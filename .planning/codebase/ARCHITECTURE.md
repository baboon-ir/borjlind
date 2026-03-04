# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Static Site Generator (SSG) with Client-Side State Management

**Key Characteristics:**
- Eleventy (11ty) for build-time rendering and collection management
- Markdown-first content with Nunjucks templating
- Tailwind CSS for styling with dark theme
- Client-side scroll/navigation state persistence via localStorage
- Responsive layout with sticky navigation
- Custom markdown rendering pipeline for specialized content blocks

## Layers

**Content Layer:**
- Purpose: Raw content source in Markdown with YAML frontmatter
- Location: `content/pages/` subdirectories
- Contains: Biography pages (276 total), memories collection, appendix content
- Depends on: Markdown-it processor, Eleventy collections API
- Used by: Layout templates

**Build/Processing Layer:**
- Purpose: Convert content + layouts into HTML at build time
- Location: `.eleventy.js` configuration
- Contains: Markdown-it custom renderers, collection builders, global data generators, template engine setup
- Depends on: Eleventy, markdown-it plugins, Nunjucks
- Used by: Template rendering engine

**Template Layer:**
- Purpose: Define page structure and component composition
- Location: `layouts/` (base pages) and `includes/` (components)
- Contains: Base layout, page-specific layouts (home, biography, memory, etc.), reusable components
- Depends on: Content frontmatter, Eleventy collections, Tailwind classes
- Used by: Markdown files via `layout` frontmatter field

**Styling Layer:**
- Purpose: Apply visual design and responsive behavior
- Location: `assets/css/` (Tailwind source), `tailwind.config.cjs` (theme config)
- Contains: Tailwind CSS framework, custom color palette, typography settings
- Depends on: PostCSS, Autoprefixer
- Used by: All template files

**Client-Side Layer:**
- Purpose: Interactive features and state persistence
- Location: `assets/js/` (bio-reader.js, nav.js)
- Contains: Scroll position tracking, page navigation, localStorage management, menu toggle
- Depends on: DOM API, History API, localStorage
- Used by: Browser runtime after page load

## Data Flow

**Build-Time Flow:**

1. Eleventy reads content from `content/pages/`
2. Files tagged with `biografiPage` or `minne` are collected into collections
3. Collections are sorted and enriched (e.g., `biografiPages` sorts by page.number)
4. Special `biografiAll` collection creates 276 placeholder entries (1–276)
5. Content is rendered through Markdown-it with custom plugins
6. `.eleventy.js` filters (e.g., `bioRender`, `pad3`) transform content
7. Templates render content into HTML using Nunjucks
8. Final output written to `_site/`

**Runtime Flow (User Interaction):**

1. Page loads: `base.njk` script tags load `nav.js` and `bio-reader.js`
2. `nav.js` initializes menu toggle and header scroll effect
3. `bio-reader.js` runs after DOMContentLoaded:
   - Restores saved scroll position from localStorage (if no hash present)
   - Sets up scroll listeners to track current biography page
   - Updates page input field as user scrolls
   - Saves position on scroll (throttled via requestAnimationFrame)
   - Handles hash navigation (#p-NNN format)

**State Management:**

- **Client-side state:** Stored in `localStorage['bio:last']` as `{ anchor, y, updatedAt }`
- **URL state:** Hash reflects current page anchor (`#p-001` to `#p-276`)
- **DOM markers:** Page sections have `id` attributes matching anchors, `data-page` for page number

## Key Abstractions

**Markdown Custom Renderers:**
- Purpose: Transform Markdown syntax into styled HTML blocks
- Examples: `renders/image` (adds lazy loading), container plugins (`::: center`, `::: poem`, `::: accordion`)
- Pattern: Markdown-it plugins registered in `.eleventy.js`, render functions manipulate token streams

**Content Collections:**
- Purpose: Group and order related content for iteration
- Examples: `collections.minnen` (memories), `collections.biografiPages` (biography pages), `collections.biografiAll` (all 276 pages with placeholders)
- Pattern: Defined via `eleventyConfig.addCollection()` API in `.eleventy.js`, filtered by frontmatter tags

**Template Inheritance:**
- Purpose: Reuse page structure across routes
- Examples: `base.njk` (all pages), `biography.njk` (biography page only), `memory.njk` (memory detail page)
- Pattern: `layout` field in frontmatter; child layouts can override `bodyClass`, `mainClass` variables

**Components (Includes):**
- Purpose: Reusable UI fragments
- Examples: `header.njk` (sticky nav bar), `bio-page.njk` (single biography page section), `hub-grid.njk` (memory grid)
- Pattern: Included via `{% include %}` in layouts; pass context via template variables

**Content Transformation Filter:**
- Purpose: Apply special rendering rules to biography page content
- Examples: `bioRender` filter handles `[MORE]` collapsible blocks, `[yt-video]` embeds, `<div class="">` sections
- Pattern: Custom Nunjucks filter registered in `.eleventy.js`, called in `bio-page.njk`

## Entry Points

**Home Page:**
- Location: `content/pages/index.md`
- Triggers: User navigates to `/`
- Responsibilities: Displays landing page with hub grid and navigation hub

**Biography Page (Scroll View):**
- Location: `content/pages/biografi/index.md` (uses `biography.njk` layout)
- Triggers: User navigates to `/biografi/` or `/biografi/#p-NNN`
- Responsibilities: Renders all 276 biography pages stacked vertically, manages scroll state, page number input, continue-reading button

**Memory Collection:**
- Location: `content/pages/minnen/index.md`
- Triggers: User navigates to `/minnen/`
- Responsibilities: Lists memory cards from `collections.minnen`

**Memory Detail Page:**
- Location: `content/pages/minnen/{slug}.md`
- Triggers: User clicks memory card
- Responsibilities: Renders full memory content with `memory.njk` layout

**Appendix Page:**
- Location: `content/pages/appendix.md`
- Triggers: User navigates to `/appendix/`
- Responsibilities: Static content page

**Redirect Pages (Compatibility):**
- Location: `_redirects` or similar (generated via collections)
- Triggers: User navigates to `/biografi/{n}/` or `/biografi/page/{n}/`
- Responsibilities: Redirects to `/biografi/#p-NNN` hash URL

## Error Handling

**Strategy:** Graceful degradation

**Patterns:**
- Missing biography pages: Placeholder entries created in `biografiAll` collection with empty `templateContent`
- Invalid page numbers: `bio-reader.js` clamps input to valid range (1–276) via `clamp(Number(n), 1, TOTAL)`
- localStorage unavailable: Try-catch blocks in `bio-reader.js` prevent errors if localStorage is disabled
- No hash/scroll position: Defaults to top of page; continue-reading button hidden if no saved state
- Missing images: Lazy loading directive applied but no error handling; relies on HTTP 404 behavior

## Cross-Cutting Concerns

**Logging:** No application logging; browser console only for development debugging.

**Validation:**
- Page input validation: Ensures numeric input and clamps to 1–276
- frontmatter validation: Eleventy validates YAML syntax; missing fields use defaults

**Authentication:** None; static site with no backend.

**Internationalization:** Swedish language hardcoded in templates and UI text; no translation framework.

**Accessibility:**
- ARIA attributes on navigation button (`aria-expanded`, `aria-hidden`)
- Semantic HTML: `<header>`, `<main>`, `<footer>`, `<section>`
- Skip focus management on menu toggle
- Alt text on images via implicit figures plugin

---

*Architecture analysis: 2026-03-04*
