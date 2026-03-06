# Rolf Börjlind — Biografisite

Statisk site byggd med **Eleventy 3** + handskriven CSS. Ingen Tailwind längre.

---

## Struktur

```
borjlind/
  content/
    pages/
      index.md
      appendix.md
      minnen/
      biografi/
        index.md
        pages/
          page-1.md … page-276.md
  layouts/
    base.njk
    biography.njk       ← e-boksläsaren
    home.njk
    appendix.njk
    memory.njk
    minnen.njk
  includes/
    header.njk
    footer.njk
    bio-controls.njk    ← topbar (boktitel + hamburgare)
    bio-toc.njk         ← kapitel-TOC overlay
    bio-page.njk        ← (kvar men oanvänd av biography.njk)
  assets/
    css/main.css
    js/bio-reader.js
    js/nav.js
  _data/
    chapters.js         ← 20 kapitelsdefinitioner (id, title, start, end)
  .eleventy.js
  package.json
```

---

## Routes

| URL | Sida |
|-----|------|
| `/` | Startsida |
| `/biografi/` | E-boksläsaren |
| `/minnen/` | Minnen-index |
| `/minnen/{slug}/` | Enskilt minne |
| `/appendix/` | Appendix |

---

## E-boksläsaren (`/biografi/`)

### Arkitektur

Läsaren är en fullskärms (`100dvh`) Eleventy-renderad sida utan header eller footer. Den består av:

- **Topbar** (`bio-controls.njk`) — boktitel vänster, hamburgarmeny höger. Transparent bakgrund med `backdrop-filter: blur`.
- **Läsaryta** (`rb-bio-container`) — CSS columns-baserad paginering.
- **Bottombar** — `← | sida/total — kapitelnamn | →`. Transparent.
- **TOC-panel** (`bio-toc.njk`) — helskärmsoverlay med kapitelnavigation.

### Kapitelstruktur

Definieras i `_data/chapters.js` — 20 kapitel som täcker sidorna 1–276:

| Id | Titel | Sidor |
|----|-------|-------|
| 0 | Prolog | 1–3 |
| 1 | Släktarvet | 4–6 |
| 2 | Välfärdets barn | 7–27 |
| 3 | Mötet med Carsten | 28–39 |
| 4 | Lanthandeln i Ekskogen | 40–55 |
| 5 | J'accuse! – Moderna Museet | 56–70 |
| 6 | Vägen till Amerika | 71–83 |
| 7 | San Francisco & poesins väst | 84–95 |
| 8 | Genom öken och berg | 96–110 |
| 9 | Återkomst till Sverige | 111–120 |
| 10 | Film och Gösta Ekman | 121–138 |
| 11 | Brödskrivaren | 139–153 |
| 12 | Sibirsk väg | 154–165 |
| 13 | Beck växer fram | 166–180 |
| 14 | Karriär och självinblick | 181–193 |
| 15 | Beck triumferar | 194–210 |
| 16 | Karriärbalansen | 211–220 |
| 17 | Operan och världens möte | 221–248 |
| 18 | Beck till sist | 249–275 |
| 19 | Epilog | 276 |

### CSS columns-paginering

Varje aktivt kapitel får `column-fill: auto` och `column-width` satt av JS till elementets `clientWidth` (max 628px). Innehållet flödar automatiskt in i kolumner baserat på viewport-höjden — antalet skärmsidor per kapitel varierar per enhet. JS navigerar via `scrollLeft`.

- `break-inside: avoid` på `figure`, `.rb-yt-embed`, `.rb-accordion`, `.rb-minne`
- `break-before/after: column` på mediesidor (`mediaPage: true`)

### State / localStorage

```js
// Sparas som:
localStorage['bio:pos'] = JSON.stringify({ chapter: 3, page: 1 })
// chapter = kapitelindex (0-19)
// page    = kolumnindex inom kapitlet (0-N, N beror på viewport)
```

Vid resize clampar JS sidan till `[0, nyTotalSidor-1]` och re-initierar kolumner.

### Markdown-rendering

`bioRender`-filtret i `.eleventy.js` hanterar:
- `[MORE]` → `<details class="rb-more-block">` (expanderbart innehåll)
- `[yt-video][URL]` → responsiv YouTube-embed
- `::: center / indent / poem / quote / minne / accordion / part :::` → semantiska block

---

## Eleventy-collections

| Collection | Innehåll |
|------------|----------|
| `biografiPages` | Alla sidor sorterade efter nummer |
| `biografiAll` | 1–276 inklusive placeholders |
| `biografiChapters` | Sidor grupperade per kapitel (används av läsaren) |
| `yearGroupMap` | Årsgrupper (används ej aktivt längre, men kvar) |
| `minnen` | Minnen-sidor |

---

## Utveckling

```bash
npm install
npm run dev     # startar Eleventy dev-server
npm run build   # bygger till _site/
```

---

## Föreslagna nästa steg

### 1. Finjustera CSS columns-pagineringen
CSS columns kan ibland dela stycken på oväntade ställen. Testa noggrant på mobil, tablet och desktop. Justera `padding` och `break-*`-regler per innehållstyp.

### 2. Mediesidor
Sidor med `mediaPage: true` i frontmatter ska ta upp en hel skärm. Verifiera att `break-before: column; break-after: column` fungerar som förväntat för alla bildtunga sidor. Eventuellt behöver bilderna `max-height: 100%` för att inte överflöda.

### 3. Accordion-hantering inom CSS columns
När en accordion expanderas ändras kolumnlayouten dynamiskt. JS behöver lyssna på `<details>` toggle-event och re-beräkna `getPageCount` samt justera `scrollLeft` om sidan förändras.

### 4. TOC — aktiv markering
Markera aktivt kapitel i TOC-panelen med en `.is-active`-klass när det är öppet.

### 5. Kapitelgränser — redaktionell genomgång
Kapitel 0 (Prolog, 3 sidor), kapitel 1 (Släktarvet, 3 sidor) och kapitel 19 (Epilog, 1 sida) är korta. Kapitel 17 (28 sidor) och 18 (27 sidor) är långa. Överväg att justera gränserna i `_data/chapters.js`.

### 6. Typografi och läskomfort
Justera radlängd, radavstånd och teckenstorlek per enhet för optimal läsbarhet inom 628px-kolumnen. Serif-fonten är rätt val — säkerställ att den laddas korrekt.

### 7. Deploy
Konfigurera CI/CD (`.github/workflows/deploy.yml.disabled` finns men är inaktiverad). Verifiera byggsteget och aktivera deploy till Cloudflare Pages eller GitHub Pages.
