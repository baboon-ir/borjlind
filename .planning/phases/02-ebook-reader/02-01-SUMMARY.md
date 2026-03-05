---
phase: 02-ebook-reader
plan: "01"
subsystem: infra
tags: [eleventy, node, validation, build-scripts]

requires: []
provides:
  - "TOTAL_PAGES = 276 constant in .eleventy.js as single source of truth"
  - "addGlobalData('TOTAL_PAGES') available in all Nunjucks templates"
  - "addFilter('json') for safe inline script serialization"
  - "scripts/validate-build.js: post-build HTML assertions for READER-06, NAV-02, READER-01 (--strict)"
  - "scripts/check-frontmatter.js: yearGroup frontmatter counter for biography pages"
affects:
  - 02-02-frontmatter
  - 02-03-toc-data
  - 02-04-reader-js
  - 02-05-templates

tech-stack:
  added: []
  patterns:
    - "Single constant TOTAL_PAGES in .eleventy.js drives all loop bounds and template data"
    - "addGlobalData('TOTAL_PAGES') pattern for sharing build constants with Nunjucks templates"
    - "Validation scripts use only Node.js built-ins (fs, path) — no test framework dependency"

key-files:
  created:
    - scripts/validate-build.js
  modified:
    - .eleventy.js

key-decisions:
  - "Keep existing check-frontmatter.js as-is — it was already present and more capable than the plan spec (lists missing files, exits 1 on any missing yearGroup)"
  - "TOTAL_PAGES constant placed after pad3 declaration at module level (not inside module.exports) so it is available to all collection lambdas"

patterns-established:
  - "TOTAL_PAGES pattern: single constant used in all loops and exposed via addGlobalData — zero hardcoded 276 values in .eleventy.js"
  - "Validation scripts: non-strict mode reports FAILs but does not block Wave 1; --strict flag enables full assertions after Wave 2"

requirements-completed:
  - TECH-01

duration: 16min
completed: 2026-03-05
---

# Phase 2 Plan 01: TECH-01 Foundation Summary

**TOTAL_PAGES=276 extracted to single constant in .eleventy.js with addGlobalData for templates, plus post-build validation scripts for Wave 0 verification**

## Performance

- **Duration:** 16 min
- **Started:** 2026-03-05T15:32:17Z
- **Completed:** 2026-03-05T15:48:10Z
- **Tasks:** 2
- **Files modified:** 2 (1 modified, 1 created)

## Accomplishments

- Extracted hardcoded `276` loop bounds in `.eleventy.js` to `const TOTAL_PAGES = 276` — zero `<= 276` occurrences remain
- Registered `addGlobalData("TOTAL_PAGES", TOTAL_PAGES)` so all Nunjucks templates have access via `{{ TOTAL_PAGES }}`
- Registered `addFilter("json", ...)` for safe inline script serialization (needed by plan 02-05)
- Created `scripts/validate-build.js` with assertions for READER-06, NAV-02, and READER-01 (--strict)
- Confirmed `scripts/check-frontmatter.js` already present and passing (276/276 yearGroup files)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract TOTAL_PAGES constant in .eleventy.js** - `4638f1a` (feat)
2. **Task 2: Create Wave 0 validation scripts** - `540cb4c` (feat)

**Plan metadata:** _(pending)_

## Files Created/Modified

- `.eleventy.js` - Added `const TOTAL_PAGES = 276`, replaced two `<= 276` loop bounds, registered `addGlobalData("TOTAL_PAGES")` and `addFilter("json")`
- `scripts/validate-build.js` - Post-build HTML assertions for READER-06 (data-page-indicator), NAV-02 (rb-year-groups script tag), READER-01 (is-active count, --strict only)

## Decisions Made

- Kept existing `scripts/check-frontmatter.js` unchanged — already present and more capable than the plan spec (lists missing files by name, exits 1 when any yearGroup is absent). All 276 biography page files already had yearGroup frontmatter.
- Placed `const TOTAL_PAGES` after the `pad3` declaration at module level (not inside `module.exports`) to ensure it is available to all collection lambdas.

## Deviations from Plan

None — plan executed exactly as written, with the minor note that `check-frontmatter.js` was already present and superior to the plan's spec version. No replacement was needed.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- TECH-01 prerequisite satisfied: all Wave 2 plans can reference `{{ TOTAL_PAGES }}` in templates and `data-total` attribute
- `scripts/validate-build.js` ready for Wave 2 verification commands; use `--strict` flag after plans 02-04/02-05 are wired
- `scripts/check-frontmatter.js` confirms all 276 biography pages have yearGroup — plan 02-02 can proceed directly to validating year-period boundaries

---
*Phase: 02-ebook-reader*
*Completed: 2026-03-05*
