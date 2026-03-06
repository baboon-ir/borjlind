# Testläge och verifieringsmönster

**Analysdatum:** 2026-03-06

## Sammanfattning

Projektet har i nuläget ingen automatiserad testsvit. Inga testfiler, inga testscript i `package.json` och inga konfigurationsfiler för Jest, Vitest, Playwright, Cypress eller liknande kunde beläggas i den lästa kodbasen. Den faktiska kvalitetssäkringen bygger därför på två saker:

- att Eleventy-bygget går igenom via `npm run build`
- att funktionerna kontrolleras manuellt i browsern

## Vad som faktiskt finns idag

### Paket och scripts

- `package.json` innehåller bara:
  - `npm run dev`
  - `npm run build`
- `npm run build` kör endast `eleventy`.
- Det finns inget `test`, `lint` eller `check`-script.

### Verktyg som inte finns

- Ingen test runner är deklarerad som dependency.
- Ingen E2E-runner är deklarerad som dependency.
- Ingen snapshot- eller visual regression-lösning syns.
- Ingen schema- eller contentvalidering syns i npm-scripts eller Eleventy-konfiguration.
- Ingen CI-baserad testkedja syns i de filer som lästs för denna kartläggning.

## Nuvarande verifieringsstrategi

### 1. Byggverifiering

Den mest konkreta maskinella kontrollen är att sajten kan byggas utan fel:

- Eleventy måste kunna läsa allt innehåll under `content/`
- collections i `.eleventy.js` måste kunna genereras
- filter som `bioRender`, `json`, `pad3` och `chaptersMeta` måste kunna köras
- passthrough-copy för CSS, JS och bilder måste fungera

Eftersom `.planning/**` och `README.md` ignoreras i Eleventy påverkar de inte byggresultatet.

### 2. Manuell browser-testning

Eftersom projektet har två centrala interaktiva script sker den viktiga verifieringen i browsern:

- navigationen i `assets/js/nav.js`
- e-boksläsaren i `assets/js/bio-reader.js`

## Rekommenderad manuell testrunda utifrån nuvarande kod

### Globalt

- Kör `npm run build` och verifiera att `_site/` genereras utan buildfel.
- Kör `npm run dev` och öppna startsida, biografi, minnen och appendix.
- Kontrollera att CSS och JS kopieras igenom till byggresultatet.

### Navigation (`assets/js/nav.js`)

Funktioner som bör verifieras manuellt:

- menyknappen öppnar och stänger panelen
- root-elementet får och tappar klassen `rb-nav-open`
- `aria-expanded` på knappen växlar mellan `true` och `false`
- `aria-hidden` på panelen växlar mellan `false` och `true`
- knapptexten växlar mellan `Meny` och `Stäng`
- `Escape` stänger panelen
- klick på backdrop stänger panelen
- klick på länk inne i panelen stänger panelen
- headern får `.is-scrolled` när `window.scrollY > 10`

### Biografiläsare (`assets/js/bio-reader.js`)

Funktioner som bör verifieras manuellt:

- sidan initieras bara när `document.body.dataset.biography` finns
- kapitelmetadata kan läsas från `#rb-chapter-data`
- första aktiva kapitel renderas med korrekt `columnWidth`
- höger/vänster-knappar går fram och tillbaka mellan kolumner
- navigation över kapitelgräns fungerar i båda riktningar
- tangentbordets piltangenter fungerar när fokus inte ligger i formulärfält
- swipe fungerar på touch/pointer-enheter och ignorerar mus
- TOC-panelen öppnas, stängs och hoppar till rätt kapitel
- resize reinitierar kolumner och clamp:ar aktuell sida korrekt
- `localStorage['bio:pos']` sparas och återställs korrekt
- gammal nyckel `bio:page` tas bort utan att bryta flödet

### Innehåll och rendering

Utifrån `.eleventy.js` och innehållsfilerna bör följande kontrolleras manuellt:

- bilder i Markdown får lazy loading och renderas korrekt
- bilder med alt-text blir figurer med figcaption
- `::: center`, `::: indent`, `::: poem`, `::: quote`, `::: minne`, `::: accordion`, `::: video`, `::: part` renderas till rätt HTML/CSS-struktur
- `[MORE]` skapar expanderbart block där det används
- `[yt-video][URL]` renderas som responsiv iframe
- rå HTML i Markdown fungerar där den används, till exempel `<div id="..."></div>`

### Sida- och innehållsspecifika kontroller

- `/` laddar startsidan utan interaktiva regressionsfel
- `/appendix/` visar lång kronologisk text och interna ankarpunkter
- `/minnen/` visar indexinnehåll korrekt
- `/minnen/{slug}/` visar teaser/fortsättning korrekt för minnen med `[MORE]`
- `/biografi/` visar kapitelbaserad reader och kan gå igenom innehåll med bilder, citat, minnesblock och accordion

## Riskområden som är särskilt viktiga att testa manuellt

### CSS columns och läsarlogik

Biografiläsaren är den tydligaste riskytan i projektet eftersom paginationen inte är förberäknad utan härleds från faktisk DOM-layout:

- `getPageCount()` räknar sidor från `scrollWidth / clientWidth`
- `columnWidth` sätts dynamiskt från elementets bredd
- layouten kan därför förändras mellan viewportstorlekar, innehållstyper och när `details`-block öppnas

Det gör att följande regressionsrisker är reella:

- fel sidantal efter resize
- fel landning vid återställning från `localStorage`
- hopp mellan kapitel när kolumnbredd eller innehållshöjd ändras
- oväntade brytningar runt bilder, figurer, accordion och minnesblock

### Innehållskvalitet

Biografiinnehållet ser importerat ut och innehåller på flera sidor OCR-liknande spacingfel. Det är inte ett testfel i sig, men påverkar vad som behöver kontrolleras:

- att byggprocessen tål råtext med oregelbunden spacing
- att innehåll med blandad Markdown, länkar och rå HTML inte bryter rendering
- att äldre eller ojämnt strukturerade sidor fortfarande inkluderas korrekt i collections

## Vad som saknas jämfört med en mer robust teststrategi

Följande finns inte i nuläget:

- automatiska enhetstester för filter eller helperfunktioner
- integrations-/renderingtester för Eleventy collections
- DOM-tester för `nav.js` eller `bio-reader.js`
- E2E-flöden för navigation, TOC och läsarstate
- innehållsvalidering för frontmatter eller sidintervall

## Rimlig framtida miniminivå om testning ska införas

Med nuvarande arkitektur vore den lägsta nyttiga nivån:

- ett `npm test`-script
- några enhetstester för rena hjälpfunktioner eller extraherad readerlogik
- ett litet E2E-flöde som täcker meny, biografi-navigation och `localStorage`-restore
- en byggnära kontroll som verifierar att biografisidorna faktiskt täcker 1..276 och att `anchor` följer `p-NNN`

## Slutsats

Testläget är i praktiken manuellt. Projektet förlitar sig på att Eleventy-bygget fungerar och att kritiska användarflöden provas i browsern, särskilt den kapitelbaserade biografiläsaren. Dokumentation om testning bör därför beskriva faktisk build- och UAT-nivå, inte antyda att automatiserade tester redan finns.
