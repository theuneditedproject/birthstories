# Images

By default, the Why, About, and Terms pages use **inline SVG illustrations** that are part of `index.html` itself. No image files are required for the site to work — and the SVG art is original to the project, no licensing concerns.

This folder is here for the day you want to swap in real photographs or paintings instead. Read on if that's what you're doing.

---

## Swapping in real images

Each banner page (Why, About, Terms) has its inline SVG inside a `<figure class="page-banner">` block in `index.html`. To replace an SVG with a real image:

1. Find the `<figure class="page-banner">` for that page in `index.html` (search for it; there are three).
2. Replace the entire `<svg>...</svg>` element with an `<img>` tag:

   ```html
   <img src="images/why-hero.jpg" alt="Description of the image">
   ```

3. Add a credit `<figcaption>` underneath the `<img>`:

   ```html
   <figcaption>Käthe Kollwitz, <em>Mother with Child in Arms</em>, 1916. <a href="...">Source</a>. License notice.</figcaption>
   ```

4. Drop the actual image file in this folder using the filename you specified.
5. Commit and push.

## Where to find public-domain art

These are reliable, truly free open-access collections:

- **Wellcome Collection** (CC0 medical/historical) — https://wellcomecollection.org/search/works
- **The Met Open Access** (CC0) — https://www.metmuseum.org/art/collection/search?showOnly=openAccess
- **Smithsonian Open Access** (CC0) — https://www.si.edu/openaccess
- **Rijksmuseum** (PD) — https://www.rijksmuseum.nl/en/rijksstudio
- **Art Institute of Chicago** (PD) — https://www.artic.edu/collection?is_public_domain=1
- **Wikimedia Commons** — https://commons.wikimedia.org/

Search terms that work: *mother and child, maternity, pregnancy, childbirth, midwifery, gravid uterus, cradle, nativity*.

Look for "**CC0**" or "**Public Domain**" or "**Open Access**" on each work's page before downloading.

## Sizing tip

Banner area renders up to ~420px tall and full container width (~1080px on desktop). If your image is much larger than 1600×900, resize down to that before uploading to keep page load fast.

JPG is fine for paintings and photographs. PNG only if you specifically want transparency.
