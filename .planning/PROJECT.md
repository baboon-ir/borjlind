# Rolf Börjlind — Digital Biografi

## What This Is

En tidlös digital biografi för författaren Rolf Börjlind, bestående av tre delar: biografin "Bit den hand som föder dig" (276 sidor), en minnesdel (dikter/minnen) och ett appendix. Sajten är statiskt byggd med Eleventy och hostad på Cloudflare. Målgruppen är alla som vill läsa Rolfs liv och verk — utan krav på teknisk kunskap.

## Core Value

Läsupplevelsen ska kännas som att hålla en bok i handen — enkel att navigera, tidlös i sin design, och alltid tillgänglig utan att beroenden förfaller.

## Requirements

### Validated

- ✓ 276 biografisidor renderade med Eleventy — existing
- ✓ Minnessida med kortsamling (hub grid) — existing
- ✓ Appendixsida — existing
- ✓ Mörkt tema med anpassad färgpalett — existing
- ✓ Scroll-position sparas i localStorage — existing
- ✓ Responsiv layout med sticky navigation — existing
- ✓ Rika innehållselement: videos (YouTube), dropdowns/accordion, citat — existing
- ✓ Cloudflare hosting — existing

### Active

_Inga aktiva krav — v1.0 milestone komplett (2026-03-31)._

### Completed (v1.0)

- [x] Biografiläsare med segmenterad scroll-navigation — Prolog, årsperioder, Epilog med TOC-panel
- [x] Årsbaserad navigation — innehållsförteckning med alla årsperioder + visuell indikation om vilket år man läser i
- [x] Smart sidlayout — bilder/videos som inte ryms med text får egen sida; dropdowns expanderar sidan och tillåter vertikal scroll
- [x] Ta bort Tailwind och ersätt med plain CSS — noll runtime-beroenden, minimalt npm-beroende
- [x] Design-översyn — fullständig polish för produktion (typografi, spacing, mobiloptimering)

### Out of Scope

- CMS / editorgränssnitt — innehåll uppdateras via markdown-filer direkt i repot
- Minnen och appendix i e-boksformat — de behåller sin nuvarande layout
- User-generated content / kommentarer — statisk sajt utan backend
- Notifikationer eller dynamiska features — tidlös, ingen runtime-logik

## Context

Befintlig codebase: Eleventy v2 SSG med Nunjucks-templates, Tailwind CSS v3, vanilla JS (bio-reader.js + nav.js). 276 biografisidor är redan producerade och taggade med metadata. Python-scripts användes för OCR-import och datarensning — dessa är engångsskript och inte en del av den löpande builden.

Årsperioderna i biografin: varje sida/sektion tillhör ett specifikt årsintervall (t.ex. 1982–1988). Denna metadata finns i frontmatter och måste exponeras i navigation.

Nuvarande vertikal scroll-modell fungerar som en enda lång sida med alla 276 sidor inladdade — e-boksmodellen innebär att man istället visar en sida åt gången, navigerar med svep/knappar/tangentbord.

Känd tech debt: sidantal (276) hårdkodat på flera ställen; Python-scripts har hårdkodade sökvägar; placeholder-sidor renderas för saknat innehåll.

## Constraints

- **Tech Stack**: Eleventy behålls som SSG — inget ramverksbyte
- **Hosting**: Cloudflare Pages / Bucket — statisk output, inga server-side features
- **Dependencies**: Tailwind och npm-beroenden ska minimeras; build-verktyg ok, zero runtime JS-bibliotek från tredje part
- **Content**: Markdown-filer är source of truth — ingen databasmigration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| E-boksläsare bara för biografin | Minnen och appendix har annan natur (kortsamling vs lång narrativ) | Complete |
| Plain CSS ersätter Tailwind | Tidlös kodbas utan npm-beroenden som förfaller | Complete |
| Segmenterad scroll-navigation (inte paged/swipe) | Enklare underhåll, fungerar i produktion, uppfyller kärnvärdet. Beslut 2026-03-31 | Complete |
| Media får egen sida vid platsbrist | Undviker kompromissad layout för videos/bilder | Complete |

---
*Last updated: 2026-03-31 — scroll-modell formaliserad, v1.0 milestone komplett*
