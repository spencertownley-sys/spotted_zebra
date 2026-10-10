# Spotted Zebra 🦓

The official website for **Spotted Zebra**, playing all the hits in Seattle and the Pacific Northwest.
Live at **https://spottedzebra.party**.

It's a static site built by GitHub Pages' built-in Jekyll. There's nothing to install: edit files on github.com and the site rebuilds itself in about a minute.

## What's on it

| Feature | What it does |
| --- | --- |
| **Living zebra hero** | Animated, wavy zebra stripes bend away from your cursor. Click or tap anywhere to drop a "spot" that plays a note. |
| **Spotlight photo** | The band photo sits in the dark. A spotlight follows your cursor, and drifts across the band on its own when nobody's steering. |
| **The Jukebox** | Choose a decade (80s, 90s, 2000s, Now), tick songs, and send them to the band as requests. "Shuffle" spins the record and picks a random song. |
| **Play the Zebra** | A playable zebra-stripe keyboard (mouse, touch drag, or keys `A`–`K`) with three sounds and a built-in drum beat. Runs on the Web Audio API with no audio files. |
| **Gig Builder** | The booking form prints a live ticket as you fill it in. Sending opens a pre-written email to the band, including any jukebox requests. |
| **Shows** | Upcoming gigs come from one list, and past dates drop off on their own. |
| **Listen** | A music player for your own recordings, with a zebra-stripe visualizer that moves with the music and controls on the phone lock screen. Each song can be shown or hidden. |
| **Photos** | A gallery on the homepage plus a full `/photos/` page with a swipeable lightbox. Fills itself from a folder. |
| **Blog** | Posts at `/blog/`, with an RSS feed, a sitemap and search-engine tags generated automatically. |

It respects "reduced motion" settings, works with a keyboard, and is built for phones first.

## Updating the site

Every change below can be made on github.com: open the file or folder, use the pencil icon (edit) or **Add file → Upload files**, then commit. The site updates in about a minute.

### Shows, jukebox, email and social links: `js/data.js`

- **Shows:** add one line per gig:
  ```js
  shows: [
    { date: "2026-11-14", time: "9 PM", venue: "The Some Bar", city: "Seattle, WA", link: "" },
  ],
  ```
- **Set list:** the jukebox songs are **samples**. Replace them with your real set list.

### Music: `_data/music.yml` + `assets/music/`

1. Upload the audio file (mp3 or m4a) into `assets/music/`.
2. Add it to `_data/music.yml`:
   ```yaml
   songs:
     - title: "Mr. Brightside"
       original_artist: "The Killers"
       file: mr-brightside.mp3
       recorded: "Live at The Some Bar, 2025"   # optional
       show: true
   ```
3. `show: false` hides one song. `enabled: false` at the top hides the whole Listen section. With no songs showing, the section and its menu link disappear on their own.

`show: false` only hides the song from the site. The file can still be reached by its direct link, so delete it from `assets/music/` to take it down completely.

**About covers:** posting recordings of other people's songs usually needs a license from the songwriters and publishers (a "mechanical" license for audio). The show/hide switch makes it easy to pull a song if needed.

### Photos: `assets/photos/`

Upload images into `assets/photos/` and they show up automatically, with the newest file names first. The file name becomes the caption, so name files like `2025-06-14-dance-floor-at-the-some-bar.jpg`; the leading date is used for sorting and hidden from the caption. Delete a file to remove it.

Phone photos are often 3–8 MB. Shrink them to about 2000px wide (under ~500 KB) before uploading so the gallery loads fast. Any free tool like squoosh.app works.

### Blog: `_posts/`

Add a file named `YYYY-MM-DD-short-title.md`, for example `_posts/2026-11-15-our-halloween-show.md`:

```markdown
---
title: "Our Halloween Show Was Wild"
description: "One or two sentences that show up in Google results."
cover: /assets/photos/2026-10-31-halloween-crowd.jpg   # optional
---

Write the post here. **Bold**, [links](https://example.com), and lists all work.

## A heading

More text.
```

Posts with a future date won't appear until that day.

**SEO tips:** post regularly (even one short post a month helps), mention places people search for ("Seattle", "Bellevue", "wedding band", "cover band"), link to your other posts, and write a real `description` for each one. The three starter posts are written in the band's voice but are generic, so edit them to sound like you.

Images live in `assets/img/`. To swap the main band photo, replace `band.webp` (keep it square, about 1080px).

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

## Previewing locally (optional)

```sh
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```
