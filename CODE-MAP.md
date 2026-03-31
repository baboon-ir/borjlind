# Kodkarta: Rolf Börjlind — Digital Biografi

**Genererad:** 2026-03-31
**Senast uppdaterad:** 2026-03-31 (session 2 — innehåll, layout och navigation)
**Projektstatus:** v1.0 milestone komplett. Alla tre faser klara. Segment-scroll-modellen formaliserad som målbild (beslut 2026-03-31). Appendix och Minnen har fått komplett innehåll från live-sajten, delad navigation (meny vänster / innehåll höger), och enhetlig 628px-container.

---

## Projektöversikt

En statisk digital biografi för författaren Rolf Börjlind, byggd med Eleventy 3 och handskriven CSS. Biografin "Bit den hand som föder dig" omfattar 276 sidor organiserade i 20 kapitel och 10 årsperioder. Sajten hostas på Cloudflare och har tre huvuddelar: biografin (e-boksläsare), en minnesdel och ett appendix.

**Tech stack:** Eleventy 3 (SSG), Nunjucks (templates), markdown-it (med plugins), vanilla JS, plain CSS (Tailwind borttaget i Fas 1).

**Kärnvärde:** Läsupplevelsen ska kännas som att hålla en bok i handen.

---

## Filstruktur

```
borjlind/
├── .eleventy.js              ← Huvudkonfiguration (collections, filters, markdown)
├── package.json              ← npm-beroenden (eleventy, markdown-it, playwright)
├── README.md                 ← Projektdokumentation
├── _data/
│   └── chapters.js           ← 20 kapitelsdefinitioner (id, title, start, end)
├── assets/
│   ├── css/main.css          ← All CSS (design tokens, reset, komponenter)
│   ├── js/bio-reader.js      ← Klientlogik för biografiläsaren
│   ├── js/nav.js             ← Menynavigation (header, mobil)
│   ├── js/section-reader.js  ← Klientlogik för section-sidor (Appendix, Minnen)
│   └── images/               ← Bildtillgångar
├── content/
│   └── pages/
│       ├── appendix.md
│       ├── biografi/
│       │   ├── index.md      ← Biografins startsida
│       │   ├── chapters/     ← Kapitelkällfiler med PAGE-markers
│       │   └── pages/        ← 276 individuella sidor (page-1.md – page-276.md)
│       └── minnen/           ← Minnessidor
├── layouts/                  ← 7 Nunjucks-layoutmallar
├── includes/                 ← 8 Nunjucks-inkluderingsfiler
├── scripts/                  ← Bygg- och valideringsskript
├── docs/                     ← Projektdokumentation
├── .planning/                ← Planerings- och forskningsdokument
└── [Python-skript]           ← Engångsskript för OCR-import och datarensning
```

---

## Konfiguration: `.eleventy.js`

Hjärtat i byggsystemet. Definierar markdown-rendering, collections, filters och datamodell.

### Konstanter

| Konstant | Värde | Beskrivning |
|----------|-------|-------------|
| `TOTAL_PAGES` | 276 | Enda sanningskälla för sidantal (TECH-01) |
| `PROLOG_END_PAGE` | 4 | Sista sidan i prologsegmentet |
| `EPILOG_START_PAGE` | 276 | Första sidan i epilogsegmentet |
| `CHAPTERS_DIR` | `content/pages/biografi/chapters` | Sökväg till kapitelkällfiler |
| `YEAR_GROUP_RANGES` | 10 årsperioder | Mappar sidnummer → årsintervall (1942–2024) |

### Funktioner

| Funktion | Parametrar | Beskrivning |
|----------|-----------|-------------|
| `pad3(n)` | `n: number` | Nollpaddar tal till 3 siffror (1 → "001") |
| `getYearGroupForPage(pageNumber)` | `pageNumber: number` | Returnerar årsperiod-etikett (t.ex. "1942–1955") för en sida baserat på `YEAR_GROUP_RANGES` |
| `isMediaOnlyMarkdown(markdown)` | `markdown: string` | Kontrollerar om markdown-innehåll enbart är en bild (`![alt](url)`) — avgör om sidan ska få media-page-behandling |
| `loadChapterPageContentMap()` | — | Läser alla `chapter-*.md`-filer från `CHAPTERS_DIR`, extraherar sidinnehåll via `<!-- PAGE N START/END -->`-markers, returnerar `Map<nummer, innehåll>` |
| `escapeAttr(s)` | `s: string` | Escapar HTML-attributtecken (`&`, `"`, `<`, `>`) |
| `renderBio(text)` | `text: string` | Renderar biografitext: hanterar `[MORE]`-block (→ `<details>`), `[yt-video][URL]`-embeds (→ YouTube iframe), `<div class="">`-sektioner. Wrappas i `.rb-prose`-divs. Använder markdown-it internt. |

### Markdown-it plugins

Konfigurerade containers som transformerar `:::` -block till semantisk HTML:

| Container | CSS-klass | Resultat |
|-----------|-----------|----------|
| `center` | `.rb-center` | Centrerad div |
| `minne` | `.rb-minne` | Minnesblock |
| `quote` | `.rb-quote` | Blockquote |
| `part` | — | Tom rendering (separator) |
| `accordion` | `.rb-accordion` | `<details>/<summary>`-block med "Läs mer"-etikett. Extraherar första stycket som summary, resten som dolt innehåll |
| `indent` | `.rb-indent` | Indenterad div |
| `poem` | `.rb-poem` | Diktblock |
| `video` | `.rb-video` | Videocontainer |

Dessutom: `markdown-it-implicit-figures` (bilder med alt-text → `<figure>` + `<figcaption>`) och lazy-loading på alla bilder.

### Eleventy Collections

| Collection | Beskrivning |
|------------|-------------|
| `biografiPages` | Alla sidor (1–276) med innehåll från kapitelkällfiler. Varje objekt har: `page.number`, `anchor`, `yearGroup`, `mediaPage`, `templateContent` |
| `biografiAll` | Samma som ovan men inkluderar placeholders för sidor utan innehåll (tom `templateContent`) |
| `biografiSegments` | Segmentbaserad uppdelning: Prolog (sida 1–4) + 10 årsgrupper + Epilog (sida 276). Varje segment har `id`, `type`, `label`, `start`, `end`, `pages[]`. **Primär datakälla för läsaren** |
| `yearGroupMap` | Årsgrupper med `yearGroup`-etikett och `firstPage` (används ej aktivt) |
| `minnen` | Sidor taggade med "minne" |

### Globala Data

| Data | Beskrivning |
|------|-------------|
| `TOTAL_PAGES` | 276 — exponeras till alla templates |
| `bioRedirectPages` | Array med `{ page, anchor }` för sida 1–276 (redirect-generering) |

### Filters

| Filter | Beskrivning |
|--------|-------------|
| `pad3` | Nollpaddar tal |
| `bioRender` | Renderar biografitext (custom markdown) |
| `segmentsMeta` | Strippar pages-array, returnerar bara `{ id, type, label, start, end }` |
| `json` | JSON.stringify (för inline script-taggar) |

---

## Data: `_data/chapters.js`

Exporterar en array med 20 kapitelobjekt:

| Fält | Typ | Beskrivning |
|------|-----|-------------|
| `id` | number | Kapitelindex (0–19) |
| `title` | string | Kapitelnamn (t.ex. "Prolog", "Välfärdets barn") |
| `start` | number | Första sidan i kapitlet |
| `end` | number | Sista sidan i kapitlet |

Kapitel 0 (Prolog) och 19 (Epilog) är korta (1–3 sidor), kapitel 17–18 är långa (27–28 sidor).

---

## Layouts (Nunjucks)

### Arvshierarki

```
base.njk (root)
├── biography.njk    ← Fullskärms e-boksläsare
├── home.njk         ← Landningssida med video-hero
├── appendix.njk     ← Appendix-index med sidnavigering
├── memory.njk       ← Enskilt minne
├── minnen.njk       ← Minnen-hub
└── page.njk         ← Generisk sida
```

### `base.njk` — Rotlayout

Wrappas kring allt. HTML-struktur med `<head>` (charset, viewport, titel, meta description, CSS), `<body>` med valfri header/footer.

**Variabler:**
- `title` (default: "Rolf Börjlind")
- `teaser` / `description` → meta description
- `bodyClass`, `mainClass` → CSS-klasser
- `noHeader`, `noFooter` → döljer header/footer

**Inkluderar:** `header.njk`, `footer.njk`
**Laddar:** `nav.js` och `bio-reader.js` (deferred)

### `biography.njk` — E-boksläsaren

Fullskärmsvy utan header/footer. Renderar alla 276 sidor i segment.

**Front matter:** `bodyClass: ""`, `mainClass: "rb-main-full"`, `noHeader: true`, `noFooter: true`

**Struktur:**
1. Inlineat script med segment-metadata (JSON)
2. Cover-page (segment 0) med titel + författare
3. Alla segment med page-anchors, bio-rendered innehåll
4. Reader bar med titel, sidindikator, TOC-toggle
5. TOC-panel (include)

**Data:** `collections.biografiSegments`
**Filter:** `segmentsMeta`, `json`, `bioRender`
**Inkluderar:** `bio-toc.njk`

### `home.njk` — Startsida

Hero-sektion med autoplaying bakgrundsvideo (från CDN), mörkt overlay, centrerad titel och CTA-knapp.

**Front matter:** `bodyClass: "rb-hub-bg"`, `mainClass: "h-full"`

### `appendix.njk` — Appendix

Section-layout med reader-bar (Meny/Innehåll-knappar), site-nav (vänster drawer) och section-toc (höger drawer). 18 TOC-items: 7 decennier (60-talet–20-talet) + 10 mediekategorier (Böcker, Konst, Föreställningar, Tv, Radio, Biofilmer, Scen, Musik, Tidningar/Tidskrifter, Övrigt) + Utmärkelser. Använder `rb-section-container` (628px centrerad).

**Inkluderar:** `site-nav.njk`, `section-toc.njk`

### `memory.njk` — Enskilt minne

Artikellayout med titel, valfri period, teaser och prosa-innehåll. Använder `rb-section-container`.

### `minnen.njk` — Minnen-hub

Section-layout med reader-bar, site-nav (vänster drawer) och section-toc (höger drawer). 3 TOC-items: Kusinen, Den osynlige, En vacker yngling. Använder `rb-section-container` (628px centrerad).

**Inkluderar:** `site-nav.njk`, `section-toc.njk`

### `page.njk` — Generisk sida

Enkel layout med titel och prosa.

---

## Includes (Nunjucks)

| Fil | Beskrivning | Används av |
|-----|-------------|-----------|
| `header.njk` | Sajt-header med logotyp, menyknapp (SVG), navigeringspanel (Start, Biografi, Minnen, Appendix). Data-attribut: `data-header`, `data-nav-toggle`, `data-nav-panel` | `base.njk` |
| `footer.njk` | Copyright-footer med dynamiskt år (inline JS) | `base.njk` |
| `site-nav.njk` | Delad site-navigation (Meny-drawer). Glider in från **vänster** sida. Innehåller länkar till Start, Biografi, Minnen, Appendix. Öppnas via Meny-knappen i reader-baren. CSS: `transform: translateX(-100%)` → `translateX(0)` | `appendix.njk`, `minnen.njk` |
| `section-toc.njk` | Section-specifik innehållsförteckning (TOC-drawer). Glider in från **höger** sida. Renderar `tocItems`-array med ankarlänkar. Öppnas via Innehåll-knappen i reader-baren | `appendix.njk`, `minnen.njk` |
| `bio-toc.njk` | TOC-panel med segmentnavigering. Visar alla segment med sidintervall och etikett. Data-attribut: `data-toc-panel`, `data-toc-segment`, `data-toc-close` | `biography.njk` |
| `bio-controls.njk` | Topbar för biografiläsaren med boktitel och TOC-toggle. Data-attribut: `data-controls`, `data-toc-toggle` | **Legacy — ej inkluderad i nuvarande biography.njk** |
| `bio-page.njk` | Sidkomponent med anchor, metadata, bioRender-filter. Fallback-placeholder om innehåll saknas | **Legacy — ej inkluderad i nuvarande biography.njk** |
| `hub-grid.njk` | Grid med 3 navigationskort (Biografi, Minnen, Appendix) | **Legacy — ej inkluderad** |

---

## JavaScript

### `assets/js/bio-reader.js` — Biografiläsarens klientlogik

IIFE som hanterar scroll-baserad positionsuppdatering och TOC-navigation.

**Nyckelfunktioner:**

| Funktion | Beskrivning |
|----------|-------------|
| `setYearLabel(segmentId)` | Uppdaterar årsetiketten i reader-baren baserat på segment |
| `binarySearchLastAtOrBefore(list, targetY)` | Binärsökning för att hitta aktuellt segment/sida baserat på scroll-position. Probe-punkter: 35% ner i viewport (segment), 28% (sidnummer) |
| `recomputePositions()` | Räknar om alla elements offsetpositioner (segment + page anchors) |
| `updateFromScroll()` | Uppdaterar etiketter och footer vid scroll |
| `scheduleRecompute()` | Använder `requestAnimationFrame` för position-uppdatering |
| `onScroll()` | Throttlad scroll-hantering med rAF |
| `wireToc()` | Kopplar klick-lyssnare till TOC-knappar med smooth scroll |
| `wireReflowTriggers()` | Registrerar resize- och bild-load/error-handlers |

**State:** Closure-variabler `currentSegmentId`, `currentPageNumber`, rAF-IDs.
**Early exit:** Kör bara om `document.body.dataset.biography` finns.
**Beroenden:** Inga externa — ren vanilla JS.

### `assets/js/nav.js` — Sajtnavigation

IIFE som hanterar hamburgarmeny-toggle.

**Nyckelfunktioner:**

| Funktion | Beskrivning |
|----------|-------------|
| `setOpen(open)` | Togglear `.rb-nav-open` på `<html>`, uppdaterar `aria-expanded` och knapptext ("Stäng"/"Meny") |

**Eventlyssnare:**
- Klick på menyknapp → toggle
- Klick på stäng-knapp → stäng
- ESC-tangent → stäng
- Klick på bakgrund → stäng
- Klick på navigationslänk → stäng
- Scroll → toggle `.is-scrolled` på header (>10px)

### `assets/js/section-reader.js` — Section-sidornas klientlogik

Hanterar interaktivitet för Appendix och Minnen: site-nav drawer (vänster), section-toc drawer (höger), och smooth-scroll till ankarlänkar.

**Nyckelfunktioner:**
- Öppna/stäng site-nav via Meny-knappen
- Öppna/stäng section-toc via Innehåll-knappen
- TOC-ankarlänkar scrollar till rätt `<div id="...">` med offset
- ESC stänger öppna drawers
- Klick på overlay stänger drawers

### `scripts/check-frontmatter.js` — Frontmatter-validering

Node.js-skript som verifierar att alla `page-*.md` i `content/pages/biografi/pages/` har `yearGroup:`-fält. Returnerar exit code 1 om fält saknas.

### `scripts/validate-build.js` — Byggvalidering

Post-build-skript som inspekterar `_site/biografi/index.html` och verifierar:
- `data-page-indicator` finns (READER-06)
- `id="rb-year-groups"` script-tagg finns (NAV-02)
- (Strict mode) Exakt en `.rb-bio-page.is-active` (READER-01)

---

## CSS: `assets/css/main.css`

Handskriven plain CSS som ersätter Tailwind (Fas 1). Organiserad i sektioner:

### Design Tokens (Custom Properties)

| Token | Värde | Beskrivning |
|-------|-------|-------------|
| `--color-dark` | `#1c1d1e` | Bakgrund biografi |
| `--color-hub` | `#282828` | Bakgrund hub/start |
| `--color-light` | `#fdf9f0` | Textfärg (varm off-white) |
| `--rb-accent` | `#4169e1` | Accentfärg |
| `--rb-body-size` | `1.0625rem` (17px) | Brödtextstorlek |
| `--rb-body-leading` | `1.72` | Radavstånd |
| `--rb-measure` | `65ch` | Maximal radlängd |
| `--header-h` | `56px` (mobil) / `98px` (desktop) | Header-höjd |

**Fonter:** "Iowan Old Style", Palatino, serif (serif-stack för läsbarhet).

### Sektioner

1. Custom Properties / Design Tokens
2. Minimal Reset (box-sizing, margin/padding, form, media)
3. Base/Global (dark bg, serif, responsive font-size)
4. Hub Background (video, pattern, overlay)
5. Navigation (header, nav-panel, toggle)
6. Hero
7. Hub Grid / Cards
8. Reader (bio-container, segments, pages, reader-bar)
9. TOC Panel (bio-toc)
10. Typography / Prose
11. Komponenter (accordion, quote, poem, indent, center, minne, video embed)
12. Memory / Appendix
13. Section Reader (rb-section-reader-wrap, rb-section-container, site-nav drawer, section-toc drawer)
14. Footer

### Nyckelkomponenter (session 2)

| Komponent | CSS-klass | Beskrivning |
|-----------|-----------|-------------|
| Reader-bar grid | `.rb-reader-bar` | `grid-template-columns: auto 1fr auto` — knappar krymper till content-storlek |
| Section-container | `.rb-section-container` | `max-width: 628px; margin: 0 auto` — matchar biografins bredd |
| Section-reader-wrap | `.rb-section-reader-wrap` | Full-höjd flex-column wrapper för Appendix/Minnen |
| Site-nav drawer | `.rb-site-nav-content` | Vänster-glidande drawer (`left: 0; transform: translateX(-100%)`) |
| Section-toc drawer | `.rb-section-toc-content` | Höger-glidande drawer (`right: 0; transform: translateX(100%)`) |
| Page title/content | `.rb-page-title-wrap`, `.rb-page-content` | Responsiv padding via `--rb-inline-inset-desktop` / `--rb-inline-inset-mobile` |

---

## Python-skript (engångsskript)

Dessa användes för OCR-import och datarensning — inte en del av den löpande builden.

### Importpipeline

| Ordning | Skript | Beskrivning |
|---------|--------|-------------|
| 1 | `import-biography.py` | Delar monolitisk biografifil (`assets/biografi_full_export.md`) i 276 individuella sidor. Parsear `## Page N/276`-markers. Skapar `page-NNN.md` med frontmatter |
| 2 | `add-frontmatter-to-html.py` | Lägger till YAML frontmatter på HTML-sidor (page number, anchor, tags) |
| 3 | `fix-formatting.py` | Fixar trasig bold/italic-markup, tar bort `---`, konverterar dialogstreck till tankstreck |
| 4 | `fix-spacing.py` | Stor flerstegs-fix för saknade mellanslag runt svenska tecken (å, ä, ö), pronomen, prepositioner, skiljetecken |
| 5 | `fix-spacing-3.py` | Tredje pass för kvarvarande konkatenerings-problem med "på", "så", "också" |
| 6 | `fix-spacing-and-urls.py` | Fixar mellanslag runt svenska tecken + uppdaterar Cloudflare R2 media-URLs till ny domän |
| 7 | `fix-swedish-chars-and-frontmatter.py` | Fixar uppdelade svenska tecken (" å " → "å") och standardiserar frontmatter |

### Sidhantering

| Skript | Beskrivning |
|--------|-------------|
| `renumber-pages.py` | Skiftar alla sidor NER med 1 (002→001, 003→002, etc.) |
| `shift-up-pages.py` | Skiftar alla sidor UPP med 1 (001→002, 002→003, etc.) |
| `scripts/fix_biography_chapter_spacing.py` | Konservativa typografi-/mellanrumsfixar på kapitelkällfiler (`chapter-*.md`). 53+ regex-mönster |

### Funktioner i Python-skript

**`import-biography.py`:**
- `parse_biography_file(input_file)` → lista av `(page_num, content)`
- `create_page_file(page_num, content, output_dir)` → skapar `NNN.md`

**`fix-formatting.py`:**
- `fix_page(filepath)` → sammanfogar trasiga markers, tar bort HR, fixar dialog

**`fix-spacing.py`:**
- `fix_page(filepath)` → 12+ fixkategorier för svenska tecken och konkatenering

**`fix-spacing-3.py`:**
- `fix_page(filepath)` → regex-fixar för "på/så/också" + substantiv

**`fix-spacing-and-urls.py`:**
- `fix_spacing(text)` → mellanrumsfixar
- `update_media_urls(text)` → URL-migration
- `process_file(filepath)` → kombinerar båda

**`fix-swedish-chars-and-frontmatter.py`:**
- `fix_swedish_characters(text)` → fixar uppdelade å/ä/ö
- `update_frontmatter(content, page_num)` → ny standardiserad frontmatter
- `process_file(filepath)` → kombinerar båda

**`scripts/fix_biography_chapter_spacing.py`:**
- `split_frontmatter(content)` → separerar YAML och body
- `apply_patterns(body)` → 53+ regex-mönster
- `fix_file(path)` → applicerar mönster och sparar

---

## Dokumentation

### `/docs/`

| Fil | Beskrivning |
|-----|-------------|
| `decisions.md` | MVP-beslut: Eleventy-arkitektur, anchor-system (`p-001`–`p-276`), render-markers, scroll-restoration, färgpalett |
| `deploy-cloudflare.md` | Deploy-instruktioner med redirect-regler för legacy-URLs |
| `deploy-github-pages.md` | GitHub Actions-workflow: push → build → deploy |
| `qa-checklist.md` | QA-checklista (svenska): build, navigation, biografi, responsivitet |
| `style-audit.md` | Detaljerad stilextraktion från live-sajter med hex-värden, typografi, komponentspecifikation |

### `/.planning/`

| Fil | Beskrivning |
|-----|-------------|
| `PROJECT.md` | Projektöversikt, krav (validerade/aktiva/out-of-scope), constraints, nyckelbeslut |
| `STATE.md` | Aktuell status: 100% av milstolpe v1.0, fas 3 klar, fas 2 har gap mot spec |
| `ROADMAP.md` | Vägkarta: fas 1 klar, fas 2 delvis (segment-scroll vs swipe), fas 3 klar |
| `REQUIREMENTS.md` | Alla v1-krav med status: CSS-01–04 ✓, DESIGN-01–07 ✓, READER-01–09 (7 av 9 gap), NAV-01–04 ✓, LAYOUT-01–02 ✓, TECH-01 ✓ |

### `/.planning/research/`

| Fil | Beskrivning |
|-----|-------------|
| `ARCHITECTURE.md` | Arkitekturdesign: single-page med JS visibility toggle rekommenderas. Komponentgränser, dataflöde, state-schema |
| `FEATURES.md` | Feature-prioritering: table stakes (paging, keyboard, TOC), differentiators (media pages, transitions), anti-features (search, TTS) |
| `PITFALLS.md` | 14 identifierade risker: iOS Safari swipe-konflikt, Tailwind prose-collapse, localStorage-konflikt, hårdkodat sidantal, DOM-jank |
| `STACK.md` | Stackrekommendationer: Pointer Events API, plain CSS, zero runtime-beroenden. Detaljerad implementationsguide |
| `SUMMARY.md` | Exekutiv sammanfattning: två sekventiella faser, HIGH confidence, roadmap-ready |

---

## Routes

| URL | Layout | Beskrivning |
|-----|--------|-------------|
| `/` | `home.njk` | Startsida med video-hero |
| `/biografi/` | `biography.njk` | E-boksläsaren (276 sidor) |
| `/minnen/` | `minnen.njk` | Minnen-index |
| `/minnen/{slug}/` | `memory.njk` | Enskilt minne |
| `/appendix/` | `appendix.njk` | Appendix |

---

## Status (2026-03-31)

v1.0 milestone komplett. Segment-scroll-modellen formaliserad som målbild.

**Alla v1-krav uppfyllda:** CSS-01–04, DESIGN-01–07, READER-01–03 (omskrivna för scroll), READER-06, READER-10, NAV-01–04, LAYOUT-01–02, TECH-01.
**Deferred till v2:** READER-07 (localStorage restore → V2-01).

**v2-backlog:** localStorage läspositions-restore, URL per sida (djuplänkning), hoppa till sidnummer, förbättrad TOC-animering.

---

## Sessionslogg: 2026-03-31 (session 2)

Ändringar gjorda i denna session:

### 1. Reader-bar grid-fix
- `grid-template-columns` ändrad till `auto 1fr auto` så Meny/Innehåll-knappar inte stretchar full-width.

### 2. Enhetlig container-bredd
- Appendix och Minnen delar nu samma `max-width: 628px` centrerad container som biografin.
- Ny CSS-klass `.rb-section-container` och `.rb-section-reader-wrap`.
- Responsiv padding via `--rb-inline-inset-desktop` / `--rb-inline-inset-mobile`.

### 3. Navigation — delad drawer-modell
- **Meny** (site-nav): glider in från **vänster** sida (`site-nav.njk`).
- **Innehåll** (section-toc): glider in från **höger** sida (`section-toc.njk`).
- Två separata inkluderingsfiler, används av både `appendix.njk` och `minnen.njk`.

### 4. Appendix — komplett innehåll från live-sajten
- Hämtade allt innehåll från `rolfborjlind.com/appendix/` via Chrome MCP.
- Lade till 10 mediekategorier: Böcker, Konst, Föreställningar, Tv, Radio, Biofilmer, Scen, Musik, Tidningar/Tidskrifter, Övrigt.
- Uppdaterade Utmärkelser-sektionen.
- 18 TOC-items med matchande anchor-divs (`<div id="bocker">`, etc.).
- Fixade saknat år 2003 i kronologisk del.

### 5. Minnen — kompletta dikter från live-sajten
- Hämtade fullständiga dikter från individuella sidor:
  - `/minnen-kusinen/` — redan komplett lokalt (~688 rader).
  - `/minnen-den-osynlige/` — ersatte kort inkomplett version med full dikt (28 622 tecken, ~67 strofer).
  - `/minnen-en-vacker-yngling/` — ersatte `{TEXT HÄR}`-placeholder med full dikt (64 441 tecken).
- Format: strofer separerade med `<div class="stars">***</div>`, stycken med blankrader.

### Berörda filer

| Fil | Typ av ändring |
|-----|---------------|
| `assets/css/main.css` | Grid-fix, section-container, drawer-riktning, responsiv padding |
| `layouts/appendix.njk` | 18 TOC-items, site-nav + section-toc includes |
| `layouts/minnen.njk` | 3 TOC-items, site-nav + section-toc includes |
| `includes/site-nav.njk` | Ny — delad meny-drawer (vänster) |
| `includes/section-toc.njk` | Ny — section-specifik TOC-drawer (höger) |
| `assets/js/section-reader.js` | Ny — klientlogik för drawers och ankarlänkar |
| `content/pages/appendix.md` | Komplett innehåll: 7 decennier + 10 kategorier + utmärkelser |
| `content/pages/minnen/index.md` | 3 kompletta dikter (totalt ~95 000 tecken) |
