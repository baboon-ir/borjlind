# Cloudflare: legacy biography URL redirects

Goal:

- `/biografi/12` → `/biografi/#p-012`
- `/biografi/page/12` → `/biografi/#p-012`

## Recommended (static): use the generated redirect pages

Eleventy generates redirect pages for **1..276**:

- `/biografi/<n>/index.html`
- `/biografi/page/<n>/index.html`

So you typically don’t need Cloudflare rules if you deploy `_site/` as-is.

## If you still want Cloudflare Redirect Rules

Cloudflare does not provide a simple `padStart(3)` helper, so the simplest approach is **three redirect rules** based on the numeric range.

Create **Dynamic Redirect** rules:

### Rule 1: 1–9
- Incoming URL regex: `^https?://[^/]+/biografi/(page/)?([1-9])/?$`
- Target: `/biografi/#p-00$2`

### Rule 2: 10–99
- Incoming URL regex: `^https?://[^/]+/biografi/(page/)?([1-9][0-9])/?$`
- Target: `/biografi/#p-0$2`

### Rule 3: 100–276
- Incoming URL regex: `^https?://[^/]+/biografi/(page/)?([1-2][0-9][0-9])/?$`
- Target: `/biografi/#p-$2`

Adjust the last rule if you want to strictly cap at 276.
