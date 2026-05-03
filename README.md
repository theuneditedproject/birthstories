# Unedited

A collection of birth stories from mothers around the world, told in their own words.

This repo contains both the website (free GitHub Pages hosting) and the dataset of stories themselves (each story is a single JSON file). Editing a story is as simple as editing one file.

## How it works

- `index.html` is the entire website. Single file, no build step
- `stories/` contains one JSON file per published story, plus `index.json` listing them
- Submissions come in via Formspree. They're emailed to you privately
- When you decide to publish, you add a JSON file to `stories/` and update `index.json`
- The site loads stories at page load. No database needed

## Submitter experience

The "Share your story" page is a real writing environment, not just a plain text box:

- **Modern rich text editor (TipTap)**. Bold, italic, headings, blockquotes, bulleted and numbered lists, undo/redo. Same editor library used by Linear, Substack, GitLab, and others.
- **Auto-save drafts**. Drafts save to the submitter's browser every second as they type. If they close the tab and come back days later, their draft is waiting with a "Restore draft" button.
- **Word count**. Live, at the bottom of the editor
- **Preview**. See the story as it will appear on the site before submitting
- **Save status**. Small dot showing "Saved at 3:42 PM" so they know their work is safe
- **Keyboard shortcuts**. Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+S
- **Tag picker**. Clickable buttons to categorize the birth
- **Friendly validation**. Clear error messages if they miss something

When they submit, both an HTML version (with their formatting) and a plain text version arrive in your inbox.

## Audio recording

Some women would rather tell their story aloud than write it. The submission form has a **Write / Record** toggle, plus a Telegram option for mobile-first submitters. The recorder includes:

- One-click recording with pause and resume
- Live waveform visualization
- Playback to review before submitting
- Re-record button to start over
- 30-minute time limit (warning at 25 minutes)
- Works in any modern browser (Chrome, Firefox, Safari, Edge)

Audio uploads to Cloudinary (a free media-hosting service). You receive an email from Formspree with a link to the audio file. When you publish, the published story page displays a clean audio player.

### Telegram option

Below the in-page recorder, submitters see a "Send a voice note from your phone" option that opens Telegram and goes to your project's account. This is especially useful for:

- Submitters in regions where Telegram is the default messaging app (Iran, much of the Middle East and Central Asia)
- Mobile-first users who'd rather use their phone's native voice-message UX
- Longer recordings (Telegram supports up to 2GB per file vs. Cloudinary's free-tier limit)
- Submitters who want a back-and-forth conversation rather than a one-shot submission

The Telegram option is optional. If you don't set up a Telegram account, that section is automatically hidden.

You'll need to set up Cloudinary alongside Formspree for the in-page recorder, and (optionally) Telegram. Instructions below.

## Gallery

The gallery has two views, switchable with a toggle:

- **Featured** (default): one story at a time, large and cinematic, with prev/next arrows and a counter (e.g. "3 / 24"). Click anywhere on the card to read the full story. Keyboard arrows work too.
- **All stories**: compact cards in a list, easier to scan when there are many stories.

Stories appear in a **freshly shuffled order on every page load**, so no story is permanently buried at the bottom. A "Shuffle" button next to the view toggle lets people re-shuffle on demand. When a filter is active (by tag or language), shuffling applies within the filtered set.

## Sharing

Each published story has share buttons at the bottom: Twitter/X, Facebook, WhatsApp, Telegram, email, and copy link. The footer of every page also has share buttons for the project as a whole.

When someone shares a specific story, the link includes a hash like `#story=042` that auto-opens that story when the recipient clicks through.

### Share consent

The submission form has a checkbox: **"My story can be shared on social media (uncheck if you'd prefer your story stays only on this website)."** It defaults to checked (opt-out, not opt-in), so most stories will be shareable. If a submitter unchecks it, you should set `"share_allowed": false` in their JSON when you publish. The share buttons will be hidden on that story's page.

## Multilingual support

The site renders stories in any language correctly:

- **Automatic script detection**. When a story is displayed, the site detects whether it's in Persian, Arabic, Hebrew, Chinese, Japanese, Hindi, Bengali, Thai, or any Latin-script language, and applies the appropriate font and reading direction (RTL for Persian/Arabic/Hebrew).
- **Live in the editor**, as a writer types, the editor flips to right-to-left and switches to a Persian or Arabic font automatically. They see their story rendered correctly while writing, not just after submitting.
- **Language filter**. When you have stories in multiple languages, a language filter appears in the gallery so readers can browse in their preferred language.
- **No translation**. Stories stay in the language they were written in. The words are part of the story.

You can override auto-detection by adding a `"language"` field to a story's JSON (BCP-47 codes: `"fa"`, `"ar"`, `"zh"`, `"en"`, `"nl"`, etc.). Useful for distinguishing similar scripts (e.g. Norwegian vs. Swedish).

The form interface is in English. A short note tells submitters they can write in any language they prefer.

### How drafts work

Drafts save to the **submitter's own browser** (localStorage). They never leave their computer until they hit Submit. This means:

- Their draft is private to them. You can't see it
- If they switch devices, they won't see the draft on the other device
- Clearing browser data clears their draft
- This is by design. Gives them privacy and control while they're still deciding whether to share

## First-time setup

### 1. Create your project identity

Before anything technical, set up a project email and GitHub account separate from your personal accounts:

1. Create a new email (Gmail, ProtonMail) for the project
2. Create a GitHub account using that email, with a project username (not your name)
3. Don't fill your real name in the GitHub profile

### 2. Set up Formspree (intake)

1. Go to [formspree.io](https://formspree.io) and sign up with your project email
2. Create a new form, name it "Story submissions"
3. Copy the endpoint URL (looks like `https://formspree.io/f/abcdwxyz`)
4. Open `index.html` in any text editor
5. Find `formspreeEndpoint: "REPLACE_WITH_YOUR_FORMSPREE_URL"` near the top of the script section
6. Replace `REPLACE_WITH_YOUR_FORMSPREE_URL` with your URL
7. Save

Free Formspree allows 50 submissions/month. Upgrade for $10/mo if you exceed that.

### 2b. Set up Cloudinary (for audio recordings)

If you want submitters to be able to record their stories, you also need Cloudinary. If you only want text submissions, you can skip this step. The recorder will simply tell submitters that audio isn't available.

1. Sign up at [cloudinary.com](https://cloudinary.com) with your project email. Free tier
2. After signing in, find your **Cloud name** in the dashboard (top of the page)
3. Go to Settings → Upload → "Upload presets" → "Add upload preset"
4. Set "Signing Mode" to **Unsigned** (this is required for browser uploads)
5. Give it a name like `unedited_audio` and save
6. Open `index.html` and find these two lines near the top of the script:
   ```
   cloudinaryCloudName: "REPLACE_WITH_YOUR_CLOUD_NAME",
   cloudinaryUploadPreset: "REPLACE_WITH_YOUR_UPLOAD_PRESET",
   ```
7. Replace with your cloud name and the preset name you created. Save.

Free Cloudinary gives you 25GB storage and 25GB monthly bandwidth, which is plenty for early stages of the project.

### 2c. Set up Telegram (optional)

If you want to offer the Telegram option for voice notes:

1. On your phone, install Telegram if you haven't already
2. Sign up with the project's phone number (you may want a separate SIM or a virtual number for this. Keeps it separate from your personal account)
3. Go to Settings → Username and pick a username for the project (e.g. `unedited_stories`)
4. Open `index.html` and find:
   ```
   telegramUsername: "REPLACE_WITH_YOUR_TELEGRAM",
   ```
5. Replace with your username (without the @ symbol). Save.

If you skip this step, the Telegram option is automatically hidden on the form. To turn it back on later, just edit that one line.

**Tip:** When voice notes arrive on Telegram, your first reply should be a short checklist message:

> Thank you for sharing your story. To include it in the project, I just need to confirm a few things:
> 1. How would you like to be credited? (full name, first name, initials, or anonymous)
> 2. Where are you from? (optional)
> 3. Year of the birth? (optional)
> 4. Are there content notes others should know? (e.g. medical trauma, loss)
> 5. Do you give permission to publish on the website? You can ask for changes or removal anytime.
> 6. Would you also be open to being contacted about a future book? (separate consent will be required)

Save that as a "saved message" in Telegram so you can paste it quickly each time.

### Publishing an audio story

When a submission with audio arrives, you'll get the metadata via email plus a Cloudinary URL to the audio file. To publish:

1. Click the audio URL to listen
2. If approving, create a JSON file like the text stories, but with `audio_url` instead of (or alongside) `body`:
   ```json
   {
     "id": "042",
     "author": "Maria",
     "location": "Lisbon, Portugal",
     "year": "2023",
     "tags": ["hospital"],
     "content_notes": "",
     "language": "pt",
     "audio_url": "https://res.cloudinary.com/your-cloud/video/upload/...",
     "audio_duration_seconds": 1245,
     "submitted_at": "2026-04-15",
     "published_at": "2026-04-29",
     "body": ""
   }
   ```
3. Add to `stories/index.json` like any other story
4. The site automatically shows an audio player on that story's page

### 3. Push to GitHub and turn on Pages

1. Create a public repo on GitHub called `unedited` (or whatever you want)
2. Upload all these files (drag and drop in GitHub's web interface, or use Git)
3. In the repo: Settings → Pages
4. Source: "Deploy from a branch"
5. Pick `main` branch and `/` (root) folder, save
6. Wait 1–2 minutes. Your site is live at `https://YOUR-USERNAME.github.io/unedited/`

### 4. Optional: custom domain

1. Buy a domain at Namecheap, Porkbun, etc. (~$12/yr)
2. In your GitHub repo: Settings → Pages → Custom domain
3. In your registrar: add a CNAME record pointing your domain to `YOUR-USERNAME.github.io`
4. Wait for DNS to propagate (~1 hour)

### 5. Set up your private tracking repo (optional but recommended)

1. Create a second repo, this time **private**, called `unedited-tracking`
2. This is where you log incoming submissions as issues for your own organization
3. When a submission email arrives, you create a new issue in this repo to track it
4. Use labels: `pending-review`, `replied`, `approved`, `published`, `declined`, `book-candidate`
5. Only you (and anyone you invite) can see this repo

## Admin panel

There's an admin panel at `/admin.html` (or `https://YOUR-USERNAME.github.io/unedited/admin.html`). It lets you publish, edit, and delete stories from a clean UI instead of editing JSON files by hand. Everything runs in your browser; the only "backend" is GitHub itself.

### Setting up

1. Open the live site, then go to `/admin.html`. You'll see a sign-in screen.
2. The first time, you need a Personal Access Token from GitHub. Click the "How do I get a Personal Access Token?" link on the sign-in screen. It walks you through it. Takes about 3 minutes.
3. Enter your GitHub username, repo name (`unedited`), and paste the token. Check "Remember on this device" so you don't have to do this every time.
4. Click Sign in.

### What it does

- **Stories tab:** lists all published stories. Click Edit to change one, Delete to remove one (commits a deletion to GitHub).
- **New story tab:** a form with all the fields (author, location, language, tags, content notes, audio URL, share consent, dates, plus a rich-text editor for the body). Click Publish. It creates the JSON file, updates `index.json`, and the site rebuilds within ~1 minute.
- **Site content tab:** edit all the words shown on the public site. Site title, tagline, About page, Why page, home teaser, contact email, available submission tags. Backed by a structured `content.json` file that the site loads at runtime.
- **Settings tab:** sign out, link to edit `index.html` directly on GitHub for site-wide layout/style changes.

The editor in the New/Edit story screen detects when you're typing in Persian, Arabic, Chinese, etc. and switches direction and font accordingly. Same as the public submission form.

### Security notes

- Your GitHub token is stored only in this browser's localStorage. It never leaves your device except when calling api.github.com directly.
- The token has access only to the one repo you grant it, with read/write to Contents only. It can't access other repos or your account settings.
- Sign out clears the token. You can also revoke it any time from GitHub Settings → Developer settings → Personal access tokens.
- The admin page has a `noindex` meta tag, so search engines won't list it. It's not "secret" but it's not public either.

### When the admin panel isn't enough

The admin panel covers stories AND site text content. For deeper changes. Colors, fonts, page layout, adding new pages, modifying the submission form fields, anything code-level. Edit `index.html` directly on GitHub. There's a link to it from the Settings tab.

## Day-to-day workflow

### When a submission arrives

1. You get an email from Formspree with the full submission (both HTML and plain text)
2. Read it. Sit with it.
3. Optional: log it as an issue in your private tracking repo
4. Reply from your project email. Thank them, ask follow-up questions, clarify consent if needed
5. If publishing, see "Publishing a story" below
6. If not publishing, send a kind reply explaining

### Publishing a story

1. Pick the next available story number (e.g. `002`)
2. Create a new file: `stories/002-firstname-location.json`
3. Use this template:

```json
{
  "id": "002",
  "author": "Maria",
  "location": "Lisbon, Portugal",
  "year": "2023",
  "tags": ["hospital", "induction"],
  "content_notes": "",
  "submitted_at": "2026-04-15",
  "published_at": "2026-04-29",
  "body": "<p>The full story text. The site supports HTML formatting from the editor (p, strong, em, h2, h3, blockquote, ul, ol, li). You can also use plain text with double-newline paragraph breaks if you prefer.</p>"
}
```

4. Open `stories/index.json` and add the new story:

```json
{
  "stories": [
    { "id": "001", "file": "001-the-founder.json" },
    { "id": "002", "file": "002-maria-lisbon.json" }
  ]
}
```

5. Commit. The site updates within ~1 minute.

### Editing a published story

Open the JSON file, edit, save, commit. Done. Every change tracked in Git history.

### Removing a story

1. Delete the story's JSON file from `stories/`
2. Remove its entry from `stories/index.json`
3. Commit with a descriptive message

For a full history scrub, look up `git filter-repo`.

## Customizing the site

Everything you'd want to change is at the top of `index.html`:

- **Site name and tagline:** in the `<header>` section
- **Colors:** in the `:root` CSS block
- **About page text:** in the `<div id="page-about">` section
- **Available submission tags:** in `CONFIG.availableTags`
- **Auto-save delay:** in `CONFIG.autosaveDelayMs` (default 800ms)

## Things you might want to add later

- **Spreadsheet integration**. Formspree can pipe submissions into Google Sheets automatically
- **Newsletter**. Buttondown or Substack signup form on the About page
- **Translation**. Add a `language` field to each JSON, language filter to the UI
- **Image support**. Add an `image` field pointing to files in a new `stories/images/` folder

## Help

Common fixes:

- **Site loads but no stories:** check `stories/index.json` is valid JSON (jsonlint.com)
- **Form doesn't submit:** check the Formspree endpoint is correctly pasted in `index.html`
- **Pages doesn't update after a commit:** wait 2 minutes; GitHub Pages takes a moment to rebuild
- **Editor toolbar buttons don't work:** the editor (TipTap) loads from a CDN at page load. If the user has a flaky connection, the editor may take a moment to appear. They'll see "Loading editor…" until it's ready. If TipTap fails to load entirely (very rare), you'd see this in the browser console.

## Notes on TipTap

The site uses [TipTap](https://tiptap.dev) loaded from `cdn.jsdelivr.net` as ES modules. This means:

- No build step required. It just works
- ~150KB downloaded only when a visitor opens the **Share your story** page (lazy-loaded). Other visitors never download it.
- The version is pinned in `index.html` (currently `TIPTAP_VERSION = "2.11.5"`) so it won't break unexpectedly if TipTap releases new versions
- To upgrade, change the value of `TIPTAP_VERSION` near the top of the script section in `index.html`. (Older code had four separate `import` lines. The new code uses dynamic `import()` so there's only one constant to change.)
- If TipTap ever fails to load (CDN outage), the site falls back to a plain `<textarea>` automatically so submitters can still share their story.

The **admin panel** uses a simpler `contenteditable` editor (not TipTap) for editing story bodies. Fewer dependencies, smaller surface area for the operator. If you'd prefer TipTap there too, see "Things you might want to add later" below.

## Terms & license

Each story is © its author. **All rights reserved.** Two layers of permission to keep in mind:

**1. What the project (you) may do with each story.** By submitting, the author grants Unedited a non-exclusive license to: publish on the website, share on official social channels, include in a project newsletter, translate (with the original kept available), read aloud as part of an official audio version or podcast, quote excerpts in press / partner publications, and edit lightly for typos and clarity. The author can withdraw or restrict any of this at any time. Book inclusion is a separate written consent.

**2. What readers (the public) may do.** Read the story here on the site, share a *link* to it (the share buttons send links, not story text), and quote briefly with attribution. Readers cannot copy a full story to another website, translate it, adapt it, republish it, or use it commercially without the author's explicit permission. The site is the place these stories live.

The full plain-English version is on the **Terms** page on the site (`#terms`), and there's a copyright footer on every story.

The `_STORY_TEMPLATE.json` defaults `"license": "all-rights-reserved"`. The field is mostly informational — what governs reader rights is what the Terms page says. If you ever want a story to be more openly shareable (rare for this project), you could mark it with a Creative Commons identifier and we'd extend the rendering logic.

If you find a story republished without permission, the author can require it taken down. Help her send a takedown notice — most platforms (Medium, WordPress, Substack, etc.) have copyright-complaint forms that get acted on quickly.
