---
phase: 02-ebook-reader
plan: "05"
subsystem: templates
tags: [nunjucks, eleventy, navigation, layout, toc]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [NAV-02, NAV-03, LAYOUT-01, TECH-01-templates]
  affects: [bio-reader.js, _site/biografi/index.html]
tech_stack:
  added: []
  patterns: [inline-json-data, baked-build-time-data, conditional-css-classes]
key_files:
  created:
    - includes/bio-toc.njk
  modified:
    - .eleventy.js
    - layouts/biography.njk
    - includes/bio-controls.njk
    - includes/bio-page.njk
decisions:
  - yearGroupMap collection built server-side via Eleventy, baked into HTML as inline JSON — no runtime fetch needed
  - bio-toc.njk placed outside rb-bio-reader-wrap so it can overlay the full viewport independently
  - bio-page.njk uses TOTAL_PAGES global data — zero occurrences of hardcoded 276 remain in templates
metrics:
  duration: ~8 minutes
  completed: "2026-03-05T16:35:36Z"
  tasks_completed: 2
  files_changed: 5
---

# Phase 2 Plan 05: Eleventy Data Pipeline and Template Restructure Summary

**One-liner:** yearGroupMap Eleventy collection baked as inline JSON into biography layout, with fully redesigned reader controls, new TOC panel, and TOTAL_PAGES-driven page sections replacing the hardcoded 276.

## What Was Built

### Task 1: yearGroupMap collection (.eleventy.js)
Added `addCollection("yearGroupMap", ...)` that reads all `biografiPage`-tagged items, sorts by page number, and produces a deduped array of `{ yearGroup, firstPage }` objects — one entry per unique year group. The `| json` filter registered in plan 02-01 serializes this for inline embedding.

### Task 2: Four template updates

**layouts/biography.njk**
- Added `<script type="application/json" id="rb-year-groups">` at the top — bakes yearGroupMap into HTML at build time (NAV-02)
- Wrapped all reader content in `<div class="rb-bio-reader-wrap">` (LAYOUT-01)
- Added `data-total="{{ TOTAL_PAGES }}"` to `.rb-bio-container` so bio-reader.js reads page count from the DOM (TECH-01)
- Added `{% include "bio-toc.njk" %}` after the reader wrap

**includes/bio-controls.njk**
- Replaced the old number input with a reader controls bar: prev button (`data-prev`), page indicator (`data-page-indicator`), year badge (`data-year-badge`), next button (`data-next`), TOC toggle (`data-toc-toggle`)
- Satisfies READER-04, READER-06, NAV-04

**includes/bio-page.njk**
- Replaced `Page {{ pageNum }}/276` with `Sida {{ pageNum }} / {{ TOTAL_PAGES }}` — no hardcoded page counts
- Added `rb-bio-page--media` conditional CSS class for pages with `mediaPage: true` frontmatter (LAYOUT-01)

**includes/bio-toc.njk** (new file)
- TOC panel with `data-toc-panel` (aria-hidden by default), close button (`data-toc-close`), and year-group jump buttons (`data-toc-page="{{ group.firstPage }}"`) rendered from `collections.yearGroupMap` (NAV-03)

## Verification Results

```
PASS: READER-06: data-page-indicator present
PASS: NAV-02: rb-year-groups script tag present
Results: 2 passed, 0 failed
```

- `grep -c "rb-year-groups" _site/biografi/index.html` → 1
- `grep -c "data-page-indicator" _site/biografi/index.html` → 1
- `grep -c "data-toc-panel" _site/biografi/index.html` → 1
- `grep -rn "/276" includes/ layouts/` → 0 matches
- `grep -rn '"276"\|= 276' assets/js/bio-reader.js includes/ layouts/` → 0 matches
- `npx eleventy` → 560 files written, 0 errors

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 10552a8 | feat(02-05): add yearGroupMap collection to .eleventy.js |
| 2 | ad42e06 | feat(02-05): restructure templates for paged reader layout |

## Self-Check: PASSED

All files confirmed present on disk. Both task commits (10552a8, ad42e06) verified in git log.
