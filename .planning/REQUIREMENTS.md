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

- [ ] **DESIGN-01**: Bakgrundsfärg är forskningsoptimerad för ögonkomfort — inte ren `#000000` (mjuk svart, t.ex. `#111111`–`#1a1a1a`)
- [ ] **DESIGN-02**: Textfärg är forskningsoptimerad — inte ren `#ffffff` (varm off-white, t.ex. `#e8e8e8`–`#f0ede4`)
- [ ] **DESIGN-03**: Ingen mörkt/ljust-läge-toggle — ett enda tema genomgående
- [ ] **DESIGN-04**: Bastextstorlek är läsoptimerad (16–18px för brödtext)
- [ ] **DESIGN-05**: Radavstånd är läsoptimerat (1.6–1.8 för löptext)
- [ ] **DESIGN-06**: Teckenavstånd är läsoptimerat (lätt positivt tracking för brödtext, 0.01–0.02em)
- [ ] **DESIGN-07**: Radlängd är begränsad till optimal läsbredd (60–75 tecken, ca 65ch)

### E-boksläsare — sidnavigation

- [x] **READER-01**: En sida visas åt gången — synlighetsmodell (JS-kontrollerad), inte scroll
- [x] **READER-02**: Svep vänster/höger med Pointer Events API navigerar till nästa/föregående sida
- [x] **READER-03**: iOS Safari kantsvep hanteras korrekt (`touch-action: pan-y`, riktningsvinkelkontroll)
- [x] **READER-04**: Knappar (pil vänster/höger) navigerar sida — synliga på både mobil och desktop
- [x] **READER-05**: Tangentbordsnavigation — piltangenter vänster/höger byter sida
- [x] **READER-06**: Sidindikator visar aktuell sida och totalt antal ("12 / 276")
- [x] **READER-07**: Läsposition sparas i localStorage och återställs vid nästa besök
- [x] **READER-08**: Läsarcontainer använder `100dvh` (inte `100vh`) — löser iOS Safari webbläsar-chrome-problem
- [x] **READER-09**: Befintlig `bio-reader.js` ersätts helt med ny sidstyrningscontroller (scroll-modell tas bort)

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

- **V2-01**: Sidövergångsanimation (fade eller slide) vid bläddrande
- **V2-02**: URL per sida (`/biografi/#p-001`) uppdateras vid navigation — möjliggör djuplänkning och webbläsarhistorik
- **V2-03**: Onboarding-hint vid första besök ("Svep för att bläddra")
- **V2-04**: Hoppa direkt till specifikt sidnummer via inmatningsfält

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

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CSS-01 | Phase 1 | Complete |
| CSS-02 | Phase 1 | Complete |
| CSS-03 | Phase 1 | Complete |
| CSS-04 | Phase 1 | Complete |
| DESIGN-01 | Phase 3 | Pending |
| DESIGN-02 | Phase 3 | Pending |
| DESIGN-03 | Phase 3 | Pending |
| DESIGN-04 | Phase 3 | Pending |
| DESIGN-05 | Phase 3 | Pending |
| DESIGN-06 | Phase 3 | Pending |
| DESIGN-07 | Phase 3 | Pending |
| READER-01 | Phase 2 | Complete |
| READER-02 | Phase 2 | Complete |
| READER-03 | Phase 2 | Complete |
| READER-04 | Phase 2 | Complete |
| READER-05 | Phase 2 | Complete |
| READER-06 | Phase 2 | Complete |
| READER-07 | Phase 2 | Complete |
| READER-08 | Phase 2 | Complete |
| READER-09 | Phase 2 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| NAV-04 | Phase 2 | Complete |
| LAYOUT-01 | Phase 2 | Complete |
| LAYOUT-02 | Phase 2 | Complete |
| TECH-01 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation — all requirements mapped*
