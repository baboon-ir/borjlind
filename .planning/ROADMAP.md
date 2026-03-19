# Roadmap: Rolf Borjlind - Digital Biografi

## Overview

Projektet har genomfort CSS-migreringen (Tailwind -> plain CSS) och har en fungerande biografilasare i produktion, men implementationen i `main` har avvikit fran den ursprungliga Phase 2-planen.

Nuvarande lasare ar segmenterad och scroll-baserad (Prolog / arssegment / Epilog) med TOC-overlay, inte en strikt page-toggle-lasare med swipe + localStorage.

## Current Reality (2026-03-19)

- Phase 1 (CSS Foundation): klar.
- Phase 2 (E-book Reader): delvis uppfylld enligt ursprunglig kravbild; funktionell lasare finns, men flera READER-krav ar ej implementerade i aktuell kod.
- Phase 3 (Design Polish): klar, 03-01 och 03-02 fullforda.

## Phases

- [x] **Phase 1: CSS Foundation** - Tailwind borttaget, plain CSS etablerat.
- [ ] **Phase 2: Reader Implementation (Reality-synkad)** - Segmenterad vertikal lasning + TOC i drift; ursprunglig swipe/page-toggle-spec ej fullt uppfylld.
- [x] **Phase 3: Design Polish** - typografi/farg/lasbarhetspolish.

## Phase Details

### Phase 1: CSS Foundation
**Status**: Complete (verifierad)

### Phase 2: Reader Implementation (Reality-synkad)
**As-built i `main`:**
1. Biografi byggs fran `content/pages/biografi/chapters/*.md` via PAGE-markers i `.eleventy.js`.
2. Segmenterad render i `layouts/biography.njk` via `collections.biografiSegments`.
3. TOC-panel navigerar till segment (`data-toc-segment`) med `scrollIntoView`.
4. Footer visar sidindikator baserat pa page-anchors i DOM.

**Gap mot ursprunglig v1-spec:**
1. Ingen pointer-swipe sidbladdring (READER-02, READER-03).
2. Inga prev/next-knappar eller keyboard page-turn (READER-04, READER-05).
3. Ingen localStorage-restore av lasposition (READER-07).
4. Ingen 100dvh page-container for one-page-at-a-time (READER-08).
5. Scrollmodell kvar i `bio-reader.js` (READER-09).

**Status**: In Progress (reality drift dokumenterad)

### Phase 3: Design Polish
**Status**: Complete (03-01 and 03-02 complete)

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 1. CSS Foundation | Complete | Klar och i drift |
| 2. Reader Implementation | In Progress | As-built avviker fran ursprunglig paged/swipe-spec |
| 3. Design Polish | Complete | 03-01/03-02 klara: tokeniserad lasbarhet och verifierad visuell sign-off |

## Next Planning Action

Skapa en kort replan for Phase 2 som antingen:
1. Fullfoljer ursprunglig one-page/swipe-spec, eller
2. Formaliserar segmenterad vertikal lasning som ny malbild och uppdaterar requirements.
