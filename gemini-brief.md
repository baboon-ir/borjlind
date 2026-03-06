# Uppdrag till Gemini: Omstrukturera innehåll till kapitelkällor (utan att bryta readern)

## Bakgrund
Projektet har idag 1 markdown-fil per sida under:

- `content/pages/biografi/pages/page-1.md` ... `page-276.md`

Frontend-readern använder fortfarande sidnivådata (page number, anchor, yearGroup, mediaPage), så dessa sidfiler måste fortsatt finnas för att koden ska fungera.

Readern är nu segmentdriven (`Prolog -> år -> Epilog`) och bygger metadata från sidfilerna.

## Mål
Skapa en mer redaktionellt korrekt innehållsstruktur med kapitelkällor, utan att bryta nuvarande frontend.

Det betyder:

1. Vi ska få kapitel-sorterade "masterfiler" (inte 1 fil per sida som primär redigeringsyta).
2. Vi ska behålla sidfilerna som runtime-kompatibla artefakter för läsaren.
3. Ingen synlig kapitelpresentation behöver införas i frontend just nu.

## Viktigt: kompatibilitetskrav mot befintlig kod
Nuvarande kod förutsätter att sidfiler finns kvar och innehåller minst:

- `page.number`
- `anchor` (`p-001` ... `p-276`)
- `yearGroup`
- `tags: [biografiPage]`
- `permalink: false`

Ändra inte readerlogik i detta uppdrag. Fokus är innehållsstruktur.

## Ny målstruktur
Skapa följande nya struktur:

- `content/pages/biografi/chapters/`
- `content/pages/biografi/chapters/chapter-01-prolog.md`
- `content/pages/biografi/chapters/chapter-02-slaktarvet.md`
- ...
- `content/pages/biografi/chapters/chapter-21-epilog.md`
- `content/pages/biografi/chapters/INDEX.md` (översikt: kapitel, sidspann, yearGroup, tema)

Kapitelfilerna ska vara "källfiler" som sammanställer texten i korrekt ordning per kapitel.

## Kapitelindelning som ska användas (B-spåret)
Använd denna kapitelmappning:

1. Prolog: s. 1–3
2. Släktarvet: s. 4–6
3. Välfärdets barn: s. 7–27
4. Mötet med Carsten: s. 28–39
5. Lanthandeln i Ekskogen: s. 40–54
6. Konstnärsuppvaknandet: s. 55–55
7. J'accuse! Moderna Museet: s. 56–70
8. Vägen till Amerika: s. 71–83
9. San Francisco & poesins väst: s. 84–95
10. Genom öken och berg: s. 96–110
11. Återkomst till Sverige: s. 111–120
12. Film och Gösta Ekman: s. 121–138
13. Brödskrivaren: s. 139–153
14. Sibirsk väg: s. 154–165
15. Beck växer fram: s. 166–180
16. Karriär och självinblick: s. 181–193
17. Beck triumferar: s. 194–210
18. Karriärbalansen: s. 211–220
19. Operan och världens möte: s. 221–248
20. Beck till sist: s. 249–275
21. Epilog: s. 276–276

## YearGroup-data (verifiering)
Utgå från att yearGroup-perioderna i nuläget är:

- 1942–1955: s. 1–27
- 1956–1968: s. 28–55
- 1969–1975: s. 56–83
- 1976–1982: s. 84–110
- 1983–1990: s. 111–138
- 1991–1998: s. 139–165
- 1999–2006: s. 166–193
- 2007–2012: s. 194–220
- 2013–2017: s. 221–248
- 2018–2024: s. 249–276

## Genomförandeinstruktioner
1. Läs samtliga `page-*.md` i ordning.
2. Bygg kapitelkällor enligt mappningen ovan.
3. Lägg in tydliga sidmarkörer i varje kapitelfil, t.ex.:
   - `<!-- PAGE 119 START -->`
   - `<!-- PAGE 119 END -->`
4. Bevara originalinnehåll exakt (ingen redaktionell omskrivning).
5. Flagga särskilt:
   - sida 119 är mycket lång/anomalisk.
   - mediesidor som är bild/dedikering.
6. Skapa `INDEX.md` med:
   - kapitelnummer
   - titel
   - sidspann
   - yearGroup-spann
   - kort temarad

## Förbjudet i detta uppdrag
- Inga ändringar i readerns JS/CSS/templates.
- Ingen borttagning av `content/pages/biografi/pages/page-*.md`.
- Ingen ändring av frontmatter i sidfiler om det inte är absolut nödvändigt för konsistens (och då ska det dokumenteras tydligt).

## Leverans
När du är klar, returnera:

1. Lista på skapade filer under `content/pages/biografi/chapters/`.
2. Eventuella konsistensproblem mellan kapitelindelning och yearGroup.
3. Lista med sidor som sticker ut (längd/medieinnehåll).
4. Kort förslag på nästa steg för att senare kunna göra kapitelkällorna till "source of truth" med sidfiler som genereras automatiskt.
