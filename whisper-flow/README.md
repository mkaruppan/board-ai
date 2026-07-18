# Flow — a Whisper Flow–style voice-to-text app

A browser-based clone of the core Whisper Flow (Wispr Flow) experience: speak, and get clean,
formatted text back — ready to paste anywhere.

## Features

- **Tap-to-talk or hold `Ctrl+Space`** to dictate from anywhere on the page.
- **Live level meter** on the mic orb while recording.
- **AI clean-up** — turns rambling speech into polished text, with selectable styles:
  Clean-up, Professional, Casual, Notes, Email, Bullets.
- **Auto-copy to clipboard** so the result is ready to paste immediately (toggle in Settings).
- **Personal dictionary** — teach it names/jargon it should spell correctly.
- **History** of past dictations, stored locally in your browser.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key.
3. Run the app:
   `npm run dev`

The dev server runs on port `3001` (the existing Boardwise SA app in this repo uses `3000`,
so both can run side by side).

## How it works

Recorded audio is sent to Gemini in a single multimodal request that returns both a verbatim
transcript and a styled rewrite. Switching styles after the fact re-runs a cheap text-only pass
over the existing transcript instead of re-sending audio.
