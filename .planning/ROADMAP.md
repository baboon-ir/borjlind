# Roadmap: Rolf Börjlind — Digital Biografi

## Overview

Alla tre faser av v1-milstolpen är klara. Segment-scroll-modellen har formaliserats som målbild (beslut 2026-03-31), och den ursprungliga paged/swipe-specen är borttagen.

## Current Reality (2026-03-31)

- Phase 1 (CSS Foundation): klar.
- Phase 2 (Reader Implementation): klar — segment-scroll-modellen formaliserad som v1-målbild.
- Phase 3 (Design Polish): klar, 03-01 och 03-02 fullförda.

## Phases

- [x] **Phase 1: CSS Foundation** — Tailwind borttaget, plain CSS etablerat.
- [x] **Phase 2: Reader Implementation** — Segmenterad vertikal läsning + TOC i drift, formaliserad som målbild.
- [x] **Phase 3: Design Polish** — typografi/färg/läsbarhetspolish.

## Phase Details

### Phase 1: CSS Foundation
**Status**: Complete (verifierad)

### Phase 2: Reader Implementation
**Status**: Complete (2026-03-31)

**Implementerat:**
1. Biografi byggs från `content/pages/biografi/chapters/*.md` via PAGE-markers i `.eleventy.js`.
2. Segmenterad render i `layouts/biography.njk` via `collections.biografiSegments`.
3. TOC-panel navigerar till segment (`data-toc-segment`) med `scrollIntoView`.
4. Footer visar sidindikator baserat på page-anchors i DOM.
5. Realtids-scroll-tracking med binärsökning i `bio-reader.js`.
6. Fullskärmsläsare utan header/footer med egen reader-bar.

**Kvarvarande (deferred till v2):**
- localStorage-restore av läsposition (V2-01).

### Phase 3: Design Polish
**Status**: Complete (03-01 and 03-02 complete)

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 1. CSS Foundation | Complete | Klar och i drift |
| 2. Reader Implementation | Complete | Segment-scroll formaliserad som målbild 2026-03-31 |
| 3. Design Polish | Complete | 03-01/03-02 klara: tokeniserad läsbarhet och verifierad visuell sign-off |

## v1 Milestone: Complete

Alla v1-krav uppfyllda (21/22 complete, 1 deferred till v2). Se REQUIREMENTS.md för detaljer.

## v2 Backlog

| Feature | Krav-ID | Prioritet |
|---------|---------|-----------|
| localStorage läspositions-restore | V2-01 | Hög |
| URL per sida (djuplänkning via hash) | V2-02 | Medium |
| Hoppa till sidnummer | V2-03 | Låg |
| Förbättrad TOC scroll-animering | V2-04 | Låg |
