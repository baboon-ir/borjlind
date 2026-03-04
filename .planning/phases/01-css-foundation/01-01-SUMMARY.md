---
phase: 01-css-foundation
plan: 01
subsystem: ui
tags: [plain-css, css-custom-properties, design-tokens, tailwind-removal, typography]

# Dependency graph
requires: []
provides:
  - Complete hand-written assets/css/main.css with 25 sections and all component rules
  - CSS custom properties for 3 brand colors (--color-dark, --color-hub, --color-light)
  - CSS custom properties for 3 font stacks (--font-serif, --font-sans, --font-mono)
  - Minimal reset replacing Tailwind preflight
  - Prose typography rules (prose-invert variant, extracted from compiled Tailwind output)
  - All @apply directives from tailwind.css expanded to explicit CSS declarations
  - Semantic layout classes for Plan 02 template cleanup (rb-body, rb-main, rb-header-outer, rb-footer, etc.)
  - Semantic classes for renderBio function (rb-yt-embed, rb-more-block)
affects:
  - 01-02 (template cleanup uses new semantic class names)
  - 01-03 (Tailwind removal relies on main.css being complete)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS custom properties as design tokens in :root (--color-*, --font-*)
    - Semantic component class naming with rb- prefix
    - Plain CSS with no build pipeline dependency

key-files:
  created:
    - assets/css/main.css
  modified:
    - .eleventy.js

key-decisions:
  - "CSS custom properties declared in :root as single source of truth for brand colors and font stacks"
  - "Prose typography rules derived from compiled Tailwind output to preserve visual parity"
  - "New semantic layout classes (rb-body, rb-main, etc.) added to CSS now so templates can migrate in Plan 02"
  - "Add .planning/** to eleventyConfig.ignores to prevent Eleventy parsing planning markdown as site templates"

patterns-established:
  - "rb- prefix for all project component classes"
  - "CSS custom property references: var(--color-X) instead of hardcoded hex values"
  - "Single-file CSS: all rules in assets/css/main.css, no @import, no build step"

requirements-completed: [CSS-02, CSS-03]

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 1 Plan 01: CSS Foundation Summary

**650-line hand-written plain CSS file replacing Tailwind compiled output — all 44 @apply directives expanded, all theme() calls replaced with CSS custom properties, 25 sections covering every component and layout pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T15:21:43Z
- **Completed:** 2026-03-04T15:26:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Wrote complete plain CSS file in 25 sections: custom properties, minimal reset, hub background, navigation, hero, CTA and cards, biography title block, biography controls, biography page, prose typography (prose-invert), content components, markdown containers, YouTube embed, MORE accordion, appendix layout, and 9 semantic layout class sections
- Expanded all 44 `@apply` directives and replaced all 8 `theme()` calls with CSS custom property references (`var(--color-X)`)
- Prose typography block (~30+ rules) derived from compiled Tailwind output to preserve visual parity without `@apply prose prose-invert`
- Added semantic layout classes for Plan 02 template cleanup: `rb-body`, `rb-main`, `rb-main-inner`, `rb-header-outer`, `rb-header-inner`, `rb-header-nav`, `rb-footer`, `rb-footer-inner`, `rb-controls-outer`, `rb-controls-inner`, `rb-bio-container`, `rb-page-title-wrap`, `rb-memory-section`, and more
- Added semantic classes for `.eleventy.js` renderBio function: `rb-yt-embed`, `rb-yt-embed-ratio`, `rb-more-block`, `rb-more-summary`, `rb-more-content`
- Eleventy build succeeds: 560 files written

## Task Commits

Each task was committed atomically:

1. **Task 1: Write assets/css/main.css** - `b496b0e` (feat)

**Plan metadata:** (created next)

## Files Created/Modified
- `assets/css/main.css` - Complete hand-written plain CSS file replacing Tailwind compiled output (650+ lines, 25 sections)
- `.eleventy.js` - Added `.planning/**` to eleventyConfig.ignores to prevent Eleventy from parsing planning files as site templates

## Decisions Made
- **CSS custom properties as design tokens:** Declared `--color-dark`, `--color-hub`, `--color-light` and `--font-serif`, `--font-sans`, `--font-mono` in `:root` as the single source of truth. All component rules reference these variables rather than hardcoded hex values.
- **Prose rules derived from compiled output:** The `@apply prose prose-invert max-w-none` macro expands to ~400 lines. Rather than hand-rolling all rules, the essential prose-invert rules were extracted from the compiled Tailwind output and the project-specific overrides kept verbatim. This ensures visual parity.
- **Semantic layout classes added now:** Sections 17-24 add semantic classes (`rb-body`, `rb-header-outer`, etc.) that are not yet used by templates. These are added in Plan 01 so Plan 02 can migrate templates to use them without needing a CSS change.
- **`.planning/**` added to eleventyConfig.ignores:** The `.planning/` directory was not in Eleventy's ignore list. Planning files contain Nunjucks-like syntax (`%}`) that caused template parse failures. Fixed inline as a Rule 3 blocking issue.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added .planning/** to eleventyConfig.ignores**
- **Found during:** Task 1 (build verification)
- **Issue:** Eleventy tried to render `.planning/codebase/ARCHITECTURE.md` as a Nunjucks template. The file contains `%}` syntax in a code block which caused a parse error: "unexpected token: %}". The `.planning/` directory was not in the ignore list.
- **Fix:** Added `eleventyConfig.ignores.add(".planning/**");` to `.eleventy.js`
- **Files modified:** `.eleventy.js`
- **Verification:** `npx @11ty/eleventy` succeeds: "Wrote 560 files in 5.33 seconds"
- **Committed in:** `b496b0e` (part of Task 1 commit)

**2. [Rule 3 - Blocking] Installed missing npm dependencies (npm install)**
- **Found during:** Task 1 (initial build attempt)
- **Issue:** `eleventy-plugin-embed-everything` was in `package.json` dependencies but not installed (no `node_modules/`). This caused Eleventy to fail with "Cannot find module 'eleventy-plugin-embed-everything'".
- **Fix:** Ran `npm install` to install all dependencies
- **Files modified:** `node_modules/` (not committed — gitignored)
- **Verification:** Eleventy import succeeded after install
- **Committed in:** n/a (node_modules not committed)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were necessary for the build to succeed. No scope creep — `.eleventy.js` change adds a single line to the existing ignores block.

## Issues Encountered
- The plan description stated `main.css` was empty (0 bytes), but at execution time it contained 31529 bytes of compiled Tailwind output. This was the compiled ground-truth file, which was overwritten as planned. No impact.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `assets/css/main.css` is complete and contains all component rules in plain CSS
- Semantic layout classes are defined and ready for Plan 02 to apply to templates
- The site builds successfully with Eleventy (560 files)
- Plan 02 can now remove Tailwind utility classes from all `.njk` templates and update `.eleventy.js` renderBio function to use `rb-yt-embed` and `rb-more-block`

---
*Phase: 01-css-foundation*
*Completed: 2026-03-04*

## Self-Check: PASSED

- `assets/css/main.css`: FOUND
- Commit `b496b0e`: FOUND
- 0 `@apply`/`@tailwind`/`theme()` directives: CONFIRMED
- 42 lines with CSS custom property references: CONFIRMED
- All 8 key selectors present: CONFIRMED
- Eleventy build: 560 files written without error
