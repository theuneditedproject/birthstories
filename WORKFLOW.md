# Workflow cheatsheet

This is the everyday operations guide. Bookmark it, or print the section you need most.

---

## When a submission arrives by email (Formspree)

1. Read the email
2. Sit with it. There's no rush. Stories deserve attention before decisions.
3. Reply to the submitter from your project email. Thank them. Ask any follow-up questions. Confirm consent if anything was unclear.
4. **If you're publishing it:** follow the "Publish a new story" recipe below
5. **If you're not publishing it:** send a kind reply explaining (it doesn't have to be long; "thank you for trusting us with this. We've decided not to include it because [reason]" is enough)

### Notes on the cover image (when included)

The submission email includes a `cover_image_url` field if the submitter uploaded an image. Before publishing:

1. Click the URL and look at the image carefully. Specifically check for:
   - **Recognizable children's faces.** If any child's face is identifiable, ask the submitter to crop or replace the image. We don't publish identifiable images of minors. This is non-negotiable, even if the submitter is the child's parent.
   - **Identifying details that could compromise privacy.** Hospital wristbands with names/numbers, license plates, name badges on staff, very specific room numbers or signage. Crop or skip.
   - **Anything that doesn't match the tone the submitter intended.** If the image is obviously a stock photo or AI-generated and feels off, you can ask if she'd like to swap.
2. If the image is fine, paste the URL into the `cover_image` field of the story's JSON when you publish.
3. If she didn't upload one, the story renders cleanly without — typography only. Don't add a default image.

### Notes on the consent fields in the email

The submission email includes a few consent flags. Worth knowing what each means:

- `consent_author` / `consent_publish` / `consent_license`. Required to submit. If any are "no", the form wouldn't have gone through.
- `consent_share`. Defaults to "yes". If "no", set `"share_allowed": false` in the JSON when you publish, and the share buttons will be hidden on that story.
- `consent_book`. Opt-in. If "yes", they're open to a future book conversation. **Log this in your private tracking repo with the `book-candidate` label** so you can find it later.
- `long_term_contact`, only present if they checked the book box AND filled in this optional field. It's their preferred way to be reached about the book later (might be a different email, a phone, a Telegram handle). Save it in your tracking repo. If empty, the regular email above is what they want you to use.

## When a voice note arrives on Telegram

1. Listen to it
2. Reply with the metadata-collection checklist (saved in your Telegram saved messages):

   > Thank you for sharing your story. To include it in the project, I just need to confirm a few things:
   > 1. How would you like to be credited? (full name, first name, initials, or anonymous)
   > 2. Where are you from? (optional)
   > 3. Year of the birth? (optional)
   > 4. Are there content notes others should know? (e.g. medical trauma, loss)
   > 5. Do you give permission to publish on the website? You can ask for changes or removal anytime.
   > 6. Is it okay if your story can be shared on social media?
   > 7. Would you also be open to being contacted about a future book? (separate consent will be required)

3. When they reply, copy the audio file: tap the voice message, "Save to..." → save to your computer, OR forward to a cloud storage service
4. Upload the audio to Cloudinary manually:
   - Go to cloudinary.com/console
   - Click "Media Library" → "Upload"
   - Drop the file in
   - Once uploaded, click the file → "Copy URL" (use the URL ending in `.webm`, `.mp3`, or `.mp4`)
5. Follow "Publish a new story" recipe, putting the Cloudinary URL in `audio_url`

---

## Publish a new story

1. **Pick the next story number.** Look at `stories/index.json` for the highest existing ID, add 1. If the latest is `008`, your new one is `009`.

2. **Create a new file.** In GitHub: navigate to `stories/` folder → "Add file" → "Create new file" → name it `009-firstname-location.json` (lowercase, dashes, no spaces).

3. **Copy this template into the file:**

```json
{
  "id": "009",
  "author": "First name only or full name",
  "location": "City, Country (or empty string)",
  "year": "2024",
  "tags": ["pick-from-list-below"],
  "content_notes": "leave empty if none",
  "language": "en",
  "share_allowed": true,
  "submitted_at": "YYYY-MM-DD",
  "published_at": "YYYY-MM-DD",
  "audio_url": "",
  "audio_duration_seconds": 0,
  "body": "<p>Paste the story HTML here. The form sends story_html in submission emails. Copy that whole block.</p><p>Each paragraph is in its own p tag.</p>"
}
```

4. **Fill in each field.** Notes:
   - **id** must match the number in the filename
   - **language** uses BCP-47 codes: `en` English, `fa` Persian, `ar` Arabic, `nl` Dutch, `zh` Chinese, `ja` Japanese, `es` Spanish, `pt` Portuguese, `fr` French, `de` German, `he` Hebrew, `hi` Hindi
   - **share_allowed** is `true` unless they opted out on the form (or asked you to keep it private)
   - **audio_url** stays empty (`""`) for text-only stories. For audio stories paste the Cloudinary URL.
   - **body** can be empty (`""`) for audio-only stories
   - **tags** are an array. Available: `hospital`, `home`, `birth-center`, `water-birth`, `c-section`, `vbac`, `induction`, `unmedicated`, `epidural`, `premature`, `twins`, `surrogacy`, `adoption`, `loss`, `first-baby`, `rainbow-baby`

5. **Commit the new file.** Scroll down, write a commit message like "Add story 009. Maria, Lisbon", click "Commit new file"

6. **Update `stories/index.json`.** Click on `index.json`, click the pencil icon. Add the new entry inside the `"stories"` array:

```json
{
  "stories": [
    { "id": "001", "file": "001-the-founder.json" },
    { "id": "002", "file": "002-sample-farsi.json" },
    { "id": "009", "file": "009-firstname-location.json" }
  ]
}
```

   Don't forget the comma after the previous entry. Commit this change too.

7. **Wait 1-2 minutes.** GitHub Pages rebuilds. Refresh your site. Your new story appears.

---

## Edit a published story

Just open the JSON file, click the pencil icon, change what you want, commit. The site updates within a minute. The full edit history is preserved in Git.

Common edits:
- **Fix a typo:** edit `body`, recommit
- **Add tags:** add to the `tags` array
- **Change author credit:** edit `author` (e.g. they wanted to be more anonymous later)
- **Add content notes:** edit `content_notes`

---

## Remove a story

1. Navigate to the story's JSON file in the repo
2. Click the trash icon at the top
3. Commit the deletion (something like "Remove story 042 at author's request")
4. Open `stories/index.json` and delete that story's line from the array
5. Commit

The story disappears from the site within a minute. If the author also wants it scrubbed from Git history (rare but valid), look up `git filter-repo` or ask for help.

---

## Edit the site itself (header text, About page, etc.)

1. Open `index.html` in the repo
2. Click the pencil icon
3. Use Ctrl/Cmd+F to find the text you want to change
4. Edit it
5. Commit

Common edits:
- **Change the tagline** under the site title: search for "Birth stories in their own words"
- **Change About page text:** search for "About this project". The page text is right there
- **Change the Why page:** search for "Why this exists". Same idea
- **Add a new tag** to the submission form: find `availableTags` and add it to the array
- **Change the contact email:** search for `hello@example.com`. It appears in About and footer

If you accidentally break something, GitHub keeps history. Click the file's "History" button, find the version that worked, click "..." → "Revert".

---

## When something looks wrong on the site

1. **Did you commit?** GitHub web editor needs the "Commit changes" button. Editing alone doesn't save.
2. **Did you wait 2 minutes?** Pages rebuilds take a moment.
3. **Did you break the JSON?** Paste the file into [jsonlint.com](https://jsonlint.com). It'll tell you what's wrong. Most common issues: missing comma between entries, missing quote, extra trailing comma.
4. **Did you forget `stories/index.json`?** Stories must be listed there or they don't appear.
5. **If still broken:** click the file's History tab, revert to the last good version.

---

## A weekly habit I'd suggest

Once a week, spend 10 minutes:

1. Check your project email inbox for new submissions
2. Check your project Telegram for new voice notes
3. Reply to anything that's been waiting
4. Publish 1-2 stories you've been sitting with
5. Look at the live site, click around, make sure nothing's broken

Doesn't have to be exact. The point is to keep the project moving without it taking over your life.

---

## Worth keeping handy

- Your GitHub repo URL: `https://github.com/YOUR-USERNAME/unedited`
- Your live site: `https://YOUR-USERNAME.github.io/unedited/`
- Your project email: `___________________@gmail.com`
- Your Telegram username: `@___________________`
- Your Cloudinary cloud name: `___________________`

Print this section. Tape it inside a notebook. Whatever works.
