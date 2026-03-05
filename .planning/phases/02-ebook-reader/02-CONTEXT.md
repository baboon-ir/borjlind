# Phase 2: E-book Reader - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the 276-page vertical-scroll biography into a paged e-book reader — one biography page visible at a time, navigated by swipe (mobile), arrow buttons, and keyboard. Includes a year-structured table of contents and persistent reading position. Minnen and Appendix are out of scope — they keep their current layout.

</domain>

<decisions>
## Implementation Decisions

### Year periods
- Year grouping: custom ranges (e.g. 1942–1955, 1956–1968) — not decade-based, not thematic labels
- Expected: 10–15 groups covering the full biography span
- Exact year boundaries are TBD — user will define page-to-yearGroup mapping before launch
- Implementation proceeds with placeholder ranges; real data filled in before production
- `yearGroup` frontmatter key added to all 276 biography page .md files (e.g. `yearGroup: "1942–1955"`)

### Claude's Discretion
- TOC presentation (panel, overlay, bottom sheet) — Claude decides based on codebase patterns
- Reader controls layout (bottom bar, floating arrows, header-integrated) — Claude decides
- Swipe edge behavior at page 1 and 276 — Claude decides (silent block is fine)
- localStorage key format for new page-based state (replacing scroll-based `bio:last`)
- Exact placeholder year ranges to use during implementation

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bio-page.njk` — each page already has `id="p-NNN"` and `data-page="NNN"` — solid foundation for show/hide model
- `bio-controls.njk` — currently just a page number input; will become the full reader controls bar (prev/next buttons, page indicator, TOC toggle)
- `biografiAll` collection — generates all 276 entries including placeholder pages; no changes needed to collection logic
- `layouts/biography.njk` — main layout with `.rb-bio-container[data-bio-pages]`; becomes the reader container
- `rb-*` CSS class convention — all new classes must follow this semantic naming pattern

### Established Patterns
- Vanilla JS IIFE pattern — no ES modules, no third-party runtime libraries (zero runtime deps constraint)
- `data-*` attributes for DOM targeting (e.g. `data-page-input`, `data-biography`, `data-nav-toggle`)
- localStorage for client-side state persistence; existing key is `bio:last` (will be replaced)
- Eleventy `addCollection()` for build-time data; `addFilter()` for content transformation
- Global data baked into HTML at build time — no runtime fetch (NAV-02 requirement)
- `100dvh` not `100vh` for full-height containers (READER-08)

### Integration Points
- `assets/js/bio-reader.js` — will be completely replaced (READER-09); new file handles page switching, swipe, keyboard, position persistence
- `.eleventy.js` — needs `yearGroup` data exposed as global data for TOC; `renderBio` filter stays
- `includes/bio-controls.njk` — redesigned for reader controls (prev/next/indicator/TOC toggle)
- `assets/css/main.css` — new reader CSS added; `rb-*` classes for all new elements
- `content/pages/biografi/pages/*.md` — `yearGroup` frontmatter added to all 276 files

</code_context>

<specifics>
## Specific Ideas

- iOS Safari edge-swipe is the highest-severity risk — `touch-action: pan-y` required, swipe direction angle check needed (STATE.md blocker note)
- Page indicator format: "12 / 276" (from READER-06 requirement)
- READER-03 specifies Pointer Events API for swipe detection (not Touch Events)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-ebook-reader*
*Context gathered: 2026-03-05*
