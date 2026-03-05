# Roadmap: Rolf Börjlind — Digital Biografi

## Overview

The existing Eleventy biography is a vertical-scroll experience with Tailwind CSS. This roadmap transforms it into a paged e-book reader with swipe navigation, year-structured table of contents, and a timeless hand-written CSS foundation. Tailwind removal is the hard prerequisite — the new plain CSS file is the foundation on which all reader styling is built. The reader follows, delivering the core reading experience. Design polish closes the milestone, applying research-backed typography and colour decisions that make the biography feel like holding a book.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: CSS Foundation** - Remove Tailwind, replace with plain CSS — zero build dependencies, visual parity (completed 2026-03-04)
- [ ] **Phase 2: E-book Reader** - Paged reading experience with swipe, keyboard, TOC, and year navigation
- [ ] **Phase 3: Design Polish** - Reading-optimised typography, colour, spacing — production-ready aesthetics

## Phase Details

### Phase 1: CSS Foundation
**Goal**: The site runs entirely on hand-written plain CSS with no Tailwind, no PostCSS, and no npm build pipeline — visually identical to today.
**Depends on**: Nothing (first phase)
**Requirements**: CSS-01, CSS-02, CSS-03, CSS-04
**Success Criteria** (what must be TRUE):
  1. The site builds and renders with `eleventy --serve` only — no PostCSS step, no Tailwind CLI
  2. Every page looks visually identical to the Tailwind version (colours, typography, spacing, layout)
  3. `package.json` contains no reference to `tailwindcss`, `postcss`, or `autoprefixer`
  4. A single `assets/css/main.css` file using CSS custom properties replaces all Tailwind output
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Write hand-written assets/css/main.css with CSS custom properties, reset, and all component rules
- [ ] 01-02-PLAN.md — Update all templates and .eleventy.js to semantic classes, remove Tailwind infrastructure

### Phase 2: E-book Reader
**Goal**: Users can read the 276-page biography one page at a time, navigating by swipe, button, or keyboard, with a year-structured table of contents and persistent reading position.
**Depends on**: Phase 1
**Requirements**: READER-01, READER-02, READER-03, READER-04, READER-05, READER-06, READER-07, READER-08, READER-09, NAV-01, NAV-02, NAV-03, NAV-04, LAYOUT-01, LAYOUT-02, TECH-01
**Success Criteria** (what must be TRUE):
  1. Swiping left or right on mobile navigates to the next or previous biography page — one page visible at a time
  2. Arrow buttons and keyboard arrow keys navigate pages on desktop
  3. The table of contents lists all year periods and jumping to one lands on the correct first page of that period
  4. Closing the browser and reopening returns the reader to the last page read
  5. Pages containing video or large images display correctly — media gets its own dedicated page slot
**Plans**: 6 plans

Plans:
- [ ] 02-01-PLAN.md — Extract TOTAL_PAGES constant in .eleventy.js + create Wave 0 validation scripts
- [ ] 02-02-PLAN.md — Add yearGroup frontmatter to all 276 biography page .md files
- [ ] 02-03-PLAN.md — Add reader CSS to main.css (container, visibility model, controls bar, TOC panel)
- [ ] 02-04-PLAN.md — Replace bio-reader.js with new paged reader controller (swipe, keyboard, localStorage, year badge)
- [ ] 02-05-PLAN.md — Update templates and Eleventy data pipeline (yearGroupMap collection, biography.njk, bio-controls.njk, bio-page.njk, bio-toc.njk)
- [ ] 02-06-PLAN.md — Human verify: device testing checkpoint (iOS swipe, edge-swipe, keyboard, TOC, localStorage)

### Phase 3: Design Polish
**Goal**: The typography, colour, and spacing of the reader are optimised for long-form reading — the experience feels like holding a printed book, not browsing a website.
**Depends on**: Phase 2
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07
**Success Criteria** (what must be TRUE):
  1. Background and text colours are soft — no pure black or pure white — reducing eye strain during extended reading
  2. Body text is 16–18px with line height 1.6–1.8 and a maximum line width of approximately 65 characters
  3. The site has exactly one colour theme — no toggle, no mode switch
  4. Typographic rhythm (size, spacing, tracking) is consistent and visually polished across all biography pages
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CSS Foundation | 2/2 | Complete    | 2026-03-05 |
| 2. E-book Reader | 5/6 | In Progress|  |
| 3. Design Polish | 0/? | Not started | - |
