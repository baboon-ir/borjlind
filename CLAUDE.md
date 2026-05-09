# CLAUDE.md — borjlind

## Vad detta är
Rolf Börjlinds självbiografi som statisk site. Eleventy 3, handskriven CSS (ingen Tailwind, inget ramverk utöver Eleventy + markdown-it-plugins). Svenska. v1.0 är komplett och i produktion.

Kärnvärde: läsupplevelsen ska kännas som att hålla en bok i handen.

## Absolut regel
**Utför inga ändringar på eget initiativ. Konfirmera alltid eller fråga Håkan-Filip först.**

Det gäller även "små" rättningar, refactoring, struktur, beroenden, CSS-justeringar. Vid minsta tvekan — fråga innan du rör.

## Att göra utan att fråga
- Läsa filer, köra `npm run dev` / `npm run build` lokalt
- Ställa förtydligande frågor
- Föreslå alternativ i text
- Rapportera observationer, buggar, inkonsekvenser
- Ta read-only inventeringar (greps, build-output-koll, HEAD-checks mot publika resurser)

## Att alltid fråga om
- Faktiska ändringar i innehåll, CSS, JS, layouts, partials
- Dependencies (lägga till / uppgradera / ta bort)
- Struktur- eller fil-flyttar
- Deploy-konfiguration på Cloudflare (Pages eller R2)
- R2-uploads
- Merge till `main`
- Applicering av .docx-rättningar på kapitelfiler

## Rättningsworkflow för Rolfs .docx
Det här är den mest projektspecifika operationen — läs noga innan du rör en kapitelfil.

**Kedja:**
1. Rolf skickar `.docx` via Håkan-Filip.
2. Håkan-Filip lägger filen lokalt utanför repot (filen ska *inte* checkas in).
3. Strikethrough-text (`<w:strike/>`) markerar text som ska tas bort — den försvinner spårlöst om man kör `textutil -convert txt`. Använd inte `textutil`.
4. Korrekt extraktion: unzippa `.docx` (det är en zip-arkiv), öppna `word/document.xml`, parsa på `<w:strike/>` för att hitta exakt vilka run:s som är genomstrukna.
5. Applicera ändringarna manuellt i `content/pages/biografi/chapters/chapter-NN-*.md`.
6. **Confirma med Håkan-Filip innan du committar texträttningar.**

Det finns ett parser-script för det här flödet, men det är inte komplett — fråga Håkan-Filip om aktuell status innan du försöker använda det.

## Arkitektur

```
content/pages/biografi/chapters/*.md   ← källan till biografin (276 sidor i 21 kap)
content/pages/minnen/                  ← 4 dikter
content/pages/appendix.md              ← appendix
content/pages/index.md                 ← startsida
_data/chapters.js                      ← kapitelindex (id, titel, start, end)
_data/site.js                          ← site-meta (url, title)
includes/                              ← delade njk-partials (header, nav, TOC)
layouts/                               ← sidlayouts (base, biography, home m.fl.)
assets/css/main.css                    ← all styling, ~2 100 rader
assets/js/                             ← bio-reader, section-reader, nav
assets/images/                         ← favicon, divider, og-image-general, pattern m.m.
.eleventy.js                           ← config + custom markdown-containers + filter
```

Routes: `/`, `/biografi/`, `/minnen/`, `/appendix/` (+ redirects `/biografi/N/` → ankare).

## Läsararkitektur

Biografin är **scroll-driven, inte paged/swipe**. Anledningen: läsaren ska kännas som en e-bok i en kontinuerlig spalt — inte som en swipe-app som tvingar fram konstgjorda sidbrytningar mellan stycken. Sidnumret är en *rapporteringsfunktion*, inte en navigationsmodell.

**Build-tid (`.eleventy.js:202`):**
- Funktionen `loadChapterPageContentMap()` läser alla `chapter-*.md`, parsar `<!-- PAGE N START -->` … `<!-- PAGE N END -->`-markörer (276 totalt) och bygger en `Map(pageNumber → templateContent)`.
- Collections som derivieras: `biografiPages`, `biografiAll`, `biografiChapters`, `biografiSegments`, `yearGroupMap`.
- `biografiSegments` är det viktigaste: en segmentering "Prolog → år-segment → Epilog" som biographien renderas via.

**Runtime (`assets/js/bio-reader.js`):**
- Varje sida i biografin har ett ankare: `<span id="p-NNN" class="rb-page-anchor" data-page-number="N">` som genereras av `biography.njk`.
- Varje segment har en wrapper: `<div class="rb-segment" data-segment-id="N">`.
- Vid scroll mäter `binarySearchLastAtOrBefore()` (rad 137) två listor — `segmentPositions` och `pagePositions` — sorterade efter `offsetTop`. Söker "sista element vars top ≤ probeY", där probeY är `scrollY + viewportHeight * 0.28` (sida) respektive `* 0.35` (segment).
- Resultatet uppdaterar footer-indikatorn (`N av 276`) och årtags-etiketten i topbar.
- Hash i URL:en uppdateras debounced (400 ms) för delningslänkar och scroll-restore.

**State (localStorage):**
- `rb-bio-page` — senaste sida som lästes
- `rb-bio-read` — JSON-array över genomlästa kapitel-id:n (markeras med prick i sidomenyn)

**Övriga JS-filer:**
- `section-reader.js` — multi-level drawer-meny + section-TOC för minnen/appendix + accordion-toggle
- `nav.js` — bara `is-scrolled`-klass på header vid scroll

## Markdown-konventioner

**Custom containers** (definierade i `.eleventy.js:8-170`):

| Container | Renderar till | Används för |
|---|---|---|
| `::: indent` | `<div class="rb-indent">` | Stycke med vänstermarginal — t.ex. citat-/dialogformatering |
| `::: poem` | `<div class="rb-poem">` | Poesi *inom* prosakontext (kapitel) — bevarar radbrytning |
| `::: quote` | `<blockquote class="rb-quote">` | Citerad text från andra |
| `::: center` | `<div class="rb-center">` | Centrerat block (omslagsmotiv, signaturer) |
| `::: minne` | `<div class="rb-minne">` | Hela dikter på `/minnen/` (separat från prosa-poem) |
| `::: part` | `<hr class="rb-part">` | Avdelare ("part-break") inom kapitel |
| `::: accordion` | `<details class="rb-accordion-details">` med `LÄS MER`-summary | Utfällbart sidospår — första stycket blir excerpt, resten döljs |
| `::: video` | `<div class="rb-video">` | Video-wrapper |
| `::: fullpage` | `<div class="rb-fullpage">` | Helsidesblock (typ omslag) |

Skillnaden `poem` vs `minne`: **`poem` är inline-poesi i kapitelprosan**, **`minne` är en hel dikt på `/minnen/`-sektionen** (egen sida, egen layout, egna typografiska regler).

**Andra markdown-mönster:**
- `[yt-video][URL]` → responsiv YouTube-embed
- `[MORE]` → `<details class="rb-more-block">` (utfällbart "Mer"-block)
- `Fotnot…`-stycken wrappas automatiskt i `.rb-footnote`
- `<!-- PAGE N START -->` / `<!-- PAGE N END -->` markerar sidgränser i kapitelkällor (build läser dem, runtime ser dem aldrig)

## Media

Alla bilder och videos ligger på **Cloudflare R2** (bucket: `rolf-borjlind`, location EEUR), serverat via custom domain `https://www.rolfborjlind.com/`:

- Bilder: `https://www.rolfborjlind.com/img/...`
- Videos: `https://www.rolfborjlind.com/vid/...`
- OG-bilder: `https://www.rolfborjlind.com/og-image*.png`

Den gamla `pub-*.r2.dev`-URL:en är en dev-subdomän (rate-limitad, inte produktionsklar) och används inte längre.

Lokalt i repot ligger bara `assets/images/` (favicon, divider, pattern, noise-light, og-image-general).

## Hosting & deploy

**Cloudflare Pages:**
- Repo: `github.com/baboon-ir/borjlind`
- Produktionsdomän: `rolfborjlind.com`
- Triggar: push till `main` ger auto-deploy
- Build-kommando (lokalt): `npm run build` (= `eleventy`)
- Output-katalog: `_site/`

**R2:**
- Bucket: `rolf-borjlind`
- Custom domain: `www.rolfborjlind.com` (Active, TLS 1.0 min)
- S3 API: `https://f94fd764a5845820accbbd2640674c66.r2.cloudflarestorage.com/rolf-borjlind`

**Branch-strategi:**
- Två branches finns: `main` (default + auto-deploy) och `dev`
- Arbeta på `dev` eller en feature-branch — merge till `main` först efter Håkan-Filips OK
- Aldrig push direkt till `main` utan godkännande

## Kommandon

```bash
npm run dev     # Eleventy dev-server med watch (port 8080)
npm run build   # bygger till _site/
```

## Verifiering — innan något kallas klart

1. Ren `npm run build` utan fel eller varningar
2. Manuell sidladdning av berörda routes (`/`, `/biografi/`, `/minnen/`, `/appendix/`)
3. Kontroll av interna ankarlänkar (t.ex. `/biografi/#p-100` om sidnummer rörts)
4. Om media rörts: HEAD-check att R2-URL:erna svarar 200
5. Vid CSS-/JS-ändring som påverkar mobilen: testa på Chrome mobil (drawer-scroll-lock, dvh-höjder, footer-bar)

## Git-disciplin

- En commit per logisk enhet, inte per session
- Skriv i imperativ presens på svenska, gärna med scope-prefix (`fix:`, `feat:`, `chore:`, `docs:`)
- Aldrig `--no-verify`, aldrig hooks-bypass
- Aldrig destruktiva operationer (`reset --hard`, `force-push`, `branch -D`) utan explicit instruktion
- Co-author-attribution till AI-modeller läggs *inte* till i commits

## Vad detta projekt inte är

- Inte en SPA eller dynamisk app
- Inte ett ramverksprojekt utöver Eleventy (inget Next, Astro, Nuxt, SvelteKit)
- Inte tänkt för CMS eller dynamiskt innehåll — text bor i markdown, ändras via PR
- Inte ett bildhanteringssystem — bilder laddas upp till R2 manuellt och refereras från markdown
- Inte ett Tailwind- eller CSS-ramverksprojekt — CSS är handskriven (`assets/css/main.css`)
- Inte tänkt att skala till många författare eller flera språk

## Vad som inte är i repot längre

v1.0 GSD-planering, one-off migrationsscripts, AI-arbetsanteckningar, tomma image-stubs, GCP-migration-loggar, Rolfs docx-rättningskällor och den läckta `biografi_full_export.md` raderades under april–maj 2026. Git-historiken har allt om det behövs.

## Kontakt

Håkan-Filip (hakan@filterrefresh.se) är projektägare på teknik-sidan. Rolf Börjlind är författaren och skickar rättningar via Håkan-Filip.
