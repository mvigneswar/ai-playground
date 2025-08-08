# AI Playground

Multi‑modal AI playground with authentication and three skills:

- Conversation Analysis: Upload audio → Speech‑to‑text, diarization (max 2 speakers, no vendor diarization), summary
- Image Analysis: Upload image → detailed description
- Document/URL Summarization: Upload PDF/DOC or provide URL → concise summary

UI is minimal and Linear‑like. Deployed on Vercel.

## Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS
- Auth: simple email magic link (demo cookie based)
- OpenAI API (gpt‑4o‑mini and gpt‑4o‑mini‑transcribe)
- Parsing: pdf-parse, mammoth, Readability (jsdom)

## Getting Started

1. Install dependencies

```bash
pnpm i # or npm i or yarn
```

2. Create `.env.local`

```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run dev server

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Authentication

For demo, enter your email and click "Send magic link". The app sets a cookie to simulate a sign‑in and logs the link in server console. In production you would wire a real email provider.

## API Endpoints

- `POST /api/conversation` — form‑data `audio`: performs STT via OpenAI Whisper (gpt‑4o‑mini‑transcribe), diarizes via LLM (no vendor diarization), then summarizes.
- `POST /api/image` — form‑data `image`: creates a detailed description with multimodal GPT‑4o‑mini.
- `POST /api/summarize` — form‑data `file` (PDF/DOC) or `url`: extracts content and summarizes.

## Deployment (Vercel)

1. Push this folder to a GitHub repo.
2. On Vercel: New Project → Import repo → Framework: Next.js.
3. Environment Variables: set `OPENAI_API_KEY`.
4. Deploy.

## Notes

- Diarization requirement: we avoid any STT vendor diarization. We first transcribe, then ask an LLM to segment speech into up to two speakers and return JSON. The UI renders that JSON.
- File limits: Very large files are truncated for token budgets. Adjust as needed.
- Optional history stretch goal can be added by persisting recent requests to localStorage or a database.

