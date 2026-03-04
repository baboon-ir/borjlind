# Domain Pitfalls

**Domain:** Swipe-based e-book reader on static Eleventy site + Tailwind-to-plain-CSS migration
**Researched:** 2026-03-04
**Confidence:** HIGH (grounded in actual codebase analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites or major breakage.

---

### Pitfall 1: iOS Safari Swipe Conflicts with Browser Back/Forward Navigation

**What goes wrong:** iOS Safari reserves horizontal swipe gestures for browser back/forward navigation. A custom swipe handler that listens to `touchstart`/`touchmove`/`touchend` on the document or body will race with the browser. The browser can cancel the touch sequence mid-gesture, causing a partial page-turn animation that then gets snapped back, or worse, navigating away from the biography page entirely. The problem is worse at the left and right screen edges (15-20px dead zones where Safari intercepts unconditionally).

**Why it happens:** Safari does not expose an API to disable edge-swipe navigation. `preventDefault()` on `touchmove` can suppress scrolling but not edge navigation. The browser applies its own gesture recognition first, before the JS handler.

**Consequences:** Readers trying to turn to the next page instead trigger browser back. On iOS 16+ with swipe-back animation enabled, a failed swipe leaves a ghost animation. The reader becomes unusable on iPhone in Safari.

**Prevention:**
- Apply swipe detection only on an inner container element (`.rb-bio-page` or a dedicated reader wrapper), not on `document`/`window`.
- Require a minimum horizontal displacement (e.g. 40px) AND that the gesture is more horizontal than vertical (angle check: `Math.abs(dx) > Math.abs(dy) * 1.5`) before committing to a page turn.
- Set `touch-action: pan-y` on the swipe container via CSS — this tells the browser "vertical scrolling is managed, horizontal is mine." This is the correct modern approach. Do NOT use `touch-action: none` which disables all native scrolling.
- Never call `preventDefault()` on `touchstart` (this blocks passive event listener optimization and breaks iOS momentum scrolling).
- Call `preventDefault()` on `touchmove` only after confirming horizontal intent.

**Warning signs:**
- Swipe works on Android/Chrome but feels broken on iPhone.
- Pages turn intermittently on iOS.
- Browser back animation appears during swipe attempts.

**Phase:** E-book reader implementation (Phase 1 of new milestone).

---

### Pitfall 2: Tailwind Prose Reset Erasure — Typography Collapses Without Replacement

**What goes wrong:** The current CSS (`main.css`) uses `@apply prose prose-invert max-w-none` on `.rb-prose` (line 327). The `prose` class from `@tailwindcss/typography` injects ~300 lines of opinionated typographic rules: paragraph margins, heading sizes, list styles, blockquote styling, figure/figcaption spacing, table layout, and code rendering. When Tailwind is removed, `.rb-prose` loses all of this. The result is a completely unstyled wall of text with no paragraph spacing, no heading hierarchy, and collapsed lists.

**Why it happens:** Developers focus on utility classes in HTML (which are easy to audit) and miss that `@apply prose` is a macro that expands to hundreds of rules in the compiled output.

**Consequences:** Every page of the biography renders as unstyled text. Images lose their centering. Blockquotes lose their styling. Headings look identical to body text. This is a full visual regression across all 276 pages.

**Prevention:**
- Before removing any Tailwind, extract the compiled `prose` rules from `main.css` (the compiled file already contains them in full — inspect the minified output). Copy the relevant `.rb-prose *` selectors verbatim into the new plain CSS file.
- Migration order: write plain CSS that produces identical output, verify visually, then remove Tailwind.
- Do NOT attempt to rewrite prose styles from scratch — extract the compiled output and clean it up.
- The compiled `main.css` file is the source of truth for what prose currently produces. Every `.rb-prose` rule in there must have a plain-CSS equivalent.

**Warning signs:**
- First post-migration build: all biography pages look like `<pre>` text.
- Paragraph gaps disappear.
- `<details>` accordions lose their styling.

**Phase:** Tailwind removal phase (must happen before e-book reader to avoid compound regressions).

---

### Pitfall 3: `content-visibility: auto` Breaks Swipe Page Detection

**What goes wrong:** The existing `.rb-bio-page` elements have `content-visibility: auto` and `contain-intrinsic-size: auto 800px`. This is a rendering optimization: off-screen sections are skipped during layout. In the current vertical-scroll model this is safe. In a swipe/page-per-view model where the reader needs to know the exact position of a specific page element (to slide it into view, or to restore scroll position to it), `content-visibility: auto` can report incorrect bounding boxes for off-screen pages until they are rendered. A swipe to page 200 may snap to the wrong position because the browser skipped layout for pages 100-199.

**Why it happens:** `content-visibility: auto` tells the browser it may skip layout for off-screen elements. The browser uses `contain-intrinsic-size` as a placeholder, but this is an estimate (800px per page), not the actual rendered height. For the vertical scroll model this is fine. For positional targeting (scroll-to-page, swipe-to-page), it's a source of offset errors.

**Consequences:** Navigation to a specific page via the page number input or table of contents lands on the wrong page. Scroll position restoration is off by several hundred pixels.

**Warning signs:**
- Page input `gotoPage(150)` jumps to the wrong visual position.
- Restored position after reload appears to be correct page number but wrong vertical offset.

**Prevention:**
- If sticking with the single-DOM approach (all 276 pages rendered), remove `content-visibility: auto` from `.rb-bio-page` during the e-book reader implementation phase.
- If switching to a show-one-page-at-a-time model (CSS `display: none` on inactive pages, `display: block` on active), `content-visibility` becomes irrelevant — remove it entirely.
- Do not remove it during the Tailwind migration phase (the optimization is still valid for the current vertical scroll model during transition).

**Phase:** E-book reader implementation.

---

### Pitfall 4: Scroll Position Restoration Conflicts with Swipe Navigation State

**What goes wrong:** The existing `bio-reader.js` stores `{ anchor, y, updatedAt }` in `localStorage` under `bio:last`. The `restore()` function on page load scrolls to the saved position. In the new e-book model, "position" is a page index, not a scroll coordinate. If both systems exist simultaneously during development (old scroll-restore + new swipe reader), they will fight: on load, the old restore function scrolls to a `y` coordinate; the new reader's initialization also tries to display a specific page; whichever runs last wins, and the result is a flash/jump.

**Why it happens:** Incremental migration — the old JS code is not fully replaced before the new code is added.

**Consequences:** On first load in the new reader, users see a page flash from page 1 to their last read page, then possibly back again. Reading position appears to reset randomly.

**Prevention:**
- Replace `bio-reader.js` entirely rather than extending it. The scroll-position storage schema must change from `{ anchor, y }` to `{ pageIndex }` — they are incompatible.
- When deploying the new reader, clear the old localStorage key on first load: `if (localStorage.getItem('bio:last')) { localStorage.removeItem('bio:last'); }`. Write to a new key (e.g. `bio:page`) to avoid schema conflicts with returning users who have old data.
- Do not run both restore systems in parallel even briefly.

**Warning signs:**
- Position flicker on page load (visible for 100-300ms).
- "Continue reading" button navigates to wrong page after e-book reader is introduced.

**Phase:** E-book reader implementation.

---

### Pitfall 5: Hardcoded `276` in Three Locations Causes Silent Reader Bugs

**What goes wrong:** `TOTAL = 276` is hardcoded in `bio-reader.js` line 3. The same value appears in `.eleventy.js` and `bio-page.njk`. The e-book reader needs this constant for: clamping page navigation, generating the table of contents, displaying "page X of 276", and knowing when to disable the next-page button. If any of these locations gets updated for new content but another doesn't, the reader silently allows navigation to non-existent pages or caps navigation before the last real page.

**Why it happens:** Tech debt identified in CONCERNS.md — the value was never extracted to a single configurable source.

**Consequences:** Reader allows swiping to page 277 (shows empty placeholder content). Or caps at 276 when real total is 280. The year-based table of contents generates wrong ranges.

**Prevention:**
- Fix the hardcoded count as the first task of the e-book reader phase, before implementing any navigation logic.
- Extract page count as a global data value in `.eleventy.js` (e.g. `eleventyConfig.addGlobalData('totalPages', biografiPages.length)`).
- Pass it to the client-side bundle as a `data-total-pages` attribute on the container element: `<div data-bio-pages data-total="{{ totalPages }}">`.
- Read it in JS: `const TOTAL = parseInt(document.querySelector('[data-bio-pages]').dataset.totalPages, 10)`.
- Never use a numeric literal for page count anywhere in new code.

**Warning signs:**
- Page count displayed in reader UI differs from actual last page.
- Table of contents year ranges don't cover all pages.
- Next/prev buttons behave inconsistently near page boundaries.

**Phase:** E-book reader implementation — first task.

---

## Moderate Pitfalls

---

### Pitfall 6: Tailwind `@apply` in Source CSS — Not Just Utility Classes in HTML

**What goes wrong:** The Tailwind removal audit typically focuses on scanning HTML/Nunjucks templates for utility classes like `class="flex items-center"`. This project also uses `@apply` directives inside `tailwind.css` (the source file). For example: `@apply prose prose-invert max-w-none`, `@apply my-6 p-4`, `@apply inline-flex items-center justify-center no-underline`, etc. These disappear entirely when Tailwind is removed — they produce no output without the Tailwind PostCSS pipeline.

**Prevention:**
- Audit `tailwind.css` for every `@apply` directive before removing Tailwind. Map each to explicit CSS property values.
- There are ~40 `@apply` usages in `tailwind.css`. Each must be expanded to plain CSS.
- The compiled `main.css` shows what each `@apply` expands to — use it as the reference.
- Remove `tailwind.css` from the build entirely only after `main-new.css` (plain CSS replacement) is verified to produce identical output.

**Warning signs:**
- After migration, some components appear correctly styled (the ones using explicit CSS in `tailwind.css`) while others are broken (the ones relying on `@apply`).
- Layout shifts appear only on specific components like `.rb-cta`, `.rb-btn`, `.rb-minne`, `.rb-quote`.

**Phase:** Tailwind removal.

---

### Pitfall 7: Tailwind Custom Colors (`theme('colors.light')`) Must Be Replaced With CSS Variables

**What goes wrong:** The source CSS uses `theme('colors.light')`, `theme('colors.dark')`, `theme('colors.hub')` etc. — Tailwind theme references resolved at build time. In plain CSS these become unresolved references and render as `transparent` or `inherit`. The dark color palette `#1c1d1e`, `#fdf9f0`, and `#282828` are this project's brand colors used throughout.

**Prevention:**
- At migration start, declare CSS custom properties in `:root`:
  ```css
  :root {
    --color-light: #fdf9f0;
    --color-dark: #1c1d1e;
    --color-hub: #282828;
  }
  ```
- Replace every `theme('colors.X')` reference with `var(--color-X)`.
- The compiled `main.css` shows the resolved hex values for each theme color — use those as the source of truth.

**Warning signs:**
- Backgrounds appear transparent where they should be dark.
- Text becomes invisible (white-on-white or dark-on-dark).

**Phase:** Tailwind removal.

---

### Pitfall 8: Accordion Vertical Scroll Conflict Inside Swipe Pages

**What goes wrong:** The e-book reader requires horizontal swipe for page navigation. Some biography pages contain `<details>` accordions with potentially long expanded content. When an accordion is open and the user scrolls vertically within an expanded accordion, the touch gesture may be misinterpreted as a horizontal page swipe if the swipe detection threshold is too loose. The user scrolls the accordion, the reader turns the page.

**Why it happens:** Touch gesture disambiguation between vertical scroll and horizontal swipe requires careful threshold tuning. The existing accordion content can be multiple paragraphs long when expanded.

**Prevention:**
- Implement gesture direction lock: on `touchstart`, record initial position; on first `touchmove`, determine if gesture is predominantly vertical or horizontal; lock to that direction for the remainder of the gesture.
- If determined to be vertical (scrolling), do not track horizontal movement at all for that touch sequence.
- The angle check: if `Math.abs(dy) > Math.abs(dx)` at any point in the first 10px of movement, treat as scroll and ignore horizontal.

**Warning signs:**
- Pages turn unexpectedly when user scrolls within expanded accordions.
- Horizontal test: swipe works on empty pages; fails on pages with accordions.

**Phase:** E-book reader implementation — swipe gesture implementation task.

---

### Pitfall 9: 276-Page DOM Causes Paint/INP Issues on Slow Devices

**What goes wrong:** The current biography page loads all 276 `<section>` elements into a single DOM. The existing `content-visibility: auto` optimization helps, but in the swipe reader model the browser must composite and track all 276 sections for the swipe animation (slide in/out). CSS transitions on a container with 276 children that are individually positioned require significant GPU memory. On mid-range Android devices (the majority of global mobile users), this causes noticeable jank during swipe animation.

**Why it happens:** The decision to keep all pages in a single DOM was made for the scroll model. In the scroll model, `content-visibility: auto` means only ~3-5 pages are actively rendered at any time. In the swipe model, if the transition animates the full container, all 276 pages participate in the animation.

**Prevention:**
- The swipe animation should move only the current page out and the next page in. Use a virtual/windowed approach: only 3 pages are fully rendered in the DOM at any time (previous, current, next). The rest are either removed from the DOM or left as placeholder skeletons.
- Or: use the existing single-DOM approach but animate only the viewport window (CSS `overflow: hidden` on the reader container, translate only the active and adjacent pages). This is more complex but avoids DOM manipulation on each page turn.
- Profile on actual mid-range Android (Chrome DevTools device emulation is not sufficient — use real device or WebPageTest).

**Warning signs:**
- Swipe animation is smooth on developer device (high-end Mac/iPhone) but choppy on test devices.
- Chrome DevTools shows paint time >16ms during swipe.

**Phase:** E-book reader implementation — after initial proof of concept, before performance sign-off.

---

### Pitfall 10: Scroll-Margin-Top on `.rb-bio-page` Must Be Recalculated for Reader Mode

**What goes wrong:** The current `.rb-bio-page` elements use `scroll-mt-32` (Tailwind, = 8rem = 128px). This compensates for the sticky header height (56px mobile, 98px desktop). In the swipe reader, if pages are positioned absolutely or using CSS transforms for the slide animation, `scroll-margin-top` becomes irrelevant, but the `pt-[140px]` padding on the main content area (used in the vertical scroll model) remains and creates a large blank gap at the top of each page in reader mode.

**Prevention:**
- Reader mode and scroll mode use different layout models. Once reader mode is activated, the document layout switches entirely: no scroll-margin-top, no pt-140px, pages fill the viewport.
- Use a CSS class on `<body>` (e.g. `data-reader-mode="true"`) to switch between layout modes: scroll mode uses the current layout, reader mode overrides it.
- Remove Tailwind-based scroll-margin before the reader phase so the problem is in plain CSS and is explicit.

**Phase:** E-book reader implementation.

---

## Minor Pitfalls

---

### Pitfall 11: Keyboard Navigation Conflicts with Browser Shortcuts

**What goes wrong:** Implementing Left/Right arrow keys for page navigation conflicts with normal browser behavior: Left/Right arrows scroll the page horizontally when a horizontally scrollable element is focused, or move the cursor inside form inputs. If the page number input is focused and the user presses arrow keys to navigate pages, the input's value changes instead.

**Prevention:**
- Only handle arrow keys when no form element is focused: `if (document.activeElement.tagName === 'INPUT') return;`
- Also guard against `<select>`, `<textarea>`, `<summary>` (accordion toggle via keyboard).

**Phase:** E-book reader implementation.

---

### Pitfall 12: History API Pollution from URL Hash Updates

**What goes wrong:** The existing `bio-reader.js` calls `history.replaceState(null, '', '#p-001')` on every scroll event (throttled). In the swipe reader, each page turn that updates the URL hash via `history.pushState` creates a new history entry. Rapid swiping through 10 pages creates 10 history entries. Pressing browser back navigates through all 10 instead of leaving the biography page.

**Prevention:**
- Use `history.replaceState` (not `pushState`) for page-turn URL updates. The reader is a single-page experience; the history stack should not grow with each page turn.
- Only push a new history entry when the user explicitly shares a link or navigates via the table of contents (those are intentional destinations).

**Phase:** E-book reader implementation.

---

### Pitfall 13: Tailwind Base Reset Removal Breaks Form Element Defaults

**What goes wrong:** Tailwind's preflight (base reset) removes default browser styles from buttons, inputs, and selects: removes border, sets `background: transparent`, sets `font-family: inherit`, etc. The biography's existing UI elements (page number input `.rb-page-input`, nav buttons `.rb-btn`, page input `.rb-input`) rely on preflight having zeroed these defaults. When Tailwind is removed, native browser defaults re-apply: inputs get a grey border and system font, buttons get a raised 3D appearance, form elements look broken.

**Prevention:**
- Include a minimal CSS reset as part of the plain CSS replacement. The reset does NOT need to be as comprehensive as Tailwind preflight — extract only the rules that affect elements actually used in the project:
  - `*, *::before, *::after { box-sizing: border-box; }`
  - `button { background: transparent; border: 0; cursor: pointer; font: inherit; }`
  - `input { font: inherit; }`
  - `img, video { max-width: 100%; height: auto; display: block; }`
- Do not copy the full Tailwind preflight — it's 200+ lines and most of it is irrelevant for this project.

**Phase:** Tailwind removal — first task (reset before components).

---

### Pitfall 14: `prefers-reduced-motion` Not Honoured in Swipe Animations

**What goes wrong:** Swipe page transitions typically use CSS transforms with transitions (e.g. `transform: translateX(-100%)` over 300ms). For users with vestibular disorders who have set `prefers-reduced-motion: reduce`, animated page transitions can cause physical discomfort. The existing site has no motion accommodation.

**Prevention:**
- Wrap all page-transition CSS animations in a media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .reader-page { transition: none; }
  }
  ```
- For reduced motion, use an instant cut (opacity fade is acceptable as it has no spatial component).

**Phase:** E-book reader implementation — can be added at polish stage, but must not be forgotten before production.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Tailwind removal start | Form element defaults break (preflight) | Write CSS reset first, verify buttons/inputs before removing Tailwind |
| Tailwind removal — typography | `.rb-prose` collapses without prose plugin styles | Extract compiled prose rules before removing; do not rewrite from scratch |
| Tailwind removal — `@apply` | ~40 `@apply` usages produce no output without pipeline | Audit all `@apply` in `tailwind.css`, expand to explicit properties |
| Tailwind removal — colors | `theme('colors.X')` resolves to nothing | Declare CSS custom properties at migration start |
| E-book reader — swipe | iOS Safari edge-swipe triggers browser back | Use `touch-action: pan-y` + angle check; listener on inner container only |
| E-book reader — swipe + accordion | Vertical scroll inside accordion fires page turn | Implement direction lock on first 10px of gesture |
| E-book reader — init | Old localStorage schema conflicts with new page index | Use new key `bio:page`, clear old `bio:last` on first load |
| E-book reader — page count | `TOTAL = 276` hardcoded in JS | Fix first, before any navigation logic; use `data-total-pages` attribute |
| E-book reader — performance | Animating 276 DOM nodes causes jank | Window to 3 pages in DOM, or animate only viewport position |
| E-book reader — URL | `history.pushState` on every page turn pollutes back stack | Use `replaceState` throughout |
| E-book reader — keyboard | Arrow keys conflict with form inputs | Guard against focused input elements |
| E-book reader — accessibility | Swipe animation causes motion sickness | Honour `prefers-reduced-motion` with instant cut |

---

## Sources

- Direct analysis of `/assets/js/bio-reader.js` (lines 1-141)
- Direct analysis of `/assets/css/tailwind.css` (source with `@apply` directives)
- Direct analysis of `/assets/css/main.css` (compiled Tailwind output — shows what prose rules expand to)
- Direct analysis of `/layouts/biography.njk`, `/includes/bio-page.njk`, `/includes/bio-controls.njk`
- `.planning/codebase/CONCERNS.md` — identified fragile areas and tech debt
- `.planning/PROJECT.md` — scope constraints and decisions
- Confidence: HIGH — all pitfalls grounded in actual code, not generic advice
