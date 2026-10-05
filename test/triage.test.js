// Jev triage (src/triage.js) and its use in /api/draft: shown with the draft, a confident case type
// guides the draft, and a failing or missing Jev changes nothing.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createTriage } from "../src/triage.js";
import { createApp, createLimiter } from "../src/app.js";

const quiet = { warn() {} };
const answers = {
  case_type: { type: "choice", choice: "delivery", probabilities: { delivery: 0.94, other: 0.06 }, confidence: 0.9 },
  urgency: { type: "score", score: 1.7 },
  frustration: { type: "score", score: 1.8 },
  wants_human: { type: "noul", noul: 0.2 },
  churn_risk: { type: "noul", noul: 0.85 },
  injection: { type: "noul", noul: 0.01 },
};
const jev = (status = 200) => {
  const calls = [];
  return { calls, fetch: async (url, init) => { calls.push({ url, body: JSON.parse(init.body), headers: init.headers }); return status === 200 ? Response.json({ model: "jev-test", answers, usage: {} }) : new Response("{}", { status }); } };
};

test("triage: case type, urgency, mood and flags; off without a key; failure is null", async () => {
  const j = jev();
  const r = await createTriage({ apiKey: "k", fetch: j.fetch, log: quiet }).triage("Third time this week no paper. I'm done with this.");
  assert.deepEqual(r, { caseType: "delivery", caseConfidence: 0.94, urgency: 1.7, frustration: 1.8, wantsHuman: 0.2, churnRisk: 0.85, injection: 0.01, priority: true, reasons: ["urgent", "angry", "may leave"] });
  assert.equal(j.calls[0].url, "https://api.typesafe.ai/v1/systemone");
  assert.equal(j.calls[0].headers.authorization, "Bearer k");
  assert.deepEqual(Object.keys(j.calls[0].body.questions.case_type.criteria), ["cancellation", "delivery", "billing", "price_change", "address", "login", "other"]);
  assert.equal(await createTriage({ apiKey: "" }).triage("hi"), null);
  assert.equal(await createTriage({ apiKey: "k", fetch: jev(529).fetch, log: quiet }).triage("hi"), null);
});

const servers = [];
after(() => servers.forEach((s) => s.close()));
const serve = (app) => new Promise((resolve) => { const s = app.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${s.address().port}`)); servers.push(s); });

test("/api/draft: triage comes back with the draft and hints the case type only when none was picked", async () => {
  const seen = [];
  const draft = async (req) => { seen.push(req.caseType); return { case_type: req.caseType ?? "other", language: "en", subject: "s", draft: "d", notes: [], check_before_sending: [] }; };
  const base = await serve(createApp({ draft, triage: createTriage({ apiKey: "k", fetch: jev().fetch, log: quiet }), limiter: createLimiter({ perIpPerHour: 100 }) }));
  const post = (body) => fetch(`${base}/api/draft`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
  const a = await post({ message: "No paper again!" });
  assert.equal(a.triage.caseType, "delivery");
  assert.equal(a.triage.priority, true);
  const b = await post({ message: "No paper again!", caseType: "billing" });
  assert.deepEqual(seen, ["delivery", "billing"]); // the agent's choice wins
  assert.equal(b.case_type, "billing");
  const plain = await serve(createApp({ draft, limiter: createLimiter({ perIpPerHour: 100 }) }));
  const c = await fetch(`${plain}/api/draft`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "hi" }) }).then((r) => r.json());
  assert.equal(c.triage, undefined);
});
