---
phase: 02-ebook-reader
plan: "06"
subsystem: verification
tags: [reality-sync, as-built, drift, reader]
status: partial
completed: 2026-03-19
---

# Phase 2 Plan 06: As-Built Reality Summary

## Scope

This summary documents the actual implementation currently running in `main` and reconciles it with the original Phase 2 plan.

## What Is Implemented (Code Truth)

1. Reader rendering is segment-based via `collections.biografiSegments` in `.eleventy.js`.
2. Biography content is sourced from chapter marker files in `content/pages/biografi/chapters/*.md`.
3. `layouts/biography.njk` renders segment blocks, page anchors, and a TOC overlay.
4. `assets/js/bio-reader.js` updates year label and page indicator based on scroll position.
5. TOC buttons jump to segments using `scrollIntoView`.

## Requirement Status (Original v1 Reader Spec)

Satisfied in current code:
- READER-06
- NAV-01
- NAV-02
- NAV-03
- NAV-04
- LAYOUT-01
- LAYOUT-02
- TECH-01

Not satisfied in current code:
- READER-01
- READER-02
- READER-03
- READER-04
- READER-05
- READER-07
- READER-08
- READER-09

## Legacy / Unused Template Surface

The following files exist but are not included by current biography/home rendering paths:
- `includes/bio-controls.njk`
- `includes/bio-page.njk`
- `includes/hub-grid.njk`

## Notes

- This is not a failure report; it is a drift report between planned acceptance criteria and as-built behavior.
- Phase 2 should remain "In Progress" until a product decision is made:
  1. Return to original paged swipe model, or
  2. Re-baseline requirements around segment-scroll reader behavior.
