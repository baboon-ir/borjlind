# Rolf Börjlind – biografi (MVP)

Static site built with **Eleventy** + **Tailwind CSS**.

## Structure (proposed)

- `src/` – Eleventy input
  - `index.njk` – home
  - `appendix.njk` – appendix page
  - `biografi.njk` – long-scroll biography (pages with anchors `#p-001`…)
  - `minnen/` – memories (collection)
  - `_includes/` – layouts/partials
  - `assets/` – Tailwind input, JS
  - `content/biografi/pages/` – page markdown includes (`p-001.md` etc)
- `_site/` – build output (deploy this)
- `docs/` – deployment notes (Cloudflare redirects etc)

This structure can be adapted if you already have conventions.

## Development

```bash
npm install
npm run split:biografi   # optional: regenerate `src/content/biografi/pages/` from export
npm run dev
```

Eleventy will serve the site locally (usually at <http://localhost:8080/>).

## Build

```bash
npm run build
```

Outputs to `_site/`.

## Deploy (GitHub Pages)

This repo includes a GitHub Actions workflow that builds and deploys `_site/` to GitHub Pages.

1. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main`

If you deploy as a **Project Page** (e.g. `https://user.github.io/borjlind/`), you may want to add a path prefix and avoid absolute URLs. MVP currently uses absolute paths like `/biografi/`.

## Routes

- `/` – home
- `/appendix/` – appendix
- `/minnen/` – memories index
- `/minnen/<slug>/` – memory detail
- `/biografi/` – long biography with anchors `#p-001 … #p-276`
- Compatibility redirects:
  - `/biografi/12/` → `/biografi/#p-012`
  - `/biografi/page/12/` → `/biografi/#p-012`

