# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Eleventy 3 static site with build-time content assembly and a small amount of page-specific client-side behavior.

**Key characteristics:**
- Eleventy reads markdown and Nunjucks templates directly from repo root.
- `.eleventy.js` is the architectural center for markdown parsing, filters, collections, globals, passthrough assets, and ignored paths.
- `content/pages/` is route-oriented content; frontmatter decides layout, tags, and permalink behavior.
- `layouts/base.njk` is the shared shell for almost every route.
- `/biografi/` is not rendered as one route per biography page; it is one reader route that inlines all 276 content files, grouped into chapter containers.
- `assets/js/bio-reader.js` owns reader pagination, chapter switching, local persistence, keyboard/swipe controls, and TOC interactions.
- Redirect routes exist only to translate legacy `/biografi/{n}/` and `/biografi/page/{n}/` URLs into hash anchors on `/biografi/`.

## Runtime Model

### Build-time

1. Eleventy loads all source files from the project root.
2. Markdown files under `content/pages/` provide route content and frontmatter metadata.
3. `.eleventy.js` configures a custom `markdown-it` instance with:
   - lazy-loaded images
   - implicit figures with figcaptions
   - custom `::: ...` containers for `center`, `minne`, `quote`, `part`, `accordion`, `indent`, `poem`, and `video`
4. The custom `bioRender` filter post-processes biography page bodies for:
   - `[MORE]` collapsible sections
   - `[yt-video][URL]` embeds
   - `<div class="">...</div>` sections wrapped as `rb-section`
5. Collections are built from tagged content:
   - `minnen`
   - `biografiPages`
   - `biografiAll`
   - `yearGroupMap`
   - `biografiChapters`
6. Global data exposes:
   - `TOTAL_PAGES = 276`
   - `TOTAL_CHAPTERS = chapters.length`
   - `bioRedirectPages` for paginated redirect generation
7. Nunjucks layouts/includes render final HTML into `_site/`.

### Client-side

There are only two client scripts:

- `assets/js/nav.js`
  - runs on any page where `[data-nav-toggle]` and `[data-nav-panel]` exist
  - toggles the global menu panel
  - updates `aria-expanded` and `aria-hidden`
  - adds `is-scrolled` to the header when the page is scrolled

- `assets/js/bio-reader.js`
  - exits immediately unless `document.body.dataset.biography` is present
  - reads chapter metadata from inline JSON emitted by `layouts/biography.njk`
  - treats each `.rb-chapter` as a horizontally paged CSS-columns region
  - persists reader state in `localStorage['bio:pos']`
  - wires previous/next buttons, keyboard arrows, swipe gestures, TOC buttons, and resize recalculation

## Main Rendering Flows

### Standard page flow

Routes such as `/`, `/appendix/`, and `/minnen/` follow the same shell:

1. markdown content file sets `layout`
2. chosen layout usually inherits from `layouts/base.njk`
3. `base.njk` renders:
   - document head
   - optional shared header include
   - main content region
   - optional shared footer include
   - both client scripts

This means all pages receive `nav.js` and `bio-reader.js`, but the biography script self-gates on `data-biography`.

### Biography reader flow

The biography route is assembled differently from the rest of the site:

1. `content/pages/biografi/index.md` defines the route `/biografi/` and selects `layouts/biography.njk`.
2. `layouts/biography.njk` extends `base.njk` with header/footer disabled.
3. It emits a JSON blob containing `collections.biografiChapters | chaptersMeta`.
4. It iterates `collections.biografiChapters`, where each chapter comes from `_data/chapters.js`.
5. For every chapter page entry:
   - an anchor span with `id="p-XYZ"` is emitted
   - if the content file exists, `page.item.templateContent | bioRender` is rendered
6. The result is one large `/biografi/` document containing 20 chapter containers and all 276 page anchors.
7. `bio-reader.js` activates exactly one chapter at a time by toggling `.is-active`, setting `columnWidth`, and scrolling horizontally within that chapter element.

Important consequence: the numbered biography markdown files do **not** create their own standalone URLs because each file uses `permalink: false`.

### Redirect flow

Legacy numeric URLs are generated through paginated Nunjucks templates:

- `content/pages/biografi/redirect-number.njk`
- `content/pages/biografi/redirect-page.njk`

Both paginate over `bioRedirectPages` and emit static HTML pages for:

- `/biografi/{n}/index.html`
- `/biografi/page/{n}/index.html`

Each redirect immediately sends the browser to `/biografi/#p-XYZ` using both `<meta http-equiv="refresh">` and `location.replace(...)`.

## Data Flow

### Content to layout

- `content/pages/index.md` -> `layouts/home.njk`
- `content/pages/appendix.md` -> `layouts/appendix.njk`
- `content/pages/minnen/index.md` -> `layouts/minnen.njk`
- `content/pages/minnen/*.md` with `tags: [minne]` -> `layouts/memory.njk`
- `content/pages/biografi/index.md` -> `layouts/biography.njk`
- `content/pages/biografi/pages/page-*.md` with `tags: [biografiPage]` -> not routed directly; consumed through collections

### Biography content pipeline

For each biography page file:

1. frontmatter supplies `page.number`, `anchor`, `tags`, `layout`, optional `yearGroup`
2. `biografiPages` sorts all tagged items numerically
3. `biografiChapters` maps the chapter ranges from `_data/chapters.js` onto those items
4. `biography.njk` renders page content inside the correct chapter container
5. `bioRender` transforms the page body into reader-ready HTML
6. `bio-reader.js` turns the static output into a chapter-by-chapter paged reading experience

### Collections and their roles

- `minnen`
  - source: files tagged `minne`
  - role: detail pages and any future memory listing logic

- `biografiPages`
  - source: files tagged `biografiPage`
  - role: numerically sorted raw biography page items

- `biografiAll`
  - source: `biografiPage` files plus placeholders
  - role: complete 1..276 index even if some content files were missing
  - current state: all 276 page files exist, so placeholders are effectively dormant fallback behavior

- `yearGroupMap`
  - source: first occurrence of each `yearGroup` in sorted biography pages
  - role: residual navigation/metadata collection; not used by the current templates read here

- `biografiChapters`
  - source: `_data/chapters.js` + `biografiPage` files
  - role: canonical structure for rendering the reader and TOC

## Templates and Composition

### Layout responsibilities

- `layouts/base.njk`
  - global HTML shell
  - conditional header/footer
  - script loading

- `layouts/biography.njk`
  - dedicated reader shell
  - chapter JSON payload
  - chapter/page loop
  - reader chrome and TOC include

- `layouts/home.njk`
  - landing page visual treatment
  - full-screen video-backed hero

- `layouts/appendix.njk`
  - static appendix nav plus content wrapper

- `layouts/minnen.njk`
  - static in-page nav for the memories index markdown

- `layouts/memory.njk`
  - detail layout for tagged memory pages

- `layouts/page.njk`
  - generic page shell, currently present but not part of the core route set read for this map

### Include responsibilities

- `includes/header.njk`
  - shared site header and nav panel

- `includes/footer.njk`
  - shared footer and current year script

- `includes/bio-controls.njk`
  - reader top bar with title and TOC toggle

- `includes/bio-toc.njk`
  - chapter list based on `collections.biografiChapters`

- `includes/bio-page.njk`
  - older single-page biography partial; still present but not used by `layouts/biography.njk`

- `includes/hub-grid.njk`
  - card grid partial; still present but not used by `layouts/home.njk`

## Routing Model

### Primary routes

- `/`
  - source: `content/pages/index.md`
  - layout: `home.njk`

- `/biografi/`
  - source: `content/pages/biografi/index.md`
  - layout: `biography.njk`

- `/minnen/`
  - source: `content/pages/minnen/index.md`
  - layout: `minnen.njk`

- `/minnen/{slug}/`
  - source: `content/pages/minnen/*.md`
  - layout: `memory.njk`
  - slug comes from file path because the memory files shown do not set explicit `permalink`

- `/appendix/`
  - source: `content/pages/appendix.md`
  - layout: `appendix.njk`

### Compatibility routes

- `/biografi/{n}/`
- `/biografi/page/{n}/`

Both redirect to the canonical hash-based route on `/biografi/`.

### Non-routed content

- `content/pages/biografi/pages/page-1.md` through `page-276.md`
  - `permalink: false`
  - consumed only through collections

## State and Persistence

### Reader state

`bio-reader.js` stores:

```json
{ "chapter": 0, "page": 0 }
```

under `localStorage['bio:pos']`.

Semantics:
- `chapter` = chapter index from `_data/chapters.js`
- `page` = column index within the currently active chapter element, not the original book page number

This is a significant architectural detail: the persisted reader position is viewport-dependent because chapter column counts are recalculated from `clientWidth`.

### URL state

- Canonical deep-linking uses anchors like `#p-001`.
- Redirect pages translate numeric routes into those anchors.
- The active reader view itself is driven by localStorage and in-document chapter paging rather than by updating the hash during navigation.

## Architectural Constraints

- The biography reader depends on all 276 page files being bundled into one HTML document.
- Reader pagination is a client-side illusion created by CSS columns and horizontal scrolling, not Eleventy pagination.
- `TOTAL_PAGES` is hardcoded in `.eleventy.js`; chapter boundaries are hardcoded in `_data/chapters.js`.
- `bioRender` contains site-specific parsing rules that couple biography authoring format to the Eleventy config.
- Header/footer behavior is layout-driven, not route-driven.
- Docs and planning directories are explicitly ignored by Eleventy and never become site output.

## Current Simplifications

- No backend, API, or server-side runtime beyond static file hosting.
- No formal test suite is wired into `package.json`; validation scripts exist under `scripts/` but are not part of default build commands.
- No dynamic data fetches at runtime in the site code inspected here.
- No dedicated data files beyond `_data/chapters.js`.

---

This document reflects the current codebase as read from `README.md`, `.eleventy.js`, `layouts/`, `includes/`, `_data/chapters.js`, `content/pages/biografi/index.md`, biography redirect templates, and the relevant client scripts.
