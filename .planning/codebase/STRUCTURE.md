# Codebase Structure

**Analysis Date:** 2026-03-06

## Top-Level Layout

```text
borjlind/
├── .eleventy.js
├── README.md
├── package.json
├── package-lock.json
├── _data/
│   └── chapters.js
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── images/
│   │   ├── divider.png
│   │   ├── -divider.png
│   │   ├── noise-light.png
│   │   └── pattern.png
│   └── js/
│       ├── bio-reader.js
│       └── nav.js
├── content/
│   └── pages/
│       ├── index.md
│       ├── appendix.md
│       ├── biografi/
│       │   ├── index.md
│       │   ├── redirect-number.njk
│       │   ├── redirect-page.njk
│       │   └── pages/
│       │       ├── page-1.md
│       │       ├── page-2.md
│       │       ├── ...
│       │       └── page-276.md
│       └── minnen/
│           ├── index.md
│           ├── filmsetet.md
│           ├── skrivbordet.md
│           └── vagen-hem.md
├── docs/
│   ├── decisions.md
│   ├── deploy-cloudflare.md
│   ├── deploy-github-pages.md
│   ├── qa-checklist.md
│   └── style-audit.md
├── includes/
│   ├── bio-controls.njk
│   ├── bio-page.njk
│   ├── bio-toc.njk
│   ├── footer.njk
│   ├── header.njk
│   └── hub-grid.njk
├── layouts/
│   ├── appendix.njk
│   ├── base.njk
│   ├── biography.njk
│   ├── home.njk
│   ├── memory.njk
│   ├── minnen.njk
│   └── page.njk
├── scripts/
│   ├── check-frontmatter.js
│   └── validate-build.js
└── assorted one-off import/fix Python scripts
```

## Directory Roles

### `_data/`

- Holds Eleventy global data modules.
- Current central file is `_data/chapters.js`, which defines the 20 chapter ranges used to build `collections.biografiChapters`.

### `assets/`

- Passthrough-copied by Eleventy.
- `assets/css/main.css` is the main site stylesheet.
- `assets/js/nav.js` provides global nav/header behavior.
- `assets/js/bio-reader.js` only activates on the biography reader.
- `assets/images/` contains static imagery referenced by CSS/templates/content.

### `content/pages/`

- Canonical source for routed site content.
- Files here are organized by URL area rather than by component type.
- Markdown and Nunjucks coexist in the route tree.

Subareas:

- `content/pages/index.md`
  - home route `/`

- `content/pages/appendix.md`
  - appendix route `/appendix/`

- `content/pages/minnen/`
  - index route plus individual memory pages

- `content/pages/biografi/`
  - reader entry route
  - redirect templates
  - 276 numbered content fragments used by the reader

### `layouts/`

- Page-level Nunjucks layouts.
- `base.njk` is the shared wrapper.
- Other layouts either extend `base.njk` or provide route-specific composition around page content.

### `includes/`

- Reusable partials included by layouts.
- Contains shared shell pieces and biography reader UI pieces.
- Also contains some currently unused partials left in the repo.

### `docs/`

- Project documentation only.
- Explicitly ignored by Eleventy via `.eleventy.js`.

### `scripts/`

- Local validation/utility scripts.
- Not wired into `npm run build` or `npm run dev`.

## Route-Oriented Structure

### Home

- Source file: `content/pages/index.md`
- Layout: `layouts/home.njk`
- Output route: `/`

Notable structure:
- Minimal markdown file; almost all visual structure lives in `home.njk`.
- `home.njk` currently renders a full-screen hero with background video and CTA directly to `/biografi/`.
- `includes/hub-grid.njk` exists but is not used by the current home layout.

### Biography

- Route entry: `content/pages/biografi/index.md`
- Layout: `layouts/biography.njk`
- Output route: `/biografi/`

Supporting files:
- `_data/chapters.js`
- `assets/js/bio-reader.js`
- `includes/bio-controls.njk`
- `includes/bio-toc.njk`
- `content/pages/biografi/pages/page-1.md` through `page-276.md`
- redirect templates in the same folder

Important structural fact:
- The `pages/` directory is content storage, not a directory of standalone routes.
- Every numbered page file sets `permalink: false`.
- The reader route is assembled from the collection, so the site has one biography HTML document plus generated redirect routes.

### Memories

- Index source: `content/pages/minnen/index.md`
- Index layout: `layouts/minnen.njk`
- Detail files: `content/pages/minnen/*.md` tagged with `minne`
- Detail layout: `layouts/memory.njk`

Observed files:
- `filmsetet.md`
- `skrivbordet.md`
- `vagen-hem.md`

Structural note:
- The index page content is handwritten markdown with internal anchors and is structurally separate from the tagged memory detail pages.
- The `slug` frontmatter present on detail pages is editorial metadata in the files read here; route generation still follows Eleventy path defaults because no custom `permalink` is set.

### Appendix

- Source file: `content/pages/appendix.md`
- Layout: `layouts/appendix.njk`
- Output route: `/appendix/`

Structural note:
- The content file is long-form markdown/HTML with explicit anchor divs.
- The layout contains a hardcoded in-page nav that assumes those anchor IDs exist in the content body.

## Biography Content Shape

### Numbered page files

The directory `content/pages/biografi/pages/` contains exactly 276 markdown files.

Common frontmatter pattern:

```yaml
---
page:
  number: 1
anchor: p-001
permalink: false
tags: [biografiPage]
layout: biography
yearGroup: "1942–1955"
---
```

Notes:
- `page.number` drives numeric sorting.
- `anchor` maps directly to in-document hash targets like `#p-001`.
- `layout: biography` is present but these files do not render as routes because `permalink: false`.
- `yearGroup` exists on biography pages and feeds `yearGroupMap`.
- `mediaPage` is supported by collection/render logic but was not found in the page files read during this pass.

### Redirect templates

`content/pages/biografi/redirect-number.njk`
- Generates `/biografi/{n}/index.html`

`content/pages/biografi/redirect-page.njk`
- Generates `/biografi/page/{n}/index.html`

Shared characteristics:
- `pagination.data: bioRedirectPages`
- `layout: null`
- emit complete redirect HTML documents

## Layout and Include Structure

### `layouts/base.njk`

Shared shell with:
- `<head>` title and description
- optional header include
- `<main>` wrapper
- optional footer include
- deferred loading of `nav.js` and `bio-reader.js`

Control variables used by child layouts/frontmatter:
- `bodyClass`
- `mainClass`
- `noHeader`
- `noFooter`

### `layouts/biography.njk`

Specialized reader layout:
- extends `base.njk`
- disables shared header/footer
- injects chapter JSON into `<script type="application/json" id="rb-chapter-data">`
- renders `.rb-bio-container` and chapter wrappers
- includes `bio-controls.njk` and `bio-toc.njk`
- marks the body with `data-biography`

### Other layouts

- `layouts/home.njk`
  - landing page presentation

- `layouts/appendix.njk`
  - hardcoded appendix nav plus content wrapper

- `layouts/minnen.njk`
  - hardcoded nav plus content wrapper for the memories index

- `layouts/memory.njk`
  - detail-page presentation for tagged memory items

- `layouts/page.njk`
  - generic prose page layout, currently peripheral to the main routes examined

### Includes

- `includes/header.njk`
  - shared site header and nav panel

- `includes/footer.njk`
  - shared footer

- `includes/bio-controls.njk`
  - reader top controls

- `includes/bio-toc.njk`
  - chapter buttons derived from `collections.biografiChapters`

- `includes/bio-page.njk`
  - older standalone biography page partial; not used by current `biography.njk`

- `includes/hub-grid.njk`
  - card grid partial; not used by current `home.njk`

## Eleventy Configuration Structure

`.eleventy.js` currently contains six kinds of responsibilities:

1. Dependency setup
   - `eleventy-plugin-embed-everything`
   - `markdown-it`
   - `markdown-it-container`
   - `markdown-it-implicit-figures`

2. Markdown customization
   - lazy-load image renderer
   - custom containers
   - custom accordion token handling

3. Site-specific filters/helpers
   - `pad3`
   - `bioRender`
   - `chaptersMeta`
   - `json`

4. Collections
   - `minnen`
   - `biografiPages`
   - `biografiAll`
   - `yearGroupMap`
   - `biografiChapters`

5. Global data and passthrough assets
   - `TOTAL_PAGES`
   - `TOTAL_CHAPTERS`
   - `bioRedirectPages`
   - CSS/JS/image passthrough copy

6. Eleventy project config
   - `dir.input = "."`
   - `dir.output = "_site"`
   - `dir.includes = "includes"`
   - `dir.layouts = "layouts"`
   - template formats: `md`, `njk`, `html`

## Output-Relevant Conventions

### Naming

- Biography page filenames use `page-{n}.md`.
- Hash anchors use zero-padded `p-001` form.
- Reader chapter elements use `chapter-{id}`.
- CSS classes consistently use the `rb-` prefix.

### Content conventions

- Biography page content frequently relies on custom markdown container syntax and `bioRender` transforms.
- `index.md` files define section landing routes.
- The appendix and minnen index content use inline HTML anchors that their layouts assume.

### Ignored paths

The following are explicitly excluded from the site build:
- `docs/**`
- `README.md`
- `**/.trash_restructure/**`
- `.planning/**`

## Development Commands

From `package.json`:

- `npm run dev`
  - runs `eleventy --serve --watch`

- `npm run build`
  - runs `eleventy`

There is no Tailwind/PostCSS pipeline in the current package manifest; the checked-in `README.md` and older planning docs describing Tailwind are out of date relative to the current code.

## Structural Observations

- The codebase is small and route-centric; most behavior is concentrated in `.eleventy.js`, `layouts/biography.njk`, and `assets/js/bio-reader.js`.
- The biography reader is the only part with meaningful runtime state.
- Some files remain as legacy or spare components (`includes/bio-page.njk`, `includes/hub-grid.njk`, `layouts/page.njk`, `yearGroupMap`) and should not be mistaken for the active rendering path.
- The route tree under `content/pages/biografi/` mixes canonical route entry, redirect generators, and non-routed source fragments in one folder, which is important context when modifying that area.

---

This document reflects the current repository structure relevant to architecture, rendering, data flow, templates, collections, routing, and directory layout.
