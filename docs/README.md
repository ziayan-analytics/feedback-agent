# Feedback Agent (Cloudflare Workers + D1 + Workers AI)

A lightweight feedback collection app built on **Cloudflare Workers**.
Users submit feedback in the browser, the Worker calls **Cloudflare Workers AI** to generate structured labels (summary / sentiment / category), and stores everything in **Cloudflare D1**.

---

## Live Demo

- **Production URL:** https://feedback-agent.zia-feedback-agent.workers.dev
- **How to use it:** This app provides a simple workflow for teams to collect and triage user feedback in a structured way.

1. A team member copies a piece of feedback (e.g., from Slack, customer support tickets, emails, or app reviews) and pastes it into the browser UI.
2. Click **Submit** to send the feedback to the Cloudflare Worker.
3. The Worker calls **Cloudflare Workers AI** to automatically generate structured labels:
   - `summary`
   - `sentiment` (positive / neutral / negative)
   - `category` (Bug / Feature Request / Praise / Other)
4. The feedback and AI-generated labels are saved directly into **Cloudflare D1**.
5. The latest feedback can be viewed in the UI (via **Refresh**) or retrieved programmatically through the API (`GET /api/feedback`) for further analysis, exporting, or downstream pipelines.

---

## Features

- Browser UI for submitting feedback
- Stores feedback in **Cloudflare D1**
- Uses **Cloudflare Workers AI** to automatically label feedback:
  - `summary`
  - `sentiment` (positive / neutral / negative)
  - `category` (Bug / Feature Request / Praise / Other)
- REST API endpoints:
  - `POST /api/feedback` → submit feedback
  - `GET /api/feedback` → fetch latest feedback list

---

## Tech Stack

- **Cloudflare Workers** (TypeScript)
- **Cloudflare D1** (SQLite database)
- **Cloudflare Workers AI**
- Static frontend: `public/index.html`
- Wrangler CLI

---

## Project Structure

```txt
feedback-agent/
├── public/
│   └── index.html            # Frontend UI
├── src/
│   └── index.ts              # Worker API + AI labeling + D1 logic
├── wrangler.jsonc            # Wrangler configuration (D1 + AI bindings)
├── worker-configuration.d.ts # Generated types
├── package.json
└── docs
    └── README.md
    └── SETUP.md
```

---


## API Usage

### Submit feedback

```bash
curl -X POST https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"text":"the price is too high"}'
```

* Response:

```json

{ "ok": true }
```

### Fetch latest feedback

```bash

curl https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback
```

* Example response:

```json

{
  "ok": true,
  "data": [
    {
      "id": 3,
      "text": "the price is too high",
      "summary": "User thinks the price is too high",
      "sentiment": "negative",
      "category": "Feature Request",
      "created_at": "2026-01-20 04:04:50"
    }
  ]
}
```

---

## Local Development

### Install dependencies

```bash

npm install
```

### Run locally

```bash


npm run dev
```

### Open:

```arduino

http://localhost:8787
```

---

## Deploy

```bash

npm run deploy
```

---

## Notes

If you update bindings in wrangler.jsonc, regenerate types:

```bash

npx wrangler types
```

---

## Author

Zia Yan (UCSD)
