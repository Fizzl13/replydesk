import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COMPANY, CASE_TYPES, SAMPLES } from "./company.js";
import { DraftError, parseDraftRequest, MAX_MESSAGE_CHARS, MAX_INSTRUCTION_CHARS } from "./drafter.js";

// The fizzl.eu homepage runs a small version of this demo against /api/draft.
export const DEFAULT_ORIGINS = ["https://fizzl.eu", "https://www.fizzl.eu", "https://ai.fizzl.eu", "https://projects.fizzl.eu"];

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

// Every draft costs an API call, so the public demo is capped per visitor and
// per day. Per instance and in memory: a restart resets it, which is fine here.
export function createLimiter({ perIpPerHour = 10, perDay = 300, now = () => Date.now() } = {}) {
  const hits = new Map();
  let day = { start: now(), count: 0 };
  return function allow(ip) {
    const t = now();
    if (t - day.start >= 86_400_000) day = { start: t, count: 0 };
    if (day.count >= perDay) return { ok: false, reason: "The demo's daily limit is reached. Try again tomorrow." };
    const recent = (hits.get(ip) ?? []).filter((s) => t - s < 3_600_000);
    if (recent.length >= perIpPerHour) return { ok: false, reason: `Demo limit: ${perIpPerHour} drafts per hour. Try again later.` };
    recent.push(t);
    hits.set(ip, recent);
    if (hits.size > 10_000) hits.delete(hits.keys().next().value);
    day.count++;
    return { ok: true };
  };
}

export function createApp({ draft, limiter = createLimiter(), origins = DEFAULT_ORIGINS }) {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'",
    });
    next();
  });

  app.use("/api/draft", (req, res, next) => {
    const origin = req.get("origin");
    const allowed = Boolean(origin && origins.includes(origin));
    if (allowed) {
      res.set({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
      });
    }
    if (req.method === "OPTIONS") return res.sendStatus(allowed ? 204 : 403);
    next();
  });

  app.get("/health", (_req, res) => res.json({ ok: true, service: "replydesk" }));

  app.get("/api/config", (_req, res) => res.json({
    company: COMPANY.name,
    caseTypes: CASE_TYPES,
    samples: SAMPLES,
    limits: { message: MAX_MESSAGE_CHARS, instruction: MAX_INSTRUCTION_CHARS },
  }));

  app.post("/api/draft", express.json({ limit: "16kb" }), async (req, res) => {
    try {
      const request = parseDraftRequest(req.body);
      const allowed = limiter(req.ip);
      if (!allowed.ok) return res.status(429).json({ error: allowed.reason });
      res.set("Cache-Control", "no-store").json(await draft(request));
    } catch (err) {
      if (err instanceof DraftError) return res.status(err.status).json({ error: err.message });
      console.error("[draft]", err);
      res.status(500).json({ error: "Something went wrong. Try again." });
    }
  });

  app.use(express.static(PUBLIC_DIR, { maxAge: "1h" }));
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  return app;
}
