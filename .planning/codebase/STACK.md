# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- JavaScript (Node.js) - Build tooling, configuration
- Markdown - Content format for all pages
- Nunjucks (njk) - HTML templating engine for layouts and includes
- CSS - Styling via Tailwind

**Secondary:**
- Python - Utility scripts for content preprocessing (fix-spacing.py, import-biography.py, etc.)

## Runtime

**Environment:**
- Node.js (version 22 specified in GitHub Actions) - Development and build

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Eleventy (11ty) v2.0.1 - Static site generator (SSG)
  - Template formats: Markdown (md), Nunjucks (njk), HTML
  - Output directory: `_site`

**Markdown Processing:**
- markdown-it v14.1.0 - Markdown parser and renderer
- markdown-it-container v4.0.0 - Support for custom containers (`::: center`, `::: poem`, `::: accordion`, etc.)
- markdown-it-implicit-figures v0.12.0 - Converts images with alt text to `<figure>` elements with captions

**Embedding:**
- eleventy-plugin-embed-everything v1.21.1 - Auto-embeds external content (YouTube, Twitter, etc.)

**Styling:**
- Tailwind CSS v3.4.10 - Utility-first CSS framework
  - Plugin: @tailwindcss/typography v0.5.15 - Prose styling for markdown content

**Build & CSS:**
- PostCSS v8.4.38 - CSS transformation pipeline
- autoprefixer v10.4.19 - Adds vendor prefixes for cross-browser compatibility

**Development:**
- npm-run-all v4.1.5 - Run multiple npm scripts in parallel/sequence

## Key Dependencies

**Critical:**
- @11ty/eleventy v2.0.1 - Core static site generation; templates, collections, filters, passthrough copy
- markdown-it v14.1.0 - Markdown rendering with lazy-load images and custom HTML output

**Infrastructure:**
- markdown-it-container v4.0.0 - Enables semantic markdown blocks (accordions, quotes, poems, sections)
- eleventy-plugin-embed-everything v1.21.1 - YouTube/video embedding from markdown links
- Tailwind CSS v3.4.10 - Responsive design, dark mode theming

## Configuration

**Environment:**
- No environment variables detected; static site with no runtime secrets
- Build-time configuration only

**Build:**
- `.eleventy.js` - Main Eleventy configuration
  - Input directory: `.` (root)
  - Output directory: `_site`
  - Include paths: `includes/`, `layouts/`
  - Collections: `minnen` (memories), `biografiPages` (biography pages), `biografiAll` (1-276 paginated)
  - Global data: `bioRedirectPages` for pagination compatibility
- `postcss.config.cjs` - PostCSS pipeline for CSS processing
- `tailwind.config.cjs` - Tailwind theme customization
  - Extends color palette: `dark` (#1c1d1e), `hub` (#282828), `light` (#fdf9f0)
  - Font families: serif (Georgia, Times), sans (System UI stack), mono (SFMono, Menlo, Monaco)

## Platform Requirements

**Development:**
- Node.js 22+
- npm (comes with Node.js)
- Unix-like shell for `npm-run-all` parallel execution

**Production:**
- Static file hosting (GitHub Pages or Cloudflare Pages)
  - Output: pre-built `_site` directory
  - No runtime dependencies; pure static assets

## Deployment

**CI/CD:**
- GitHub Actions (disabled, file: `.github/workflows/deploy.yml.disabled`)
  - Would target GitHub Pages
  - Runs `npm ci`, `npm run build`, uploads `_site` artifact

**Static Hosting:**
- GitHub Pages (workflow present but disabled)
- Cloudflare Pages (referenced in docs)

---

*Stack analysis: 2026-03-04*
