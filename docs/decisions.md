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
