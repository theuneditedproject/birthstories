# Images

This folder holds the public-domain artwork that appears as page banners on Why, About, and Terms.

The site looks for these three filenames specifically. **If a file is missing, that page just doesn't show its banner** — nothing breaks. So you can add them one at a time, or skip any you don't want.

## What goes where

### `why-hero.jpg` — Why this exists page

**Käthe Kollwitz, *Mother with Child in Arms* (Mutter mit Kind im Arm), 1916.** Lithograph.

Source: The Museum of Modern Art (MoMA), New York
URL: <https://www.moma.org/collection/works/65543>

License: Public domain (Kollwitz d. 1945; pre-1929 works are PD via copyright term in the US). MoMA may also flag the page with "Open Access" — verify the badge before download.

How to download: open the URL, click the image to enlarge, right-click → Save image. If MoMA's reproduction has restrictions, fall back to Wikimedia Commons:
<https://commons.wikimedia.org/wiki/Category:Mother_with_Child_in_Arms_by_K%C3%A4the_Kollwitz>

### `about-hero.jpg` — About the project page

**Berthe Morisot, *The Cradle* (Le Berceau), 1872.** Oil on canvas.

Source: Musée d'Orsay, Paris
URL: <https://www.musee-orsay.fr/en/artworks/le-berceau-905>

License: Public domain (Morisot d. 1895). The d'Orsay's high-resolution download is free for non-commercial use; for any use, the work itself is PD and you can use a Wikimedia Commons mirror without restriction:
<https://commons.wikimedia.org/wiki/File:Berthe_Morisot_-_Le_berceau_-_The_Cradle.jpg>

### `terms-hero.jpg` — Terms & license page

**William Hunter, *The Anatomy of the Human Gravid Uterus*, 1774.** Engraved by Jan van Rymsdyk. (Pick any plate that reads well as a banner — Plate VI is the most-reproduced full cross-section.)

Source: Wellcome Collection, London
URL: <https://wellcomecollection.org/works/whtxg2sj>

License: **CC0 / Public Domain** — Wellcome Collection explicitly grants free reuse for any purpose, including commercial. No attribution required, but they appreciate it. Click "Download" on the work page to get the high-res image.

## How to install

1. Download each image to your computer
2. Rename to the filenames above (`why-hero.jpg`, `about-hero.jpg`, `terms-hero.jpg`)
3. Drop them into this `images/` folder
4. Commit + push: the site picks them up automatically — credit lines under each image are already wired in the HTML

## Sizing tip

The site renders banners up to 420px tall, full container width (~1080px on desktop). If your downloaded image is much larger than 1600px wide, consider resizing it down to ~1600x900 to keep page load fast. Any image editor or [tinyjpg.com](https://tinyjpg.com) works.

JPG is fine for these (they're paintings/lithographs, lossy compression is invisible). PNG only if you specifically want transparency.

## Want a different image instead?

Just swap the file in this folder. The HTML has the filename hardcoded; no need to edit anywhere else. If you also want to change the credit line below the image (artist, museum, link), that's in `index.html` — search for `page-banner` and you'll find each `<figcaption>`.
