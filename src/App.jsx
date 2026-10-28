import React, { useEffect, useRef, useState } from "react";

const modes = [
  { id: "podcast", label: "Podcast", eyebrow: "A conversation worth having", icon: "mic" },
  { id: "interview", label: "Interview", eyebrow: "Your next opportunity, rehearsed", icon: "briefcase" },
  { id: "tutor", label: "Tutor", eyebrow: "Make room for a new idea", icon: "book" },
];

const personas = {
  podcast: [
    {
      id: "aarav",
      name: "Aarav Mehta",
      role: "Podcast co-host",
      style: "Warm · curious · quick-witted",
      description: "A lively, thoughtful co-host who follows the interesting thread and asks the next good question.",
      photo: "photo-1500648767791-00dcc994a43e",
      initial: "A",
      voice: "Indian English · Warm & conversational",
    },
    {
      id: "kabir",
      name: "Kabir Sethi",
      role: "Podcast co-host",
      style: "Bright · playful · big-picture",
      description: "A high-energy conversation partner who loves a surprising connection and a fresh perspective.",
      photo: "photo-1506794778202-cad84cf45f1d",
      initial: "K",
      voice: "Indian English · Bright & curious",
    },
  ],
  interview: [
    {
      id: "priya",
      name: "Priya Nair",
      role: "People & culture",
      style: "Warm · perceptive · encouraging",
      description: "A people-first interviewer focused on motivation, collaboration, and the story behind your work.",
      photo: "photo-1580489944761-15a19d654956",
      initial: "P",
      voice: "Indian English · Calm & thoughtful",
    },
    {
      id: "arjun",
      name: "Arjun Rao",
      role: "Engineering lead",
      style: "Direct · analytical · focused",
      description: "A technical interviewer who values clear thinking, practical trade-offs, and sound fundamentals.",
      photo: "photo-1506794778202-cad84cf45f1d",
      initial: "A",
      voice: "Indian English · Direct & analytical",
    },
    {
      id: "meera",
      name: "Meera Kapoor",
      role: "Founder",
      style: "Ambitious · curious · big-picture",
      description: "A founder-style interviewer interested in ownership, customer insight, and how you make things happen.",
      photo: "photo-1534528741775-53994a69daeb",
      initial: "M",
      voice: "Indian English · Energetic & curious",
    },
  ],
  tutor: [
    {
      id: "ananya",
      name: "Ananya Shah",
      role: "Your learning guide",
      style: "Patient · clear · encouraging",
      description: "A patient teacher who turns tricky ideas into small steps and everyday examples.",
      photo: "photo-1531123897727-8f129e1688ce",
      initial: "A",
      voice: "Indian English · Gentle & clear",
    },
    {
      id: "dev",
      name: "Dev Malhotra",
      role: "Your learning guide",
      style: "Practical · upbeat · curious",
      description: "A hands-on teacher who uses familiar examples to make new concepts click.",
      photo: "photo-1500648767791-00dcc994a43e",
      initial: "D",
      voice: "Indian English · Upbeat & clear",
    },
  ],
};

const starterCopy = {
  podcast: {
    prompt: "What’s an idea you’ve changed your mind about recently?",
    helper: "Bring a topic you can’t stop thinking about. Your co-host will take it from there.",
  },
  interview: {
    prompt: "What role are you targeting, and what kind of company are you interviewing with?",
    helper: "Tell us the role and company type you’re preparing for. Your panel will handle one question at a time.",
  },
  tutor: {
    prompt: "What would you like to understand today?",
    helper: "Pick a subject and your comfort level. We’ll take one idea at a time.",
  },
};

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    studio: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M7 9h4m-4 4h8" /></>,
    sessions: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8m-8 4h7" /></>,
    voices: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.3a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.3a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8m-8 4h6" /></>,
    play: <path d="M8 5.14v13.72c0 .78.84 1.26 1.5.86l10.5-6.86a1.02 1.02 0 0 0 0-1.72L9.5 4.28c-.66-.4-1.5.08-1.5.86Z" fill="currentColor" stroke="none" />,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
    bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    sound: <><path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  };

  return <svg {...common}>{paths[name] ?? paths.spark}</svg>;
}

function photoUrl(photo, width = 900) {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function messageText(content) {
  return content.replace(/^\[[^\]]+\]\s*/gm, "");
}

function messageSpeaker(content, personaName) {
  const match = content.match(/^\[([^\]]+)\]/);
  return match?.[1] ?? personaName;
}

function App() {
  const [mode, setMode] = useState("podcast");
  const [personaId, setPersonaId] = useState(personas.podcast[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState("transcript");
  const [bookmarked, setBookmarked] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("Studio");
  const [apiHealth, setApiHealth] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [volume, setVolume] = useState(72);
  const [interviewRole, setInterviewRole] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [tutorTopic, setTutorTopic] = useState("");
  const [tutorLevel, setTutorLevel] = useState("beginner");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const discardRecordingRef = useRef(false);

  const choices = personas[mode];
  const persona = choices.find((item) => item.id === personaId) ?? choices[0];
  const copy = starterCopy[mode];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("The API health check failed.");
        setApiHealth(await response.json());
      })
      .catch((error) => {
        if (error.name !== "AbortError") setApiHealth({ status: "offline", chatConfigured: false, speechConfigured: false, transcriptionConfigured: false });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => () => {
    discardRecordingRef.current = true;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    audioRef.current?.pause();
    const objectUrl = audioRef.current?.dataset.objectUrl;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      const tag = document.activeElement?.tagName;
      if (event.code === "Space" && !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) {
        event.preventDefault();
        toggleSession();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRunning, isSending, isStarting, sessionId, mode, personaId, interviewRole, companyType, tutorTopic, tutorLevel]);

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok) throw new Error(payload?.error ?? `Request failed with status ${response.status}.`);
    return payload;
  }

  async function endSession(currentSessionId = sessionId) {
    if (currentSessionId) {
      try {
        await requestJson(`/api/sessions/${currentSessionId}/end`, { method: "POST" });
      } catch {
        setToast("Session ended locally; the API could not confirm the end.");
      }
    }
    if (recorderRef.current?.state === "recording") {
      discardRecordingRef.current = true;
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    streamRef.current = null;
    setMicrophone(false);
    setSessionId("");
    setMessages([]);
    setIsRunning(false);
    setElapsed(0);
  }

  async function changeMode(nextMode) {
    if (nextMode === mode) return;
    if (sessionId) await endSession();
    setMode(nextMode);
    setPersonaId(personas[nextMode][0].id);
    setToast(`${modes.find((item) => item.id === nextMode).label} studio selected`);
  }

  async function toggleSession() {
    if (isSending) return;
    if (isRunning) {
      await endSession();
      setToast("Session ended.");
      return;
    }
    if (isStarting) return;
    setIsStarting(true);
    try {
      const context = mode === "interview"
        ? { targetRole: interviewRole, companyType }
        : mode === "tutor"
          ? { topic: tutorTopic, experienceLevel: tutorLevel }
          : {};
      const session = await requestJson("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ mode, personaId: persona.id, context }),
      });
      setSessionId(session.id);
      setMessages([]);
      setElapsed(0);
      setIsRunning(true);
      setIsStarting(false);
      setToast(apiHealth?.chatConfigured
        ? "Studio session started. Your host is opening the conversation."
        : "Session created. Add your provider key to start the AI conversation.");
      if (apiHealth?.chatConfigured) {
        isSendingRef.current = true;
        setIsSending(true);
        try {
          const opening = await requestJson(`/api/sessions/${session.id}/turns`, {
            method: "POST",
            body: JSON.stringify({ start: true }),
          });
          setMessages([opening.assistantMessage]);
          if (speakReplies) await playSpeech(opening.assistantMessage.content, session.id);
        } catch (error) {
          setToast(getErrorMessage(error));
        } finally {
          isSendingRef.current = false;
          setIsSending(false);
        }
      }
    } catch (error) {
      setToast(getErrorMessage(error));
    } finally {
      setIsStarting(false);
    }
  }

  async function playSpeech(text, currentSessionId = sessionId) {
    if (!currentSessionId) {
      setToast("Start a studio session before playing speech.");
      return;
    }
    // Choose TTS source based on mode
    const useCoqui = mode === "podcast" && process.env.REACT_APP_COQUI_API_KEY;
    if (useCoqui) {
      try {
        const response = await fetch("https://api.coqui.ai/v1/synthesize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_COQUI_API_KEY}`,
          },
          body: JSON.stringify({
            text: messageText(text),
            voice: "raj_shamani",
            language: "en",
            output_format: "mp3",
          }),
        });
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Coqui speech generation failed.");
        }
        const objectUrl = URL.createObjectURL(await response.blob());
        if (audioRef.current) {
          audioRef.current.pause();
          const previousUrl = audioRef.current.dataset.objectUrl;
          if (previousUrl) URL.revokeObjectURL(previousUrl);
        }
        const audio = new Audio(objectUrl);
        audio.volume = volume / 100;
        audio.dataset.objectUrl = objectUrl;
        audioRef.current = audio;
        audio.addEventListener("ended", () => URL.revokeObjectURL(objectUrl), { once: true });
        await audio.play();
        return;
      } catch (error) {
        setToast(getErrorMessage(error));
        return;
      }
    }
    // Fallback to existing OpenAI speech endpoint
    if (!apiHealth?.speechConfigured) {
      setToast("Speech is not configured. Add OPENAI_API_KEY to the backend .env file.");
      return;
    }
    try {
      const response = await fetch(`/api/sessions/${currentSessionId}/speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText(text), personaId: persona.id }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Speech generation failed.");
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      if (audioRef.current) {
        audioRef.current.pause();
        const previousUrl = audioRef.current.dataset.objectUrl;
        if (previousUrl) URL.revokeObjectURL(previousUrl);
      }
      const audio = new Audio(objectUrl);
      audio.volume = volume / 100;
      audio.dataset.objectUrl = objectUrl;
      audioRef.current = audio;
      audio.addEventListener("ended", () => URL.revokeObjectURL(objectUrl), { once: true });
      await audio.play();
    } catch (error) {
      setToast(getErrorMessage(error));
    }
  }

  async function sendTurn(text = draft) {
    const trimmed = text.trim();
    if (!trimmed || !sessionId || isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);
    setDraft("");
    setMessages((current) => [...current, { role: "user", content: trimmed, createdAt: Date.now() }]);
    try {
      const result = await requestJson(`/api/sessions/${sessionId}/turns`, {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      setMessages((current) => [...current, result.assistantMessage]);
      if (speakReplies) await playSpeech(result.assistantMessage.content);
    } catch (error) {
      setMessages((current) => current.filter((message) => message.content !== trimmed || message.role !== "user"));
      setDraft(trimmed);
      setToast(getErrorMessage(error));
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }

  async function toggleMicrophone() {
    if (microphone && recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setMicrophone(false);
      setIsTranscribing(true);
      return;
    }
    if (!sessionId) {
      setToast("Enter the studio before recording.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setToast("Microphone recording isn't supported in this browser. You can type instead.");
      return;
    }
    if (!apiHealth?.transcriptionConfigured) {
      setToast("Transcription is not configured. Add OPENAI_API_KEY to the backend .env file.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      let recordingBytes = 0;
      discardRecordingRef.current = false;
      recorderRef.current = recorder;
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) {
          chunks.push(event.data);
          recordingBytes += event.data.size;
          if (recordingBytes > 12 * 1024 * 1024 && recorder.state === "recording") {
            recorder.stop();
            setMicrophone(false);
            setIsTranscribing(true);
            setToast("Recording reached its size limit. Transcribing it now.");
          }
        }
      });
      recorder.addEventListener("stop", async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          setIsTranscribing(false);
          return;
        }
        if (!chunks.length) {
          setIsTranscribing(false);
          setToast("No audio was captured. Try recording again.");
          return;
        }
        try {
          const form = new FormData();
          const mimeType = recorder.mimeType || "audio/webm";
          const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "m4a" : "webm";
          form.append("audio", new Blob(chunks, { type: mimeType }), `studio-recording.${extension}`);
          const result = await requestJson(`/api/sessions/${sessionId}/transcriptions`, { method: "POST", body: form });
          await sendTurn(result.text);
        } catch (error) {
          setToast(getErrorMessage(error));
        } finally {
          setIsTranscribing(false);
        }
      }, { once: true });
      recorder.start();
      setMicrophone(true);
      setToast("Recording. Select the mic again when you're ready to send.");
    } catch (error) {
      setToast(error.name === "NotAllowedError" ? "Allow microphone access in your browser to record." : getErrorMessage(error));
    }
  }

  function selectNav(label) {
    setActiveNav(label);
    if (label !== "Studio") setToast(`${label} workspace is coming soon.`);
  }

  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="app-shell">
      <aside className="rail" aria-label="Main navigation">
        <a className="brand-mark" href="#studio" aria-label="Guru Studio home">g.</a>
        <nav className="rail-nav">
          {[
            ["Studio", "studio"],
            ["Sessions", "sessions"],
            ["Voice library", "voices"],
            ["Settings", "settings"],
          ].map(([label, icon]) => (
            <button
              className={`rail-button ${activeNav === label ? "active" : ""}`}
              key={label}
              aria-label={label}
              title={label}
              onClick={() => selectNav(label)}
            >
              <Icon name={icon} />
            </button>
          ))}
        </nav>
        <div className="rail-spacer" />
        <button className="avatar-small" aria-label="Your profile" onClick={() => setToast("Profile settings are coming soon.")}>AK</button>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="crumbs"><span>Workspace</span><span className="crumb-dot" /><strong>Live studio</strong></div>
          <div className="topbar-right">
            <div className={`connection ${apiHealth?.status === "offline" ? "offline" : ""}`}>
              <span className="connection-dot" />
              {apiHealth === null ? "Checking API..." : apiHealth.status === "offline" ? "API offline" : apiHealth.chatConfigured ? "API online · key set" : "API ready · add key"}
            </div>
            <button className="icon-button" aria-label="Notifications" onClick={() => setToast("You're all caught up.")}>
              <span className="notification-glyph">·</span>
            </button>
          </div>
        </header>

        <main id="studio">
          <div className="intro-row">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />Your room, your rules</p>
              <h1>Good ideas sound<br className="title-break" /> better out loud.</h1>
              <p className="intro-copy">Choose your kind of conversation. We’ll set the scene.</p>
            </div>
            <div className="session-meta"><Icon name="clock" size={14} /> {isRunning ? "Session active" : "New session"} <span>·</span> {sessionId ? "Temporary session" : "Not started"}</div>
          </div>

          <div className="mode-row" role="tablist" aria-label="Choose a studio mode">
            {modes.map((item) => (
              <button
                className={`mode-card ${mode === item.id ? "selected" : ""}`}
                key={item.id}
                role="tab"
                aria-selected={mode === item.id}
                disabled={isRunning || isStarting}
                onClick={() => changeMode(item.id)}
              >
                <span className="mode-icon"><Icon name={item.icon} size={17} /></span>
                <span className="mode-text"><strong>{item.label}</strong><small>{item.eyebrow}</small></span>
                {mode === item.id && <span className="mode-check"><Icon name="check" size={13} /></span>}
              </button>
            ))}
          </div>

          <div className="studio-grid">
            <section className="studio-card" aria-label="Studio desk">
              <div className="hero-visual" key={`${mode}-${persona.id}`}>
                <img
                  className="hero-photo"
                  src={photoUrl(persona.photo, 1200)}
                  alt={`Portrait of fictional AI ${persona.role.toLowerCase()} ${persona.name}`}
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
                <div className="photo-shade" />
                <div className="hero-topline">
                  <span className={`live-pill ${isRunning ? "on-air" : ""}`}><span />{isRunning ? "Preview live" : "Studio preview"}</span>
                  <span className="scene-label"><span className="scene-dot" />{mode === "podcast" ? "THE CONVERSATION ROOM" : mode === "interview" ? "INTERVIEW SUITE" : "THE LEARNING ROOM"}</span>
                </div>
                <div className="hero-copy">
                  <span className="hero-kicker"><Icon name="spark" size={13} />{persona.role}</span>
                  <h2>{persona.name}</h2>
                  <p>{persona.description}</p>
                  <div className="persona-meta">
                    <span className="persona-avatar">{persona.initial}</span>
                    <span>{persona.style}</span>
                    <span className="meta-divider" />
                    <span>Fictional AI persona</span>
                  </div>
                </div>
                <div className={`visualizer ${isRunning ? "animated" : ""}`} aria-label="Decorative audio waveform">
                  {Array.from({ length: 42 }, (_, index) => (
                    <span key={index} style={{ "--bar-height": `${10 + ((index * 19 + 7) % 29)}px`, "--bar-delay": `${(index % 11) * -0.1}s` }} />
                  ))}
                </div>
                <span className="image-credit">Portrait photography via Unsplash</span>
              </div>

              <div className="studio-controls">
                <div className="control-label"><span>Choose your host</span><small>{choices.length} original personas</small></div>
                <div className="persona-list" role="list" aria-label={`${mode} host choices`}>
                  {choices.map((item) => (
                    <button
                      className={`persona-option ${persona.id === item.id ? "chosen" : ""}`}
                      key={item.id}
                      disabled={isRunning || isStarting}
                      onClick={() => setPersonaId(item.id)}
                      aria-pressed={persona.id === item.id}
                    >
                      <img src={photoUrl(item.photo, 100)} alt="" />
                      <span className="persona-option-text"><strong>{item.name}</strong><small>{item.role}</small></span>
                      {persona.id === item.id && <span className="selected-indicator"><Icon name="check" size={12} /></span>}
                    </button>
                  ))}
                </div>
                <div className="voice-strip">
                  <div className="voice-strip-icon"><Icon name="sound" size={15} /></div>
                  <div className="voice-strip-copy"><small>VOICE PROFILE</small><strong>{persona.voice}</strong></div>
                  <span className={`voice-status ${apiHealth?.speechConfigured ? "" : "not-ready"}`}><span />{apiHealth?.speechConfigured ? "Speech ready" : "Speech needs API key"}</span>
                </div>
                {mode !== "podcast" && (
                  <div className="context-fields">
                    {mode === "interview" ? (
                      <>
                        <label>Role you’re preparing for<input type="text" value={interviewRole} onChange={(event) => setInterviewRole(event.target.value)} placeholder="e.g. Product designer" disabled={isRunning || isStarting} /></label>
                        <label>Company type<input type="text" value={companyType} onChange={(event) => setCompanyType(event.target.value)} placeholder="e.g. Indian tech startup" disabled={isRunning || isStarting} /></label>
                      </>
                    ) : (
                      <>
                        <label>What would you like to learn?<input type="text" value={tutorTopic} onChange={(event) => setTutorTopic(event.target.value)} placeholder="e.g. How APIs work" disabled={isRunning || isStarting} /></label>
                        <label>Your experience<select value={tutorLevel} onChange={(event) => setTutorLevel(event.target.value)} disabled={isRunning || isStarting}><option value="beginner">New to this</option><option value="some">Know a little</option><option value="comfortable">Comfortable with the basics</option></select></label>
                      </>
                    )}
                  </div>
                )}
                <div className="action-row">
                  <button
                    className={`control-button ${microphone ? "active-control" : ""}`}
                    aria-label={microphone ? "Stop and send recording" : "Start microphone recording"}
                    onClick={toggleMicrophone}
                    disabled={isTranscribing}
                  ><Icon name="mic" size={16} /><span>{isTranscribing ? "Transcribing…" : microphone ? "Stop & send" : "Record"}</span></button>
                  <button
                    className={`control-button ${speakReplies ? "active-control" : ""}`}
                    aria-label={speakReplies ? "Turn spoken replies off" : "Turn spoken replies on"}
                    aria-pressed={speakReplies}
                    onClick={() => setSpeakReplies((value) => !value)}
                  ><Icon name="sound" size={15} /><span>Voice {speakReplies ? "on" : "off"}</span></button>
                  <div className="volume-control"><Icon name="sound" size={15} /><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Output volume" /></div>
                  <span className="timer">{time}</span>
                  <button className={`begin-button ${isRunning ? "end-button" : ""}`} onClick={toggleSession} disabled={isStarting}>
                    <Icon name={isRunning ? "stop" : "play"} size={14} />
                    {isStarting ? "Connecting…" : isRunning ? "End session" : "Enter the studio"}
                    {!isRunning && !isStarting && <Icon name="arrow" size={14} />}
                  </button>
                </div>
              </div>
            </section>

            <aside className="monitor-column">
              <section className="monitor-card">
                <div className="monitor-heading">
                  <div><p className="panel-eyebrow">Your session, at a glance</p><h2>Studio monitor</h2></div>
                  <span className="monitor-dots" aria-hidden="true">···</span>
                </div>
                <div className="monitor-tabs" role="tablist" aria-label="Monitor content">
                  <button role="tab" aria-selected={activeTab === "transcript"} className={activeTab === "transcript" ? "active" : ""} onClick={() => setActiveTab("transcript")}>Transcript</button>
                  <button role="tab" aria-selected={activeTab === "notes"} className={activeTab === "notes" ? "active" : ""} onClick={() => setActiveTab("notes")}>Session notes</button>
                </div>
                {activeTab === "transcript" ? (
                  <div className="transcript-content">
                    {messages.length === 0 ? (
                      <>
                        <div className="transcript-entry">
                          <span className="speaker-mark">{persona.initial}</span>
                          <div><div className="entry-meta"><strong>{persona.name.split(" ")[0]}</strong><time>00:00</time></div><p>{copy.prompt}</p></div>
                        </div>
                        <div className="transcript-entry guest-entry">
                          <span className="speaker-mark">Y</span>
                          <div><div className="entry-meta"><strong>You</strong><time>—</time></div><p>Your part of the conversation will show up here. No rush; good thoughts take the time they need.</p></div>
                        </div>
                        <div className="transcript-hint"><span className="hint-line" />{copy.helper}</div>
                      </>
                    ) : messages.map((message, index) => {
                      const speaker = message.role === "user" ? "You" : messageSpeaker(message.content, persona.name);
                      const timestamp = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div className={`transcript-entry ${message.role === "user" ? "guest-entry" : ""}`} key={`${message.createdAt}-${index}`}>
                          <span className="speaker-mark">{speaker[0]}</span>
                          <div>
                            <div className="entry-meta">
                              <strong>{speaker}</strong><time>{timestamp}</time>
                              {message.role === "assistant" && (
                                <button className="speak-message" onClick={() => playSpeech(message.content)} disabled={!apiHealth?.speechConfigured} aria-label={`Play ${speaker}'s reply`} title="Play reply">
                                  <Icon name="sound" size={12} />
                                </button>
                              )}
                            </div>
                            <p>{messageText(message.content)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {isSending && <div className="typing-indicator" role="status"><span /><span /><span />{persona.name.split(" ")[0]} is thinking</div>}
                    <div ref={transcriptEndRef} />
                  </div>
                ) : (
                  <div className="notes-content">
                    <span className="notes-kicker">A place to begin</span>
                    <blockquote>“{copy.prompt}”</blockquote>
                    <p>Bring your own story. The best conversation starts where your curiosity does.</p>
                    <div className="note-tags"><span>{modes.find((item) => item.id === mode).label}</span><span>{persona.name}</span></div>
                  </div>
                )}
                {isRunning && activeTab === "transcript" && (
                  <form className="message-composer" onSubmit={(event) => { event.preventDefault(); sendTurn(); }}>
                    <input
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={isTranscribing ? "Transcribing your recording…" : "Write your reply…"}
                      aria-label="Your message"
                      maxLength={4000}
                      disabled={isSending || isTranscribing}
                    />
                    <button type="submit" disabled={!draft.trim() || isSending || isTranscribing} aria-label="Send message"><Icon name="arrow" size={16} /></button>
                  </form>
                )}
                <div className="monitor-footer">
                  <span><span className={`status-indicator ${isRunning ? "running" : ""}`} />{isRunning ? "Session active" : apiHealth?.status === "offline" ? "API unavailable" : "Waiting for session"}</span>
                  <button className={`bookmark-button ${bookmarked ? "bookmarked" : ""}`} onClick={() => { setBookmarked((value) => !value); setToast(bookmarked ? "Bookmark removed" : "Moment bookmarked"); }}>
                    <Icon name="bookmark" size={13} />{bookmarked ? "Saved" : "Bookmark"}
                  </button>
                </div>
              </section>
              <section className="backend-card">
                <div className="backend-icon"><Icon name="sound" size={16} /></div>
                <div><strong>{apiHealth?.status === "offline" ? "Start the backend" : apiHealth?.providerConfigured ? "AI audio is configured" : "Add your AI provider key"}</strong><p>{apiHealth?.status === "offline" ? "Run npm run dev:all so the studio can reach its API." : apiHealth?.providerConfigured ? "Speech generation and transcription are ready for a configured session." : "The backend routes are ready. Add OPENAI_API_KEY to enable chat and voice."}</p></div>
                <span className="phase-tag">BACKEND</span>
              </section>
              <div className="promise"><Icon name="check" size={14} /><span>Original characters. Your voice. Your conversation.</span></div>
            </aside>
          </div>

          <footer className="bottomline"><span>Made for conversations that go somewhere.</span><button onClick={() => setToast("Press Space to start or end the studio preview.")}>Keyboard shortcuts <span>·</span> Space to start</button></footer>
        </main>
      </div>
      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

export default App;
