# Technology Stack

**Project:** Rolf Börjlind Digital Biografi — E-book Reader Milestone
**Researched:** 2026-03-04
**Overall Confidence:** HIGH (based on codebase inspection + established Web Platform APIs)

---

## Recommended Stack

### Core Framework (unchanged)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Eleventy | 2.0.1 | SSG, template rendering | Keep as-is — no migration cost, already working |
| Nunjucks | (bundled) | Layout templates | biography.njk controls page structure |
| markdown-it | 14.1.0 | Markdown rendering | Keep — accordion/poem containers are custom plugins |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Plain CSS (hand-written) | — | All visual styling | Replace Tailwind entirely; one well-structured file |
| CSS Custom Properties | Native | Theming (colors, fonts, layout vars) | Already started: `--header-h`, `color-scheme: dark` |
| No PostCSS pipeline | — | Build | Plain CSS needs no build step; passthrough copy only |

### JavaScript (runtime, zero dependencies)

| Technology | API Version | Purpose | Why |
|------------|-------------|---------|-----|
| Pointer Events API | Level 2 (2024, all browsers) | Swipe/drag detection | Use this, not Touch Events — see section below |
| localStorage | Web Storage Level 2 | Progress persistence | Already used in bio-reader.js |
| History API (`replaceState`) | HTML Living Standard | URL-hash sync | Already used; keep for deep-linking |
| `requestAnimationFrame` | DOM Living Standard | Animation (slide transitions) | Zero-cost, native |
| CSS `transition` + JS class toggle | — | Page flip animation | Let CSS do the interpolation, JS only toggles classes |

### Build

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Eleventy | 2.0.1 | Build entire site | CSS is passthrough copy, no transformation needed |
| npm-run-all | 4.1.5 | Parallel scripts | Keep for dev; simplify build script once CSS pipeline is gone |

---

## What to Remove

| Remove | Replace With | Rationale |
|--------|-------------|-----------|
| Tailwind CSS v3 | Plain CSS file | Zero-dependency output; no build pipeline for CSS; no class-name churn |
| @tailwindcss/typography | Hand-written `.rb-prose` rules | The `.rb-prose` block already exists in compiled output — extract it |
| PostCSS + autoprefixer | Nothing | Target browsers (2022+) support all used CSS without prefixes |
| tailwind.css input file | assets/css/main.css (hand-written) | One file, human-readable, no tooling needed |
| dev:css script (tailwindcss watch) | Remove from package.json | Eleventy's `--serve` serves passthrough CSS instantly |

After removal, `devDependencies` drops to zero. `dependencies` becomes: `@11ty/eleventy`, `eleventy-plugin-embed-everything`, `markdown-it`, `markdown-it-container`, `markdown-it-implicit-figures`.

---

## Core Technical Decisions

### Decision 1: Pointer Events API, not Touch Events

**Use:** `pointerdown`, `pointermove`, `pointerup`, `pointercancel` on the reader container.

**Why not Touch Events (`touchstart` / `touchmove` / `touchend`):**
- Touch Events are a single-finger, mobile-only abstraction. They do not fire for mouse drag on desktop.
- Pointer Events unify mouse, touch, and stylus in one event model. A single handler works on mobile swipe, desktop drag, and trackpad swipe.
- `pointer-events: none` CSS and `setPointerCapture()` give clean capture semantics — the element tracks the pointer even if it leaves the hit target mid-drag.
- Touch Events require `passive: false` to call `preventDefault()` and block scrolling, which causes Chrome scroll performance warnings. Pointer Events plus `touch-action: pan-y none` CSS is the correct 2025 approach.

**Implementation pattern:**

```javascript
// CSS on the reader container:
// touch-action: pan-y;  (allow vertical, block horizontal by JS)

const reader = document.querySelector('[data-reader]');
let startX = 0, startY = 0, dragging = false;

reader.addEventListener('pointerdown', (e) => {
  startX = e.clientX;
  startY = e.clientY;
  dragging = true;
  reader.setPointerCapture(e.pointerId);
}, { passive: true });

reader.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  // Ignore if primarily vertical (natural scroll)
  if (Math.abs(dy) > Math.abs(dx)) return;
  // Optionally: live drag preview via CSS translate
  // reader.style.setProperty('--drag-x', `${dx}px`);
}, { passive: true });

reader.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  const dx = e.clientX - startX;
  const THRESHOLD = 60; // px — tune for feel
  if (dx < -THRESHOLD) navigateTo(currentPage + 1);
  else if (dx > THRESHOLD) navigateTo(currentPage - 1);
}, { passive: true });

reader.addEventListener('pointercancel', () => { dragging = false; });
```

**Swipe threshold:** 60px minimum displacement AND velocity check optional. Start without velocity — 60px is sufficient for intentional swipes.

---

### Decision 2: JS-driven page switching, not CSS scroll-snap

**Use:** JS-controlled visibility (`display: none` / `block` or `hidden` attribute) + CSS `transition` on the active page wrapper.

**Why not CSS `scroll-snap`:**
- CSS scroll-snap (`scroll-snap-type: x mandatory`) works well for horizontally-scrolling carousels of fixed-width content. It falls apart for this project because:
  1. Pages have variable height (image-only pages vs long text with accordions). Scroll-snap needs uniform sizing or careful `scroll-snap-align` work.
  2. Accordions that expand mid-read need the page to scroll vertically while preventing horizontal snap interference. With scroll-snap this is a documented conflict — vertical overflow inside a horizontal snap container is unreliable across browsers.
  3. 276 DOM nodes in a horizontal scroll container with `overflow: hidden` on the body is a performance trap (layout of 276 full-height pages at once).
  4. Deep-linking via URL hash (`#p-042`) is trivial with the JS model, awkward with scroll-snap.

**Why JS-driven visibility is right:**
- Only one page is visible (and in layout) at a time — `content-visibility: auto` already used on `.rb-bio-page` confirms the intent.
- State is explicit and testable: `currentPage` integer, persisted to localStorage.
- Transition is simple: fade or slide via CSS `transition`, triggered by adding/removing a class.

**Recommended page transition:**

```css
.rb-reader-page {
  display: none;
  opacity: 0;
  transition: opacity 180ms ease;
  /* vertical scroll within the page: */
  overflow-y: auto;
  height: calc(100dvh - var(--header-h) - var(--controls-h));
}

.rb-reader-page.is-active {
  display: block;
  opacity: 1;
}
```

Use `requestAnimationFrame` to trigger the transition after `display: block`:

```javascript
function showPage(el) {
  el.style.display = 'block';
  requestAnimationFrame(() => el.classList.add('is-active'));
}
function hidePage(el) {
  el.classList.remove('is-active');
  // Remove after transition completes
  el.addEventListener('transitionend', () => {
    el.style.display = 'none';
  }, { once: true });
}
```

**Alternative considered:** CSS `@starting-style` (Chrome 117+, Firefox 129+) allows transitioning from `display: none` without rAF. Skip it for now — the rAF pattern is well-understood and works on all targets including older Safari.

---

### Decision 3: Accordion + media pages — vertical scroll allowed per page

Pages with accordions or large images must allow vertical scroll within the page viewport. This is a fundamental design constraint.

**Approach:** The reader viewport is `height: 100dvh - nav`. Each `.rb-reader-page` is `overflow-y: auto`. The reader container itself has `overflow: hidden` on the horizontal axis only. This means:

- Swipe left/right: detected by JS, triggers page navigation.
- Scroll up/down: native browser vertical scroll within the page, no JS involvement.
- No conflict: the Pointer Events handler ignores events where `|dy| > |dx|` (vertical swipe intent).

**Media-only pages:** Pages that contain only an image or video (e.g., page-1.md is a single image) need no special handling — they just have less content. No separate "media page" layout is needed.

---

### Decision 4: Tailwind removal strategy

**Approach: Extract-and-rewrite, not in-place removal.**

Do not try to keep Tailwind utility classes and progressively replace them. Reason: the compiled `main.css` is a single minified file that interleaves Tailwind reset, utility classes, and hand-written component CSS. It is not human-maintainable.

**Correct process:**
1. Read the existing compiled output to inventory which utility classes are actually used in templates (`.njk` files).
2. Write a new `assets/css/main.css` from scratch using plain CSS:
   - CSS custom properties for all design tokens (colors, font families, spacing scale).
   - Component classes (`.rb-header`, `.rb-bio-page`, `.rb-prose`, `.rb-accordion`, etc.) directly.
   - No utility class layer at all.
3. Strip Tailwind class names from `.njk` templates simultaneously, replacing with semantic class names or inlining into component rules.
4. Delete: `tailwindcss`, `@tailwindcss/typography`, `postcss`, `autoprefixer` from package.json.
5. Update `package.json` scripts: remove `dev:css` and `build:css`.
6. Update `.eleventy.js`: remove PostCSS passthrough, use simple passthrough for `assets/css/main.css`.

**Gotchas:**

| Gotcha | Detail |
|--------|--------|
| Tailwind reset is load-bearing | The Tailwind preflight (normalize/reset) is embedded in the compiled CSS. The new CSS must include its own reset. Use `box-sizing: border-box`, margin resets for headings, `img { max-width: 100%; height: auto }`. |
| `@tailwindcss/typography` prose styles | The `.rb-prose` component already exists in the compiled output and is hand-customized. Extract those rules verbatim into the new file — they are already overriding the plugin defaults. |
| Tailwind dark mode via `prose-invert` | Already handled by explicit color overrides in `.rb-prose`. No `prefers-color-scheme` media queries in use — dark is the only mode. |
| `content-visibility: auto` on `.rb-bio-page` | Keep this. It is a performance win for the current scroll model and will be removed/replaced when switching to one-page-at-a-time (no longer needed if only one page is visible). |
| Tailwind utility classes in `.njk` | Templates use classes like `mx-auto`, `max-w-5xl`, `flex`, `items-center`, `gap-6`, `px-4`, `z-[100]`. These must all be replaced. Count is ~40-60 unique utilities across all templates. |
| `npm-run-all` parallel dev | After removing the CSS build step, `dev:11ty` alone is sufficient. Remove `dev:css`. The `npm-run-all` package can stay or be removed — it is only needed if parallel scripts remain. |

---

### Decision 5: URL strategy and state persistence

**Keep the existing hash-based approach.** `#p-042` is a working, bookmarkable, shareable URL. The new reader should:
- On page navigation: `history.replaceState(null, '', '#p-' + pad3(n))`.
- On load: parse `location.hash` to determine starting page (falling back to localStorage).
- localStorage key: keep `bio:last` for backward compatibility; update payload to include current page number.

**Keyboard navigation:** Add `keydown` listener for `ArrowLeft` / `ArrowRight` and `ArrowUp` / `ArrowDown` (for within-page scroll). This is standard e-reader UX and costs ~10 lines of code.

---

## What NOT to Use

| Library/Approach | Why Not |
|-----------------|---------|
| Hammer.js | Abandoned (last release 2016). Pointer Events API replaces it entirely. |
| Swiper.js | Runtime dependency (40kb+). Designed for carousels, not e-readers with variable-height pages and embedded accordions. |
| CSS scroll-snap | See Decision 2 above. Conflicts with vertical scroll inside horizontal snap containers on pages with accordions/media. |
| CSS `overflow-x: scroll` on body | Makes every horizontal scroll (trackpad momentum, RTL text selection) trigger page turn. Unacceptable UX. |
| React/Vue/Svelte | The project goal is zero runtime dependencies. The JS required for this reader is <200 lines. |
| Intersection Observer for page detection | Only useful in the scroll model. In one-page-at-a-time model, current page is explicit state — no observation needed. |
| Web Animations API | More verbose than CSS transitions for this use case. Use `transition` + class toggling. |
| Tailwind CSS v4 | Would require a build pipeline change mid-project. The goal is to remove Tailwind entirely, not upgrade it. |

---

## Installation Changes

Remove from `package.json`:
```bash
npm uninstall tailwindcss @tailwindcss/typography postcss autoprefixer
```

No new packages to install. The remaining dependencies are sufficient.

Updated `package.json` scripts after Tailwind removal:
```json
{
  "scripts": {
    "dev": "eleventy --serve --watch",
    "build": "eleventy"
  }
}
```

`npm-run-all` can be removed from devDependencies once the parallel CSS build step is gone.

---

## Browser Targets

| Browser | Minimum Version | Rationale |
|---------|----------------|-----------|
| Chrome/Edge | 105 | Pointer Events Level 2, `dvh` units, `container-type` |
| Firefox | 110 | Full Pointer Events + `dvh` |
| Safari iOS | 15.4 | `dvh` units (critical for mobile reader height calculation) |
| Safari macOS | 15.4 | Same |

Use `height: 100dvh` (dynamic viewport height) not `100vh` for the reader container. On mobile Safari, `100vh` includes the browser chrome in its calculation and causes the page to overflow under the address bar. `dvh` was designed to solve this exact problem and is supported in all targets above.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Pointer Events API | HIGH | Established W3C spec, shipped in all browsers since ~2020. `setPointerCapture` documented and tested. |
| JS-driven page switching | HIGH | Standard pattern for custom readers. No external verification needed. |
| CSS scroll-snap rejection | HIGH | Vertical-inside-horizontal conflict is a documented browser behavior, not a hypothesis. |
| Tailwind removal | HIGH | Direct inspection of package.json and compiled CSS. Gotchas identified from template analysis. |
| `dvh` units | HIGH | Can Be Seen in MDN compatibility tables; all listed targets support it. |
| 60px swipe threshold | MEDIUM | Value is a starting point based on common mobile UX guidelines. Should be validated with device testing. |
| rAF display:none transition pattern | HIGH | Long-established pattern. `@starting-style` alternative is newer and optional. |

---

## Sources

- MDN Web Docs: Pointer Events (https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- MDN Web Docs: `touch-action` CSS property (https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- MDN Web Docs: `dvh` viewport units (https://developer.mozilla.org/en-US/docs/Web/CSS/length#dvh)
- W3C Pointer Events Level 2 specification
- Codebase inspection: `assets/js/bio-reader.js`, `assets/css/main.css`, `layouts/biography.njk`, `includes/bio-page.njk`, `package.json`, `.eleventy.js`
