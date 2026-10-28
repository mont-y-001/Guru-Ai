# Guru AI

Full-stack AI studio application built with Next.js App Router, Tailwind CSS, Prisma ORM, and PostgreSQL (Neon).

Features AI conversation, speech generation (TTS), and audio transcription across three interactive modes: **Podcast**, **Interview**, and **Tutor**.

## Getting Started

### 1. Prerequisites
- Node.js 20.19 or newer
- PostgreSQL database (e.g. Neon)
- OpenAI API Key

### 2. Environment Setup
Create `fullstack/.env` (refer to `fullstack/.env.example`):

```bash
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_CHAT_MODEL="gpt-4o-mini"
OPENAI_TTS_MODEL="gpt-4o-mini-tts"
OPENAI_TRANSCRIPTION_MODEL="gpt-4o-mini-transcribe"
```

### 3. Install & Initialize
From the repository root:

```bash
cd fullstack
npm install
npx prisma generate
```

### 4. Run the Development Server
From the repository root or inside `fullstack`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Guru-Ai/
├── fullstack/
│   ├── app/
│   │   ├── api/            # Next.js route handlers (sessions, speech, turns, etc.)
│   │   ├── lib/            # OpenAI client, Prisma client, personas config
│   │   ├── page.tsx        # Main studio UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── prisma/
│   │   └── schema.prisma   # Database schema for sessions & messages
│   └── package.json
├── package.json            # Root runner forwarding commands to fullstack/
└── README.md
```
