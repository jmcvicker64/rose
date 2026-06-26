# 🌹 Rose

A tiny, private app that gives your wife a **new picture and a new message every day**,
installed to her iPhone and iPad Home Screen with its own rose icon. No App Store, no fees.

## How the daily photo is chosen

Photos are picked by **the date they were taken** ("On This Day"):

- On a day that matches photos in your library — e.g. **13 January**, your wedding —
  she sees one of those, badged **"Married N years ago today"** / **"On this day · N years ago"**.
- On a day with no matching photo, she sees a **rotating picture** from the whole
  collection, so there's always something new. (Your 806 photos cover 135 of the year's days.)
- One of the written **messages** is shown each day too, rotating independently.

She can also swipe (or tap ‹ ›) to wander to any other day, and tap **Back to today**.

---

## Editing it (one file)

Open [`content.js`](content.js):

```js
const CONFIG = {
  recipientName: "Rose",   // her name, used in the greeting
  fromName: "",            // your name for a sign-off (optional)
  anniversary: "01-13",    // MM-DD — gets the special "Married N years ago" badge
};
```

Below that is the `MESSAGES` list — add or edit as many notes as you like.

### Changing the photos
The photo list lives in [`photos.js`](photos.js), which is **auto-generated** from your
library (each entry is a file + its capture date). You normally won't edit it by hand.

- **To remove a photo** (a screenshot, a venue render, an unflattering one): delete its
  line in `photos.js` and, if you like, delete the matching `photos/pXXXX.jpg`.
  The file [`photos/_source-map.tsv`](photos/_source-map.tsv) maps each `pXXXX.jpg` back
  to its original filename so you can tell which is which.
- **To add new photos later:** drop the originals somewhere and ask Claude to
  re-run the build — it re-reads capture dates, resizes for web, and regenerates `photos.js`.

> After any change to content or photos, bump the version in
> [`service-worker.js`](service-worker.js) (`rose-v2` → `rose-v3`, …) so her phone
> picks up the update.

---

## Previewing on your Mac

```bash
cd "/Users/johnmcvicker/Rose"
python3 -m http.server 8000
```
Open <http://localhost:8000> in Safari.

> If you've already installed it and changes aren't showing, that's the offline cache.
> Bumping the `service-worker.js` version fixes it; in Safari you can also clear the site.

---

## Getting it onto her iPhone & iPad

It needs to live at an https web address so her devices can install it. The photo set is
**~330 MB**, so a proper host (not your Mac) is the way to go.

**Recommended:** a free static host (Netlify, Cloudflare Pages, GitHub Pages). Claude can
deploy it for you to a **private, hard-to-guess link** — or one **behind a password**,
which is worth it here since these are personal photos.

Once it's at a link, on **her** device:
1. Open the link in **Safari**.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. The 🌹 icon appears and opens full-screen.

---

## What's inside

| File | What it does |
|------|--------------|
| `content.js` | **Your** names, anniversary, and the daily messages (edit this) |
| `photos.js` | Auto-generated list of photos + their capture dates |
| `photos/` | The web-sized images (`pXXXX.jpg`) + `_source-map.tsv` |
| `app.js` | Picks the day's photo by date, handles browsing & the badge |
| `index.html` / `styles.css` | Structure and look |
| `manifest.webmanifest` | Makes it installable with the rose icon |
| `service-worker.js` | Offline support |
| `icons/` | The 🌹 app icons |

### Extras you can ask Claude for
- A daily reminder notification.
- A special **message** that only appears on your anniversary (or birthdays).
- Pruning out screenshots / non-photos in one pass.
- A "days married" counter.
