/**
 * Unedited — reminder worker
 *
 * Stores opt-in "remind me to come back and write my story" requests in
 * Cloudflare KV, sends gentle nudges on a daily cron via Resend, and auto-
 * cancels reminders when the matching email submits a story.
 *
 * Endpoints:
 *   POST /api/reminder         — create a reminder
 *     body: { email, interval_days, lang? }
 *   POST /api/reminder/clear   — cancel any pending reminder for an email
 *     body: { email }           (called from the submit form's success path)
 *   GET  /api/unsubscribe?token=...  — opt out from any reminder email
 *
 * Cron: runs daily, sends any reminder whose next_due <= now, then bumps
 * next_due forward; auto-deletes after MAX_REMINDERS_SENT nudges without a
 * submission so we don't pester anyone forever.
 *
 * Environment:
 *   KV binding:    REMINDERS
 *   Secrets:       RESEND_API_KEY, FROM_EMAIL
 *   Variables:     SITE_URL (e.g. "https://birthstories.pages.dev")
 *                  ALLOWED_ORIGINS (comma-separated list of allowed CORS origins)
 */

const MAX_REMINDERS_SENT = 3;
const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 90;

// ---------- HTTP entry point ----------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const corsOrigin = allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] || "*");
    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/reminder" && request.method === "POST") {
        return withCors(await handleCreate(request, env), corsHeaders);
      }
      if (url.pathname === "/api/reminder/clear" && request.method === "POST") {
        return withCors(await handleClear(request, env), corsHeaders);
      }
      if (url.pathname === "/api/unsubscribe" && request.method === "GET") {
        return handleUnsubscribe(url, env);  // returns HTML, no CORS needed
      }
      return withCors(json({ ok: false, error: "Not found" }, 404), corsHeaders);
    } catch (err) {
      return withCors(json({ ok: false, error: "Server error: " + err.message }, 500), corsHeaders);
    }
  },

  // ---------- Daily cron ----------
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processReminders(env));
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function withCors(res, headers) {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return new Response(res.body, { status: res.status, headers: h });
}

// ---------- Helpers ----------

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(s) {
  return String(s || "").trim().toLowerCase();
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length < 254;
}

function randomToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode.apply(null, bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400 * 1000).toISOString();
}

async function kvKeyFor(email) {
  return "reminder:" + (await sha256Hex(normalizeEmail(email)));
}

// ---------- POST /api/reminder ----------

async function handleCreate(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  const email = normalizeEmail(body.email);
  const intervalDays = parseInt(body.interval_days, 10);
  const lang = (body.lang || "en").toString().slice(0, 8);

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }
  if (!Number.isFinite(intervalDays) || intervalDays < MIN_INTERVAL_DAYS || intervalDays > MAX_INTERVAL_DAYS) {
    return json({ ok: false, error: "Interval must be between 1 and 90 days" }, 400);
  }

  const key = await kvKeyFor(email);
  const token = randomToken();
  const record = {
    email,
    interval_days: intervalDays,
    lang,
    next_due: daysFromNow(intervalDays),
    count_sent: 0,
    created_at: new Date().toISOString(),
    token,
  };
  // 120 days TTL — anyone who hasn't submitted in 4 months gets cleaned up.
  await env.REMINDERS.put(key, JSON.stringify(record), { expirationTtl: 120 * 86400 });
  return json({ ok: true });
}

// ---------- POST /api/reminder/clear ----------

async function handleClear(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    // Don't leak validation — pretend success
    return json({ ok: true });
  }
  const key = await kvKeyFor(email);
  await env.REMINDERS.delete(key);
  return json({ ok: true });
}

// ---------- GET /api/unsubscribe ----------

async function handleUnsubscribe(url, env) {
  const token = url.searchParams.get("token") || "";
  if (!token) {
    return unsubscribePage("Missing token", false);
  }
  // Scan KV to find the matching token. KV doesn't have secondary indexes, so
  // we iterate. Cheap enough at this scale; if it grows large, add a second
  // KV namespace mapping token → key.
  let cursor;
  let removed = false;
  do {
    const list = await env.REMINDERS.list({ prefix: "reminder:", cursor });
    for (const entry of list.keys) {
      const raw = await env.REMINDERS.get(entry.name);
      if (!raw) continue;
      try {
        const rec = JSON.parse(raw);
        if (rec.token === token) {
          await env.REMINDERS.delete(entry.name);
          removed = true;
          break;
        }
      } catch {}
    }
    if (removed) break;
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  const siteUrl = (env.SITE_URL || "https://birthstories.pages.dev").replace(/\/+$/, "");
  return unsubscribePage(
    removed ? "You won't hear from us again." : "Couldn't find that reminder — it may have already been removed.",
    removed,
    siteUrl
  );
}

function unsubscribePage(message, success, siteUrl) {
  const heartColor = success ? "#a36400" : "#888";
  const heartChar = success ? "♡" : "·";
  const title = success ? "Unsubscribed" : "Hmm";
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unsubscribed — Unedited</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         font-family: Georgia, "Times New Roman", serif; background: #FAF7F0; color: #0F0F0F;
         padding: 24px; }
  .card { max-width: 480px; text-align: center; }
  h1 { font-size: 28px; font-weight: 500; margin: 0 0 16px; letter-spacing: -0.02em; }
  p { font-size: 16px; line-height: 1.55; margin: 0 0 12px; color: #444; }
  a { color: #0F0F0F; border-bottom: 1px solid currentColor; text-decoration: none; }
  .heart { font-size: 22px; color: ${heartColor}; margin-bottom: 12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="heart">${heartChar}</div>
    <h1>${title}</h1>
    <p>${escapeHtml(message)}</p>
    <p style="margin-top: 28px;"><a href="${escapeAttr(siteUrl)}">Back to Unedited</a></p>
  </div>
</body>
</html>`;
  return new Response(body, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// ---------- Scheduled handler ----------

async function processReminders(env) {
  const now = Date.now();
  let cursor;
  let processed = 0;
  do {
    const list = await env.REMINDERS.list({ prefix: "reminder:", cursor });
    for (const entry of list.keys) {
      const raw = await env.REMINDERS.get(entry.name);
      if (!raw) continue;
      let rec;
      try { rec = JSON.parse(raw); } catch { continue; }
      if (new Date(rec.next_due).getTime() > now) continue;

      // Due — send and bump.
      const sent = await sendReminderEmail(env, rec);
      if (sent) {
        rec.count_sent = (rec.count_sent || 0) + 1;
        if (rec.count_sent >= MAX_REMINDERS_SENT) {
          await env.REMINDERS.delete(entry.name);
        } else {
          // Stretch the interval a little each time — less pestering.
          const bump = Math.min(rec.interval_days * 2, MAX_INTERVAL_DAYS);
          rec.next_due = daysFromNow(bump);
          await env.REMINDERS.put(entry.name, JSON.stringify(rec), { expirationTtl: 120 * 86400 });
        }
        processed++;
      }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
  return processed;
}

async function sendReminderEmail(env, rec) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) {
    console.warn("Resend not configured; skipping email send");
    return false;
  }

  const siteUrl = (env.SITE_URL || "https://birthstories.pages.dev").replace(/\/+$/, "");
  const submitUrl = siteUrl + "/#submit";
  const unsubscribeUrl = (env.WORKER_URL || "").replace(/\/+$/, "") + "/api/unsubscribe?token=" + encodeURIComponent(rec.token);
  const greeting = rec.count_sent === 0 ? "A gentle note." : "Still thinking of you.";

  const subject = "Unedited — your story, when you have a moment";
  const textBody =
    "Hello,\n\n" +
    "A little while ago you said you'd come back to write your birth story for Unedited. We hope this finds you in a quiet moment.\n\n" +
    "Your draft is safe — it auto-saves on the submission page. Pick up where you left off, in any language, named or anonymous:\n\n" +
    submitUrl + "\n\n" +
    "If you'd rather not hear from us again, you can unsubscribe here:\n" +
    unsubscribeUrl + "\n\n" +
    "With care,\n" +
    "Unedited";

  const htmlBody =
    `<!DOCTYPE html><html><body style="font-family: Georgia, serif; line-height: 1.6; color: #222; padding: 20px; max-width: 560px; margin: 0 auto;">` +
    `<p style="margin: 0 0 14px;">Hello,</p>` +
    `<p style="margin: 0 0 14px;">A little while ago you said you'd come back to write your birth story for <em>Unedited</em>. We hope this finds you in a quiet moment.</p>` +
    `<p style="margin: 0 0 14px;">Your draft is safe — it auto-saves on the submission page. Pick up where you left off, in any language, named or anonymous:</p>` +
    `<p style="margin: 0 0 22px;"><a href="${escapeAttr(submitUrl)}" style="color: #0F0F0F; border-bottom: 1px solid #0F0F0F; text-decoration: none;">${escapeHtml(submitUrl)}</a></p>` +
    `<p style="font-size: 13px; color: #666; margin: 36px 0 0; padding-top: 16px; border-top: 1px solid #ddd;">` +
    `If you'd rather not hear from us again, ` +
    `<a href="${escapeAttr(unsubscribeUrl)}" style="color: #666;">unsubscribe here</a>.` +
    `</p>` +
    `<p style="margin: 18px 0 0; font-size: 13px; color: #666;">With care,<br>Unedited</p>` +
    `</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + env.RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [rec.email],
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Resend send failed:", res.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send error:", err.message);
    return false;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
