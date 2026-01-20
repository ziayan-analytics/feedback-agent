# Feedback Agent (Cloudflare Workers + D1 + Workers AI)

A lightweight feedback collection app built on **Cloudflare Workers**.  
Users submit feedback in the browser, the Worker calls **Cloudflare Workers AI** to generate structured labels (summary / sentiment / category), and stores everything in **Cloudflare D1**.

---

## Live Demo

- **Production URL:** https://feedback-agent.zia-feedback-agent.workers.dev

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
└── README.md
```
---
## How It Works
- User types feedback in the UI and clicks Submit

- Frontend sends the feedback to the Worker: POST /api/feedback

- The Worker calls Cloudflare Workers AI to generate:

  - `summary`
  - `sentiment` (positive / neutral / negative)
  - `category` (Bug / Feature Request / Praise / Other)

- The Worker stores feedback + AI labels in Cloudflare D1

- UI fetches and displays the latest feedback list from: GET /api/feedback

---

## API Usage

### Submit feedback

```bash
curl -X POST https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"text":"the price is too high"}'
```
Response:

```json

{ "ok": true }
```
### Fetch latest feedback
```bash

curl https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback
```
Example response:

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
``` bash

npm install
```

### Run locally
``` bash


npm run dev
``` 
### Open:

``` arduino

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

``` bash

npx wrangler types
```
---
## Author
Zia Yan (UCSD)
