# Bildcaption-arbete — Status 2026-03-30

## Bakgrund

Eleventy-projektet (denna repo) är en ombyggnad av React-appen på biografi.rolfborjlind.com. Vid import av innehållet fick de flesta bilderna filnamnet som alt-text (t.ex. `![287.jpg](url)`) istället för korrekt caption eller tom alt-text. Eftersom `markdown-it-implicit-figures`-pluginet i `.eleventy.js` konverterar alt-text till `<figcaption>`, visades filnamn som synliga bildtexter.

## Vad som gjordes

### 1. Inventering av Eleventy-projektets bilder
Alla 21 chapter-filer (`content/pages/biografi/chapters/chapter-*.md`) analyserades. **301 bilder** hittades, fördelade i tre kategorier:
- **45 bilder** med korrekt caption (t.ex. `![Livet är obeskrivligt roligt.]`)
- **29 bilder** med tom alt-text (`![]`) — korrekt, ingen figcaption visas
- **227 bilder** med filnamn som alt-text (`![287.jpg]`) — buggen

### 2. Extraktion av korrekt caption-data från React-appen
React-appen lazy-loadar kapiteldata som webpack-chunks. Varje sida är en chunk (chunk-ID 3–278 = sida 0–275). Bilddata lagras som:
```json
{"images":[{"ref":"52.png","imgText":"CR."}]}
```
Alla 276 chunks hämtades via `fetch()` i webbläsaren och parsades med regex. **225 bilder** extraherades, varav **59 med caption** och **166 utan** (tom `imgText`).

### 3. Korsreferering och åtgärder
Matchning gjordes på filnamn (case-insensitive). Resultat:

| Åtgärd | Antal | Beskrivning |
|--------|-------|-------------|
| REMOVE_ALT | 128 | Filnamn-caption borttagen → `![]` (React saknar caption) |
| SET_CAPTION | 39 | Korrekt caption satt från React-appen |
| UPDATE_CAPTION | 4 | Befintlig caption uppdaterad till React-versionen |
| REVIEW → REMOVE_ALT | 63 | Ej i React-appen, filnamn-caption borttagen |
| OK | 67 | Redan korrekt, ingen ändring |
| **Totalt** | **301** | |

### 4. Applicering
**234 ändringar** gjordes i 21 markdown-filer (234 rader ändrade, 1:1 insertion/deletion). Alla ändringar är begränsade till `![alt](url)`-rader — ingen annan text påverkades.

## Resultat efter fix
- **0 bilder** med filnamn-som-caption (var 227, nu 0)
- **104 bilder** med riktig caption-text
- **197 bilder** med tom alt-text (ingen figcaption visas)

## Kvarvarande frågor

### 63 bilder utan React-matchning
Dessa bilder finns i Eleventy-projektet men hittades inte i React-appens data. De har nu tom alt-text. Det kan betyda:
- De är nya bilder som lagts till i Eleventy-versionen
- React-appen hade dem på andra sidor (page-mapping-skillnad)
- De fanns i ej laddade delar av React-appen

Om dessa ska ha captions behöver det avgöras manuellt. Fullständig lista finns i `/sessions/admiring-charming-cerf/mnt/my-workspace/bild-caption-inventering.xlsx` (fliken "Åtgärder", gula rader med "Granska").

## Tekniska detaljer

### Bildvisning i Eleventy
- Plugin: `markdown-it-implicit-figures` (konfigurerad i `.eleventy.js`)
- Beteende: `![alt text](url)` → `<figure><img src="url" alt="alt text"><figcaption>alt text</figcaption></figure>`
- Tom alt `![](url)` → `<figure><img src="url"></figure>` (ingen figcaption)

### Bildhosting
Alla bilder hämtas från Cloudflare R2:
```
https://pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev/img/{filename}
```

### React-appens chunk-struktur
- Runtime/bootstrap: inline `<script>` i HTML med chunk-hashmap
- Chunk-ID → sida: `pageNo = chunkId - 3`
- Data-format per chunk: `JSON.parse('[...]')` med objekt som `{images:[{ref, imgText}]}`, `{segment:[...]}`, `{linebreak:true}`, etc.

## Filer skapade under arbetet
- `crossref_results.json` — Fullständig korsreferens (301 poster) med åtgärd per bild
- `react_images_full.csv` — Alla 225 bilder extraherade från React-appen (format: `pageNo|filename|caption`)
- `bild-caption-inventering.xlsx` — Kalkylblad med inventering och åtgärder (i workspace-mappen)
