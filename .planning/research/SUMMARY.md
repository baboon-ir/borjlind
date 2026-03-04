# Project Research Summary

**Project:** Rolf Börjlind Digital Biografi — E-book Reader Milestone
**Domain:** Swipe-based e-book reader on Eleventy static site with Tailwind-to-plain-CSS migration
**Researched:** 2026-03-04
**Confidence:** HIGH (all research grounded in direct codebase inspection + established Web Platform APIs)

## Executive Summary

This project transforms an existing Eleventy-based digital biography from a continuous vertical-scroll experience into a paged e-book reader with swipe navigation. The existing site already has 276 markdown pages, a compiled Nunjucks template system, and a `bio-reader.js` scroll tracker — the work is replacing the reading model, not rebuilding from scratch. Expert consensus for this type of project is clear: keep all pages in a single HTML document and use JS-controlled CSS visibility toggling rather than scroll-snap or 276 separate HTML files. This approach requires no SPA router, no network requests between pages, and supports instant swipe transitions.

The recommended approach has two sequential phases with a hard dependency between them. Phase 1 must be Tailwind CSS removal and replacement with hand-written plain CSS. This is not optional sequencing — Tailwind's PostCSS pipeline and JIT class scanning conflict with dynamically toggled CSS classes (`is-active`, `display:none`) that are not present at build-scan time. Plain CSS also removes all build tooling overhead, leaving a simpler `eleventy --serve` pipeline. Phase 2 is the e-book reader implementation: rewriting `bio-reader.js` as a page-state controller, replacing scroll position persistence with page-index persistence, and adding swipe/keyboard/TOC navigation.

The key risk is compounded regressions from attempting both phases simultaneously. Tailwind's `@apply prose` macro expands to ~300 lines of typography rules that will silently collapse when Tailwind is removed — this must be extracted before removal. On the reader side, iOS Safari's edge-swipe reservation for browser navigation is the highest-severity implementation risk. Both risks have clear, documented prevention strategies and must be addressed in phase order.

---

## Key Findings

### Recommended Stack

The existing stack (Eleventy 2.0.1, Nunjucks, markdown-it) stays unchanged. The build pipeline simplifies dramatically: Tailwind CSS, PostCSS, autoprefixer, and `@tailwindcss/typography` are all removed. The replacement is a single hand-written `assets/css/main.css` using CSS Custom Properties for design tokens. After removal, `devDependencies` drops to zero; only five runtime npm packages remain. No new packages are installed for the e-book reader — all required browser APIs (Pointer Events, localStorage, History API, requestAnimationFrame) are native.

**Core technologies:**
- Eleventy 2.0.1: SSG and build system — keep unchanged, no migration cost
- Plain CSS with Custom Properties: styling — replaces Tailwind entirely, no build step required
- Pointer Events API (Level 2): swipe/drag detection — use this instead of Touch Events; unifies mouse, touch, and stylus in one model; correct 2025 approach
- localStorage (Web Storage Level 2): reading position persistence — already in use, adapt schema from scroll-position to page-index
- History API `replaceState`: URL hash sync — already in use, keep for bookmarkable page URLs

**What to remove:** `tailwindcss`, `@tailwindcss/typography`, `postcss`, `autoprefixer`. Updated build script becomes `eleventy --serve` only.

**Browser targets:** Chrome/Edge 105+, Firefox 110+, Safari iOS/macOS 15.4+. Use `100dvh` (not `100vh`) for reader height — critical for mobile Safari.

### Expected Features

The 276-page corpus and biography-reader context define a clear feature priority. Core paging mechanics are table stakes; wayfinding tools (TOC, year indicators) are required at this scale; polish features (transitions, onboarding) are deferrable.

**Must have (table stakes):**
- One-page-at-a-time display — the entire value proposition of e-book mode
- Button navigation (previous/next) — universal desktop expectation
- Keyboard navigation (arrow keys) — accessibility baseline, ~10 lines of code
- Current page indicator ("Page X of 276") — essential orientation
- Reading position memory — adapt existing localStorage for page index instead of scroll position
- Table of contents with year-period navigation — required for 276-page corpus; without it the reader has no wayfinding
- Current year/section indicator — connects TOC to active reading position
- Swipe navigation (touch) — primary interaction on mobile

**Should have (differentiators):**
- Smart media pages — images/video get dedicated full-page slots; build-time decision, no runtime cost
- Accordion vertical overflow — expandable content stays on its page, page grows vertically
- Smooth page transition animation — CSS fade/slide; do not use JS animation libraries
- Direct URL per page — hash-based, already partially implemented
- First-visit onboarding hint — one-time tooltip explaining swipe; critical for older non-tech-savvy readers

**Defer (v2+):**
- TOC with per-section reading progress — high complexity; requires page-to-section mapping and visit tracking
- Font size / typeface customization — anti-feature; adds UI complexity, breaks designed aesthetic
- Day/night theme toggle — anti-feature; dark theme is intentional design, not a preference

### Architecture Approach

The architecture is a single HTML document with JS-controlled CSS visibility. All 276 page sections are rendered into the DOM at build time. The active page is shown with `.is-active { display: block }`; all others have `display: none`. This collapses inactive pages to zero height (no 276-screen-height document), enables instant transitions without network requests, and keeps swipe gesture handling trivial (direct DOM manipulation). The `bio-reader.js` scroll tracker is replaced entirely with a page-state controller — there is no incremental migration path between the two models.

Year chapter data (TOC structure) is embedded as a JSON literal in the built HTML via a Nunjucks global data dump into a `<script>` tag. No runtime fetches. The TOC is built at build time from frontmatter `yearGroup` fields on markdown pages.

**Major components:**
1. `bio-reader.js` (full rewrite) — single source of truth for current page; show/hide sections; handle swipe, keyboard, URL hash, localStorage, TOC sync
2. `bio-toc.njk` (new) — year-period chapter list rendered at build time as hidden drawer; each entry is a button with target page number
3. `bio-controls.njk` (rewrite) — prev/next buttons, page number input, TOC trigger, year label display
4. `bio-page.njk` (update) — add `data-year-group` attribute; remove hardcoded `/276` text
5. `biography.njk` (update) — wire `YEAR_CHAPTERS` JSON injection; include new components

**Critical path for implementation:** Frontmatter `yearGroup` data → Eleventy global `yearChapters` data → CSS foundation → Templates → JS rewrite.

### Critical Pitfalls

1. **iOS Safari edge-swipe conflicts with browser back/forward** — Apply swipe detection on an inner container element only (not `document`/`window`). Require minimum 40px horizontal displacement AND angle check (`Math.abs(dx) > Math.abs(dy) * 1.5`). Set `touch-action: pan-y` on swipe container via CSS. Never use Pointer Events or Touch Events on `document` level for horizontal gestures.

2. **Tailwind `@apply prose` collapse removes all biography typography** — Before removing any Tailwind, extract the compiled prose rules from `main.css` (the compiled file contains them in full). Copy `.rb-prose *` selectors verbatim into the new CSS file. Migration order: write plain CSS that produces identical output, verify visually, then remove Tailwind. Do not rewrite prose styles from scratch.

3. **Old localStorage schema conflicts with new page-index schema** — Replace `bio-reader.js` entirely rather than extending it. Use a new key (`bio:page`) instead of the old `bio:last` key. Clear the old key on first load to avoid returning users seeing position conflicts.

4. **Hardcoded `TOTAL = 276` in three locations causes silent navigation bugs** — Fix this as the very first task of the reader implementation phase. Extract page count as Eleventy global data, pass to client-side as `data-total-pages` attribute. Never use a numeric literal for page count in new code.

5. **`content-visibility: auto` on `.rb-bio-page` reports incorrect bounding boxes in reader mode** — Remove `content-visibility: auto` from `.rb-bio-page` during reader implementation. In the single-page-visible model, it provides no benefit and causes position errors for TOC jump navigation.

---

## Implications for Roadmap

Based on the combined research, the implementation has a strict two-phase dependency. These cannot be reversed or merged.

### Phase 1: Tailwind CSS Removal and Plain CSS Foundation

**Rationale:** The Tailwind PostCSS pipeline must be removed before implementing the reader. JIT class scanning does not detect dynamically toggled classes (`is-active`). The CSS build step runs in parallel with Eleventy during dev — removing it first simplifies the dev environment before adding new complexity. Any visual regressions from Tailwind removal are easier to debug when there are no concurrent reader changes.

**Delivers:** A fully functional biography site visually identical to today, with zero Tailwind dependency, a human-readable CSS file, and a simplified build pipeline (`eleventy --serve` only).

**Addresses:** Foundation for all reader styling (`.rb-reader-page.is-active`, page transition classes).

**Avoids:**
- Tailwind `@apply prose` collapse (Pitfall 2) — extract before removing
- `@apply` directives expanding to nothing (Pitfall 6) — audit ~40 usages first
- `theme('colors.X')` resolving to transparent (Pitfall 7) — declare CSS custom properties first
- Form element defaults breaking (Pitfall 13) — write CSS reset as the first task of this phase

**Implementation order within this phase:**
1. Declare CSS custom properties (colors, spacing) in `:root`
2. Write minimal CSS reset (box-sizing, button, input, img)
3. Extract and verify compiled `.rb-prose` rules
4. Write complete plain CSS component by component
5. Strip Tailwind classes from Nunjucks templates simultaneously
6. Remove Tailwind, PostCSS, autoprefixer from package.json
7. Simplify build scripts

**Research flag:** Standard patterns — skip `/gsd:research-phase`. The Tailwind removal process is fully documented in STACK.md and PITFALLS.md.

---

### Phase 2: E-book Reader Implementation

**Rationale:** Depends entirely on Phase 1 being complete. Reader implementation adds new CSS classes (`.is-active`, page transition rules) that must live in the plain CSS file, not Tailwind. The `bio-reader.js` rewrite replaces the scroll model — it cannot coexist with the old system even temporarily (Pitfall 4).

**Delivers:** Full swipe-based e-book reader with: one-page-at-a-time display, button/keyboard/swipe navigation, localStorage page persistence, URL hash per page, year-structured TOC, current year indicator, smooth page transitions, first-visit onboarding hint.

**Uses:** Pointer Events API, localStorage, History API `replaceState`, CSS transitions + rAF class toggling, `100dvh` units.

**Implements:** All major components — `bio-reader.js` (full rewrite), `bio-toc.njk` (new), `bio-controls.njk` (rewrite), `bio-page.njk` (update), `biography.njk` (update), Eleventy `yearChapters` global data.

**Avoids:**
- iOS Safari swipe conflict (Pitfall 1) — inner container target + `touch-action: pan-y` + angle check
- `content-visibility: auto` position errors (Pitfall 3) — remove from `.rb-bio-page`
- localStorage schema conflict (Pitfall 4) — new key `bio:page`, clear old `bio:last` on init
- Hardcoded page count (Pitfall 5) — fix first before any navigation logic
- Accordion swipe conflict (Pitfall 8) — gesture direction lock in first 10px
- History stack pollution (Pitfall 12) — use `replaceState` throughout
- Arrow key conflict with form inputs (Pitfall 11) — guard `document.activeElement`
- Missing `prefers-reduced-motion` (Pitfall 14) — add before production

**Implementation order within this phase:**
1. Frontmatter: add `yearGroup` to markdown pages (or data file)
2. Eleventy: build `yearChapters` global data, expose `totalPages`
3. Fix hardcoded `TOTAL = 276` — use `data-total-pages` attribute
4. `bio-page.njk`: add `data-year-group`, `data-page`, remove hardcoded `/276`
5. `bio-toc.njk`: build-time rendered chapter list
6. `bio-controls.njk`: prev/next buttons, page input, TOC trigger, year label
7. `biography.njk`: inject `YEAR_CHAPTERS` JSON, wire new components
8. `bio-reader.js`: full rewrite — page state controller
9. CSS: add page transition rules, reader layout (override scroll-model layout)
10. Swipe: Pointer Events handler with angle check and direction lock
11. Keyboard: arrow key listener with form input guard
12. `prefers-reduced-motion`: motion-safe media query on transitions
13. Onboarding: first-visit hint (localStorage flag)

**Research flag:** Swipe gesture implementation needs careful device testing — specifically on mid-range Android (performance, Pitfall 9) and iOS Safari (edge-swipe conflict, Pitfall 1). Standard patterns otherwise.

---

### Phase Ordering Rationale

- CSS must precede JS because Tailwind JIT class scanning conflicts with dynamically toggled classes in reader mode. There is no safe way to develop both simultaneously.
- The `yearChapters` global data must be built before any template or JS work that depends on it — it is the foundation for TOC rendering and year-group attribution.
- The hardcoded page count fix must be the literal first task of Phase 2 before any navigation logic is written — otherwise every navigation feature will be built on a fragile literal that is known to be wrong.
- Accordion, keyboard, and motion-preference handling can all be added after the core page-turn mechanic is proven — they are independent features with no blocking dependencies.

### Research Flags

Phases needing deeper research during planning:
- **Phase 2, swipe implementation:** Real-device testing on Android mid-range and iOS Safari edge zones required before sign-off. Chrome DevTools emulation is documented as insufficient (Pitfall 9).

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1 (Tailwind removal):** Fully mapped. Gotchas, migration order, and verification steps are all documented in STACK.md and PITFALLS.md.
- **Phase 2, all non-swipe features:** Keyboard navigation, localStorage, History API, CSS transitions — all use established Web Platform patterns with no novel complexity.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase inspection of package.json, compiled CSS, and Nunjucks templates. Browser API targets verified against MDN compatibility tables. |
| Features | MEDIUM | Domain knowledge from Kindle Web, Apple Books, Epub.js patterns. No live web search — established conventions unlikely to have changed. |
| Architecture | HIGH | Based on direct inspection of all relevant source files. Single-DOM approach validated against the specific constraints of this codebase (accordions, variable page heights, existing collection system). |
| Pitfalls | HIGH | All pitfalls grounded in actual code analysis, not generic advice. iOS Safari swipe conflict and Tailwind prose collapse are documented browser behaviors, not hypotheses. |

**Overall confidence:** HIGH

### Gaps to Address

- **Swipe threshold (60px) needs device validation:** The 60px minimum displacement for swipe detection is a starting point from mobile UX guidelines, not a verified value for this specific project. Tune during Phase 2 implementation with real device testing.
- **`yearGroup` frontmatter scope:** The research confirms no `yearGroup` field currently exists in any page frontmatter. The exact set of pages that need this field (and the year-period boundaries) must be confirmed against the actual content before implementing the TOC. This is a content decision, not a technical one.
- **276-page DOM performance on mid-range Android:** The single-DOM approach is correct architecturally, but Pitfall 9 identifies a potential jank issue on slower devices during swipe animation. If profiling reveals this is a real problem, the windowed approach (3 pages in DOM at a time) is the documented mitigation — but this is only needed if performance is measured as insufficient.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `assets/js/bio-reader.js`, `assets/css/main.css`, `assets/css/tailwind.css`, `layouts/biography.njk`, `includes/bio-page.njk`, `includes/bio-controls.njk`, `package.json`, `.eleventy.js`
- `.planning/codebase/CONCERNS.md` — identified fragile areas and tech debt
- `.planning/PROJECT.md` — scope constraints and decisions
- MDN Web Docs: Pointer Events, `touch-action`, `dvh` viewport units
- W3C Pointer Events Level 2 specification

### Secondary (MEDIUM confidence)
- Domain knowledge: Kindle Web reader, Apple Books, Epub.js feature set — well-established e-reader UX conventions
- Nielsen Norman Group long-form reading patterns — swipe threshold and reading UX guidance

### Tertiary (LOW confidence — validate during execution)
- 60px swipe threshold: community mobile UX guideline, not project-specific measurement
- Mid-range Android jank threshold: extrapolated from DOM size; needs real-device profiling

---

*Research completed: 2026-03-04*
*Ready for roadmap: yes*
