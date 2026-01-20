## Prerequisites

- Node.js + npm

- Cloudflare account

- Wrangler CLI (usually installed via project devDependencies)

- Logged in to Cloudflare:
```bash

npx wrangler login
```
---

## Step-by-step: from CLI to Production UI (what we did today)

### 1) Create the project (create-cloudflare CLI)

If starting from scratch:

```bash
npm create cloudflare@latest feedback-agent
cd feedback-agent
npm install
```

Choose Workers + static assets if prompted.
---

### 2) Create a D1 database (Cloudflare)

Create the D1 database (Cloudflare will output a database_id):
```bash
npx wrangler d1 create feedback_db
```

Wrangler prints something like:

- database_name: feedback_db

- database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

---

### 3) Bind D1 + AI in wrangler.jsonc

Open wrangler.jsonc and ensure you have:

- assets pointing to ./public

- d1_databases binding (name used in code = feedback_db)

- Workers AI binding (usually AI)

Example:

```jsonc

{
  "name": "feedback-agent",
  "main": "src/index.ts",
  "compatibility_date": "2025-09-27",
  "assets": {
    "directory": "./public"
  },
  "d1_databases": [
    {
      "binding": "feedback_db",
      "database_name": "feedback_db",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ]
}

```

### Note: The Workers AI binding often appears automatically in generated types as AI: Ai;.
If you added/changed bindings, regenerate types (next step).
---

### 4) Generate TypeScript runtime types

After changing wrangler.jsonc, run:

```bash

npx wrangler types
```

This generates/updates worker-configuration.d.ts so env.feedback_db and env.AI are typed.
---

### 5) Create the database table (LOCAL first)

Create the feedback table locally (so local dev works):
```bash

npx wrangler d1 execute feedback_db --command "
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT,
  summary TEXT,
  sentiment TEXT,
  category TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);"

```
Optional quick verification (local):
```bash

npx wrangler d1 execute feedback_db --command "SELECT name FROM sqlite_master WHERE type='table';"

```
---
### 6) Run locally (wrangler dev)

Start local dev server:
```bash
npm run dev
```

Then open:

- http://localhost:8787 (your local UI)
---

### 7) Test API locally (curl)

Submit feedback:
```bash
curl -X POST http://localhost:8787/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"text":"the price is too high"}'

```
Fetch latest:
```bash
curl http://localhost:8787/api/feedback
```

You should see JSON including AI labels + created_at.
---

### 8) Deploy Worker to production

Deploy:

```bash
npm run deploy
```

Wrangler will output a production URL like: https://feedback-agent.<your-subdomain>.workers.dev
---

### 9) Create the table in REMOTE D1 (production)

Important: Local D1 and Remote D1 are different.
After deploy, initialize the remote database schema:
```bash
npx wrangler d1 execute feedback_db --remote --command "
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT,
  summary TEXT,
  sentiment TEXT,
  category TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);"

```
Optional: insert one test row into remote:
```bash
npx wrangler d1 execute feedback_db --remote --command \
"INSERT INTO feedback(text, summary, sentiment, category) VALUES ('hello from remote', 'hello from remote', 'neutral', 'Other');"
```
---
### 10) Verify production API + production UI

Production API test:
```bash
curl -X POST https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"text":"this is my first production feedback"}'

```
Fetch:
```bash

curl https://feedback-agent.zia-feedback-agent.workers.dev/api/feedback
```

Then open production UI: https://feedback-agent.zia-feedback-agent.workers.dev

You should see the newest entries rendered.
---

## API Reference
POST /api/feedback

Request body:
```json
{ "text": "the price is too high" }
```

Response:

```json

{ "ok": true }
```

GET /api/feedback

Response example:

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
## Notes & Troubleshooting (issues we hit today)
### 1) Local works but production UI shows “Load failed”

Usually remote D1 schema is missing.
Fix: run the --remote CREATE TABLE command:
```bash
npx wrangler d1 execute feedback_db --remote --command "CREATE TABLE IF NOT EXISTS feedback (...);"
```

### 2) Git push 403 / wrong GitHub account

If push says:
Permission denied to <repo> denied to <another-account>

It means your git credentials are using a different GitHub identity.
Common fix: re-auth in VS Code GitHub extension OR clear cached credentials and try again.

### 3) Git push rejected (fetch first)

If push says remote contains work you do not have locally (e.g. you created README on GitHub first):
```bash
git pull origin main --rebase
git push
```
---

## Author

Zia Yan (UCSD)
