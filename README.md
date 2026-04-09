# Subject Decision Briefing — 5-Agent AI Pipeline

A brutally honest career and subject research tool. Type any query — "Is data science worth it in 2028", "Should I study nursing or software engineering" — and five Claude AI agents run sequentially, each building on the last, to give you a grounded, uncertainty-aware briefing.

**No sugar-coating. No hallucinated confidence. Just AI reasoning that tells you what it knows, what it's extrapolating, and where it's guessing.**

---

## Live Demo

[https://my-briefing-hazel.vercel.app](https://my-briefing-hazel.vercel.app)

You bring your own Anthropic API key. It runs on your account, not mine. Your key is never stored — it's used in-memory per request only.

Get a key at [console.anthropic.com](https://console.anthropic.com/settings/keys).

---

## What it does

Runs 5 AI agents in sequence. Each agent reads the previous agents' outputs before responding:

| Agent | Role | What it produces |
|---|---|---|
| 01 · Sentiment Listener | Reads the room | Public sentiment score, key themes, concern level |
| 02 · Job Market Scanner | Reads the market | Demand score, top roles, salary ranges, hiring trend |
| 03 · Career Path Mapper | Maps the routes | Recommended subject combos, career paths, entry points |
| 04 · Future-Proofing Checker | Stress-tests the bet | AI disruption risk, 5-year outlook, safe bets vs. avoid |
| 05 · Decision Brief | Calls the verdict | GO / CAUTION / AVOID with confidence score and risk flag |

Every output includes:
- Confidence ranges, not false precision
- Data gap flags (what the AI couldn't verify)
- Caveats when extrapolating past its training data
- A 45-second per-agent timeout so it never hangs

---

## Why it looks like this

Most AI tools dress uncertainty up as confidence. This one doesn't.

The design is intentionally raw — terminal aesthetic, ASCII score bars, yellow warning boxes for caveats, red boxes for risk flags. The visual language matches the epistemic honesty of the outputs. If the AI is guessing, it says so, and the UI makes that visible.

---

## Tech stack

- **Next.js 16** (App Router)
- **Anthropic Claude claude-opus-4-6** via `@anthropic-ai/sdk`
- **Server-Sent Events** for real-time streaming — you watch each agent's raw output as Claude writes it, then see the parsed result card when it's done
- **Tailwind CSS** (dark terminal theme)
- **Vercel** for deployment

---

## How the pipeline works

```
User query
    │
    ▼
Agent 1 (Sentiment) ──► Agent 2 (Job Market) ──► Agent 3 (Career Paths)
                                                         │
                                              Agent 5 (Brief) ◄── Agent 4 (Future-Proof)
```

Each agent receives the full output of all previous agents as context before it runs. Agent 5 sees everything.

The API route streams Claude's response token-by-token via SSE. The frontend shows the raw text streaming in real time, then renders the parsed JSON into structured cards when each agent completes.

---

## Run it yourself

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/my-briefing.git
cd my-briefing
```

### 2. Install

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter your Anthropic API key in the field provided. No `.env` file needed — the key is passed per-request from the browser.

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

No environment variables required. Users supply their own API key in the UI.

---

## Project structure

```
app/
├── page.tsx              # Client UI — input, streaming display, agent cards
├── layout.tsx            # Root layout
├── globals.css           # Tailwind base
└── api/
    └── pipeline/
        └── route.ts      # 5-agent SSE stream — prompts, Claude calls, JSON parsing
```

---

## Design decisions worth noting

**Why BYOK (bring your own key)?**
The app runs on Claude Opus — not cheap per query. BYOK means you control your own usage and costs. The key is sent in the request body over HTTPS, used in-memory for that request, and never logged or persisted.

**Why not just one Claude call?**
Sequential agents with context-passing catches contradictions, builds reasoning depth, and makes the uncertainty visible step by step. Agent 5's confidence score reflects how consistently the first four agents agreed — not just how confident Claude sounds.

**Why stream the raw output?**
Watching the AI reason in real time, including hedges and self-corrections as it writes JSON, is more honest than presenting a polished card after a loading spinner. You see what you're actually getting.

**Why no real data sources?**
This is a reasoning tool, not a data aggregator. It's upfront that everything is extrapolated from Claude's training data (cutoff early 2025). For queries about 2027, 2028, 2030 — it forecasts forward rather than refusing, and tells you that's what it's doing.

---

## Limitations (the honest version)

- All data is AI-estimated from training data up to early 2025
- Salary figures, job volumes, and hiring trends are extrapolations — not live scrapes
- Future-date queries (2028+) are forecasting exercises, not verified predictions
- Character and cultural context will affect outputs (tuned for Australian context but broadly applicable)
- Claude Opus is not cheap. A full 5-agent run costs approximately $0.05–0.15 USD depending on query length

---

## Built by

[@TheAIMum](https://github.com/YOUR_USERNAME) — solo operator experimenting with multi-agent AI pipelines for practical research problems.

---

## License

MIT — fork it, break it, rebuild it better.
