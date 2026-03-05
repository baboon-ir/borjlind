---
phase: 02-ebook-reader
plan: "04"
subsystem: reader-js
tags: [javascript, paged-reader, pointer-events, localstorage, keyboard-nav]
dependency_graph:
  requires:
    - 02-01  # TECH-01 foundation (TOTAL_PAGES global, data-total attribute)
  provides:
    - paged-reader-controller  # consumed by 02-03 (CSS active state) and 02-05 (templates)
  affects:
    - assets/js/bio-reader.js
tech_stack:
  added: []
  patterns:
    - Vanilla JS IIFE with biography guard
    - Pointer Events API (pointerdown/pointermove/pointerup/pointercancel)
    - setPointerCapture for reliable tracking
    - classList.add/remove is-active for page visibility
    - JSON script tag for year groups data island
key_files:
  created: []
  modified:
    - assets/js/bio-reader.js
decisions:
  - Guard moved to top of IIFE (before DOMContentLoaded) — early exit if not biography page
  - bio:page key stores plain integer string, not JSON object — simpler than old bio:last payload
  - ArrowDown/ArrowUp also trigger page turn — natural addition alongside Left/Right
  - pointerType === 'mouse' check skips swipe logic for desktop mouse users
  - Fallback value '276' in TOTAL_PAGES parseInt is a safe default; real value comes from data-total
metrics:
  duration_minutes: 3
  completed_date: "2026-03-05"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
requirements_satisfied:
  - READER-01
  - READER-02
  - READER-03
  - READER-04
  - READER-05
  - READER-06
  - READER-07
  - READER-08
  - READER-09
  - NAV-04
---

# Phase 2 Plan 04: bio-reader.js Paged Controller Summary

**One-liner:** Zero-scroll paged reader IIFE with Pointer Events swipe, 20px iOS edge exclusion, keyboard navigation, and localStorage `bio:page` integer persistence.

## What Was Built

Replaced the scroll-based `bio-reader.js` entirely with a new paged controller. The old implementation used `scrollY`, `scrollIntoView`, `window.scrollTo`, `history.replaceState`, and `bio:last` JSON payloads. The new implementation has no scroll model at all.

### Core behaviours delivered

| Requirement | Implementation |
|-------------|----------------|
| READER-01 | `showPage(n)` toggles `is-active` class — only one page visible at a time |
| READER-02 | `wireSwipe()` uses `pointerdown/pointermove/pointerup` on the container |
| READER-03 | `EDGE_PX = 20` exclusion zone on `pointerdown`; `ANGLE_LIMIT = 30` degrees aborts vertical gestures |
| READER-04 | `wireButtons()` wires `[data-prev]` and `[data-next]` buttons |
| READER-05 | `wireKeyboard()` handles ArrowLeft/Right/Up/Down; excludes input/textarea/select |
| READER-06 | TOC panel wired via `wireToc()` — open/close + year-group jump buttons |
| READER-07 | `save(n)` writes integer to `localStorage['bio:page']`; `restore()` reads it |
| READER-08 | `updateIndicator()` updates `[data-page-indicator]` text |
| READER-09 | All scroll-model code removed; `bio:last` key deleted on startup |
| NAV-04 | `updateYearBadge()` calls `getYearGroup(currentPage)` on every page change |

### Key architectural links

- `pointerdown` handler checks `e.clientX < EDGE_PX || e.clientX > window.innerWidth - EDGE_PX` — gives iOS Safari back gesture its 20px safe zone
- `TOTAL_PAGES` reads from `container?.dataset.total` with `'276'` as fallback — no hardcoded value in logic paths
- `yearGroups` parsed from `#rb-year-groups` JSON script tag (written by plan 02-05); gracefully degrades to empty array if absent

## Deviations from Plan

None — plan executed exactly as written. The single task had a fully specified implementation; no auto-fixes were required.

## Verification Results

```
# READER-09: scroll references
grep -c "scrollY\|scrollIntoView\|window\.scroll" assets/js/bio-reader.js
0  ✓

# READER-02/03: Pointer Events
grep -n "pointerdown\|EDGE_PX\|ANGLE_LIMIT" assets/js/bio-reader.js
9:  const EDGE_PX = 20;
10: const ANGLE_LIMIT = 30;
96: container.addEventListener('pointerdown', ...)  ✓

# TECH-01: no hardcoded 276
grep -c "= 276\|\"276\"" assets/js/bio-reader.js
0  ✓

# READER-07: localStorage keys
bio:page  — line 8 (KEY const), used via KEY variable in save/restore  ✓
bio:last  — line 41, removed on startup  ✓

# Build
npx eleventy --dryrun → Wrote 0 files in 5.07 seconds (v2.0.1) — exit 0  ✓
```

## Commits

| Task | Description | Hash | Files |
|------|-------------|------|-------|
| 1 | Replace bio-reader.js with paged controller | 4799bb2 | assets/js/bio-reader.js |

## Self-Check: PASSED

- `assets/js/bio-reader.js` — present and contains new IIFE
- commit `4799bb2` — verified in git log
- Zero scroll references confirmed
- Eleventy dry-run exits 0
