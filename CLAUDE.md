# CLAUDE.md — borjlind

## Vad detta är
Rolf Börjlinds självbiografi som statisk site. Eleventy 3, handskriven CSS (ingen Tailwind, inget ramverk utöver Eleventy + ett par markdown-it-plugins). Svenska. v1.0 är komplett och i produktion.

Kärnvärde: läsupplevelsen ska kännas som att hålla en bok i handen.

## Absolut regel
**Utför inga ändringar på eget initiativ. Konfirmera alltid eller fråga Håkan-Filip först.**

Det gäller även "små" rättningar, refactoring, struktur, beroenden, CSS-justeringar. Vid minsta tvekan — fråga innan du rör.

## Arkitektur i korthet

```
content/pages/biografi/chapters/*.md   ← källan till biografin (276 sidor i 21 kap)
content/pages/minnen/                  ← 4 dikter
content/pages/appendix.md              ← appendix
content/pages/index.md                 ← startsida
_data/chapters.js                      ← kapitelindex (id, titel, start, end)
includes/                              ← delade njk-partials (header, nav, TOC)
layouts/                               ← sidlayouts (base, biography, home m.fl.)
assets/css/main.css                    ← all styling
assets/js/                             ← bio-reader, nav, section-reader
.eleventy.js                           ← config + custom markdown-containers + filter
```

Routes: `/`, `/biografi/`, `/minnen/`, `/appendix/` (+ redirects `/biografi/N/` → ankare).

Läsaren är **segmentbaserad och scroll-driven** — inte paged/swipe. Footer-sidindikator uppdateras via binärsökning från ankarposition i viewport.

## Media
Alla bilder och videos ligger externt på **Cloudflare R2**:
`https://pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev/img/...`

Bara `assets/images/` (favicon m.m.) ligger lokalt i repot.

## Markdown-konventioner
- Custom containers: `::: indent`, `::: poem`, `::: quote`, `::: center`, `::: minne`, `::: part`, `::: accordion`
- YouTube-embed: `[yt-video][URL]`
- Utfällbart block: `[MORE]`
- `<!-- PAGE N START -->` / `<!-- PAGE N END -->` markerar sidgränser i kapitelkällor

## Kommandon
```bash
npm run dev     # Eleventy dev-server med watch
npm run build   # bygger till _site/
```

## Deploy
Repot är kopplat till **Cloudflare Pages**. Push till `main` triggar automatisk deploy.

Arbeta alltid på `dev`-branch eller feature-branch — merge till `main` först efter Håkan-Filips bekräftelse.

## Rättningsworkflow (Rolfs .docx-filer)
När Rolf levererar rättningar som `.docx`:
- **Använd inte** `textutil -convert txt` — genomstrukna stycken försvinner
- Unzippa docx och parsa `word/document.xml` på `<w:strike/>` för att hitta text som ska tas bort
- Rättningskällor arkiveras i `Last edits/` (exkluderade från build)

## Vad som inte är i repot längre
v1.0 GSD-planering, one-off migrationsscripts, AI-arbetsanteckningar och tomma image-stubs raderades i april 2026. Git-historiken har allt om det behövs.

## Kontakt
Håkan-Filip (hakan@filterrefresh.se) är projektägare på teknik-sidan. Rolf Börjlind är författaren och skickar rättningar via Håkan-Filip.
