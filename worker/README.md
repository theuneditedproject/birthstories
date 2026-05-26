# Unedited — Reminder Worker

A small Cloudflare Worker that holds opt-in "remind me to come back and write my story" requests and sends gentle nudges by email. It runs once a day on a cron schedule. When a matching email submits a story, the Worker auto-removes its pending reminder so the woman isn't pestered after she's already shared.

This file walks through one-time setup. Once deployed, the Worker runs without further attention.

## What you'll need

- A free **Cloudflare account** (you already have one — your site is on Pages).
- A free **Resend account** for sending the email (https://resend.com — 3,000 emails/month on the free tier).
- A **domain you own** to send email *from*. The Cloudflare `pages.dev` hostname can't be used as a sender. Use a domain like `dornafoundation.org` — Resend will give you DNS records to add.
- `node` and `npm` installed locally (you already have these).

## Step 1 — Install wrangler

```
cd worker
npm install
```

This installs `wrangler` (Cloudflare's CLI) into `worker/node_modules`. You'll invoke it via `npx wrangler` from here on.

## Step 2 — Log in to Cloudflare

```
npx wrangler login
```

Opens your browser, asks you to authorize wrangler. One-time.

## Step 3 — Create the KV namespace

```
npx wrangler kv:namespace create REMINDERS
npx wrangler kv:namespace create REMINDERS --preview
```

Each command prints something like:

```
🌀 Creating namespace with title "unedited-reminders-REMINDERS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "REMINDERS", id = "abc123def456..." }
```

**Copy the two IDs** (one from each command — the "live" id and the "preview" id) into `wrangler.toml`, replacing the `REPLACE_WITH_KV_NAMESPACE_ID` and `REPLACE_WITH_KV_PREVIEW_ID` placeholders.

## Step 4 — Set up Resend

1. Sign up at https://resend.com (free).
2. Add a sending domain. Use a domain you own (e.g. `dornafoundation.org`).
3. Resend gives you a list of DNS records (TXT, MX, CNAMEs) to add. Add them in Cloudflare DNS for that domain (Cloudflare dashboard → DNS).
4. Wait a few minutes; Resend verifies the records.
5. Once verified, create an API key (Resend dashboard → API Keys → Create API Key). Copy it.

You'll use a "from" address on that domain, e.g. `reminders@dornafoundation.org`. You don't need to set up a real mailbox at that address — Resend handles outbound sending; replies route by whatever you configure in DNS.

## Step 5 — Set Worker secrets

Run each of these and paste the value when prompted:

```
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put FROM_EMAIL
npx wrangler secret put ADMIN_SECRET
```

For `FROM_EMAIL`, use a friendly format like `Unedited <reminders@dornafoundation.org>`.

For `ADMIN_SECRET`, generate a long random string (e.g. `openssl rand -base64 32`). It's the bearer token the admin tool sends so the Worker knows the publish-confirmation email request is from you and not a stranger. Paste the same value into the admin tool's Settings panel after you sign in. Treat it like the GitHub PAT — local-only, regenerate if it leaks.

## Step 6 — Edit wrangler.toml

Open `worker/wrangler.toml` and:

1. Replace the KV `id` and `preview_id` with what you got from Step 3.
2. Update `SITE_URL` if you've added a custom domain to Cloudflare Pages (not strictly needed — the default `birthstories.pages.dev` works).
3. Update `ALLOWED_ORIGINS` similarly.

Leave `WORKER_URL` as the placeholder for now — you'll set it after the first deploy.

## Step 7 — First deploy

```
npx wrangler deploy
```

Wrangler will print the live URL, something like:

```
Published unedited-reminders (...) https://unedited-reminders.YOUR-CF-SUBDOMAIN.workers.dev
```

**Copy that URL.** Open `wrangler.toml` again, replace the `WORKER_URL` placeholder with that URL (this becomes the base for unsubscribe links inside the emails), then deploy a second time:

```
npx wrangler deploy
```

## Step 8 — Wire the public site to the Worker

In the project root, open `index.html` and find:

```
reminderEndpoint: "REPLACE_WITH_REMINDER_WORKER_URL",
```

Replace `REPLACE_WITH_REMINDER_WORKER_URL` with the Worker URL from Step 7. Commit and push.

The "Remind me later" button on the submit page is hidden when the placeholder is in place, and appears once a real URL is set.

## Step 9 — Verify

1. Go to your live site → Share yours.
2. Click **Remind me later**.
3. Use your own email, pick "In 3 days" (the smallest interval is fine for testing — you'll wait, not deal with it now).
4. After clicking **Set reminder**, you should see a success message.

To verify the data landed in KV:

```
npx wrangler kv:key list --binding REMINDERS
```

You should see a single key like `reminder:abc123…`.

To force-send any due reminders without waiting for the cron:

```
npx wrangler dev
# then in another terminal:
curl -X POST http://localhost:8787/__scheduled --header "Authorization: dummy"
```

(That's a wrangler-local dev convention; in production, the cron runs at 14:00 UTC daily.)

## Publish-confirmation emails

When Mosi publishes a story in the admin tool, the confirmation panel offers a **Send email now** button. If the admin's Worker URL + admin secret are configured (Settings tab), the button posts to `POST /api/notify-published` and the Worker sends the author their story URL and private manage link via Resend. Otherwise the panel falls back to the `mailto:` draft, same as before.

The endpoint requires `Authorization: Bearer <ADMIN_SECRET>` and validates that the email and URLs look sane before hitting Resend. It doesn't store anything in KV — fire-and-forget.

## Auto-cancellation flow

When a woman submits her story:

1. The submit form posts to Formspree (as today).
2. On a successful Formspree response, the page also fires a one-shot `POST /api/reminder/clear` to the Worker with her email.
3. The Worker hashes the email (SHA-256) and deletes any matching KV record.

No human is in the loop — she gets nudged only if she hasn't submitted, and only as long as she has a pending record. Maximum 3 nudges, gradually-stretched intervals; after that, the record auto-deletes.

## Privacy notes

- The Worker stores **plaintext email** in KV (it needs to in order to send the message). The KV is private to the Worker.
- KV records auto-expire after 120 days even if untouched.
- Each reminder email includes a one-click **unsubscribe link** (token-based) that wipes the record.
- The Pages site stores **no** email on its end — it just relays the opt-in to the Worker.

## Troubleshooting

- **"You'll hear from us again" / no email arrives.** Check `npx wrangler tail` while triggering the cron — you'll see logs from the Worker, including Resend's response. Most likely cause: `FROM_EMAIL` isn't a verified domain on Resend, or `RESEND_API_KEY` is wrong.
- **"Reminders aren't configured on this site yet."** The `CONFIG.reminderEndpoint` placeholder in `index.html` hasn't been replaced. Step 8.
- **CORS errors in browser console.** Check `ALLOWED_ORIGINS` in `wrangler.toml` includes the domain you're testing from. Redeploy after editing.

## Costs

- Cloudflare Workers free tier: 100,000 requests/day, 10ms CPU/request. The reminder API uses well under that.
- KV free tier: 100,000 reads/day, 1,000 writes/day. Plenty.
- Resend free tier: 3,000 emails/month, 100/day. If you ever exceed it, $20/month gets 50,000.

So this is free unless something improbable happens.
