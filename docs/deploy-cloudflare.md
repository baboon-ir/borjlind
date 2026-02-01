# Cloudflare: redirects for legacy biography URLs

Goal: support legacy URLs like:

- `/biografi/12` → `/biografi/#p-012`
- `/biografi/page/12` → `/biografi/#p-012`

## Option A (recommended for static hosting): build-time redirect pages

This repo already generates static redirect pages for **all 1…276**:

- `/biografi/<n>/index.html`
- `/biografi/page/<n>/index.html`

So you typically **do not need Cloudflare rules** if you deploy `_site/` as-is.

## Option B: Cloudflare Redirect Rules (3 rules to pad to 3 digits)

Cloudflare rules do not provide a generic `padStart()` helper, so the simplest approach is **three Redirect Rules** using regex ranges.

Create **Dynamic Redirect** rules (302 or 301) with these patterns:

### 1) 1–9
- If incoming URL matches regex: `^https?://[^/]+/biografi/(page/)?([1-9])/?$`
- Then redirect to: `/biografi/#p-00$2`

### 2) 10–99
- If incoming URL matches regex: `^https?://[^/]+/biografi/(page/)?([1-9][0-9])/?$`
- Then redirect to: `/biografi/#p-0$2`

### 3) 100–276
- If incoming URL matches regex: `^https?://[^/]+/biografi/(page/)?([1-2][0-9][0-9])/?$`
- Then redirect to: `/biografi/#p-$2`

Notes:
- Adjust the last range if you want to strictly cap at 276.
- Cloudflare’s UI varies; make sure the rule is applied to both variants (`/biografi/<n>` and `/biografi/page/<n>`) via the optional group `(page/)?`.

## Option C: Cloudflare Transform Rules

Transform Rules can be used to normalize paths, but it is usually simpler to use Redirect Rules for hash targets.

If you need advanced mapping or strict validation (1–276 only), consider a small **Cloudflare Worker**.
