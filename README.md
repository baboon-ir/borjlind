# rolfborjlind-site

Static site (MVP) built with **Eleventy** + **Tailwind**.

## Repo structure (fixed)

```
rolfborjlind-site/
  content/
    pages/
      index.md
      appendix.md
      minnen/
        index.md
        <slug>.md
      biografi/
        pages/
          001.md 002.md ... (demo 10)
  layouts/
    base.njk home.njk page.njk memory.njk biography.njk
  includes/
    header.njk footer.njk hub-grid.njk bio-controls.njk bio-page.njk
  assets/
    css/ tailwind.css main.css
    js/ bio-reader.js
  docs/
    deploy-github-pages.md
    deploy-cloudflare.md
    decisions.md
  _site/
  .eleventy.js
  postcss.config.cjs
  tailwind.config.cjs
  package.json
  README.md
```

## Routes

- `/` home
- `/appendix/`
- `/minnen/` + `/minnen/{slug}/`
- `/biografi/` (one long scroll)
- Compatibility redirects:
  - `/biografi/{n}/` → `/biografi/#p-XYZ`
  - `/biografi/page/{n}/` → `/biografi/#p-XYZ`

## Biografi rendering

- Anchors: `#p-001`…`#p-276`
- Page source files: `content/pages/biografi/pages/NNN.md` with frontmatter:
  - `page` (number)
  - `anchor` (e.g. `p-012`)
- Render rules:
  - `[IMAGE: x]` → `<figure><img …></figure>` (expects `/assets/images/x`)
  - `[VIDEO: url]` → responsive `<iframe>`
  - `[MORE]` → collapses the remainder into `<details>`

## Scroll restore

On `/biografi/` the reader stores `localStorage['bio:last'] = { anchor, y, updatedAt }` and restores it on revisit **unless** a hash is present.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `_site/`.

## Deploy

See:
- `docs/deploy-github-pages.md`
- `docs/deploy-cloudflare.md`
