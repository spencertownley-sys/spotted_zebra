# Spotted Zebra 🦓

The official website for **Spotted Zebra**, playing all the hits in Seattle and the Pacific Northwest.
Live at **https://spottedzebra.party**.

It's a static site built by GitHub Pages' built-in Jekyll. There's nothing to install: edit files on github.com and the site rebuilds itself in about a minute.

## What's on it

| Feature | What it does |
| --- | --- |
| **Living zebra hero** | Animated, wavy zebra stripes that bend away from your cursor. Swap in a video loop any time (see "Homepage video" below). |
| **Spotlight photo** | The band photo sits in the dark. A spotlight follows your cursor, and drifts across the band on its own when nobody's steering. |
| **Play the Zebra** | At `/play/`: a playable zebra-stripe keyboard (mouse, touch drag, or keys `A`–`K`) with three sounds and a built-in drum beat. Runs on the Web Audio API with no audio files. |
| **The Jukebox** | At `/jukebox/`: the full song list, grouped by decade, searchable, with a "Watch" button on every song we have a video of. |
| **Press kit** | At `/press/`: bio, quick facts, venues, live videos, downloadable photo and logo. Prints cleanly to PDF. |
| **Mailing list** | "Get first dibs on show tickets" signup on the homepage and in the footer. Each signup lands in the booking inbox. |
| **Gig Builder** | The booking form prints a live ticket as you fill it in, then sends itself to the band's inbox and stamps the ticket "SENT". If sending ever fails, it offers a pre-written email instead. |
| **Shows** | Upcoming gigs come from one list, and past dates drop off on their own. Sits right under the hero, and the next show's poster pops up with a ticket button. |
| **Watch** | YouTube clips on the homepage in a "theater" with a film-strip picker, Shorts in a phone-sized player, and a searchable `/videos/` page. Nothing from YouTube loads until someone presses play. |
| **Listen** | A music player for your own recordings, with a zebra-stripe visualizer that moves with the music and controls on the phone lock screen. Originals and covers are labeled, and each song can be shown or hidden. |
| **Photos** | A gallery on the homepage plus a full `/photos/` page with a swipeable lightbox. Fills itself from a folder. |
| **Blog** | Posts at `/blog/`, with an RSS feed, a sitemap and search-engine tags generated automatically. |

It respects "reduced motion" settings, works with a keyboard, and is built for phones first.

## Updating the site

Every change below can be made on github.com: open the file or folder, use the pencil icon (edit) or **Add file → Upload files**, then commit. The site updates in about a minute.

### Shows, email and social links: `js/data.js`

- **Shows:** add one line per gig:
  ```js
  shows: [
    { date: "2026-11-14", time: "9 PM", venue: "The Some Bar", city: "Seattle, WA", link: "" },
  ],
  ```
  Add `flyer: "/assets/shows/your-flyer.jpg"` (put the image in `assets/shows/`) and the show gets a big featured card with the flyer. Optional extras: `title`, `with` (other bands), `doors`, `end`, `price`, `address`. Put a ticket URL in `link` and a **Get tickets** button appears.
- **Pop-up:** the next show with both a `flyer` and a ticket `link` pops up on the homepage (once per visit) with its poster and a **Buy tickets** button. Add `popup: false` to a show to skip it, or set `popup: false` near the top of the shows list to turn the pop-up off.

### Homepage video: `_config.yml` + `assets/video/`

1. Upload a 10–15 second muted loop (MP4, landscape, 1920×1080 or larger, ideally under 8 MB) to `assets/video/`, for example `hero.mp4`.
2. In `_config.yml`, set `hero_video: /assets/video/hero.mp4`. Optionally set `hero_poster:` to a still image shown while it loads.
3. The video fills the top of the homepage behind the logo. Clear `hero_video` to bring the zebra stripes back.

### Song list: `_data/songs.yml`

One line per song, grouped by decade. Add `yt:` with a YouTube ID to show a **Watch** button, or `show: false` to hide a song.

### Venues we've played: `_data/venues.yml`

One venue per line. Shows up in the "Spotted at" strip on the homepage and on the press kit.

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
     - title: "Runnin' Hot"
       file: runnin-hot.mp3
       note: "Demo"                      # optional: short label under the title
       show: true
     - title: "Mr. Brightside"           # a cover
       original_artist: "The Killers"    # leave out for originals
       file: mr-brightside.mp3
       show: true
   ```
   Originals are labeled "Spotted Zebra original". Covers say "Originally by …".
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

## Getting found on Google

Already built into the site:
- **Page titles and descriptions:** each page has its own, aimed at searches like "Seattle cover band".
- **Structured data** that tells Google who the band is (MusicGroup), answers common questions (FAQPage), and lists shows as events (MusicEvent).
- **Sitemap** at `/sitemap.xml`, plus a robots.txt that points to it.
- **Blog** with an RSS feed, a FAQ section, and a 404 page.

The things that move rankings most happen off the site:
1. **Google Search Console.** At search.google.com/search-console, add a *Domain* property for `spottedzebra.party`, verify it with the TXT record Google gives you (in Cloudflare DNS), then submit `https://spottedzebra.party/sitemap.xml`.
2. **Google Business Profile.** Create one at business.google.com as a "Band" or "Musician" in Seattle, set as a *service-area business* so no street address is shown. Link the website and ask happy hosts and venues for reviews. This is what puts you in the map results for "cover band near me".
3. **Point everything at the new site:** the Instagram, Facebook and YouTube bios and links, any venue or event listings, and Bandsintown or Songkick if you use them.
4. **Retire the old Wix site.** Unpublish it, or replace it with a single "We've moved → spottedzebra.party" page, so Google doesn't split your name between two sites.
5. **Keep it fresh:** add every show with its venue's street address, and post on the blog after gigs. Name the venue and neighborhood in each post.
6. **Get listed:** ask venues you play to link to the site from their event pages. Add the band to local directories, such as wedding vendor sites (The Knot, WeddingWire), GigSalad, and Seattle music calendars.

## Email: contact@spottedzebra.party

The site shows **contact@spottedzebra.party** everywhere (links, booking section, press kit, Google data). Cloudflare Email Routing (free) forwards it to **SpottedZebraMusic@gmail.com**, so the Gmail address never appears on the site. To change the address shown, edit `email` in `js/data.js` (and the `mailto:` links in `index.html` and `press.html`).

**Receiving (Cloudflare):**
1. In Cloudflare, open **spottedzebra.party → Email → Email Routing**. (It's already enabled: the MX and SPF records are in place.)
2. Under **Destination addresses**, make sure `SpottedZebraMusic@gmail.com` is listed and verified.
3. Under **Routing rules → Custom addresses**, create `contact` → *Send to an email* → `SpottedZebraMusic@gmail.com`. Keep the existing `booking` rule too: the booking form and mailing list still deliver through booking@. Or turn on **Catch-all** → `SpottedZebraMusic@gmail.com` so anything@spottedzebra.party arrives.

**Replying as contact@ from Gmail (optional):**
1. Turn on 2-Step Verification for the Gmail account, then create an **App password** (Google Account → Security → App passwords).
2. In Gmail: **Settings → Accounts and Import → Send mail as → Add another email address**. Name: *Spotted Zebra*, address `contact@spottedzebra.party`, untick "Treat as an alias". Then set it as the default "send as" address.
3. SMTP server `smtp.gmail.com`, port `587`, username = the full Gmail address, password = the app password, TLS. Confirm with the code Gmail sends (it arrives through the routing above).
4. Back in Cloudflare DNS, edit the TXT record that starts with `v=spf1` so it includes Google: `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`.

**Booking form and mailing list:** both post to FormSubmit (`formEndpoint` in `js/data.js`), which emails each one to booking@spottedzebra.party (already activated, and never shown to visitors). If you ever change that address, the **first** submission sends an "Activate form" email instead; click **Activate Form** once and everything after arrives normally. Spam bots are filtered out by a hidden "honeypot" field.

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
