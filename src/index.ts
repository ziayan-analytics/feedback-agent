/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ---------- GET /api/feedback -----------
    if (url.pathname === "/api/feedback" && request.method === "GET") {
      try {
        const { results } = await env.feedback_db
          .prepare(
            `SELECT id, text, created_at, summary, sentiment, category
             FROM feedback
             ORDER BY id DESC
             LIMIT 20`
          )
          .all();

        return Response.json({ ok: true, data: results });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
      }
    }

    // ---------- POST /api/feedback ----------
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const text = (body?.text ?? "").toString().trim();

        if (!text) {
          return Response.json({ ok: false, error: "Missing text" }, { status: 400 });
        }

        // 1) Call Workers AI to generate summary / sentiment / category
        const aiPrompt = `
You are a helpful assistant for product feedback analysis.

Given a user feedback text, return JSON ONLY with:
- summary: one short sentence summary (<= 20 words)
- sentiment: one of ["positive","neutral","negative"]
- category: one of ["Bug","Feature Request","Praise","Other"]

Feedback:
"""${text}"""
`;

        const aiResp: any = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: "Return JSON only, no markdown, no extra words." },
            { role: "user", content: aiPrompt },
          ],
        });

        // aiResp.response is usually the model output text
        const raw = aiResp?.response ?? "";
        let summary = "";
        let sentiment = "neutral";
        let category = "Other";

        // parse JSON safely
        try {
          const parsed = JSON.parse(raw);
          summary = (parsed.summary ?? "").toString();
          sentiment = (parsed.sentiment ?? "neutral").toString();
          category = (parsed.category ?? "Other").toString();
        } catch {
          // fallback if model output isn't valid JSON
          summary = raw.toString().slice(0, 120);
        }

        // 2) Insert into D1
        const stmt = env.feedback_db.prepare(
          `INSERT INTO feedback (text, summary, sentiment, category)
           VALUES (?1, ?2, ?3, ?4)`
        );

        await stmt.bind(text, summary, sentiment, category).run();

        return Response.json({
          ok: true,
          inserted: { text, summary, sentiment, category },
        });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
      }
    }

    // ---------- fallback ----------
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

