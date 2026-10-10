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
| **Gig Builder** | The booking form prints a live ticket as you fill it in, then sends itself to the band's inbox (with any jukebox requests) and stamps the ticket "SENT". If sending ever fails, it offers a pre-written email instead. |
| **Shows** | Upcoming gigs come from one list, and past dates drop off on their own. |
| **Watch** | YouTube clips on the homepage in a "theater" with a film-strip picker, Shorts in a phone-sized player, and a searchable `/videos/` page. Nothing from YouTube loads until someone presses play. |
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

### Videos: `_data/videos.yml`

Each clip is one line with its YouTube ID: the part after `watch?v=` (or after `shorts/`).

```yaml
videos:
  - { id: yqAKQAtSMLo, song: "Sex on Fire", artist: "Kings of Leon", featured: true, show: true }
shorts:
  - { id: k2abLonj4Bo, title: "Sex on Fire", show: true }
```

- `show: false` hides a clip from the site. It stays on YouTube.
- `featured: true` puts it on the homepage. The first featured clip is the one that plays big.
- Add new clips at the top of each list.
- `enabled: false` hides the video section and its menu link.

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

## Email: booking@spottedzebra.party

The site's address is **booking@spottedzebra.party**. Cloudflare Email Routing (free) forwards it to the band's Gmail.

**Receiving (Cloudflare):**
1. In Cloudflare, open **spottedzebra.party → Email → Email Routing** and click **Get started** / **Enable**. Let it add the MX and TXT records it asks for.
2. Under **Destination addresses**, add `SpottedZebraMusic@gmail.com` and click the verification link Cloudflare emails there.
3. Under **Routing rules → Custom addresses**, create `booking` → *Send to an email* → `SpottedZebraMusic@gmail.com`. Optionally turn on **Catch-all** so anything@spottedzebra.party also arrives.

**Replying as booking@ from Gmail (optional):**
1. Turn on 2-Step Verification for the Gmail account, then create an **App password** (Google Account → Security → App passwords).
2. In Gmail: **Settings → Accounts and Import → Send mail as → Add another email address**. Name: *Spotted Zebra*, address `booking@spottedzebra.party`, untick "Treat as an alias".
3. SMTP server `smtp.gmail.com`, port `587`, username = the full Gmail address, password = the app password, TLS. Confirm with the code Gmail sends (it arrives through the routing above).
4. Back in Cloudflare DNS, edit the TXT record that starts with `v=spf1` so it includes Google: `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`.

**Booking form:** it posts to FormSubmit (`formEndpoint` in `js/data.js`), which emails each booking to booking@spottedzebra.party. The **first** booking ever sent triggers an "Activate form" email from FormSubmit instead. Click **Activate Form** in that email once, and every booking after that arrives normally. Spam bots are filtered out by a hidden "honeypot" field.

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
