# Formateringslogg

Datum: 2026-04-01
Projekt: `content/pages/biografi`

## Tillvägagångssätt

Arbetet har gjorts försiktigt och konservativt, med fokus på säkra formateringsfel snarare än innehållsliga omskrivningar.

Grundprincip:

1. Varje sidfil i `content/pages/biografi/pages/page-XXX.md` jämförs mot motsvarande kapitelkälla i `content/pages/biografi/chapters/chapter-XX-*.md`.
2. Endast tydliga och verifierbara formateringsfel rättas.
3. Om kapitelkällan bär på samma uppenbara spacing-/formateringsfel, synkas även den.
4. Inga fria textomskrivningar görs utan direkt stöd i källan eller uttrycklig instruktion.

## Vad som har rättats

Återkommande typer av fixar:

- saknade eller felplacerade `::: part`
- saknade eller felaktiga `::: accordion`
- saknade avslutande block som `:::`
- felplacerade `yt-video`-rader
- felaktiga bildrader och bildtexter
- felaktig citatspacning
- hopklistrade ord och saknade mellanrum
- trasiga kursiv-/fetmarkeringar
- dikter, titlar och andra block som drivit från avsedd layout

## Genomfört arbete hittills

### 1. Detaljstyrda korrigeringar efter användarinstruktion

Ett stort antal specificerade korrigeringar har gjorts i senare delen av boken, huvudsakligen:

- sidor 153-276

Det omfattar bland annat:

- titel- och diktformatering
- införande/flytt av `::: part`
- införande/flytt av `::: accordion`
- bildtexter
- videoinbäddningar
- mindre strukturella layoutfixar

### 2. Löpande sidgranskning

Autonom, sida-för-sida-granskning har hittills genomförts för:

- sidor 1-62

Det arbetet har främst bestått av:

- att återföra sidfilerna till kapitelkällans struktur
- att rätta drift i spacing och typografi
- att återställa bortfallna block, bilder eller videor där sidfilen avvikit från källan

## Kapitelfiler som har synkats under granskningen

Hittills har bland annat följande kapitelkällor uppdaterats när de haft samma tydliga formateringsfel som sidfilerna:

- `chapter-01-prolog.md`
- `chapter-02-slaktarvet.md`
- `chapter-03-valfardets-barn.md`
- `chapter-04-motet-med-carsten.md`
- `chapter-05-lanthandeln-i-ekskogen.md`
- `chapter-06-konstnarsuppvaknandet.md`
- `chapter-07-jaccuse-moderna-museet.md`

## Avgränsning

Det här passet har inte syftat till att:

- stilistiskt skriva om text
- lösa tvetydiga språkfrågor utan källstöd
- normalisera innehåll som kan vara avsiktligt
- göra större redaktionella ingrepp

Målet har varit:

- korrekt och stabil rendering
- konsekvent struktur mellan sidfiler och kapitelkällor
- så låg risk som möjligt för oavsiktliga innehållsändringar

## Status

Klart hittills:

- användarstyrda detaljfixar i senare delen av biografin
- sida-för-sida-granskning av sidor 1-62

Nästa steg:

- fortsätta den autonoma granskningen från sida 63 och framåt i samma metodiska ordning
