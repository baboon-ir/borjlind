# Phase 2: E-book Reader - Research

**Researched:** 2026-03-05
**Domain:** Vanilla JS paged reader, Pointer Events swipe, Eleventy data pipeline, CSS visibility model
**Confidence:** HIGH (core implementation patterns), MEDIUM (iOS Safari edge-swipe specifics)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Year grouping: custom ranges (e.g. 1942–1955, 1956–1968) — not decade-based, not thematic labels
- Expected: 10–15 groups covering the full biography span
- Exact year boundaries are TBD — user will define page-to-yearGroup mapping before launch
- Implementation proceeds with placeholder ranges; real data filled in before production
- `yearGroup` frontmatter key added to all 276 biography page .md files (e.g. `yearGroup: "1942–1955"`)
- Vanilla JS IIFE pattern — no ES modules, no third-party runtime libraries (zero runtime deps constraint)
- `data-*` attributes for DOM targeting
- localStorage for client-side state persistence
- Global data baked into HTML at build time — no runtime fetch (NAV-02 requirement)
- `100dvh` not `100vh` for full-height containers (READER-08)
- `assets/js/bio-reader.js` will be completely replaced (READER-09)
- `rb-*` CSS class convention for all new classes
- Pointer Events API for swipe (not Touch Events) — READER-02/03

### Claude's Discretion
- TOC presentation (panel, overlay, bottom sheet) — Claude decides based on codebase patterns
- Reader controls layout (bottom bar, floating arrows, header-integrated) — Claude decides
- Swipe edge behavior at page 1 and 276 — Claude decides (silent block is fine)
- localStorage key format for new page-based state (replacing scroll-based `bio:last`)
- Exact placeholder year ranges to use during implementation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| READER-01 | One page visible at a time — JS-controlled visibility, not scroll | CSS visibility model section: `content-visibility: hidden` is the right tool |
| READER-02 | Swipe left/right via Pointer Events API navigates pages | Pointer Events section: pointerdown/pointermove/pointerup pattern |
| READER-03 | iOS Safari edge-swipe handled correctly (`touch-action: pan-y`, angle check) | iOS Safari edge-swipe section: dual defense strategy documented |
| READER-04 | Arrow buttons navigate page — visible on mobile and desktop | Controls architecture section: fixed bottom bar pattern |
| READER-05 | Keyboard arrow keys navigate pages | Keyboard events section: `keydown` on `document`, ArrowLeft/ArrowRight |
| READER-06 | Page indicator shows "12 / 276" format | Controls architecture section: text node update pattern |
| READER-07 | Reading position saved in localStorage and restored on next visit | localStorage section: new key `bio:page`, integer storage, restore pattern |
| READER-08 | Reader container uses `100dvh` | CSS section: `100dvh` browser support Safari 15.4+, fallback `100vh` |
| READER-09 | Existing `bio-reader.js` replaced entirely | Architecture section: full replacement, new IIFE scope |
| NAV-01 | `yearGroup` frontmatter added to all 276 biography .md files | Eleventy section: frontmatter addition pattern, Python script approach |
| NAV-02 | Eleventy exposes year-group data as global data baked into HTML | Eleventy section: `addGlobalData` + inline `<script>` JSON approach |
| NAV-03 | TOC panel lists year periods, allows jumping to period | TOC section: fixed panel, `data-toc-panel`, show/hide pattern |
| NAV-04 | Current year period indicated visually during reading | NAV-04 section: derive yearGroup from currentPage via JS lookup table |
| LAYOUT-01 | Media pages (video/image-only) rendered as dedicated page slots | LAYOUT-01 section: frontmatter `mediaPage: true` flag approach |
| LAYOUT-02 | `<details>` accordion expands with local vertical scroll | LAYOUT-02 section: `overflow-y: auto` + `overscroll-behavior: contain` on page |
| TECH-01 | Hardcoded 276 replaced with single config point in `.eleventy.js` | TECH-01 section: `addGlobalData("TOTAL_PAGES", 276)`, referenced in templates and JS |
</phase_requirements>

---

## Summary

Phase 2 transforms the biography from a single long-scroll page into a CSS-paged reader where one `<section>` is visible at a time and all navigation is JS-driven. The 276 sections already exist in the DOM with stable `id="p-NNN"` and `data-page="NNN"` attributes — that is the right foundation. The visibility model, swipe detection, TOC data pipeline, and controls bar are the four implementation pillars.

The most important architectural finding is the visibility model choice: `content-visibility: hidden` on inactive pages preserves their render state (fast show/hide) and avoids layout reflow, beating both `display: none` (triggers reflow and discards render state) and `visibility: hidden` (preserves space in document flow, causing a 276-page tall document). With `content-visibility: hidden` on 275 pages and `content-visibility: auto` (already set in CSS) restored on the active page, switching is a single class toggle with no paint cost for the off-screen pages.

The highest-severity risk — iOS Safari edge-swipe — requires a dual defense: `touch-action: pan-y` on the container (CSS), and in JS, ignoring `pointermove` events where the initial horizontal delta is less than 12 px and the Y-axis movement exceeds the X-axis movement in the first 20 ms of the gesture. A 30-degree angle threshold (atan2 check) reliably separates intentional horizontal swipes from the near-edge back gestures that start at a diagonal.

**Primary recommendation:** Use `content-visibility: hidden` for inactive pages, Pointer Events API for swipe with 30-degree angle threshold and 10px edge exclusion zone, `addGlobalData` for TOC data baked into a `<script type="application/json">` tag, and a fixed bottom controls bar matching the existing `rb-controls` pattern.

---

## Standard Stack

### Core (all already in project)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Eleventy (11ty) | existing | Build-time data pipeline, collections, global data | Already the project SSG |
| Nunjucks | existing | Templates — TOC panel, controls bar | Already the template engine |
| Vanilla JS IIFE | — | Reader controller, swipe, keyboard, localStorage | Project constraint; zero deps |
| CSS custom properties | — | Reader layout, page show/hide | Already established |

### No New Dependencies
This phase introduces zero new npm packages. All requirements are addressed with the existing Eleventy build pipeline, standard DOM APIs (Pointer Events, localStorage, keyboard events), and plain CSS.

### Alternatives Considered (for planner awareness)
| Chosen | Alternative | Why Chosen |
|--------|-------------|------------|
| `content-visibility: hidden` | `display: none` | Preserves render state; no layout reflow on show |
| `content-visibility: hidden` | CSS transform/translate | No 3D-compositing cost; no stacking context side-effects |
| Pointer Events API | Touch Events API | Already decided; better cross-device (stylus, mouse, touch unified) |
| Fixed bottom controls bar | Floating arrows | Consistent with existing `rb-controls` component placement |
| `<script type="application/json">` inline | `addGlobalData` JS data file | Inline puts data in HTML at exact point of use; no runtime fetch |

---

## Architecture Patterns

### Recommended File Changes
```
assets/js/
  bio-reader.js          — full replacement (READER-09)

assets/css/
  main.css               — new reader sections appended (reader container,
                           page visibility, controls bar, TOC panel)

layouts/
  biography.njk          — add TOC panel include, reader container attrs,
                           inline yearGroup JSON script tag

includes/
  bio-controls.njk       — redesigned: prev/next buttons, indicator, TOC toggle
  bio-page.njk           — add class hook for active/inactive state

content/pages/biografi/pages/
  page-*.md (276 files)  — add `yearGroup` frontmatter key

.eleventy.js             — TECH-01: extract TOTAL_PAGES constant;
                           NAV-02: addGlobalData for yearGroup map
```

### Pattern 1: Page Visibility Model (READER-01)

**What:** 275 pages hidden via `content-visibility: hidden`, 1 page active. Switching is a single DOM class toggle.

**Why `content-visibility: hidden`:** Inactive pages are skipped by the browser's rendering pipeline entirely (no paint, no layout cost) but their render state is cached — toggling to active is near-instant. `display: none` causes reflow and discards layout cache. `visibility: hidden` keeps pages in flow, making the document 276 pages tall (defeats the paged model entirely).

**CSS:**
```css
/* Add to main.css — reader visibility model */
.rb-bio-page {
  /* default: visible (fallback for no-JS) */
}

.rb-bio-page[hidden] {
  content-visibility: hidden;
  /* contain-intrinsic-size already set to auto 800px in existing CSS */
}

/* Active page: restore full auto rendering */
.rb-bio-page.is-active {
  content-visibility: auto;
}
```

**JS pattern (in new bio-reader.js):**
```javascript
// Source: MDN content-visibility spec
const showPage = (n) => {
  const prev = document.querySelector('.rb-bio-page.is-active');
  if (prev) {
    prev.classList.remove('is-active');
    prev.hidden = true;
  }
  const next = document.getElementById(`p-${pad3(n)}`);
  if (!next) return;
  next.hidden = false;
  next.classList.add('is-active');
  currentPage = n;
  updateIndicator();
  updateYearBadge();
  save(n);
};
```

**Note on `hidden` attribute vs CSS class:** Use the HTML `hidden` attribute (sets `display: none` as UA stylesheet, which we override to `content-visibility: hidden`) — or use a data attribute. The cleanest approach is a CSS class alone: `.rb-bio-page:not(.is-active) { content-visibility: hidden; }`. This avoids the UA stylesheet conflict with `hidden`.

**Recommended final CSS rule:**
```css
/* Source: MDN content-visibility — hidden inactive pages */
.rb-bio-container .rb-bio-page:not(.is-active) {
  content-visibility: hidden;
  contain-intrinsic-size: auto 800px;
  pointer-events: none;
}

.rb-bio-container .rb-bio-page.is-active {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;
}
```

**READER-08 — Reader container height:**
```css
/* Source: MDN dvh unit, Safari 15.4+ */
.rb-bio-reader-wrap {
  height: 100dvh;
  overflow: hidden; /* paged — no vertical scroll at container level */
  display: flex;
  flex-direction: column;
}
```

### Pattern 2: Pointer Events Swipe with iOS Edge Defense (READER-02, READER-03)

**What:** Horizontal swipe detected via pointerdown → pointermove → pointerup sequence. Direction confirmed by angle threshold. iOS edge-swipe filtered by pixel exclusion zone and angle check.

**iOS Safari edge-swipe problem:** Safari's back/forward gesture starts at the left/right screen edge and travels horizontally. There is no CSS property that reliably prevents it on iOS Safari (contrary to spec, `touch-action: pan-x none` is not fully honored). The dual defense is:
1. `touch-action: pan-y` on the container — tells Safari "this element handles horizontal swipes, scroll vertically". This is the CSS signal.
2. In JS: on `pointerdown`, if `clientX < 20` or `clientX > (window.innerWidth - 20)`, do not start swipe — let Safari handle it.
3. On `pointermove`, compute angle: `Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI)`. If angle > 30 degrees from horizontal (i.e., more vertical than 30°), abort the swipe and do not call `preventDefault`.

**Angle threshold rationale:** A 30-degree threshold (meaning the gesture must be within ±30° of perfectly horizontal) matches what Swiper.js and Hammer.js use internally. Below 30° = horizontal swipe (fire navigation). Above 30° = vertical intent (abort, allow scroll). This comfortably misses diagonal back gestures which start at ~45° or more.

**JS pattern:**
```javascript
// Source: MDN Pointer Events, pqina.nl edge-swipe article
const EDGE_PX = 20;        // px from screen edge — ignore (give to Safari)
const ANGLE_LIMIT = 30;    // degrees from horizontal — above this = vertical, abort
const MIN_DIST = 40;       // minimum horizontal px to trigger page turn

let startX, startY, startTime, tracking = false;

container.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return; // mouse uses buttons
  if (e.clientX < EDGE_PX || e.clientX > window.innerWidth - EDGE_PX) return;
  startX = e.clientX;
  startY = e.clientY;
  startTime = Date.now();
  tracking = true;
  container.setPointerCapture(e.pointerId);
});

container.addEventListener('pointermove', (e) => {
  if (!tracking) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI);
  if (angle > ANGLE_LIMIT) {
    tracking = false; // vertical — hand off to browser scroll
    return;
  }
  if (Math.abs(dx) > 8) e.preventDefault(); // lock horizontal
});

container.addEventListener('pointerup', (e) => {
  if (!tracking) return;
  tracking = false;
  const dx = e.clientX - startX;
  if (Math.abs(dx) < MIN_DIST) return;
  if (dx < 0) goNext();
  else goPrev();
});

container.addEventListener('pointercancel', () => { tracking = false; });
```

**CSS required:**
```css
/* Source: MDN touch-action — signal to Safari that element handles H-swipe */
.rb-bio-container {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}
```

### Pattern 3: Keyboard Navigation (READER-05)

```javascript
// Source: MDN KeyboardEvent.key
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, select')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
});
```

### Pattern 4: TOC Data Pipeline (NAV-01, NAV-02)

**What:** `yearGroup` frontmatter on each page .md file. Eleventy collects a sorted list of `{ yearGroup, firstPage }` pairs at build time and writes them into a `<script type="application/json">` tag in the biography layout. JS reads this at runtime — no fetch, no global variable pollution.

**Step 1 — .eleventy.js: build yearGroup map**
```javascript
// Add to .eleventy.js eleventyConfig.addCollection block
eleventyConfig.addCollection("yearGroupMap", (api) => {
  const items = api.getFilteredByTag("biografiPage");
  const getNum = (it) => (it.data.page && it.data.page.number) || 0;
  const sorted = items.sort((a, b) => getNum(a) - getNum(b));

  const groups = [];
  const seen = new Set();
  for (const item of sorted) {
    const yg = item.data.yearGroup;
    if (yg && !seen.has(yg)) {
      seen.add(yg);
      groups.push({ yearGroup: yg, firstPage: getNum(item) });
    }
  }
  return groups;
});
```

**Step 2 — biography.njk: inline JSON**
```nunjucks
<script type="application/json" id="rb-year-groups">
  {{ collections.yearGroupMap | dump | safe }}
</script>
```

**Step 3 — bio-reader.js: parse at startup**
```javascript
const yearGroups = JSON.parse(
  document.getElementById('rb-year-groups')?.textContent || '[]'
);
// yearGroups = [{ yearGroup: "1942–1955", firstPage: 1 }, ...]
```

**Nunjucks `dump` filter:** Eleventy's Nunjucks environment includes the `dump` filter (from nunjucks-date or nunjucks itself) — but to be safe, register a `| json` filter explicitly:
```javascript
eleventyConfig.addFilter("json", (val) => JSON.stringify(val));
// usage in template: {{ collections.yearGroupMap | json | safe }}
```

### Pattern 5: TOC Panel (NAV-03)

**Recommended:** Fixed side panel (right or bottom sheet on mobile). Pattern matches the existing `[data-nav-panel]` overlay — reuse the same show/hide mechanism from `nav.js`.

```html
<!-- in biography.njk, after bio-controls include -->
<div class="rb-toc-panel" data-toc-panel aria-hidden="true">
  <div class="rb-toc-inner">
    <button class="rb-toc-close" data-toc-close>✕</button>
    <ul class="rb-toc-list">
      {% for group in collections.yearGroupMap %}
        <li>
          <button class="rb-toc-item" data-toc-page="{{ group.firstPage }}">
            {{ group.yearGroup }}
          </button>
        </li>
      {% endfor %}
    </ul>
  </div>
</div>
```

**JS:** Click on `.rb-toc-item` reads `data-toc-page`, calls `showPage(n)`, closes panel.

### Pattern 6: Active Year Indicator (NAV-04)

**What:** After each page change, look up `currentPage` in the `yearGroups` array to find which group it belongs to. Display the `yearGroup` label in the controls bar.

```javascript
const getYearGroup = (page) => {
  // yearGroups is sorted by firstPage ascending
  let current = yearGroups[0]?.yearGroup || '';
  for (const g of yearGroups) {
    if (g.firstPage <= page) current = g.yearGroup;
    else break;
  }
  return current;
};
```

### Pattern 7: localStorage State (READER-07)

**New key:** `bio:page` (replaces `bio:last` which stored scroll coordinates)
**Value:** Integer page number — simple, no object overhead.

```javascript
const KEY = 'bio:page';
const save = (n) => { try { localStorage.setItem(KEY, String(n)); } catch {} };
const restore = () => {
  try {
    const n = parseInt(localStorage.getItem(KEY) || '1', 10);
    return Number.isFinite(n) ? Math.max(1, Math.min(n, TOTAL_PAGES)) : 1;
  } catch { return 1; }
};
```

**Note:** The old key `bio:last` can be silently abandoned. No migration needed — first visit after the upgrade just starts at page 1.

### Pattern 8: TECH-01 — Single Config Point for Page Count

**In `.eleventy.js`:**
```javascript
const TOTAL_PAGES = 276; // single source of truth

eleventyConfig.addGlobalData("TOTAL_PAGES", TOTAL_PAGES);

// Then use TOTAL_PAGES in the biografiAll loop and bioRedirectPages:
for (let n = 1; n <= TOTAL_PAGES; n++) { ... }
```

**In biography.njk / bio-page.njk:** Reference `{{ TOTAL_PAGES }}` from Nunjucks global data.
**In bio-reader.js:** Read from an inline `<script>` or data attribute on the container:
```nunjucks
<div class="rb-bio-container" data-bio-pages data-total="{{ TOTAL_PAGES }}">
```
```javascript
const TOTAL_PAGES = parseInt(document.querySelector('[data-bio-pages]')?.dataset.total || '276', 10);
```

### Pattern 9: LAYOUT-01 — Media-Dedicated Pages

**What:** Pages whose entire content is a single image or video are flagged at build time so the reader can render them with an appropriate layout class.

**Approach:** Add `mediaPage: true` to frontmatter of known media pages. Detected by content inspection during import, or set manually. The `bioRender` filter or `bio-page.njk` adds a CSS class:

```nunjucks
{# bio-page.njk #}
<section id="{{ page.data.anchor }}"
         data-page="{{ pageNum }}"
         class="rb-bio-page{% if page.data.mediaPage %} rb-bio-page--media{% endif %}">
```

```css
.rb-bio-page--media {
  display: flex;
  align-items: center;
  justify-content: center;
}
.rb-bio-page--media img,
.rb-bio-page--media .rb-yt-embed {
  max-height: 80dvh;
  width: auto;
}
```

**Alternative (build-time detection):** Inspect `templateContent` in the `biografiAll` collection for pages where the rendered HTML contains only `<figure>`, `<img>`, or `.rb-yt-embed` at the top level. This is more complex and fragile — the frontmatter flag is preferred.

### Pattern 10: LAYOUT-02 — Local Scroll for Expanded Accordions

**Problem:** When a `<details>` element expands inside a paged container with `overflow: hidden`, the expanded content is clipped.

**Solution:** The active page `.rb-bio-page.is-active` gets `overflow-y: auto` and `overscroll-behavior: contain`. The container keeps `overflow: hidden` for non-active pages.

```css
/* Source: MDN overscroll-behavior, ben nadel article */
.rb-bio-page.is-active {
  overflow-y: auto;
  overscroll-behavior-y: contain;
  /* height: 100% of reader container — set by flexbox parent */
}

/* Inactive pages stay completely hidden */
.rb-bio-container .rb-bio-page:not(.is-active) {
  content-visibility: hidden;
  pointer-events: none;
  overflow: hidden;
}
```

**The paged container:**
```css
.rb-bio-reader-wrap {
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rb-bio-container {
  flex: 1;
  overflow: hidden; /* contains all pages; only active page scrolls internally */
  position: relative;
  touch-action: pan-y;
}
```

### Pattern 11: Controls Bar (READER-04, READER-06)

**Recommended layout:** Fixed bottom bar — consistent with the existing `rb-controls-outer` position, extends it with prev/next buttons and TOC toggle.

```html
<!-- bio-controls.njk redesign -->
<div class="rb-controls-bar" data-controls>
  <button class="rb-ctrl-btn" data-prev aria-label="Föregående sida">&#8592;</button>
  <div class="rb-ctrl-center">
    <span class="rb-page-indicator" data-page-indicator>1 / {{ TOTAL_PAGES }}</span>
    <span class="rb-year-badge" data-year-badge></span>
  </div>
  <button class="rb-ctrl-btn" data-next aria-label="Nästa sida">&#8594;</button>
  <button class="rb-ctrl-btn rb-ctrl-toc" data-toc-toggle aria-label="Innehållsförteckning">&#9776;</button>
</div>
```

### Anti-Patterns to Avoid

- **Do not use `display: none` / `display: block` toggle** for 276 elements — triggers full reflow every page turn, visible jank on mid-range devices.
- **Do not use CSS `transform: translateX` to slide pages** — creates stacking context issues with `position: fixed` controls bar, and requires knowing next/prev page in advance.
- **Do not attach swipe listeners to `window` or `document`** — Pointer Events must be captured on the specific scrollable container so `setPointerCapture` works correctly.
- **Do not skip the edge exclusion zone** — without the 20px edge guard, iOS Safari will fire both the back gesture AND the swipe handler simultaneously.
- **Do not use `scroll-snap`** — the 276-page DOM with overflow hidden is not a scrollable container; snap requires overflow: scroll which defeats the paged model.
- **Do not use `visibility: hidden`** — it preserves flow space, so the document remains 276 pages tall; the container overflows.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe angle calculation | Custom trigonometry lib | `Math.atan2` (built-in JS) | Already in all browsers; one line |
| TOC data serialization | Custom JSON builder | `JSON.stringify` + Eleventy `| json` filter | Handles escaping, nesting, Unicode |
| localStorage error handling | Promise wrappers | `try/catch` inline | localStorage is synchronous; wrapping adds no value |
| Page count config | Template-level constant | `addGlobalData` + `data-total` attribute | Single source — no divergence possible |
| Smooth swipe animation | CSS animation library | CSS `transition: opacity 0.15s` on page only | V2 scope; Phase 2 is instant switch |

**Key insight:** The 276-section DOM is already built correctly. The reader controller's job is pure state management (which page is active) plus event plumbing. There is no layout engine to build.

---

## Common Pitfalls

### Pitfall 1: iOS Safari touch-action Not Honored
**What goes wrong:** Setting `touch-action: pan-x` or `touch-action: none` on iOS Safari does not reliably prevent the back/forward navigation gesture. The system gesture takes priority.
**Why it happens:** iOS Safari's edge swipe is a UIKit-level gesture recognizer, not a web event. CSS `touch-action` affects web touch events only.
**How to avoid:** Use `touch-action: pan-y` (allows vertical scroll, signals horizontal interest) PLUS the 20px edge exclusion zone in the `pointerdown` handler.
**Warning signs:** Testers on iOS 17 report that left-swipe from page 1 navigates backward in browser history instead of silently blocking.

### Pitfall 2: content-visibility Clipping in Flex Container
**What goes wrong:** If `.rb-bio-page` is a flex child and its parent uses `overflow: hidden`, `content-visibility: hidden` may cause the active page to have zero height on first render.
**Why it happens:** `content-visibility: hidden` skips size contribution; the flex layout doesn't see the content until rendered.
**How to avoid:** Set `contain-intrinsic-size: auto 800px` on every page (already in the CSS). For the active page, also set an explicit `min-height: 0; flex: 1` so flexbox distributes height correctly.
**Warning signs:** Active page renders with 0 height; content invisible even though `is-active` class is present.

### Pitfall 3: Pointer Capture Lost on Fast Swipe
**What goes wrong:** `setPointerCapture` must be called on the element that received `pointerdown`. If the element is replaced or the pointerId is stale, pointermove events stop arriving mid-swipe.
**Why it happens:** Rapid swipes on iOS sometimes trigger `pointercancel` before `pointerup`.
**How to avoid:** Always handle `pointercancel` and reset state. Do not require `pointerup` for swipe commit — commit direction as soon as `MIN_DIST` is exceeded in `pointermove`.
**Warning signs:** Fast swipes on mobile do nothing; slow deliberate swipes work.

### Pitfall 4: yearGroup Map Ordering
**What goes wrong:** TOC lists year groups out of order if the `biografiAll` collection iteration order differs from page number order.
**Why it happens:** Eleventy collection ordering is not guaranteed unless explicitly sorted.
**How to avoid:** Always sort by `page.number` before building the yearGroup map in `addCollection("yearGroupMap", ...)`.
**Warning signs:** TOC shows "1956–1968" before "1942–1955".

### Pitfall 5: `bio:last` localStorage Key Conflict
**What goes wrong:** The new `bio:page` key stores an integer. The old `bio:last` key stored a JSON object. If both keys exist after upgrade, the restore logic may read the wrong one.
**Why it happens:** Old key persists across code upgrades.
**How to avoid:** New code only reads `bio:page`. Optionally delete `bio:last` on startup: `try { localStorage.removeItem('bio:last'); } catch {}`.
**Warning signs:** On first load after upgrade, user is returned to a position that doesn't correspond to any page.

### Pitfall 6: Nunjucks `dump` Filter vs Safe JSON
**What goes wrong:** Nunjucks' built-in `dump` filter may not be available in all Eleventy versions, or may escape characters incorrectly for embedding in `<script>`.
**Why it happens:** `dump` is a Nunjucks dev-mode filter, not guaranteed in production.
**How to avoid:** Register an explicit `| json` filter in `.eleventy.js` using `JSON.stringify`. Use `<script type="application/json">` (not `type="text/javascript"`) — content in `application/json` scripts is inert and does not need HTML escaping of `<`, `>`, `&`.
**Warning signs:** Build fails with "filter not found: dump" or JSON parse errors in browser console.

### Pitfall 7: TECH-01 Template Reference to TOTAL_PAGES
**What goes wrong:** `bio-page.njk` currently hardcodes `/276` in the page meta display. If `TOTAL_PAGES` is added as global data but `bio-page.njk` is not updated, the hardcoded value remains.
**Why it happens:** Multiple touch points for the same constant.
**How to avoid:** Search for literal `276` in all template files as part of TECH-01 task. Update `bio-page.njk` line 5, `.eleventy.js` lines 268 and 285, and the new `bio-reader.js`.
**Warning signs:** Page indicator shows "12 / 276" from JS but `Page 12/276` in the in-page meta shows a different total.

---

## Code Examples

### Minimal IIFE Shell for New bio-reader.js
```javascript
// Source: existing bio-reader.js IIFE pattern (project convention)
(() => {
  if (!document.body.dataset.biography) return;

  const TOTAL_PAGES = parseInt(
    document.querySelector('[data-bio-pages]')?.dataset.total || '276', 10
  );
  const KEY = 'bio:page';
  const pad3 = (n) => String(n).padStart(3, '0');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  let currentPage = 1;

  // --- State ---
  const save = (n) => { try { localStorage.setItem(KEY, String(n)); } catch {} };
  const restore = () => {
    try {
      const n = parseInt(localStorage.getItem(KEY) || '1', 10);
      return Number.isFinite(n) ? clamp(n, 1, TOTAL_PAGES) : 1;
    } catch { return 1; }
  };

  // --- Visibility ---
  const showPage = (n) => {
    n = clamp(n, 1, TOTAL_PAGES);
    const prev = document.querySelector('.rb-bio-page.is-active');
    if (prev) prev.classList.remove('is-active');
    const next = document.getElementById(`p-${pad3(n)}`);
    if (!next) return;
    next.classList.add('is-active');
    currentPage = n;
    updateIndicator();
    updateYearBadge();
    save(n);
  };

  const goNext = () => { if (currentPage < TOTAL_PAGES) showPage(currentPage + 1); };
  const goPrev = () => { if (currentPage > 1) showPage(currentPage - 1); };

  // --- Controls ---
  const updateIndicator = () => {
    const el = document.querySelector('[data-page-indicator]');
    if (el) el.textContent = `${currentPage} / ${TOTAL_PAGES}`;
  };

  // ... (year badge, swipe, keyboard, buttons wired here)

  window.addEventListener('DOMContentLoaded', () => {
    showPage(restore());
  });
})();
```

### Eleventy json Filter Registration
```javascript
// Source: Eleventy filter API docs — add to .eleventy.js
eleventyConfig.addFilter("json", (val) => JSON.stringify(val));
```

### biography.njk — Inline Year Groups + TOTAL_PAGES
```nunjucks
{# Baked-in data for JS reader — no runtime fetch #}
<script type="application/json" id="rb-year-groups">{{ collections.yearGroupMap | json | safe }}</script>
<div class="rb-bio-reader-wrap">
  {% include "bio-controls.njk" %}
  <div class="rb-bio-container" data-bio-pages data-total="{{ TOTAL_PAGES }}">
    {% for p in collections.biografiAll %}
      {% set page = p %}
      {% include "bio-page.njk" %}
    {% endfor %}
  </div>
</div>
{% include "bio-toc.njk" %}
```

### frontmatter Addition for yearGroup (NAV-01)
```yaml
---
page:
  number: 11
anchor: p-011
permalink: false
tags: [biografiPage]
layout: biography
yearGroup: "1942–1955"
---
```

---

## State of the Art

| Old Approach (existing) | Phase 2 Approach | Reason |
|------------------------|-----------------|--------|
| Scroll-based position (`window.scrollY`) | Page number integer in localStorage | Scroll Y is meaningless in paged model |
| `bio:last` = `{ anchor, y, updatedAt }` JSON | `bio:page` = integer string | Simpler; page number is the canonical position |
| `querySelectorAll` loop to find "current" page by viewport position | Direct `getElementById('p-NNN')` by page number | O(1) lookup; no layout thrashing |
| `content-visibility: auto` on all pages | `content-visibility: hidden` on inactive, `auto` on active | Inactive pages 100% skipped by render pipeline |
| Single scroll container | `overflow: hidden` container + `overflow-y: auto` on active page | Enables local accordion scroll while maintaining paged model |
| Page input `<input type="number">` in controls | Page indicator text + prev/next buttons + TOC toggle | Matches e-book reader UX; input retained as v2 option |

**Deprecated from bio-reader.js:**
- `getCurrentAnchor()` scroll-scan loop
- `window.scroll` event listener
- `scrollIntoView()` / `window.scrollTo()`
- `history.replaceState()` hash updates (V2 scope)
- Continue-reading button and `[data-continue]` attribute

---

## Open Questions

1. **`content-visibility: hidden` in Safari — flex height**
   - What we know: `contain-intrinsic-size: auto 800px` is already set; should prevent zero-height collapse
   - What's unclear: Whether Safari 15.4–16 handles `content-visibility: hidden` inside a flex container correctly without an explicit height on the container
   - Recommendation: Test on real iOS Safari during Wave 1; fallback is `display: none` with explicit `requestAnimationFrame` on show to avoid reflow blocking

2. **276 .md files — automated yearGroup addition**
   - What we know: All files follow `page-NNN.md` naming; frontmatter is consistent
   - What's unclear: Whether a Python script to bulk-add `yearGroup: "placeholder"` is faster than manual addition for 276 files
   - Recommendation: Write a one-shot Python script (following existing pattern in project) to add `yearGroup: "1900–1900"` placeholder to every file that lacks the key

3. **iOS 17 edge-swipe — `pointercancel` timing**
   - What we know: iOS fires `pointercancel` if the system gesture activates; the 20px guard should prevent this
   - What's unclear: Exact pixel budget on iPhone 15 Pro (notch/dynamic island area may extend edge zone)
   - Recommendation: Use 30px guard instead of 20px for safety; test on real device before sign-off

4. **TOC panel — bottom sheet on mobile vs side panel**
   - What we know: The existing nav uses a full-screen overlay (`[data-nav-panel]`)
   - What's unclear: Whether a full-screen TOC overlay (10–15 items) feels heavy vs a bottom sheet
   - Recommendation: Use the existing full-screen overlay pattern for consistency; a bottom sheet would require additional CSS complexity with no strong benefit for 10–15 items

---

## Validation Architecture

> nyquist_validation is enabled in config.json.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — static site, no test runner |
| Config file | None — see Wave 0 gaps below |
| Quick run command | `npx eleventy --dryrun 2>&1 \| grep -c "Writing"` (build count check) |
| Full suite command | `npx eleventy` + manual browser checklist |

**Note:** This project has no automated test infrastructure. Wave 0 must decide: add a minimal test harness for DOM assertions, or rely entirely on the manual checklist. Given the zero-runtime-deps philosophy, a build-output HTML assertion script (Node.js, no test framework) is the pragmatic choice.

### Phase Requirements — Verification Map

| Req ID | Behavior | Test Type | Automated Command / Method | Notes |
|--------|----------|-----------|----------------------------|-------|
| READER-01 | One page visible at a time | DOM smoke | Build output: check `<section class="rb-bio-page is-active">` appears exactly once on page load | Wave 0 script |
| READER-02 | Swipe left/right navigates | Manual/device | Human: swipe left on mobile, confirm page advances | iOS Safari + Chrome Android |
| READER-03 | iOS edge-swipe does not trigger back | Manual/device | Human: swipe from left edge on iPhone — must NOT navigate backward in browser history | Real device required |
| READER-04 | Arrow buttons navigate | Manual | Human: click ← → buttons, confirm page changes | Desktop + mobile |
| READER-05 | Keyboard ArrowLeft/ArrowRight | Manual | Human: desktop, press arrow keys | Desktop browser |
| READER-06 | Indicator shows "N / 276" | DOM smoke | Build output: `data-page-indicator` element exists in HTML | Wave 0 script |
| READER-07 | localStorage saves/restores page | Manual | Human: go to page 50, close tab, reopen — should land on 50 | Any browser |
| READER-08 | Container uses `100dvh` | CSS grep | `grep -n "100dvh" assets/css/main.css` — must find `.rb-bio-reader-wrap` | Automated |
| READER-09 | bio-reader.js has no scroll model | Code review | `grep -n "scrollY\|scrollIntoView\|window.scroll" assets/js/bio-reader.js` — must return 0 matches | Automated |
| NAV-01 | yearGroup frontmatter on all 276 pages | Build smoke | Script: count .md files with `yearGroup:` in frontmatter — must equal 276 | Wave 0 script |
| NAV-02 | Year data baked into HTML | Build output | `grep -n "rb-year-groups" _site/biografi/index.html` — must find populated script tag | Automated |
| NAV-03 | TOC lists year periods | Manual | Human: open TOC, verify all groups listed, click one, confirm page jump | Manual |
| NAV-04 | Current year indicated | Manual | Human: navigate through year boundaries, verify badge updates | Manual |
| LAYOUT-01 | Media pages get dedicated layout | Manual | Human: navigate to a known image/video page, verify media fills page | Manual |
| LAYOUT-02 | Expanded accordion allows local scroll | Manual | Human: open `<details>` on a page with long accordion content, scroll within it | Manual |
| TECH-01 | No hardcoded 276 in templates/JS | Code review | `grep -rn '"276"\|= 276\|/276' assets/js/bio-reader.js includes/ layouts/` — must return 0 | Automated |

### Automated Check Commands (runnable in < 30s)

```bash
# READER-08: 100dvh present
grep -n "100dvh" /path/to/assets/css/main.css

# READER-09: No scroll model in new bio-reader.js
grep -cn "scrollY\|scrollIntoView\|window\.scroll" assets/js/bio-reader.js

# NAV-02: year groups baked into built HTML
grep -c "rb-year-groups" _site/biografi/index.html

# TECH-01: No hardcoded 276
grep -rn '"276"\|= 276\|\/276' assets/js/bio-reader.js includes/ layouts/

# NAV-01: yearGroup in all 276 files
grep -l "yearGroup:" content/pages/biografi/pages/*.md | wc -l
# Expected: 276
```

### Manual / Device Test Checklist

**iOS Safari (real device — iPhone, not simulator):**
- [ ] Swipe right to left advances page
- [ ] Swipe left to right retreats page
- [ ] Swipe from left edge (< 20px) does NOT trigger page navigation
- [ ] Expanded `<details>` scrolls within page without scrolling the reader
- [ ] Page indicator updates correctly
- [ ] Closing and reopening Safari returns to last page

**Android Chrome (real device preferred):**
- [ ] Swipe navigation works
- [ ] 100dvh correctly excludes browser chrome

**Desktop (Chrome, Firefox, Safari):**
- [ ] Arrow key navigation works
- [ ] TOC opens and closes
- [ ] TOC jump lands on correct page
- [ ] Page indicator format is "N / 276"

### Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Page turn latency | < 16ms (1 frame at 60fps) | Chrome DevTools Performance panel — measure time from `pointerup` to paint |
| Initial page load (LCP) | < 2.0s on 4G throttle | Chrome DevTools Lighthouse |
| Memory with 276 hidden pages | < 50MB JS heap | Chrome DevTools Memory — snapshot after 10 page turns |
| TOC open latency | < 100ms | Manual perception test |

**Note on 276 DOM elements:** With `content-visibility: hidden`, the browser skips paint/layout for all 276 hidden sections. Performance impact should be minimal (comparable to 1 visible page). If content-visibility behaves unexpectedly on iOS Safari, the fallback is `display: none` + `requestAnimationFrame` — accept the reflow cost in exchange for guaranteed correctness.

### Wave 0 Gaps

- [ ] `scripts/check-build-output.js` — Node.js script: builds site, checks HTML for `is-active` count, `rb-year-groups` presence, `data-page-indicator` — covers READER-01, NAV-02, READER-06
- [ ] `scripts/check-frontmatter.js` — Scans all 276 .md files for `yearGroup:` key — covers NAV-01
- [ ] No test framework install needed — plain Node.js `fs` + `assert` modules sufficient

*(If no gaps acceptable: skip scripts entirely, rely on manual checklist. Recommended: add the two scripts as they catch the most common build-time regressions.)*

---

## Sources

### Primary (HIGH confidence)
- MDN Web Docs — [content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) — page visibility model
- MDN Web Docs — [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) — swipe detection API
- Eleventy official docs — [Config Global Data](https://www.11ty.dev/docs/data-global-custom/) — `addGlobalData` API
- Eleventy official docs — [JavaScript Data Files](https://www.11ty.dev/docs/data-js/) — build-time data generation
- web.dev — [content-visibility rendering performance](https://web.dev/articles/content-visibility) — 250ms nav improvement data
- MDN Web Docs — [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior) — local scroll containment

### Secondary (MEDIUM confidence)
- pqina.nl — [Blocking Navigation Gestures on iOS 13.4](https://pqina.nl/blog/blocking-navigation-gestures-on-ios-13-4) — 20px edge exclusion zone technique (verified: iOS-specific, applies to Safari 13.4+)
- ishadeed.com — [New Viewport Units](https://ishadeed.com/article/new-viewport-units/) — 100dvh behavior and browser support
- Ben Nadel — [overscroll-behavior to prevent parent scroll](https://www.bennadel.com/blog/3698-using-css-overscroll-behavior-to-prevent-scrolling-of-parent-containers-from-within-overflow-containers.htm) — scroll containment pattern

### Tertiary (LOW confidence — flagged for validation)
- W3C Pointer Events spec issue — [touch-action: disable webview swipe back](https://github.com/w3c/pointerevents/issues/358) — confirms `touch-action` does NOT fully prevent iOS back gesture at the web level; real-device testing required
- 30-degree angle threshold for swipe — inferred from Swiper.js source patterns and general swipe library conventions; not documented in a single authoritative source; **test on device before finalizing**

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already in project; no new dependencies
- Page visibility model: HIGH — `content-visibility` documented at MDN and web.dev with performance data
- Pointer Events swipe: HIGH for API, MEDIUM for iOS edge-swipe specifics (real-device required)
- Eleventy data pipeline: HIGH — `addGlobalData` is documented Eleventy API
- Architecture patterns: HIGH — derived from existing codebase patterns
- 30-degree angle threshold: MEDIUM — common convention, not single-source-verified

**Research date:** 2026-03-05
**Valid until:** 2026-06-05 (stable APIs; review if iOS Safari 18+ changes touch behavior)
