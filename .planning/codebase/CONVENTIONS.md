# Kod- och innehållskonventioner

**Analysdatum:** 2026-03-06

## Översikt

Projektet är en statisk Eleventy 3-sajt med handskriven CSS och små browser-script i vanilla JavaScript. Konventionerna är praktiska snarare än formellt verktygsstyrda: ingen linter, ingen formatter och inga typkontroller syns i kodbasen. I stället hålls stilen ihop av återkommande mönster i filnamn, frontmatter, CSS-prefix och hur innehåll renderas i `.eleventy.js`.

## Fil- och namngivningsmönster

### Kod och templates

- Konfigurationsfilen är CommonJS-baserad och ligger i projektroten: `.eleventy.js`.
- Browser-script ligger i `assets/js/` och använder kebab-case i filnamn: `bio-reader.js`, `nav.js`.
- CSS ligger samlat i en handskriven fil: `assets/css/main.css`.
- Nunjucks-layouts och includes använder små bokstäver och oftast kebab-case: `home.njk`, `biography.njk`, `bio-controls.njk`, `bio-toc.njk`.

### Content

- Vanliga sidor ligger som Markdown under `content/pages/`.
- Minnessidor använder slug-baserade filnamn i kebab-case, till exempel `filmsetet.md` och `vagen-hem.md`.
- Biografisidor ligger under `content/pages/biografi/pages/` och följer mönstret `page-N.md`, utan nollutfyllnad i filnamnet.
- Ankare för biografisidor följer `p-NNN` med tre siffror i frontmatter, till exempel `p-001`. Sidnummer i `anchor` är alltså striktare formaterade än själva filnamnen.

## JavaScript-konventioner

### Syntax och struktur

- Browser-JS kapslas i självexekverande funktioner för att undvika globala namn:
  - `(() => { ... })();`
  - `(function () { ... })();`
- Variabler och funktionsnamn använder `camelCase`.
- Konstanter använder `ALL_CAPS` när de representerar global eller långlivad konfiguration, till exempel `TOTAL_CHAPTERS`, `KEY`, `EDGE_PX`.
- Hjälpfunktioner hålls små och lokala till modulen, till exempel `clamp`, `getPageCount`, `setOpen`.

### DOM-hooks

- JavaScript binder primärt mot `data-*`-attribut, inte stylingklasser.
- Hook-namn använder kebab-case, till exempel:
  - `data-biography`
  - `data-prev`
  - `data-next`
  - `data-page-indicator`
  - `data-toc-panel`
  - `data-nav-toggle`
  - `data-nav-panel`
- Klassen används främst för presentation och state, till exempel `.is-active`, `.is-open`, `.rb-nav-open`, `.is-scrolled`.

### Kodstil

- Indentering är 2 mellanslag i JavaScript.
- Semikolon används konsekvent.
- Kommentarer beskriver främst blocksyfte eller implementationens avsikt, ofta som sektionsrubriker:
  - `// --- TOC ---`
  - `// Ignore non-site markdown`
- Defensive `try/catch` används där fel ska kunna ignoreras utan att bryta UI, särskilt kring `localStorage` och JSON-parsning.

## Eleventy- och Markdown-konventioner

### CommonJS och registrering

- `.eleventy.js` använder `require(...)` och `module.exports = function (eleventyConfig) { ... }`.
- Plugins, filter, collections och global data registreras direkt i exportfunktionen.
- Ignore-regler definieras explicit i konfigurationen, bland annat för `README.md` och `.planning/**`.

### Collections och single source of truth

- `TOTAL_PAGES = 276` är hårdkodat i `.eleventy.js` och används som central källa för biografins sidomängd.
- Collections byggs från taggar och sidmetadata:
  - `minnen` från `tag: minne`
  - `biografiPages` från `tag: biografiPage`
  - `biografiAll` fyller ut luckor 1..276 med placeholders
  - `biografiChapters` grupperar sidor enligt `_data/chapters.js`
- Hjälpfilter hålls små och rena, till exempel `pad3`, `json`, `chaptersMeta`, `bioRender`.

### Anpassad Markdown-rendering

- Markdown renderas med `markdown-it` och `html: true`, vilket betyder att rå HTML i innehåll accepteras.
- Bilder får `loading="lazy"` via custom renderer.
- `markdown-it-implicit-figures` används för att göra bilder med alt-text till `<figure>` med `<figcaption>`.
- Projektet använder egna container-konventioner via `markdown-it-container`:
  - `::: center`
  - `::: indent`
  - `::: poem`
  - `::: quote`
  - `::: minne`
  - `::: accordion`
  - `::: video`
  - `::: part`
- `[MORE]` används i innehåll för att dela upp text i huvuddel och expanderbar fortsättning.
- `[yt-video][URL]` ersätts i `bioRender` med responsiv YouTube-embed.

## Frontmatter- och innehållskonventioner

### Vanliga sidor

- Vanliga sidor använder enkel YAML-frontmatter med `title`, `layout`, `permalink` och ibland `description` eller `teaser`.
- Exempel:
  - `content/pages/index.md`
  - `content/pages/appendix.md`
  - `content/pages/biografi/index.md`

### Minnen

- Minnessidor använder konsekvent:
  - `title`
  - `slug`
  - `period`
  - `teaser`
  - `tags: [minne]`
- `[MORE]` förekommer i minnen för att skapa kort ingress plus expanderbart innehåll.
- Tonen i innehållet är redaktionell/litterär och texten skrivs på svenska.

### Biografi

- Biografisidor använder konsekvent frontmatter med:
  - `page.number`
  - `anchor`
  - `permalink: false`
  - `tags: [biografiPage]`
  - `layout: biography`
  - ofta `yearGroup`
- `anchor` följer mönstret `p-NNN`.
- `yearGroup` skrivs som intervallsträng, till exempel `"1942–1955"` och används för TOC-data.
- Innehållet blandar löptext, bilder, YouTube-länkar och specialcontainrar i Markdown.
- Innehållet är inte fullt normaliserat språkligt; flera sidor innehåller OCR-liknande mellanrumsfel eller sammanskrivningar. Det är därför en faktisk innehållsegenskap som dokumentationen bör räkna med, inte ett undantag.

## CSS-konventioner

### Grundprincip

- CSS är handskriven plain CSS, inte genererad Tailwind-output.
- Filen är uppdelad i numrerade sektioner med blockkommentarer.
- `:root` definierar design tokens för färg, typografi och reader-specifika värden.

### Namngivning

- Komponent- och projektklasser prefixas med `rb-`, till exempel:
  - `.rb-header`
  - `.rb-nav-toggle`
  - `.rb-card`
  - `.rb-bio-page`
  - `.rb-accordion`
  - `.rb-minne`
- State-klasser använder kortare semantiska namn utan prefix, till exempel:
  - `.is-scrolled`
  - `.is-active`
  - `.is-open`
- Några utility-liknande klasser förekommer, till exempel `.h-full`, men projektet bygger inte på ett utility-first-system.

### Layout och reader-mönster

- Biografiläsaren bygger på CSS columns där aktivt kapitel får `column-width` satt från JS.
- Regler som `break-inside`, `break-before` och `break-after` används för att styra hur innehåll bryts över kolumner.
- Responsiva justeringar görs direkt i CSS via `@media`, särskilt för mobil padding och containment i läsaren.

## Kommentar- och dokumentationsstil

- Kommentarer används sparsamt men konsekvent för att markera sektioner och förklara icke-trivial logik.
- Inline-kommentarer förekommer där implementationen annars är svår att läsa, exempelvis i `.eleventy.js` kring accordion-rendering och collections.
- CSS-kommentarerna fungerar som innehållsförteckning över filens sektioner.

## Praktiska tumregler som kodbasen följer idag

- Lägg ny browserlogik i små, fristående script i `assets/js/`.
- Använd `data-*`-attribut för JS-hooks och `rb-`-prefix för nya komponentklasser.
- Behåll CommonJS-stilen i `.eleventy.js`.
- Följ befintlig frontmatter-struktur exakt för nya `minne`- och `biografiPage`-dokument.
- Behåll svenska som innehållsspråk och respektera att textmassan i biografin kan innehålla importerade/OCR-påverkade formuleringar.
- Om ny reader-funktionalitet läggs till bör den passa befintliga state-mönster: lokal modulstate, `localStorage`, och klassbaserad UI-state.
