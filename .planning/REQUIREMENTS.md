# Requirements: Rolf Börjlind — Digital Biografi

**Defined:** 2026-03-04
**Core Value:** Läsupplevelsen ska kännas som att hålla en bok i handen — enkel att navigera, tidlös i sin design, och alltid tillgänglig utan att beroenden förfaller.

## v1 Requirements

### CSS-fundament (Tailwind-borttagning)

- [x] **CSS-01**: Tailwind CSS (PostCSS-pipeline, alla `@apply`-direktiv, `prose`-klasser) är borttaget från projektet
- [x] **CSS-02**: Plain CSS-fil ersätter Tailwind — innehåller CSS reset (ersätter Tailwind preflight) och all befintlig styling
- [x] **CSS-03**: CSS custom properties definierar färgpalett och typsnitt (ersätter `tailwind.config.cjs` theme-värden)
- [x] **CSS-04**: Visuell paritet med nuvarande design — inget ska se annorlunda ut efter migreringen (undantaget intentionella ändringar i fas 2)

### Läsoptimerad design

- [x] **DESIGN-01**: Bakgrundsfärg är forskningsoptimerad för ögonkomfort — inte ren `#000000` (mjuk svart, t.ex. `#111111`–`#1a1a1a`)
- [x] **DESIGN-02**: Textfärg är forskningsoptimerad — inte ren `#ffffff` (varm off-white, t.ex. `#e8e8e8`–`#f0ede4`)
- [x] **DESIGN-03**: Ingen mörkt/ljust-läge-toggle — ett enda tema genomgående
- [x] **DESIGN-04**: Bastextstorlek är läsoptimerad (16–18px för brödtext)
- [x] **DESIGN-05**: Radavstånd är läsoptimerat (1.6–1.8 för löptext)
- [x] **DESIGN-06**: Teckenavstånd är läsoptimerat (lätt positivt tracking för brödtext, 0.01–0.02em)
- [x] **DESIGN-07**: Radlängd är begränsad till optimal läsbredd (60–75 tecken, ca 65ch)

### Biografiläsare — segmenterad scroll-navigation

> **Beslut 2026-03-31:** Segment-scroll-modellen formaliseras som målbild. Ursprunglig paged/swipe-spec (READER-01–05, READER-08–09) ersätts med nedanstående krav. Se Out of Scope för borttagna features.

- [x] **READER-01**: Biografin renderas som segmenterad vertikal scroll — Prolog, årsperioder, Epilog — via `collections.biografiSegments`
- [x] **READER-02**: TOC-panel navigerar till segment med smooth scroll (`scrollIntoView`)
- [x] **READER-03**: Scroll-position spåras i realtid — aktuellt segment och sidnummer uppdateras i reader-baren via binärsökning i viewport
- [x] **READER-06**: Sidindikator visar aktuell sida och totalt antal ("12 / 276")
- [ ] **READER-07**: Läsposition sparas i localStorage och återställs vid nästa besök
- [x] **READER-10**: Fullskärmsläsare utan header/footer (`noHeader: true`, `noFooter: true`) med egen reader-bar

### E-boksläsare — årsnavigation

- [x] **NAV-01**: `yearGroup`-metadata läggs till i frontmatter på varje biografisida (innehållsbeslut — vilka sidor tillhör vilket årsintervall)
- [x] **NAV-02**: Eleventy exponerar årsindelningsdata som global data vid build-time (bakat in i HTML, ingen runtime-fetch)
- [x] **NAV-03**: Innehållsförteckning (panel eller overlay) listar alla årsperioder och låter användaren hoppa direkt till en period
- [x] **NAV-04**: Aktuell årsperiod indikeras visuellt under läsning (uppdateras när sida byter)

### Sidlayout — rikt innehåll

- [x] **LAYOUT-01**: Sidor där video eller bild inte ryms tillsammans med text renderas som egna dedikerade sidor (hanteras vid build-time i Eleventy-konfigurationen)
- [x] **LAYOUT-02**: Dropdowns/accordions (`<details>`) expanderar sidan vertikalt — lokal vertikal scroll tillåts på sidor med expanderat innehåll

### Teknisk städning

- [x] **TECH-01**: Hårdkodat sidantal (276) ersätts med en enda konfigurationspunkt i `.eleventy.js` — refereras från alla mallar och JS

## v2 Requirements

### Läsarfunktioner (framtida)

- **V2-01**: Läsposition sparas i localStorage och återställs vid nästa besök (kvarvarande från READER-07)
- **V2-02**: URL per sida (`/biografi/#p-001`) uppdateras vid scroll — möjliggör djuplänkning och webbläsarhistorik
- **V2-03**: Hoppa direkt till specifikt sidnummer via inmatningsfält
- **V2-04**: Smooth scroll-animering vid TOC-navigation (förbättrad)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mörkt/ljust-läge-toggle | Endast ett tema — designbeslut |
| CMS / editor-gränssnitt | Innehåll uppdateras via markdown direkt i repot |
| E-boksformat för Minnen och Appendix | Andra innehållstyper, behåller nuvarande layout |
| Kommentarer / sociala features | Statisk sajt utan backend |
| Typsnittsbyte av användaren | Tidlös design — inte ett användarvalt gränssnitt |
| Font-size-slider / zoom-inställningar | Webbläsarens inbyggda zoom räcker |
| Tredjepartsbibliotek i webbläsaren | Zero runtime-beroenden |
| Paged/swipe-navigation (en sida åt gången) | Beslut 2026-03-31: segment-scroll-modellen formaliserad som målbild |
| Pointer Events swipe-hantering | Ej relevant för scroll-modellen |
| Tangentbordsnavigation (piltangenter byter sida) | Ej relevant för scroll-modellen |
| Prev/next-knappar | Ej relevant för scroll-modellen — TOC-navigation räcker |
| `100dvh` page-container | Ej relevant — läsaren scrollar fritt |
| Sidövergångsanimation (fade/slide) | Ej relevant för scroll-modellen |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CSS-01 | Phase 1 | Complete |
| CSS-02 | Phase 1 | Complete |
| CSS-03 | Phase 1 | Complete |
| CSS-04 | Phase 1 | Complete |
| DESIGN-01 | Phase 3 | Complete |
| DESIGN-02 | Phase 3 | Complete |
| DESIGN-03 | Phase 3 | Complete |
| DESIGN-04 | Phase 3 | Complete |
| DESIGN-05 | Phase 3 | Complete |
| DESIGN-06 | Phase 3 | Complete |
| DESIGN-07 | Phase 3 | Complete |
| READER-01 | Phase 2 | Complete (rewritten for scroll model) |
| READER-02 | Phase 2 | Complete (rewritten for scroll model) |
| READER-03 | Phase 2 | Complete (rewritten for scroll model) |
| READER-06 | Phase 2 | Complete |
| READER-07 | Phase 2 | Deferred to v2 (V2-01) |
| READER-10 | Phase 2 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| NAV-04 | Phase 2 | Complete |
| LAYOUT-01 | Phase 2 | Complete |
| LAYOUT-02 | Phase 2 | Complete |
| TECH-01 | Phase 2 | Complete |

## Decision Log

### 2026-03-31: Segment-scroll formaliserad som målbild

Segment-scroll-modellen (vertikal scroll med Prolog/årsperioder/Epilog-segment och TOC-navigation) formaliseras som v1-målbild. Ursprungliga paged/swipe-krav (READER-01–05 gamla, READER-08–09) stryks och flyttas till Out of Scope.

**Borttagna krav:** Gamla READER-01 (one-page-at-a-time), READER-02 (Pointer Events swipe), READER-03 (iOS Safari kantsvep), READER-04 (prev/next-knappar), READER-05 (tangentbordsnavigation), READER-08 (100dvh container), READER-09 (ny sidstyrningscontroller).

**Rationale:** Scroll-modellen fungerar i produktion, är enklare att underhålla, och uppfyller kärnvärdet — enkel att navigera, tidlös i sin design.

**Coverage:**
- v1 requirements: 22 total (efter omskrivning)
- Complete: 21
- Deferred to v2: 1 (READER-07 → V2-01)

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-31 — scroll-modell formaliserad som målbild*
