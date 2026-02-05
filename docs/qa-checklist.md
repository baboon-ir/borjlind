# QA Checklist – Rolf Börjlind Site

Kör denna checklista efter varje ändring innan commit.

## Build & Dev

- [ ] `npm run dev` startar utan fel
- [ ] `npm run build` genererar `_site/` utan fel
- [ ] Inga 404-fel i konsolen vid lokal browse

## Navigation

- [ ] Klick på "Meny" öppnar overlay
- [ ] ESC stänger menyn
- [ ] Klick på backdrop stänger menyn
- [ ] Alla länkar (Start/Biografi/Minnen/Appendix) fungerar
- [ ] `aria-expanded` och `aria-hidden` uppdateras korrekt

## Biografi

- [ ] `/biografi/` laddar och visar sidor
- [ ] Scroll-position sparas i localStorage
- [ ] "Fortsätt läsa" knappen fungerar (om synlig)
- [ ] Anchors `#p-001` till `#p-276` fungerar
- [ ] `[IMAGE:]`, `[VIDEO:]`, `[MORE]` renderas korrekt

## Responsiveness

- [ ] Testat på mobil viewport (< 640px)
- [ ] Header är sticky och synlig
- [ ] Text är läsbar (kontrast OK)
