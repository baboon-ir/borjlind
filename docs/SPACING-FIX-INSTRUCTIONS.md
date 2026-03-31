# Instruktioner: Fixa ihopslagna ord i biografitexterna

## Bakgrund

Biografitexterna importerades via OCR och parsning från ett React-bygge. Under processen försvann mellanslag på hundratals ställen. Orden, siffrorna och citattecknen i sig är korrekta — det enda problemet är **saknade mellanslag**.

## Uppdrag

Gå igenom varje kapitelfil i `content/pages/biografi/chapters/` (chapter-01 till chapter-21), mening för mening, och infoga mellanslag där de saknas.

**Du ska ALDRIG ändra, ersätta eller ta bort ord. Du ska ALDRIG ändra stavning, grammatik eller ordval. Du ska ENBART lägga till mellanslag där mellanslag saknas.**

## Filer att bearbeta

```
content/pages/biografi/chapters/chapter-01-prolog.md
content/pages/biografi/chapters/chapter-02-slaktarvet.md
content/pages/biografi/chapters/chapter-03-valfardets-barn.md
content/pages/biografi/chapters/chapter-04-motet-med-carsten.md
content/pages/biografi/chapters/chapter-05-lanthandeln-i-ekskogen.md
content/pages/biografi/chapters/chapter-06-konstnarsuppvaknandet.md
content/pages/biografi/chapters/chapter-07-jaccuse-moderna-museet.md
content/pages/biografi/chapters/chapter-08-vagen-till-amerika.md
content/pages/biografi/chapters/chapter-09-san-francisco-och-poesins-vast.md
content/pages/biografi/chapters/chapter-10-genom-oken-och-berg.md
content/pages/biografi/chapters/chapter-11-aterkomst-till-sverige.md
content/pages/biografi/chapters/chapter-12-film-och-gosta-ekman.md
content/pages/biografi/chapters/chapter-13-brodskrivaren.md
content/pages/biografi/chapters/chapter-14-sibirsk-vag.md
content/pages/biografi/chapters/chapter-15-beck-vaxer-fram.md
content/pages/biografi/chapters/chapter-16-karriar-och-sjalvinblick.md
content/pages/biografi/chapters/chapter-17-beck-triumferar.md
content/pages/biografi/chapters/chapter-18-karriarbalansen.md
content/pages/biografi/chapters/chapter-19-operan-och-varldens-mote.md
content/pages/biografi/chapters/chapter-20-beck-till-sist.md
content/pages/biografi/chapters/chapter-21-epilog.md
```

## Vad du INTE ska röra

- Rader som börjar med `#` (rubriker)
- Rader som börjar med `<!--` (PAGE-markers)
- Rader som börjar med `:::` (markdown-containers)
- URL:er (allt som innehåller `https://`, `http://`, `.r2.dev/`, `.png`, `.mp4`)
- YAML frontmatter (mellan `---` i filens topp)
- Markdown-syntax (`**`, `*`, `![`, `](`, `[yt-video]`)

## De 9 felmönstren

Nedan listas varje mönster med exakta exempel från texterna. Varje exempel visar FEL → RÄTT.

---

### 1. Siffra ihopslaget med ord

Mellanslag saknas mellan en siffra och ett ord (eller ett ord och en siffra).

| Fel | Rätt |
|-----|------|
| `38år` | `38 år` |
| `på5.000` | `på 5.000` |
| `kapitel17` | `kapitel 17` |
| `i25 minuter` | `i 25 minuter` |
| `klockan14` | `klockan 14` |
| `runt60-talet` | `runt 60-talet` |
| `bara4 sidor` | `bara 4 sidor` |
| `över200 personer` | `över 200 personer` |

**Undantag — ändra INTE dessa:**
- Årtal i URL:er (`img/248.png`, `r2.dev`)
- Siffror i markdown-syntax
- Vedertagna sammansättningar: `B-vitaminer`, `70-talsrock` och liknande

---

### 2. Punkt följd av versal utan mellanslag

Mellanslag saknas efter punkt innan ny mening börjar.

| Fel | Rätt |
|-----|------|
| `välstädat.Över soffan` | `välstädat. Över soffan` |
| `på Lidingö.Året är 1963` | `på Lidingö. Året är 1963` |
| `helt naturligt.Älskar man` | `helt naturligt. Älskar man` |
| `kompetent.Jag gör` | `kompetent. Jag gör` |

**Undantag — ändra INTE dessa:**
- Förkortningar som `t.ex.`, `bl.a.`, `m.m.`, `f.d.`, `s.k.`
- Decimalpunkter: `5.000`, `3.14`
- URL:er

---

### 3. Citattecken ihopslaget med omgivande text

Texten använder typografiska citattecken `\u201d` (Unicode RIGHT DOUBLE QUOTATION MARK). Mellanslag saknas ofta före eller efter citattecknen.

| Fel | Rätt |
|-----|------|
| `"nånsin"är mycket` | `"nånsin" är mycket` |
| `och"nånsin"är` | `och "nånsin" är` |
| `talspråksformerna"nån"` | `talspråksformerna "nån"` |
| `filmen"Yrrol"hade` | `filmen "Yrrol" hade` |
| `heter"Dvärgarnas Vendetta"` | `heter "Dvärgarnas Vendetta"` |
| `serien"Beck"och` | `serien "Beck" och` |

**Regel:** Det ska alltid finnas mellanslag FÖRE ett öppnande citattecken och EFTER ett stängande citattecken, med följande undantag:
- Inget mellanslag efter stängande citattecken om det följs av punkt, komma, frågetecken, utropstecken, kolon eller semikolon: `"Beck", "Yrrol". "Varför?"` är korrekt.
- Inget mellanslag före öppnande citattecken om det står i början av en rad.

---

### 4. Svenska prepositioner/småord ihopslagna med nästa ord

Vanliga svenska småord (på, så, då, i, å) har slagits ihop med nästa ord.

| Fel | Rätt |
|-----|------|
| `påmellanstadiet` | `på mellanstadiet` |
| `påställen` | `på ställen` |
| `påsängen` | `på sängen` |
| `påtopp` | `på topp` |
| `påkrogar` | `på krogar` |
| `pånatten` | `på natten` |
| `såstarkt` | `så starkt` |
| `sålyckat` | `så lyckat` |
| `sålågt` | `så lågt` |
| `dåoch då` | `då och då` |
| `dåexploderar` | `då exploderar` |
| `iÅkersberga` | `i Åkersberga` |
| `iÖrebro` | `i Örebro` |

**Varning — var extremt försiktig med dessa:** Många svenska ord BÖRJAR med "på", "så", "då" etc. Ändra INTE legitima ord. Några exempel på ord du INTE ska ändra:

- `på...`: `påtaglig`, `påverka`, `påstå`, `påminna`, `pågår`, `pågång`, `påföljd`, `påsk`, `också`
- `så...`: `sånger`, `sång`, `sådan`, `sådant`, `såg`, `sås`, `såpa`, `sådd`, `också`
- `då...`: `dålig`, `dåligt`, `dåvarande`, `dåne`, `dåd`, `bedårande`
- `för...`: `förstå`, `försöka`, `försvinna`, `förtjust`, `förlag`, `föräldrar`, `förbi`, `förr`
- `av...`: `avsluta`, `avlösa`, `avvisa`, `avlida`, `avgöra`, `avsked`
- `med...`: `medveten`, `medverka`, `medan`, `medel`, `medborgare`, `media`

**Hur du avgör:** Läs meningen. Om `påsängen` betyder "på sängen" (preposition + substantiv) ska det vara två ord. Om det vore ett riktigt sammansatt ord (som `påtaglig`) ska det INTE ändras. Kontexten avgör alltid.

---

### 5. Svenska verb/pronomen ihopslagna med nästa ord

| Fel | Rätt |
|-----|------|
| `ärinte` | `är inte` |
| `ärdöd` | `är död` |
| `jagvet` | `jag vet` |
| `detär` | `det är` |
| `ochåtervänder` | `och återvänder` |
| `attjag` | `att jag` |
| `ochhan` | `och han` |
| `mendet` | `men det` |

**Samma varning:** Många ord börjar med dessa bokstavskombinationer. `ärendet` är ETT ord. `ärinte` är TVÅ (`är inte`). Kontexten avgör.

---

### 6. Bokstäver med diakritiska tecken (å, ä, ö) ihopslagna

Svensk text med å, ä, ö drabbades särskilt hårt vid parsningen.

| Fel | Rätt |
|-----|------|
| `minaögon` | `mina ögon` |
| `enörfil` | `en örfil` |
| `hanåkte` | `han åkte` |
| `kanåstadkomma` | `kan åstadkomma` |
| `jagälskade` | `jag älskade` |
| `bliråkat` | `bli råkat` |

---

### 7. Konjunktioner och adverb ihopslagna

| Fel | Rätt |
|-----|------|
| `ochsen` | `och sen` |
| `ellerinte` | `eller inte` |
| `utanatt` | `utan att` |
| `inteför` | `inte för` |
| `somom` | `som om` |
| `tillslut` | `till slut` |

**Undantag — ändra INTE:** `dessutom`, `emellertid`, `tillbaka`, `eftersom`, `utanför`, `istället`, `fortfarande`

---

### 8. Tankstreck/bindestreck utan mellanslag

| Fel | Rätt |
|-----|------|
| `Sverige-det var` | `Sverige - det var` |

**Undantag:** Bindestreck i sammansatta ord ska INTE ha mellanslag: `t-banan`, `tv-serie`, `60-talet`, `Beck-film`. Bara tankstreck (avbrott i mening) ska ha mellanslag runt sig.

---

### 9. Frågetecken/utropstecken följt av ord utan mellanslag

| Fel | Rätt |
|-----|------|
| `varandra?Hur` | `varandra? Hur` |
| `pengar!Men` | `pengar! Men` |

---

## Arbetsmetod

1. Öppna en fil i taget, börja med `chapter-01-prolog.md`.
2. Läs texten mening för mening. Hoppa över rader som börjar med `#`, `<!--`, `:::`, eller som innehåller URL:er.
3. Leta efter ställen där mellanslag saknas enligt mönstren ovan.
4. Lägg till mellanslaget. Ändra INGET annat.
5. Om du är osäker på om något är ett ihopslaget ordpar eller ett legitimt sammansatt ord — låt det vara. Det är bättre att missa en fix än att bryta ett korrekt ord.
6. När filen är klar, gå vidare till nästa.

## Sammanfattning av regeln

**Om två ord som normalt separeras av mellanslag har slagits ihop till ett — lägg till mellanslaget tillbaka. Ändra inget annat.**
