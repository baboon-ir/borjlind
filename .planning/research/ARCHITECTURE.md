# Architecture Patterns

**Domain:** E-book reader on Eleventy static site
**Researched:** 2026-03-04

---

## Recommended Architecture

**Single HTML page with JS-controlled visibility** — keep the `biografiAll` collection and single-page render, replace the vertical-scroll model with page-by-page visibility toggling. Do not split into 276 separate HTML files.

### Why Single-Page Wins

| Concern | Single Page (recommended) | Multi-page (276 HTML files) |
|---------|--------------------------|------------------------------|
| Build complexity | No change to collection/template system | New per-page route, permalink logic, redirects |
| Navigation speed | Instant (no network) | Full page reload or SPA routing layer |
| Position persistence | `localStorage` page number, trivial | URL-based, already handled by hash |
| TOC/year nav | One JS array, no fetches | Requires JSON manifest or separate fetch |
| Swipe gestures | Direct DOM manipulation | Cross-page impossible without SPA layer |
| Accordion/video on a page | No constraint | No constraint |
| Cloudflare static hosting | Already works | Also works, but 276 extra HTML files |
| Preloading adjacent pages | All content already present | Would require prefetch link injection |

The decisive constraint is **swipe gestures and instant page transitions**: multi-page HTML requires a SPA routing layer or full reloads. The single-page approach already has all 276 page sections in the DOM — visibility switching is the minimal change.

---

## Component Boundaries

### Component Map

```
biography.njk (layout)
├── bio-controls.njk         [navigation bar — prev/next, page input, TOC trigger]
├── bio-toc.njk              [year-chapter drawer/overlay — built at build time]
└── bio-page.njk (x276)     [individual page sections — hidden/shown by JS]
    └── bio-reader.js        [page display controller — replaces scroll tracker]
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `biography.njk` | Orchestrates layout, provides `biografiAll` collection and TOC data to templates | `bio-controls.njk`, `bio-page.njk`, `bio-toc.njk` |
| `bio-page.njk` | Renders one page section; sets `data-page`, `data-year-group` attributes; hidden by default via CSS | `bio-reader.js` (reads data attributes) |
| `bio-controls.njk` | Prev/Next buttons, page number input, TOC trigger button, year label display | `bio-reader.js` (listens to events / updates DOM) |
| `bio-toc.njk` | Year-period chapter list rendered at build time as hidden drawer; each entry is a link/button with target page number | `bio-reader.js` (programmatic open/close); data from Eleventy global data |
| `bio-reader.js` | Single source of truth for current page; shows/hides sections; handles swipe, keyboard, URL hash, localStorage, TOC sync | All UI components via DOM API |

---

## Data Flow

### Build-Time Flow (unchanged except year enrichment)

```
content/pages/biografi/pages/page-NNN.md
  frontmatter: { page.number, anchor, yearGroup (new field) }
      |
      v
.eleventy.js — biografiAll collection
  → enriches placeholders with yearGroup from neighboring real pages
  → builds yearChapters global data: [{ label, startPage, endPage }]
      |
      v
biography.njk
  → iterates biografiAll → renders bio-page.njk with data-year-group="1982-1988"
  → renders bio-toc.njk with yearChapters data
  → renders bio-controls.njk
      |
      v
_site/biografi/index.html
  — contains all 276 <section> elements (display:none by default)
  — contains TOC drawer HTML
  — contains control bar HTML
```

### Runtime Flow (new model — replaces scroll tracker)

```
Page load
  bio-reader.js init:
    1. Read targetPage from localStorage OR URL hash (#p-NNN) OR default 1
    2. Call showPage(n): hide all sections, show section[data-page=n]
    3. Scroll window to top (section is the only visible element)
    4. Update controls: page number input, year label, TOC highlight
    5. Save state to localStorage: { page: n, updatedAt }

User action → prev/next button / swipe left or right / keyboard arrow:
    1. bio-reader.js increments/decrements currentPage
    2. showPage(newPage) → CSS class toggle on sections
    3. URL hash updated: history.replaceState → #p-NNN
    4. Controls updated: page label, year label
    5. localStorage saved

User action → page number input:
    1. Parse integer, clamp 1–276
    2. showPage(n)

User action → TOC chapter click:
    1. TOC passes target page number
    2. bio-reader.js calls showPage(n)
    3. TOC drawer closes

User action → swipe (touch):
    1. touchstart captures startX
    2. touchend: if delta > threshold → prev or next page
    3. Same path as button click
```

### State Schema

```javascript
// localStorage key: "bio:last"
{
  page: 42,          // integer 1-276
  updatedAt: 1709500000000
}
```

The old schema stored `{ anchor, y }` (scroll-based). The new schema stores only page number. Migration: on init, if old format detected (has `anchor` key), parse page number from anchor string and migrate.

### Year Metadata Flow

```
Frontmatter (source of truth):
  page-001.md → yearGroup: absent (placeholder/preamble)
  page-015.md → yearGroup: "1952–1960"
  page-047.md → yearGroup: "1960–1969"
  ...

.eleventy.js:
  1. Build yearChapters array from pages that have yearGroup
  2. Expose as global data: eleventyConfig.addGlobalData("yearChapters", ...)
  3. Each entry: { label: "1952–1960", startPage: 15, endPage: 46 }

bio-toc.njk:
  {% for chapter in yearChapters %}
    <button data-goto="{{ chapter.startPage }}">{{ chapter.label }}</button>
  {% endfor %}

bio-reader.js at runtime:
  currentYearGroup = yearChapters.find(c => currentPage >= c.startPage && currentPage <= c.endPage)
  → updates year label in controls bar
  → highlights active chapter in TOC
```

The year chapters array is embedded as a JSON literal in the HTML at build time (a Nunjucks global data dump into a `<script>` tag), so bio-reader.js can read it without any fetch.

---

## Patterns to Follow

### Pattern: CSS Visibility Toggle (not DOM removal)

All 276 sections are rendered in the DOM at build time. The active page is shown with a CSS class; all others have `display:none`. This preserves DOM for fast switching without layout recalculation on content already in the tree.

```css
.rb-bio-page { display: none; }
.rb-bio-page.is-active { display: block; }
```

```javascript
function showPage(n) {
  document.querySelectorAll('.rb-bio-page').forEach(el => el.classList.remove('is-active'));
  const target = document.querySelector(`.rb-bio-page[data-page="${n}"]`);
  if (target) target.classList.add('is-active');
  window.scrollTo(0, 0);
}
```

**Why not `visibility:hidden` or `opacity:0`:** Those still participate in layout, causing a 276-screen-height document. `display:none` collapses all hidden sections to zero height.

### Pattern: Build-Time TOC Injection

Year chapter data is baked into HTML as a JSON literal, not fetched at runtime.

```njk
{# In biography.njk, inside a <script> tag #}
const YEAR_CHAPTERS = {{ yearChapters | dump | safe }};
const TOTAL_PAGES = 276;
```

bio-reader.js reads `YEAR_CHAPTERS` as a global constant. No runtime fetches, no async state.

### Pattern: Touch Gesture Handling (vanilla)

```javascript
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) delta < 0 ? nextPage() : prevPage();
});
```

Threshold 50px prevents accidental swipes. No third-party library needed.

### Pattern: Accordion/Dropdown Inside Page

Pages with accordion content (`details`/`summary` pattern, rendered by `.eleventy.js renderBio`) work unchanged inside a single visible `display:block` section. The section itself does not scroll — only the window scrolls if the accordion expands beyond the viewport. This is the correct behavior: the page expands, the reader scrolls vertically within the page, then navigates to the next page.

---

## Anti-Patterns to Avoid

### Anti-Pattern: 276 Separate HTML Pages

**What:** Giving each biography page its own Eleventy-generated HTML file at `/biografi/1/`, `/biografi/2/`, etc.

**Why bad:** Swipe transitions require a SPA routing layer or full page reloads. Cross-page navigation becomes a network concern. The existing `biografiAll` collection and `bio-page.njk` component would need a complete redesign. 276 files multiply Cloudflare cache invalidations.

**Instead:** Keep single `biography.njk` with all sections; JS controls visibility.

### Anti-Pattern: CSS Horizontal Scroll Snap

**What:** Using `scroll-snap-type: x mandatory` on a horizontally overflowing container with 276 children side by side.

**Why bad:** Rich pages with images and accordions overflow vertically within the snap item, causing layout conflicts. Testing across mobile browsers reveals inconsistent snap behavior with variable-height content. No URL addressability without extra JS.

**Instead:** JS-controlled `display:none` / `display:block` toggle, full window scroll reset on each page change.

### Anti-Pattern: Intersection Observer for Page Detection

**What:** Keeping the existing scroll-tracking model, adapting it to page-by-page context.

**Why bad:** The whole point of the e-book model is that only one page is visible at a time. Intersection Observer is a scroll-position tool; it has no role when content is toggled with `display:none`.

**Instead:** Replace `bio-reader.js` entirely with a page-state controller. No scroll listeners needed.

### Anti-Pattern: Fetching Year Data at Runtime

**What:** Loading a `/biografi/chapters.json` manifest via `fetch()` to power the TOC.

**Why bad:** Adds async complexity, error handling, and a flash of empty TOC. Violates the zero-runtime-dependencies constraint.

**Instead:** Embed `YEAR_CHAPTERS` as a `<script>` global in the built HTML.

---

## Build Order Implications

The implementation has a strict dependency order:

1. **Frontmatter enrichment first** — add `yearGroup` field to relevant markdown pages (or define it in a data file). Without this, the TOC cannot be built at all.

2. **Eleventy `yearChapters` global data** — computed in `.eleventy.js` from `biografiPages` collection. Must happen before template rendering. This is a build-step change in `.eleventy.js`.

3. **CSS foundation** — replace Tailwind with plain CSS. This must be complete before reworking visibility classes (`is-active`, `display:none` rules), because Tailwind JIT purging and class-name generation would conflict with dynamically toggled classes not present at scan time.

4. **`bio-page.njk` update** — add `data-year-group` attribute, remove hardcoded `/276` text (make TOTAL_PAGES a template variable).

5. **`bio-toc.njk` (new)** — build-time rendered chapter list. Depends on `yearChapters` global data being available.

6. **`bio-controls.njk` rewrite** — replace page input widget with prev/next buttons + page input + TOC trigger + year label. Depends on new CSS.

7. **`bio-reader.js` rewrite** — replaces scroll tracker with page state controller. Depends on DOM structure from steps 4–6.

8. **`biography.njk` update** — wire `YEAR_CHAPTERS` JSON injection, include new components.

**Critical path:** Frontmatter year data → Eleventy global data → CSS → Templates → JS

---

## Scalability Considerations

| Concern | At current 276 pages | Future (more pages) |
|---------|---------------------|---------------------|
| DOM size | 276 hidden sections in one HTML document; ~2–3MB uncompressed | Linear growth; above 500 pages consider lazy hydration |
| JS init time | Single `querySelectorAll` on page load; fast | Stays fast up to ~1000 pages |
| CSS class toggling | O(n) remove active class from all, O(1) add to one | Optimize with reference to current active element |
| TOC JSON size | < 1KB for ~20 year-chapters | Negligible |
| Cloudflare caching | Single HTML file, one cache entry | No change |

---

## Sources

- Existing codebase: `.eleventy.js`, `bio-reader.js`, `bio-page.njk`, `biography.njk`, `bio-controls.njk` — HIGH confidence (direct code inspection)
- Frontmatter schema confirmed via page-1.md, page-11.md, page-100.md — HIGH confidence (no year field currently exists)
- Swipe gesture pattern: vanilla touch events — HIGH confidence (standard browser API)
- `display:none` vs scroll-snap tradeoffs: architectural reasoning from DOM layout model — HIGH confidence

---

*Architecture research: 2026-03-04*
