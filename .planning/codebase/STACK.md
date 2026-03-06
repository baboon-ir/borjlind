# Technology Stack

**Analysis Date:** 2026-03-06

## Snapshot

- Static site built with Eleventy 3 and rendered to `_site` via `npm run build` in [package.json](/Users/hakanfilip/my-workspace/projects/borjlind/package.json).
- Main build/runtime wiring lives in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js).
- Frontend is plain CSS plus small vanilla JS files, not Tailwind/PostCSS anymore:
  [assets/css/main.css](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css),
  [assets/js/nav.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/nav.js),
  [assets/js/bio-reader.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).

## Languages And Templating

- JavaScript / Node.js
  Used for Eleventy config, collections, filters, and browser behavior.
  Key files:
  [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js),
  [_data/chapters.js](/Users/hakanfilip/my-workspace/projects/borjlind/_data/chapters.js),
  [assets/js/bio-reader.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).
- Markdown
  Primary content format under [content/pages](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages).
- Nunjucks
  Layout/includes layer under [layouts](/Users/hakanfilip/my-workspace/projects/borjlind/layouts) and [includes](/Users/hakanfilip/my-workspace/projects/borjlind/includes).
- CSS
  Hand-written stylesheet in [assets/css/main.css](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css).

## Build And Runtime

- Package manager: npm
- App type: static site, no server runtime
- Dev command: `npm run dev` -> `eleventy --serve --watch` in [package.json](/Users/hakanfilip/my-workspace/projects/borjlind/package.json)
- Build command: `npm run build` -> `eleventy`
- Output dir: `_site` from [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js)
- CI runtime target: Node.js 22 in [.github/workflows/deploy.yml.disabled](/Users/hakanfilip/my-workspace/projects/borjlind/.github/workflows/deploy.yml.disabled)

## Direct Dependencies

- `@11ty/eleventy` `^3.1.2`
  Core SSG, configured in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js).
- `markdown-it` `^14.1.0`
  Custom markdown pipeline with HTML enabled and custom rendering rules in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js).
- `markdown-it-container` `^4.0.0`
  Supports custom blocks such as `::: center`, `::: quote`, `::: accordion`, `::: poem`, `::: video`.
- `markdown-it-implicit-figures` `^0.12.0`
  Converts markdown images to figures/captions.
- `eleventy-plugin-embed-everything` `^1.21.1`
  Registered as an Eleventy plugin in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js).

## Eleventy Configuration

- Input/output/includes/layouts are all declared in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js):
  input `.`, output `_site`, includes `includes`, layouts `layouts`.
- Template formats: `md`, `njk`, `html`.
- Markdown engine: Nunjucks for markdown and HTML templates.
- Ignored from site build:
  `docs/**`, `README.md`, `**/.trash_restructure/**`, `.planning/**`.
- Passthrough copy explicitly publishes:
  `assets/css/main.css`,
  `assets/js/bio-reader.js`,
  `assets/js/nav.js`,
  `assets/images/**`.

## Content Model

- Main sections:
  [content/pages/index.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/index.md),
  [content/pages/biografi/index.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/index.md),
  [content/pages/minnen/index.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/minnen/index.md),
  [content/pages/appendix.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/appendix.md).
- Biography content is page-based markdown under [content/pages/biografi/pages](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages).
- Chapter metadata is centralized in [_data/chapters.js](/Users/hakanfilip/my-workspace/projects/borjlind/_data/chapters.js).

## Collections And Filters

- `minnen`
  Tag-based collection for memory pages.
- `biografiPages`
  Sorted biography markdown pages.
- `biografiAll`
  Generates a full 1..276 page sequence with placeholders for missing content.
- `yearGroupMap`
  Derives TOC-related year group metadata.
- `biografiChapters`
  Groups biography pages into 20 chapters from `_data/chapters.js`.
- Filters:
  `pad3`, `bioRender`, `chaptersMeta`, `json`.

## Frontend Runtime

- Global base template in [layouts/base.njk](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/base.njk) always loads:
  `/assets/css/main.css`,
  `/assets/js/nav.js`,
  `/assets/js/bio-reader.js`.
- Main site navigation behavior is handled by [assets/js/nav.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/nav.js).
- The e-book reader at [layouts/biography.njk](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/biography.njk) depends on:
  JSON metadata injected into `#rb-chapter-data`,
  chapter containers with `id="chapter-{id}"`,
  client-side pagination/state in [assets/js/bio-reader.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).

## Styling

- Styling is consolidated into one handwritten stylesheet:
  [assets/css/main.css](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css).
- CSS declares its own tokens, reset, layout, navigation, and reader styles.
- README explicitly says "Ingen Tailwind längre" in [README.md](/Users/hakanfilip/my-workspace/projects/borjlind/README.md), which matches the absence of Tailwind/PostCSS config files in the repo root.

## Practical Observations

- The old stack docs were stale: Tailwind, PostCSS, Autoprefixer, and `npm-run-all` are not declared in current [package.json](/Users/hakanfilip/my-workspace/projects/borjlind/package.json).
- Browser JS is intentionally small and framework-free.
- No test runner, lint script, formatter script, or type checker is declared in [package.json](/Users/hakanfilip/my-workspace/projects/borjlind/package.json).
- No environment-variable driven config was found in the examined build/runtime files.
