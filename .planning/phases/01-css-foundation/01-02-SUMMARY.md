---
phase: 01-css-foundation
plan: 02
subsystem: ui
tags: [plain-css, tailwind-removal, template-cleanup, semantic-classes, rb-prefix]

# Dependency graph
requires:
  - phase: 01-01
    provides: Complete assets/css/main.css with all rb-* semantic class definitions
provides:
  - All .njk templates using semantic rb-* class names (no Tailwind utilities)
  - .eleventy.js renderBio function using rb-yt-embed, rb-more-block, rb-prose
  - Tailwind, PostCSS, autoprefixer removed from package.json and node_modules
  - tailwind.config.cjs, postcss.config.cjs, assets/css/tailwind.css deleted
  - npm scripts simplified to "dev" and "build" (both using eleventy directly)
  - Zero-build-dependency site: only npx @11ty/eleventy needed to build
affects:
  - 01-03 (visual parity checkpoint — human verification pending)
  - Phase 2 (reader/navigation features build on this zero-dependency foundation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zero build pipeline — no CSS compilation step, main.css is served directly
    - All templates use rb- prefixed semantic class names (no utility class strings)
    - Single eleventy command builds entire site

key-files:
  created: []
  modified:
    - layouts/base.njk
    - layouts/biography.njk
    - layouts/home.njk
    - layouts/appendix.njk
    - layouts/minnen.njk
    - layouts/memory.njk
    - includes/header.njk
    - includes/bio-controls.njk
    - includes/bio-page.njk
    - includes/hub-grid.njk
    - includes/footer.njk
    - .eleventy.js
    - package.json
    - package-lock.json

key-decisions:
  - "All Tailwind utility class strings replaced with semantic rb-* class names — templates now act as pure structure with no embedded styling logic"
  - "npm-run-all removed alongside Tailwind — parallel CSS+Eleventy build replaced by single eleventy command"
  - "Package.json scripts simplified to two commands: dev and build (both eleventy-only)"

patterns-established:
  - "Template class attributes contain only semantic names (rb-body, rb-header-outer, etc.) — never Tailwind utilities"
  - "eleventy is the sole build tool — no CSS preprocessor, no bundler"

requirements-completed: [CSS-01, CSS-04]

# Metrics
duration: 10min
completed: 2026-03-04
---

# Phase 1 Plan 02: Template Cleanup and Tailwind Removal Summary

**All Tailwind utility classes replaced with semantic rb-* names across 11 templates and .eleventy.js, then Tailwind/PostCSS/autoprefixer removed from package.json — site builds with a single `eleventy` command and no CSS pipeline**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-04T15:27:00Z
- **Completed:** 2026-03-04T15:50:00Z
- **Tasks:** 2 automated (+ 1 human-verify checkpoint pending)
- **Files modified:** 14

## Accomplishments
- Replaced all Tailwind utility class strings with semantic rb-* names across all 11 .njk template files and .eleventy.js renderBio function
- Removed tailwindcss, @tailwindcss/typography, postcss, autoprefixer, and npm-run-all from package.json and node_modules
- Deleted tailwind.config.cjs, postcss.config.cjs, and assets/css/tailwind.css
- Simplified npm scripts from 5 (parallel dev:11ty+dev:css, build:11ty+build:css) to 2 (dev, build)
- Eleventy build continues to succeed: 560 files written in ~6.7 seconds

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace all Tailwind utility classes with semantic rb-* class names** - `2e6d82e` (feat)
2. **Task 2: Remove Tailwind infrastructure from package.json and delete config files** - `4744a70` (chore)

**Plan metadata:** (pending — created after human-verify checkpoint)

## Files Created/Modified
- `layouts/base.njk` - rb-body, rb-main, rb-main-centered, rb-main-inner, rb-mt-auto
- `layouts/biography.njk` - bodyClass cleared, mainClass→rb-main-full, rb-bio-container
- `layouts/home.njk` - rb-cta-wrap
- `layouts/appendix.njk` - rb-page-title-wrap, rb-page-h1, rb-page-desc, rb-page-content
- `layouts/minnen.njk` - same pattern as appendix.njk
- `layouts/memory.njk` - rb-memory-section, rb-memory-header, rb-memory-title, rb-memory-period, rb-memory-teaser, rb-memory-content rb-prose
- `includes/header.njk` - rb-header-outer, rb-header-inner, rb-header-nav, rb-nav-toggle-wrap, rb-nav-backdrop, rb-nav-content, rb-nav-list
- `includes/bio-controls.njk` - rb-controls-outer, rb-controls-inner, rb-controls-group
- `includes/bio-page.njk` - rb-page-meta-text, rb-page-placeholder, rb-prose
- `includes/hub-grid.njk` - rb-hub-grid
- `includes/footer.njk` - rb-footer, rb-footer-inner
- `.eleventy.js` - rb-yt-embed, rb-yt-embed-ratio, rb-prose, rb-section rb-prose, rb-more-block, rb-more-summary, rb-more-content; divider image inline style
- `package.json` - scripts simplified, devDependencies cleaned
- `package-lock.json` - reflects removed packages

## Decisions Made
- **Templates only carry semantic names:** Every class attribute in .njk files and .eleventy.js now contains only rb-* names. No utility classes remain. This makes the HTML read as structure + semantics, not layout instructions.
- **npm-run-all removed with Tailwind:** The parallel build runner was only needed for CSS compilation. Since main.css is hand-written and needs no build step, the parallel runner adds no value and was removed along with the Tailwind packages.

## Deviations from Plan

None — Task 1 (template replacements) was already committed prior to this session (`2e6d82e`). Task 2 executed as specified. All class substitutions match the interface mapping in the plan exactly.

## Issues Encountered
- Task 1 was already completed and committed before this session began. Verified by checking git log and grep for remaining Tailwind utility classes (zero found). Proceeded directly to Task 2.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All templates use semantic rb-* class names — visual rendering depends entirely on assets/css/main.css
- Eleventy is the sole build tool — `npm run build` or `npx @11ty/eleventy` builds the site
- Human visual verification checkpoint pending before phase sign-off
- Phase 2 (reader/navigation features) can begin after checkpoint approval

---
*Phase: 01-css-foundation*
*Completed: 2026-03-04*
