# Style audit: live site → borjlind (Eleventy/Tailwind)

Goal: match the **live look** from:
- https://rolfborjlind.com (hub / landing)
- https://biografi.rolfborjlind.com (biography reader)

> Notes are from computed styles + inlined CSS on rolfborjlind.com, and computed styles + extracted Tailwind utilities on biografi.rolfborjlind.com.

---

## 1) Key visual tokens

### Colors

**Primary background**
- Hub: `#282828` (rgb(40,40,40))
- Bio: `#1c1d1e` (rgb(28,29,30))

**Primary text**
- Warm off-white: `#fdf9f0` (rgb(253,249,240))

**Links / accents**
- Hub anchor default: `#4169e1` (royalblue)
- Hub anchor hover/active: `#191970` (midnightblue)

**Secondary warm off-white (seen in bio CSS)**
- `#f5f1e9`
- `#ede9e1`

Tailwind-esque utility names on bio live site include:
- `.bg-dark` → `background-color: rgba(28,29,30,var(--tw-bg-opacity))`
- `.text-light` → `color: rgba(253,249,240,var(--tw-text-opacity))`
- `.border-light` → `border-color: rgba(253,249,240,var(--tw-border-opacity))`
- `.from-dark` → gradient from `#1c1d1e`
- `.from-light` → gradient from `#fdf9f0`
- `.from-light-dark` → gradient from `#f5f1e9`
- `.to-dark` → gradient to `#1c1d1e`

### Typography

**Primary serif stack (both hub + bio)**
- `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`

Hub H1 (hero)
- family: Georgia/serif
- size: ~`88px` on desktop, smaller on breakpoints
- weight: `700`
- line-height: ~`1.2`
- color: `#fdf9f0`

Bio body text
- family: serif stack above
- size: `16px`
- line-height: `24px` (1.5)
- color: `#fdf9f0`

### Borders / radii

Hub CTA button ("BIOGRAFIN")
- border: `2px solid #fdf9f0`
- radius: `10px`
- letter spacing: `5px`
- text-transform: uppercase

Hub hamburger icon
- lines: `3px` height, `30px` width
- color: `#fdf9f0`

Bio
- header container is `position: sticky`
- no visible shadow; background solid `#1c1d1e`

### Layout / spacing

Bio page content wrapper (parent of the "prolog" label)
- padding left/right: `192px` at desktop (computed `padding: 0px 192px`)
- width: matches viewport (e.g. 1400px)

Hub hero wrapper `.big-boy`
- positioned absolutely, centered-ish: `top: 20%`, `left: 200px` on desktop
- responsive shifts to center transform on smaller widths

---

## 2) Components to replicate

### Hub cards / "hand-drawn" vibe
From the screenshot, the hub uses:
- dark background with subtle contour-line texture
- light serif typography
- white rounded-stroke CTA

**Action**: in our Tailwind build, implement a “hand-drawn card” style:
- rounded corners
- visible 2px stroke in `#fdf9f0`
- slightly imperfect feel via subtle shadow + tiny rotate on hover (optional)

### Biography headings + separators
Bio uses:
- centered title stack (author line + two-line title)
- section labels like `prolog` set in serif, same color, centered
- separators using an asterisk glyph `∗`

**Action**: ensure our biography layout has:
- centered title block
- a reusable separator component rendering `∗` centered with spacing

---

## 3) Screenshot references

Saved locally during audit:
- Hub full page: `MEDIA:/home/baboon/.clawdbot/media/browser/e151ee61-cd37-4cc2-b4b8-69509febd526.png`
- Bio (attempted; extremely long page hits pixel limit): `MEDIA:/home/baboon/.clawdbot/media/browser/5ad90c5a-2d16-41d4-b35a-7bcc7ed2d813.png`

---

## 4) Implementation notes for our repo

Suggested Tailwind tokens:
- `theme.colors.dark = '#1c1d1e'`
- `theme.colors.hub = '#282828'`
- `theme.colors.light = '#fdf9f0'`
- `theme.fontFamily.serif = ['ui-serif','Georgia','Cambria','"Times New Roman"','Times','serif']`

And reusable component classes:
- `.rb-card` → border 2px light, rounded-xl, bg transparent, subtle shadow
- `.rb-cta` → uppercase, tracking-[0.3em], border-2, rounded-[10px]
- `.rb-sep` → centered `∗` with margin
