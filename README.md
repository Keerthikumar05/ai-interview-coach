# InterviewIQ — AI Mock Interview Suite

A standalone AI mock-interview application: Express API + React (Vite) frontend in one
process, with a file-based JSON database (`db.json`). It runs entirely offline; a Google
Gemini key is optional and only enhances question generation and answer evaluation.

## Prerequisites

- **Node.js 18 or newer** (Node 20 LTS recommended) — check with `node -v`
- **npm 9+** (ships with Node)
- A modern browser (Chrome/Edge recommended for microphone + speech recognition)

## 1. Install

```sh
npm install
```

## 2. Environment setup (optional)

```sh
cp .env.example .env      # Windows: copy .env.example .env
```

| Variable         | Required | Purpose                                                                 |
| ---------------- | -------- | ----------------------------------------------------------------------- |
| `PORT`           | No       | Dev/prod server port. Defaults to `3000`.                                |
| `GEMINI_API_KEY` | No       | Google Gemini key from https://aistudio.google.com/app/apikey. Server-side only. Without it, the offline evaluation engine and local question bank are used. |
| `AI_PROVIDER`    | No       | Set to `mock` to force offline mode even when a key is present.          |
| `NODE_ENV`       | No       | `development` (default) or `production`.                                 |

The app works with **no `.env` file at all**.

## 3. Run locally

```sh
npm run dev
```

One terminal only — Express serves the API and Vite (in middleware mode) serves the UI.

Open: **http://localhost:3000**

Custom port: `PORT=4000 npm run dev` (or `npm run dev -- --port 4000`).

### Demo login

- Email: `admin@interviewiq.ai`
- Password: `admin123`

Or create a new account from the login screen.

## 4. Production build

```sh
npm run build   # builds the client into dist/ and the server into dist-server/
npm start       # serves the built app on PORT (default 3000)
```

Other scripts: `npm run lint` (TypeScript typecheck), `npm run clean` (remove build output).

## Data storage

All users, sessions, scores and reports are stored in `db.json` at the project root.
It is created automatically on first run. Delete it to reset the app.

## Voice & speech

- **Text-to-speech** uses the browser `speechSynthesis` API; if unavailable the interview
  continues silently.
- **Speech-to-text** uses the Web Speech API (`webkitSpeechRecognition`), best supported in
  Chrome/Edge. If the microphone is denied or the API is missing, the text answer box is
  always available as a full fallback.

## Troubleshooting

| Problem                            | Fix                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `EADDRINUSE` / port already in use | `PORT=4000 npm run dev`, or stop the process using port 3000.           |
| Blank page / stale assets          | Hard refresh (Ctrl+Shift+R) and restart `npm run dev`.                  |
| `Invalid API key` in server logs   | Recheck `GEMINI_API_KEY` in `.env`, or leave it empty to run offline.   |
| Gemini quota exceeded              | The server falls back to the offline engine; the interview keeps working. |
| `npm install` fails                | Delete `node_modules` and `package-lock.json`, then reinstall on Node 18+. |
| Microphone permission denied       | Allow the mic in browser site settings, or just type your answer.       |
| Speech recognition unsupported     | Use Chrome/Edge, or type the answer.                                    |
| Corrupted database                 | Delete `db.json`; it is recreated with seed data on next start.         |

## Security notes

- No API key is hardcoded anywhere, and no secret is exposed to browser code.
- All Gemini calls happen in `server.ts` / `services/EvaluationEngine.ts` (Node side only).
- `.env` and `node_modules` are git-ignored.

## Limitations

- Code execution in the coding round is simulated/analysed, not sandboxed real execution.
- `db.json` is a single-file store meant for local/demo use, not concurrent production traffic.
- Webcam "behavioural diagnostics" values are indicative UI metrics, not a real CV model.
