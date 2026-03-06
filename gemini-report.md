### Rapport: Slutförd omstrukturering av kapitelkällor

#### 1. Skapade filer under `content/pages/biografi/chapters/`
Samtliga 21 kapitel har skapats som markdown-filer enligt mappningen:
- `chapter-01-prolog.md`
- `chapter-02-slaktarvet.md`
- `chapter-03-valfardets-barn.md`
- `chapter-04-motet-med-carsten.md`
- `chapter-05-lanthandeln-i-ekskogen.md`
- `chapter-06-konstnarsuppvaknandet.md`
- `chapter-07-jaccuse-moderna-museet.md`
- `chapter-08-vagen-till-amerika.md`
- `chapter-09-san-francisco-och-poesins-vast.md`
- `chapter-10-genom-oken-och-berg.md`
- `chapter-11-aterkomst-till-sverige.md`
- `chapter-12-film-och-gosta-ekman.md`
- `chapter-13-brodskrivaren.md`
- `chapter-14-sibirsk-vag.md`
- `chapter-15-beck-vaxer-fram.md`
- `chapter-16-karriar-och-sjalvinblick.md`
- `chapter-17-beck-triumferar.md`
- `chapter-18-karriarbalansen.md`
- `chapter-19-operan-och-varldens-mote.md`
- `chapter-20-beck-till-sist.md`
- `chapter-21-epilog.md`
- `INDEX.md` (Sammanfattning av kapitel, sidspann och yearGroups)

#### 2. Konsistens mellan kapitelindelning och yearGroup
- **Full konsistens:** Inga avvikelser upptäcktes mellan kapitelgränserna och `yearGroup`-datan i sidornas frontmatter. Varje kapitel håller sig inom de definierade årtalsspannet.

#### 3. Sidor som sticker ut
- **Sida 119:** Exceptionellt lång textmassa (ca 40 000 tecken). Det är en central och omfattande dialog med Allen Ginsberg.
- **Mediesidor:** Sida 1 (enbart bild), Sida 2 (dedikering). Fler sidor med enbart bild och minimal text finns spritt i materialet (t.ex. sidor som inleds med `![`).

#### 4. Förslag på nästa steg för "Source of Truth"
För att helt övergå till kapitelkällorna som primär redigeringsyta rekommenderas:
1. **Byggsteg (Pre-build):** Implementera ett skript som parsar kapitelfilerna via `<!-- PAGE X START/END -->`-markörerna och genererar/uppdaterar sidfilerna i `pages/`-mappen automatiskt.
2. **Metadata-extrahering:** Flytta sid-specifik metadata (yearGroup, mediaPage etc.) till antingen en central JSON-fil eller inkludera den som dolda attribut i kapitelfilernas sidmarkörer.
3. **Validering:** Inför ett teststeg som säkerställer att inga sidor "tappas bort" eller får korrupt frontmatter vid generering.

---
*Status: Uppdrag slutfört 2026-03-06.*
