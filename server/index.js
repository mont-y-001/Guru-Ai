import crypto from "node:crypto";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "127.0.0.1";
const apiKey = process.env.OPENAI_API_KEY;
const apiBaseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
const chatModel = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const speechModel = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const transcriptionModel = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-mini-transcribe";
const maxSessionCount = 250;
const sessionLifetimeMs = 2 * 60 * 60 * 1000;
const maxHistoryMessages = 24;
const maxSessionMessages = 120;
const sessions = new Map();

const personaVoices = Object.freeze({
  aarav: "alloy",
  kabir: "echo",
  priya: "shimmer",
  arjun: "onyx",
  meera: "sage",
  ananya: "coral",
  dev: "nova",
});

const allowedPersonas = Object.freeze({
  podcast: new Set(["aarav", "kabir"]),
  interview: new Set(["priya", "arjun", "meera"]),
  tutor: new Set(["ananya", "dev"]),
});

const personaNames = Object.freeze({
  aarav: "Aarav",
  kabir: "Kabir",
  priya: "Priya",
  arjun: "Arjun",
  meera: "Meera",
  ananya: "Ananya",
  dev: "Dev",
});

const modeInstructions = Object.freeze({
  podcast: `You are Guru, the learner's warm, quick-witted podcast co-host. Speak naturally in short spoken English, mirror the learner's language, and keep each turn under 60 words. Output only spoken lines, no markdown, bullets, or emojis. Start every line with [Host]. Open with a one-line hook about the chosen topic, then one focused question. React to the learner, build on their answers, and occasionally offer a useful counterpoint. Every 4–5 turns, stitch together a one-sentence recap. If the learner hesitates, offer two directions to explore. Never invent facts or imitate a real person's voice or identity. End each turn with exactly one question or small task. If the learner has not named a topic yet, ask what they want to explore.`,
  interview: `You are one member of a fictional Indian startup interview panel. Panelists are Priya (people and culture), Arjun (engineering), and Meera (founder). Speak naturally and keep each spoken turn under 60 words. Output only spoken lines, no markdown, bullets, or emojis. Ask one question at a time. First ask which role and company type the learner is targeting if that context is missing. Then progress through introduction, motivation, STAR behavioural, role-specific problem solving, and candidate questions. Rotate panelists where appropriate. After an answer give one brief professional reaction before the next question. Do not coach during their answer. If the learner requests feedback or has answered six interview questions, step out of character and give exactly one strength, one high-impact fix, and scores out of ten for clarity, structure, and confidence. Prefix normal turns with [Priya], [Arjun], or [Meera]; prefix the feedback with [Guru]. Never present a fictional persona as a real person.`,
  tutor: `You are Guru, a patient Socratic teacher. Speak naturally and keep each turn under 60 words. Output only spoken lines, no markdown, bullets, or emojis. First ask what the learner wants to learn and their experience level if missing. Teach one small idea at a time with an everyday physical analogy, then ask a quick comprehension-check question. If the learner struggles twice, change to a completely different everyday analogy. Start every line with [Guru]. Mirror the learner's language. End each turn with exactly one question or small task.`,
});

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(express.json({ limit: "32kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many API requests. Wait a moment and try again." });
  },
});
app.use("/api", apiLimiter);
const audioLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many audio uploads. Wait a few minutes and try again." });
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!file.mimetype.startsWith("audio/") && file.mimetype !== "application/octet-stream") {
      callback(new Error("Upload an audio recording."));
      return;
    }
    callback(null, true);
  },
});

function getSession(request, response) {
  const session = sessions.get(request.params.sessionId);
  if (!session || Date.now() - session.updatedAt > sessionLifetimeMs) {
    sessions.delete(request.params.sessionId);
    response.status(404).json({ error: "Session not found. Start a new studio session." });
    return null;
  }
  session.updatedAt = Date.now();
  return session;
}

function requireProviderKey(response) {
  if (apiKey) return true;
  response.status(503).json({
    error: "AI services are not configured. Add OPENAI_API_KEY to .env and restart the API server.",
    code: "PROVIDER_NOT_CONFIGURED",
  });
  return false;
}

function requireActiveSession(session, response) {
  if (session.status === "active") return true;
  response.status(409).json({ error: "This session has ended. Start a new studio session." });
  return false;
}

async function providerRequest(path, options) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? `AI provider returned HTTP ${response.status}.`;
    const error = new Error(message);
    error.status = 502;
    throw error;
  }

  return response;
}

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    providerConfigured: Boolean(apiKey),
    chatConfigured: Boolean(apiKey),
    speechConfigured: Boolean(apiKey),
    transcriptionConfigured: Boolean(apiKey),
    models: { chat: chatModel, speech: speechModel, transcription: transcriptionModel },
  });
});

app.get("/api/voices", (_request, response) => {
  response.json({
    voices: Object.entries(personaVoices).map(([personaId, voice]) => ({
      personaId,
      name: personaNames[personaId],
      voice,
    })),
  });
});

app.post("/api/sessions", (request, response) => {
  const { mode, personaId, context = {} } = request.body ?? {};
  if (typeof mode !== "string" || !Object.hasOwn(allowedPersonas, mode) || !allowedPersonas[mode].has(personaId)) {
    response.status(400).json({ error: "Choose a valid mode and matching studio persona." });
    return;
  }
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    response.status(400).json({ error: "Session context must be an object." });
    return;
  }

  const session = {
    id: crypto.randomUUID(),
    mode,
    personaId,
    context: Object.fromEntries(
      Object.entries(context)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => [key, value.trim().slice(0, 300)]),
    ),
    messages: [],
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  if (sessions.size >= maxSessionCount) {
    const oldestId = sessions.keys().next().value;
    if (oldestId) sessions.delete(oldestId);
  }
  sessions.set(session.id, session);
  response.status(201).json({ id: session.id, mode: session.mode, personaId: session.personaId, status: session.status });
});

app.get("/api/sessions/:sessionId", (request, response) => {
  const session = getSession(request, response);
  if (!session) return;
  response.json({
    id: session.id,
    mode: session.mode,
    personaId: session.personaId,
    context: session.context,
    messages: session.messages,
    status: session.status,
  });
});

app.post("/api/sessions/:sessionId/turns", async (request, response, next) => {
  const session = getSession(request, response);
  if (!session) return;
  if (!requireActiveSession(session, response)) return;
  const isOpeningTurn = request.body?.start === true;
  const text = request.body?.text;
  if (!isOpeningTurn && session.messages.length >= maxSessionMessages) {
    response.status(409).json({ error: "This session reached its message limit. Start a new session to continue." });
    return;
  }
  if (isOpeningTurn && session.messages.length > 0) {
    response.status(409).json({ error: "The opening question has already been generated." });
    return;
  }
  if (!isOpeningTurn && (typeof text !== "string" || !text.trim() || text.length > 4000)) {
    response.status(400).json({ error: "Message must contain between 1 and 4,000 characters." });
    return;
  }
  if (!requireProviderKey(response)) return;

  const userMessage = isOpeningTurn ? null : { role: "user", content: text.trim(), createdAt: Date.now() };
  const contextLine = Object.entries(session.context)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const assistantTurn = session.messages.filter((message) => message.role === "assistant").length + 1;
  const turnGuidance = session.mode === "podcast"
    ? `\nThis is podcast turn ${assistantTurn}; include a one-sentence recap every 4–5 turns.`
    : session.mode === "interview" && assistantTurn >= 7
      ? "\nSix interview questions have already been asked and answered; provide the requested interview debrief now unless the learner has already requested feedback."
      : "";
  const systemPrompt = `${modeInstructions[session.mode]}\nThe selected fictional persona is ${personaNames[session.personaId]}.${turnGuidance}${contextLine ? `\nLearner-provided context:\n${contextLine}` : ""}`;
  const history = session.messages.slice(-maxHistoryMessages).map(({ role, content }) => ({ role, content }));

  try {
    const providerResponse = await providerRequest("/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: chatModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          ...(userMessage ? [{ role: "user", content: userMessage.content }] : []),
        ],
        max_completion_tokens: 180,
      }),
    });
    const payload = await providerResponse.json();
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      response.status(502).json({ error: "The AI provider returned an empty reply." });
      return;
    }

    const assistantMessage = { role: "assistant", content: answer, createdAt: Date.now() };
    session.messages.push(...(userMessage ? [userMessage] : []), assistantMessage);
    session.updatedAt = Date.now();
    response.json({ userMessage, assistantMessage });
  } catch (error) {
    next(error);
  }
});

app.post("/api/sessions/:sessionId/speech", async (request, response, next) => {
  const session = getSession(request, response);
  if (!session) return;
  if (!requireActiveSession(session, response)) return;
  const text = request.body?.text;
  if (typeof text !== "string" || !text.trim() || text.length > 1500) {
    response.status(400).json({ error: "Speech text must contain between 1 and 1,500 characters." });
    return;
  }
  if (!requireProviderKey(response)) return;

  const voice = personaVoices[session.personaId];
  const spokenText = text.trim().replace(/^\[[^\]]+\]\s*/gm, "").trim();
  if (!spokenText) {
    response.status(400).json({ error: "Speech text must include words to speak." });
    return;
  }
  try {
    const providerResponse = await providerRequest("/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: speechModel,
        voice,
        input: spokenText,
        response_format: "mp3",
        instructions: "Speak clearly and naturally in a warm Indian English accent. This is an original fictional AI character, not an imitation of any real person.",
      }),
    });
    response.setHeader("Content-Type", providerResponse.headers.get("content-type") ?? "audio/mpeg");
    response.setHeader("Cache-Control", "no-store");
    providerResponse.body.pipeTo(new WritableStream({
      write(chunk) { response.write(Buffer.from(chunk)); },
      close() { response.end(); },
      abort(error) { response.destroy(error); },
    })).catch(next);
  } catch (error) {
    next(error);
  }
});

app.post("/api/sessions/:sessionId/transcriptions", audioLimiter, (request, response, next) => {
  const session = getSession(request, response);
  if (!session) return;
  if (!requireActiveSession(session, response)) return;
  if (!requireProviderKey(response)) return;

  audioUpload.single("audio")(request, response, async (uploadError) => {
    if (uploadError) {
      response.status(uploadError.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        error: uploadError.code === "LIMIT_FILE_SIZE" ? "Recording is too large. Keep audio under 15 MB." : uploadError.message,
      });
      return;
    }
    if (!request.file) {
      response.status(400).json({ error: "Attach a microphone recording in the audio field." });
      return;
    }

    try {
      const form = new FormData();
      form.append("model", transcriptionModel);
      form.append("response_format", "json");
      form.append("file", new Blob([request.file.buffer], { type: request.file.mimetype }), request.file.originalname || "recording.webm");
      const providerResponse = await providerRequest("/audio/transcriptions", { method: "POST", body: form });
      const payload = await providerResponse.json();
      if (typeof payload.text !== "string" || !payload.text.trim()) {
        response.status(422).json({ error: "No speech was recognized. Try again or type your message." });
        return;
      }
      response.json({ text: payload.text.trim() });
    } catch (error) {
      next(error);
    }
  });
});

app.post("/api/sessions/:sessionId/end", (request, response) => {
  const session = getSession(request, response);
  if (!session) return;
  session.status = "ended";
  session.updatedAt = Date.now();
  response.json({ id: session.id, status: session.status });
});

app.use((error, _request, response, _next) => {
  if (response.headersSent) return;
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 502;
  console.error("API request failed:", error.message);
  response.status(status).json({
    error: status === 413
      ? "Request is too large."
      : status === 400
        ? "Invalid request body."
        : error.name === "TimeoutError"
          ? "The AI provider took too long to respond. Please try again."
          : "The AI provider could not complete this request. Check server logs and provider configuration.",
  });
});

const cleanupTimer = setInterval(() => {
  const expiredBefore = Date.now() - sessionLifetimeMs;
  for (const [id, session] of sessions) {
    if (session.updatedAt < expiredBefore) sessions.delete(id);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref();

export const server = app.listen(port, host, () => {
  console.info(`Guru API listening at http://${host}:${port}`);
  console.info(`AI provider ${apiKey ? "configured" : "not configured (set OPENAI_API_KEY in .env)"}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    clearInterval(cleanupTimer);
    server.close(() => process.exit(0));
  });
}
