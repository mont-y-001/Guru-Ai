# Guru Live Studio

React studio UI with a small Express API for AI chat, text-to-speech, and audio transcription.

## Run locally

1. Install Node.js 20.19 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
4. Run `npm run dev:all`.
5. Open the Vite URL printed in the terminal.

The API listens on `127.0.0.1:4000`; Vite proxies `/api` requests to it. For container hosting, set `HOST=0.0.0.0` and configure `TRUST_PROXY=true` only when requests arrive through a trusted reverse proxy. Never put provider keys in client-side environment variables or commit `.env`.

Without a provider key, the health check and persona list still work, but chat, speech generation, and transcription return an explicit configuration error. Sessions are held in memory and disappear when the API process restarts; production use should add durable storage, authentication, and deployment-specific rate limits.

## API

- `GET /api/health` — reports which provider-backed features are configured.
- `GET /api/voices` — lists original fictional personas and their preset provider voices.
- `POST /api/sessions` — create a `podcast`, `interview`, or `tutor` session.
- `GET /api/sessions/:sessionId` — read a session and its messages.
- `POST /api/sessions/:sessionId/turns` — generate a mode-aware AI response.
- `POST /api/sessions/:sessionId/speech` — stream MP3 speech for a reply.
- `POST /api/sessions/:sessionId/transcriptions` — transcribe a microphone recording (`audio` multipart field; 15 MB limit).
- `POST /api/sessions/:sessionId/end` — end a session.

The app uses fictional personas and preset voices. It does not imitate, clone, or claim to reproduce a real person's voice.
