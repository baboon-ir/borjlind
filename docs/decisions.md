# Decisions (MVP)

- **Eleventy input dir** is repo root, but content lives under `content/pages/`.
- **Biografi** is one long scroll page (`/biografi/`) rendering 10 demo page fragments from `content/pages/biografi/pages/`.
- **Anchors** are fixed `p-001…p-276` for compatibility.
- **Legacy routes** are supported by generating static redirect pages for all 1..276.
- **Render markers** are handled at build time:
  - `[IMAGE: x]` → `<figure><img src="/assets/images/x" …></figure>`
  - `[VIDEO: url]` → `<iframe …>`
  - `[MORE]` → `<details>`
- **Scroll restore** uses `localStorage['bio:last']` and respects explicit URL hashes.

## Style parity (live sites)

- See `docs/style-audit.md` for the extracted tokens/components from:
  - https://rolfborjlind.com
  - https://biografi.rolfborjlind.com
- **Core palette** (match live):
  - dark: `#1c1d1e` (bio)
  - hub-dark: `#282828` (hub)
  - light text/border: `#fdf9f0`
- **Core typography**: serif stack `ui-serif, Georgia, Cambria, “Times New Roman”, Times, serif`.
- **Reusable components**:
  - hub cards use a rounded 2px light stroke and a subtle “hand-drawn” vibe.
  - biography uses centered titles and an asterisk `∗` separator motif.

## Session 2 decisions (2026-03-31)

- **Reader-bar grid**: Changed to `auto 1fr auto` so Meny/Innehåll buttons size to content, not stretch.
- **Enhetlig container**: Appendix and Minnen use same `rb-section-container` at `max-width: 628px` centered, matching biography.
- **Delad navigation**: Two drawers — site-nav (left, Meny) and section-toc (right, Innehåll). Separate includes for reuse.
- **Appendix innehåll**: Full content from live site: 7 decades + 10 categories (Böcker, Konst, Föreställningar, Tv, Radio, Biofilmer, Scen, Musik, Tidningar/Tidskrifter, Övrigt) + Utmärkelser. 18 anchor divs matching TOC.
- **Minnen innehåll**: All three poems complete from live site. Stanzas separated by `<div class=”stars”>***</div>`.
- **Live site URLs**: rolfborjlind.com/appendix/ for appendix, individual poems at /minnen-kusinen/, /minnen-den-osynlige/, /minnen-en-vacker-yngling/ (not /minnen/).

