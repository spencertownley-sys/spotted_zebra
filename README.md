# Spotted Zebra 🦓

The official website for **Spotted Zebra**, playing all the hits in Seattle and the Pacific Northwest.
Live at **https://spottedzebra.party**.

It's a plain static site: HTML, CSS and JavaScript, with no build step and no dependencies.

## What's on it

| Feature | What it does |
| --- | --- |
| **Living zebra hero** | Animated, wavy zebra stripes bend away from your cursor. Click or tap anywhere to drop a "spot" that plays a note. |
| **Spotlight photo** | The band photo sits in the dark. A spotlight follows your cursor, and drifts across the band on its own when nobody's steering. |
| **The Jukebox** | Choose a decade (80s, 90s, 2000s, Now), tick songs, and send them to the band as requests. "Shuffle" spins the record and picks a random song. |
| **Play the Zebra** | A playable zebra-stripe keyboard (mouse, touch drag, or keys `A`–`K`) with three sounds and a built-in drum beat. Runs on the Web Audio API with no audio files. |
| **Gig Builder** | The booking form prints a live ticket as you fill it in. Sending opens a pre-written email to the band, including any jukebox requests. |
| **Shows** | Upcoming gigs come from one list, and past dates drop off on their own. |

It respects "reduced motion" settings, works with a keyboard, and is built for phones first.

## Updating the site

**Everything you'll normally change lives in [`js/data.js`](js/data.js):**

- **Shows:** add one line per gig:
  ```js
  shows: [
    { date: "2026-11-14", time: "9 PM", venue: "The Some Bar", city: "Seattle, WA", link: "" },
  ],
  ```
- **Set list:** the jukebox songs are **samples**. Replace them with your real set list.
- **Email and social links.**

You can edit that file right on github.com (pencil icon) and commit. The site updates in about a minute.

Images live in `assets/img/`. To swap the band photo, replace `band.webp` (keep it square, about 1080px).

## Hosting on GitHub Pages + spottedzebra.party

1. In the repo, go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, and save.
2. The `CNAME` file in this repo already tells GitHub the custom domain is `spottedzebra.party`. Confirm it shows under **Custom domain** on the same page.
3. At the company where you registered **spottedzebra.party**, set these DNS records:

   | Type | Name / Host | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `spencertownley-sys.github.io` |

   Delete any other A/AAAA records on `@`, such as a registrar "parking" page.
4. Once DNS has propagated (minutes to a few hours), tick **Enforce HTTPS** in Settings → Pages.

## Running it locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```
