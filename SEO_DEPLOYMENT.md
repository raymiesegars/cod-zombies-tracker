# SEO & Indexing Setup Guide

This document covers how to get CoD Zombies Tracker properly indexed by Google and fix common issues.

## Canonical URL: `https://codzombiestracker.com` (no www)

The site is configured to use **non-www** as canonical. All code strips `www` and uses `https://codzombiestracker.com`.

---

## 1. Vercel Domain Configuration

**Critical:** For the middleware www→non-www redirect to work, **both** domains must be added to your Vercel project.

### Steps

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Ensure both are present:
   - `codzombiestracker.com` (primary)
   - `www.codzombiestracker.com` (redirect)
3. For `www.codzombiestracker.com`, set it to **Redirect** to `codzombiestracker.com`, or add it as an alias so traffic hits the same project (the middleware will redirect www → non-www).

If `www.codzombiestracker.com` is **not** in Domains, requests will 404 before they reach your app.

---

## 2. Environment Variable

In Vercel → Project → **Settings** → **Environment Variables**, set:

```
NEXT_PUBLIC_APP_URL=https://codzombiestracker.com
```

**Do not use `https://www.codzombiestracker.com`.** The code normalizes to non-www, but keeping this consistent avoids confusion.

---

## 3. Google Search Console

### Add the correct property

1. [Google Search Console](https://search.google.com/search-console)
2. Add property: **URL prefix** → `https://codzombiestracker.com`
3. Verify via DNS or HTML tag as instructed.

**Do not** add `http://` or `www.` as separate properties; they should redirect to the canonical URL.

### Understanding Search Console messages

- **"Page has redirect"** on `http://codzombiestracker.com` – Expected. HTTP redirects to HTTPS. Only the HTTPS version is indexed.
- **"Not found (404)"** on `http://www.codzombiestracker.com` – Usually means `www` is not configured in Vercel. Add it as in section 1.
- **"Indexing requested"** – Use "Request indexing" for the home page after fixes.

### Sitemap

1. Search Console → Sitemaps
2. Submit: `https://codzombiestracker.com/sitemap.xml`

---

## 4. Favicon in Search Results

Favicons are set in `layout.tsx`:

- `favicon.ico` (16×16, 32×32, etc.)
- `icon-192.png`, `icon-512.png`
- `apple-touch-icon.png` (180×180)

Google chooses from these. Favicon updates can take days or weeks to appear in search results.

---

## 5. Build Frequency

Deploying often does **not** block indexing. Google handles frequent updates. Avoid changing canonical URLs or core structure if you want stable indexing.

---

## 6. What Was Fixed in Code

- **OG image:** Added `opengraph-image.tsx` to generate a 1200×630 image (fixes blank globe in shares).
- **Canonical:** Root layout uses `https://codzombiestracker.com` as canonical.
- **Sitemap:** Includes home, maps, leaderboards, find-group, mystery-box, about, tools, and all map pages.
- **Robots:** Allows indexing of public pages; blocks `/api/`, `/settings`, `/auth/`.
- **Middleware:** Redirects `www` → non-www and `http` → `https` (301).

---

## 7. Re-request Indexing

After deploying:

1. Search Console → URL Inspection
2. Enter `https://codzombiestracker.com`
3. Click **Request indexing**

Repeat for `https://codzombiestracker.com/maps` if desired.
