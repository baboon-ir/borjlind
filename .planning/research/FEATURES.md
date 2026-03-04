# Feature Landscape

**Domain:** E-book reader for digital biography (media-rich, year-structured, static site)
**Researched:** 2026-03-04
**Confidence:** MEDIUM — derived from domain knowledge of established e-readers (Kindle Web, Apple Books, Epub.js), long-form reading UX patterns, and direct analysis of project requirements. No live web search available; findings based on well-established patterns unlikely to have changed.

---

## Table Stakes

Features users expect from a paged reading experience. Missing = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-page-at-a-time display | The entire value proposition of "e-book mode" — without this it's just the old scroll | Low | Single DOM node visible at a time; others hidden or not rendered |
| Left/right page navigation (buttons) | Core paging mechanic; universally expected on desktop | Low | Previous / Next buttons; must be keyboard accessible |
| Swipe navigation (touch) | Mobile-first expectation for any paged content | Medium | Touch events: touchstart + touchend delta; min threshold to avoid accidental swipes |
| Keyboard navigation (arrow keys) | Desktop reading expectation; accessibility baseline | Low | ArrowLeft = previous, ArrowRight = next; also PageUp/PageDown |
| Current page indicator | "Page X of 276" — users must know where they are | Low | Can be page number, or fraction, or progress bar |
| Reading position memory | Users close the tab and return — must land on same page | Low | Already exists for scroll; adapt to page index in localStorage |
| Table of contents (year navigation) | 276 pages is too large to navigate without landmarks; year-based TOC is the primary wayfinding tool | Medium | Sidebar or overlay panel; lists all year periods with jump-to links |
| Current year/section indicator | User must know which life period they are reading | Medium | Highlight active TOC entry; update on page change |
| Responsive layout (mobile + desktop) | Non-negotiable for any modern site; biography readers include older audience on phone | Medium | Single-column on mobile, constrained reading width on desktop |
| Readable typography | Long-form biography requires comfortable line length, size, contrast | Low | Existing dark theme; constrain line length to ~65–75ch; avoid full-width text on wide screens |

---

## Differentiators

Features that set this biography apart. Not baseline expected, but meaningfully better UX.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart media pages — media gets its own page | Videos and large images do not compete with text for vertical space; each gets a clean full-page slot | Medium | Requires build-time analysis of page content to detect media-heavy pages; layout logic, not runtime JS |
| Accordion/dropdown on same page with vertical overflow | Expandable content (anecdotes, side stories) stays on its page but allows the page to grow vertically | Medium | A page is "tall" when expanded; standard scroll within that page; user returns to paged navigation on collapse |
| Visual year/era markers | Decorative year label (e.g. "1982–1988") as a typographic element on chapter-opening pages | Low | Pure CSS/HTML; strong biographical atmosphere |
| TOC with reading progress per section | Show how far through each year-section the user is | High | Requires tracking which pages belong to which section and which have been visited; localStorage |
| Smooth page transition animation | Slide or fade between pages; feels like turning a book | Low | CSS transition on display/opacity; do not use JS animation libraries |
| First-visit onboarding hint | One-time tooltip or overlay explaining swipe/arrow navigation; dismissable | Low | Only on first visit; localStorage flag; critical for non-tech-savvy older readers |
| Direct URL per page | Each page has a shareable URL (#page-42 or /biografi/42); enables bookmarking and sharing | Medium | Hash-based routing or query param; must work with Cloudflare static hosting |

---

## Anti-Features

Features to explicitly NOT build. Each would add complexity, dependencies, or maintenance burden without proportional value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Font size / typeface customization | Adds UI complexity (settings panel); breaks designed aesthetic; target audience is specific not generic | Set a carefully chosen default; use relative units (rem) so OS accessibility settings still work |
| Day/night theme toggle | Dark theme is already the intentional design; toggling undermines the designed atmosphere | Keep dark theme as default and only theme |
| Text highlighting and annotations | Requires storage backend or complex localStorage schema; out of scope for static-first | Not needed for a biography; readers consume, do not study |
| Bookmarks panel | Adds complexity; reading position memory covers the primary use case | Single saved position in localStorage is sufficient |
| Search within book | Requires indexing 276 pages; adds JS bundle weight; Ctrl+F works for in-page; full-book search is a large feature | Rely on browser find or a future static search (Pagefind) if needed |
| Audio narration / text-to-speech | Large content production effort; adds accessibility complexity beyond scope | Not in scope; standard browser TTS works if user enables it |
| Social sharing per paragraph | Adds JS, external dependencies, visual clutter; biography is not a social media product | Share per page via URL (differentiator above) is sufficient |
| Infinite scroll as fallback | Defeats the purpose of e-book mode; confuses the reading model | Paged navigation only; scroll within a page only for expanded accordions |
| Third-party reading progress sync | Requires accounts, backend, API — antithetical to static-first constraint | localStorage only; single-device persistence is sufficient |

---

## Feature Dependencies

```
Reading position memory → Page index tracking
  (must know current page to persist it)

Current year indicator → TOC with year-section metadata
  (must know which pages belong to which year to highlight active section)

TOC with progress → Reading position memory + page-to-section mapping
  (depends on both tracking systems)

Smart media pages → Build-time content analysis (Eleventy data/template logic)
  (must be a build-time decision, not runtime)

Direct URL per page → Page index tracking + hash/query routing
  (page identity must be stable and addressable)

Accordion vertical overflow → Per-page layout model
  (only meaningful once we have a defined page boundary)

Smooth transitions → One-page-at-a-time display
  (transitions require knowing what is entering and exiting)

First-visit onboarding → Page navigation implementation
  (can only hint at gestures that exist)
```

---

## MVP Recommendation

Prioritize for the first working milestone:

1. **One-page-at-a-time display** — the foundation; everything else builds on it
2. **Button navigation (previous/next)** — simplest input; works universally
3. **Keyboard navigation** — low effort, high accessibility value
4. **Reading position memory** — already exists conceptually; adapt for page index
5. **Current page indicator** — "Page X of 276"; essential for orientation
6. **Swipe navigation (touch)** — mobile is primary for many readers; medium effort
7. **Table of contents panel** — year-based wayfinding; required for 276-page corpus
8. **Current year/section indicator** — connects TOC to active reading position
9. **Smart media pages** — build-time; no runtime cost once implemented
10. **Accordion vertical overflow** — handles the dropdown/rich content case

Defer to a polish phase:

- **Direct URL per page** — valuable but not blocking; hash routing can be added after core paging works
- **Smooth page transitions** — nice to have; add after layout is stable to avoid fighting layout bugs
- **First-visit onboarding hint** — add last, when the gestures are finalized
- **TOC with reading progress per section** — high complexity; deferrable until MVP is solid

---

## Complexity Reference

| Label | Meaning |
|-------|---------|
| Low | Less than a day; vanilla JS + CSS; well-understood pattern |
| Medium | 1–3 days; requires design decisions and edge case handling |
| High | 3+ days; state management, cross-feature coordination, or data pipeline changes |

---

## Sources

- Domain knowledge: Kindle Web reader, Apple Books, Epub.js feature set (training data, HIGH confidence for established patterns)
- Project requirements: `.planning/PROJECT.md` (authoritative for this project's constraints)
- Reading UX research: Nielsen Norman Group long-form reading patterns (training data, MEDIUM confidence)
- Confidence note: No live web search was available during this research session. All recommendations reflect well-established e-reader UX conventions that are unlikely to have changed materially. Flag for human review if novel patterns are desired.
