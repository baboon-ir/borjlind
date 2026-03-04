# Phase 1: CSS Foundation — Research

**Researched:** 2026-03-04
**Domain:** Tailwind CSS removal, plain CSS migration, Eleventy build pipeline
**Confidence:** HIGH — grounded entirely in direct codebase inspection

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CSS-01 | Tailwind CSS (PostCSS-pipeline, alla `@apply`-direktiv, `prose`-klasser) är borttaget från projektet | Full audit complete: 4 devDependencies to remove, 2 scripts to delete, 1 config file to delete |
| CSS-02 | Plain CSS-fil ersätter Tailwind — innehåller CSS reset och all befintlig styling | All component classes catalogued from `tailwind.css` source; reset requirements identified |
| CSS-03 | CSS custom properties definierar färgpalett och typsnitt | 3 brand colors + 3 font stacks identified from `tailwind.config.cjs`; `theme()` call inventory complete |
| CSS-04 | Visuell paritet med nuvarande design — inget ska se annorlunda ut efter migreringen | Compiled `main.css` is the ground truth; Tailwind utility inventory in templates complete |
</phase_requirements>

---

## Summary

Phase 1 removes Tailwind CSS v3 + PostCSS + autoprefixer from the project and replaces the compiled `assets/css/main.css` with a hand-written plain CSS file that produces identical visual output. The Eleventy build pipeline already passthrough-copies `assets/css/main.css` directly — no PostCSS plugin is involved in Eleventy. The only change needed in `.eleventy.js` is the deletion of Tailwind references (none exist there; Tailwind is run as a separate CLI process via `npm-run-all`). The compiled `main.css` is the authoritative reference for what the new plain CSS must reproduce.

The project's custom CSS (source file `assets/css/tailwind.css`) contains 44 `@apply` directives that produce no output without the Tailwind pipeline. These must all be expanded to explicit CSS property declarations. The `@tailwindcss/typography` `prose` macro embedded in `.rb-prose` expands to ~400 lines in the compiled output — these rules must be extracted verbatim and kept. Three brand colors (`dark`, `hub`, `light`) and three font stacks (serif, sans, mono) must become CSS custom properties.

Across all `.njk` layout and include files, approximately 45-55 unique Tailwind utility classes are used directly in HTML class attributes. These must either be eliminated by incorporating their declarations into component rules, or given new semantic class names. The number is finite and fully inventoried below.

**Primary recommendation:** Write the new `assets/css/main.css` working directly from the compiled `main.css` as the source of truth, stripping all Tailwind infrastructure (custom properties, utility classes, `prose-invert` variable blocks), keeping the hand-written component rules and extracted prose rules. Update `.njk` templates to remove utility classes simultaneously.

---

## Standard Stack

### What Stays (no changes)

| Technology | Version | Role |
|-----------|---------|------|
| Eleventy | 2.0.1 | Build — already passthrough-copies `assets/css/main.css` |
| Nunjucks | bundled | Templates — class names will change, structure stays |
| markdown-it + plugins | 14.1.0 | Content rendering — no CSS coupling |

### What Is Removed

| Remove | From | Replace With |
|--------|------|-------------|
| `tailwindcss` | `devDependencies` | Nothing |
| `@tailwindcss/typography` | `devDependencies` | Extracted prose rules in plain CSS |
| `postcss` | `devDependencies` | Nothing |
| `autoprefixer` | `devDependencies` | Nothing |
| `dev:css` script | `package.json` | Nothing — Eleventy serves CSS directly |
| `build:css` script | `package.json` | Nothing |
| `tailwind.config.cjs` | project root | Nothing |
| `postcss.config.cjs` | project root | Nothing (if it exists) |
| `assets/css/tailwind.css` | source file | `assets/css/main.css` (hand-written) |

### After Removal

`devDependencies` drops to: `npm-run-all` only (can also be removed, or kept for future use).

Updated `package.json` scripts:
```json
{
  "scripts": {
    "dev": "eleventy --serve --watch",
    "build": "eleventy"
  }
}
```

If `npm-run-all` is removed too, `devDependencies` becomes empty `{}`.

**Uninstall command:**
```bash
npm uninstall tailwindcss @tailwindcss/typography postcss autoprefixer
```

---

## Architecture Patterns

### Recommended CSS File Structure

```
assets/css/main.css   (single file, hand-written, replaces compiled output)
```

Sections in the new file, in order:

```css
/* 1. Custom Properties (design tokens) */
:root { ... }

/* 2. Minimal Reset (replaces Tailwind preflight) */
*, *::before, *::after { ... }
html, body { ... }
/* form elements, images, etc. */

/* 3. Base / Global */
html, body { font-family: var(--font-serif); ... }
h1, h2, h3, h4, h5, h6 { ... }

/* 4. Prose Component (.rb-prose) */
/* Extracted from compiled main.css — largest section */
.rb-prose { ... }
.rb-prose :where(p) { ... }
/* ... all prose rules ... */

/* 5. Layout Components */
/* Hub page */
.rb-hub-bg, .rb-hub-pattern, .rb-hub-video, .rb-hub-overlay { ... }

/* Header */
.rb-header, .rb-brand, .rb-navlink, .rb-nav-toggle, .rb-nav-close { ... }

/* Nav panel */
.rb-nav-panel, .rb-nav-backdrop, .rb-nav-content { ... }

/* Hero */
.rb-hero, .rb-hero-inner, .rb-hero-title { ... }

/* CTA / Buttons */
.rb-cta, .rb-btn, .rb-card { ... }

/* Biography page */
.rb-title-block, .rb-controls, .rb-bio-page { ... }
.rb-page-input, .rb-page-meta { ... }

/* Content components */
.rb-prose figure, .rb-prose img, .rb-prose figcaption { ... }
.rb-accordion, .rb-minne, .rb-quote { ... }
.rb-sep, .rb-center, .rb-indent, .rb-poem, .rb-video { ... }
.rb-part { ... }
.read-more { ... }

/* 6. Appendix layout */
.appendix-layout, .appendix-nav, .appendix-nav-link { ... }
.appendix-content { ... }

/* 7. Utility classes needed in templates (or inline into components) */
/* See inventory below — these are the 45-55 Tailwind utilities still in .njk */

/* 8. Responsive overrides */
@media (max-width: 768px) { ... }
@media (min-width: 640px) { ... }
@media (min-width: 768px) { ... }
```

### How Eleventy Handles CSS (no change needed)

The `.eleventy.js` already has this, and it stays exactly as-is:

```javascript
eleventyConfig.addPassthroughCopy({ "assets/css/main.css": "assets/css/main.css" });
```

Eleventy does not run PostCSS — it just copies the file. The PostCSS pipeline runs as a separate `tailwindcss` CLI process. When that CLI process is removed, Eleventy continues to work — it just copies whatever is in `assets/css/main.css`.

---

## Complete `@apply` Inventory (Must All Be Expanded)

Every `@apply` in `assets/css/tailwind.css` with its plain-CSS expansion:

| Selector | `@apply` directive | Plain CSS equivalent |
|----------|-------------------|---------------------|
| `html, body` | `font-serif bg-dark text-light` | `font-family: var(--font-serif); background-color: var(--color-dark); color: var(--color-light);` |
| `.rb-navlink` | `no-underline text-light hover:text-light` | `text-decoration: none; color: var(--color-light);` + hover rule |
| `.rb-nav-toggle, .rb-nav-close` | `text-light hover:text-light` | `color: var(--color-light);` + hover |
| `.rb-hero-inner` | `relative` | `position: relative;` |
| `.rb-hero-title` | `text-center font-serif font-bold leading-[1.15]` | `text-align: center; font-family: var(--font-serif); font-weight: 700; line-height: 1.15;` |
| `.rb-cta` | `inline-flex items-center justify-center no-underline` | `display: inline-flex; align-items: center; justify-content: center; text-decoration: none;` |
| `.rb-card` | `block h-full rounded-2xl border-2 border-light/80 bg-transparent p-4 no-underline` | `display: block; height: 100%; border-radius: 1rem; border: 2px solid rgba(253,249,240,0.8); background: transparent; padding: 1rem; text-decoration: none;` |
| `.rb-card:hover` | `border-light` | `border-color: var(--color-light);` |
| `.rb-card-title` | `text-sm font-semibold` | `font-size: 0.875rem; font-weight: 600;` |
| `.rb-card-sub` | `mt-1 text-xs text-light/70` | `margin-top: 0.25rem; font-size: 0.75rem; color: rgba(253,249,240,0.7);` |
| `.rb-part` | `mt-48 mb-24` | `margin-top: 12rem; margin-bottom: 6rem;` |
| `.rb-title-block` | `mx-auto text-center` | `margin: 0 auto; text-align: center;` |
| `.eleventy-plugin-youtube-embed` | `my-24` | `margin-top: 6rem; margin-bottom: 6rem;` |
| `.rb-title-author` | `text-base text-light` | `font-size: 1rem; color: var(--color-light);` |
| `.rb-title-line` | `text-base text-light` | `font-size: 1rem; color: var(--color-light);` |
| `.rb-controls` | `bg-dark/90 text-light` | `background-color: rgba(28,29,30,0.9); color: var(--color-light);` |
| `.rb-page-input` | `bg-transparent border-0 px-2 py-1 text-light text-center focus:outline-none` | `background: transparent; border: 0; padding: 0.25rem 0.5rem; color: var(--color-light); text-align: center;` + focus rule |
| `.rb-input` | `w-24 rounded-xl border-2 border-light/50 bg-dark/60 px-3 py-2 text-sm text-light focus:outline-none` | `width: 6rem; border-radius: 0.75rem; border: 2px solid rgba(253,249,240,0.5); background: rgba(28,29,30,0.6); padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--color-light);` + focus rule |
| `.rb-btn` | `inline-flex items-center justify-center rounded-xl border-2 border-light/70 bg-transparent px-4 py-2 text-sm text-light no-underline` | `display: inline-flex; align-items: center; justify-content: center; border-radius: 0.75rem; border: 2px solid rgba(253,249,240,0.7); background: transparent; padding: 0.5rem 1rem; font-size: 0.875rem; color: var(--color-light); text-decoration: none;` |
| `.rb-btn:hover` | `border-light` | `border-color: var(--color-light);` |
| `.rb-bio-page` | `w-full bg-transparent` | `width: 100%; background: transparent;` |
| `.rb-page-meta` | `hidden` | `display: none;` |
| `.rb-prose` | `prose prose-invert max-w-none` | Extract compiled prose rules (see section below) |
| `.read-more` | `inline-block mb-1 text-xs font-light text-white` | `display: inline-block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 300; color: #ffffff;` |
| `.rb-minne` | `my-6 p-4` | `margin-top: 1.5rem; margin-bottom: 1.5rem; padding: 1rem;` |
| `.rb-quote` | `my-6 p-4 italic border-light pl-4` | `margin-top: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; font-style: italic; border-color: var(--color-light);` |
| `.rb-prose img` | `shadow-md` | `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);` |
| `.rb-prose figcaption` | `mt-2 text-sm italic text-light/70` | `margin-top: 0.5rem; font-size: 0.875rem; font-style: italic; color: rgba(253,249,240,0.7);` |
| `.rb-sep` | `mx-auto my-24 text-center text-light/80 stars` | `margin: 0 auto; margin-top: 6rem; margin-bottom: 6rem; text-align: center; color: rgba(253,249,240,0.8);` — note `.stars` class styles are explicit in source |
| `.appendix-nav-link` | (color via `theme()`, not `@apply`) | `color: var(--color-light);` |
| `.appendix-content h1` | `text-3xl font-bold mb-6` | `font-size: 1.875rem; font-weight: 700; margin-bottom: 1.5rem;` |
| `.appendix-content h2` | `text-xl font-semibold mt-8 mb-4` | `font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;` |
| `.appendix-content p` | `mb-4 leading-relaxed` | `margin-bottom: 1rem; line-height: 1.625;` |
| `.rb-center` | `text-center my-6` | `text-align: center; margin-top: 1.5rem; margin-bottom: 1.5rem;` |
| `.rb-indent` | `my-4` | `margin-top: 1rem; margin-bottom: 1rem;` |
| `.rb-poem` | `my-6 italic` + `my-28` (second apply overrides) | `margin-top: 7rem; margin-bottom: 7rem; font-style: italic;` |
| `.rb-poem p` | `my-6` | `margin-top: 1.5rem; margin-bottom: 1.5rem;` |
| `.rb-video` | `my-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30` | `margin-top: 1.5rem; margin-bottom: 1.5rem; overflow: hidden; border-radius: 1rem; border: 1px solid rgb(39,39,42); background: rgba(0,0,0,0.3);` |
| `.rb-video iframe, video` | `w-full aspect-video` | `width: 100%; aspect-ratio: 16/9;` |

**Note on `.rb-poem` double `@apply`:** The source has `@apply my-6 italic;` then on a separate line `@apply my-28;`. The second one overrides `my`. The compiled output confirms: `margin-top: 7rem; margin-bottom: 7rem;` (the `my-28` wins).

---

## `theme()` References Inventory (Must Become CSS Variables)

All `theme('colors.X')` calls in `tailwind.css` that resolve to brand colors:

| Call | Resolved value | CSS variable replacement |
|------|---------------|-------------------------|
| `theme('colors.hub')` | `#282828` | `var(--color-hub)` |
| `theme('colors.light')` | `#fdf9f0` | `var(--color-light)` |
| `theme('colors.dark')` | `#1c1d1e` | `var(--color-dark)` |

CSS custom properties to declare in `:root`:

```css
:root {
  color-scheme: dark;
  --header-h: 56px;

  /* Brand colors */
  --color-dark: #1c1d1e;
  --color-hub: #282828;
  --color-light: #fdf9f0;

  /* Font stacks */
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 768px) {
  :root { --header-h: 98px; }
}
```

---

## Tailwind Utility Classes in `.njk` Templates (Must Be Replaced)

Inventory of every Tailwind utility class used directly in `.njk` files. These are NOT in `tailwind.css` — they are in the HTML class attributes. They must either be absorbed into component rules or given semantic replacements.

### `layouts/base.njk`
```
min-h-screen, font-serif, bg-dark, text-light, flex, flex-col,
flex-1, relative, z-10, w-full, mt-auto
```
Also: conditional `flex items-center justify-center` on `<main>` when `mainClass == 'h-full'`.
Also: `mx-auto max-w-5xl` as the default `mainClass`.

**Strategy:** Convert `bodyClass` and `mainClass` from Tailwind strings to semantic class names. E.g. `bodyClass: rb-hub-bg` (already used on home), `mainClass: rb-main` (add rule).

### `includes/header.njk`
```
sticky, top-0, z-[100], text-light (on header),
mx-auto, flex, h-[56px], md:h-[98px], max-w-5xl, items-center, justify-between, gap-6, px-4, relative (on inner div),
no-underline (on brand link),
flex, items-center, gap-4, text-sm (on nav),
flex, items-center, gap-2 (on toggle button),
fixed, inset-0, z-[50], hidden (on nav panel),
absolute, inset-0, bg-black (on backdrop),
relative, z-10, flex, min-h-full, flex-col, items-start, justify-start, px-8, pt-[140px], max-w-5xl, mx-auto (on nav content),
text-left, space-y-6, text-3xl (on nav ul),
block (on nav links)
```

**Note:** `md:h-[98px]` is a responsive variant — the height rule is already in `.rb-controls` component styling for the controls bar. For the header, use `--header-h` CSS variable.

### `includes/bio-controls.njk`
```
fixed, bottom-0, left-0, right-0, z-[100] (already in .rb-controls component),
mx-auto, flex, h-[56px], md:h-[98px], max-w-5xl, items-center, justify-between, gap-6, px-4 (inner div),
flex, items-center, gap-2 (left group)
```

### `layouts/biography.njk`
```
mt-10, grid (on the bio pages container div)
```
Also: `bodyClass: bg-dark text-light`, `mainClass: "mw-full pt-0!"` (non-standard utility).

### `includes/bio-page.njk`
```
py-12, scroll-mt-32 (on section — these are on .rb-bio-page element),
text-xs, font-mono, text-light/60 (on page meta divs),
no-underline, text-xs, font-mono, text-light/60 (on anchor in meta),
text-sm, text-light/60 (on empty page placeholder)
```

### `includes/hub-grid.njk`
```
mt-6, grid, gap-4, sm:grid-cols-3 (on grid wrapper)
```

### `layouts/home.njk`
```
flex, justify-center, mt-8 (on CTA wrapper div)
```

### `layouts/appendix.njk` and `layouts/minnen.njk`
```
mx-auto, max-w-5xl, px-4, pt-2, pb-6 (on title wrapper),
text-6xl, font-bold, mb-4, lowercase (on h1),
text-lg (on description p),
px-4 (on content wrapper)
```

### `layouts/memory.njk`
```
card, p-6 (on section — "card" is not a project class, this may be a vestigial class),
flex, flex-wrap, items-start, justify-between, gap-4 (on header row),
text-xl, font-semibold, tracking-tight (on h1),
mt-1, text-xs, font-mono, text-zinc-500 (on period div),
btn (vestigial class?),
mt-4, text-sm, text-zinc-300 (on teaser p),
mt-6, prose-dark (on content div — "prose-dark" is not a project class)
```

**Note:** `memory.njk` uses `.card`, `.btn`, and `.prose-dark` which are NOT defined anywhere in the CSS. These appear to be holdover classes from an earlier codebase. They currently render with only Tailwind utility styles. This must be addressed during migration — likely by converting to semantic styles inline in the template or adding rules.

### `includes/footer.njk`
```
border-t, border-zinc-900, py-10,
mx-auto, max-w-5xl, px-4, text-xs, text-zinc-500,
flex, flex-wrap, items-center, justify-between, gap-4
```

### `.eleventy.js` renderBio function (generates HTML with inline classes)
```
my-5, overflow-hidden, rounded-2xl, border, border-zinc-800, bg-black/30 (YouTube embed wrapper),
aspect-video, h-full, w-full (YouTube iframe),
mt-6, rounded-2xl, border, border-zinc-800, bg-black/30, p-4 (MORE details block),
cursor-pointer, select-none, text-sm, text-zinc-200 (MORE summary),
mt-4 (MORE content div),
prose-dark (renderBio output div wrapping content)
```

**Critical:** The `renderBio` function in `.eleventy.js` generates HTML with hardcoded Tailwind utility class names. These must be replaced with semantic class names or explicit inline styles.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS reset / normalize | Custom property-by-property reset | Extract the minimal reset rules listed below | Tailwind preflight is load-bearing; the specific reset rules are already identified |
| Prose typography | Rewrite from scratch | Extract from compiled `main.css` verbatim | The compiled output already contains expanded prose rules — 400+ lines; rewriting introduces regressions |

**Minimal reset (replaces Tailwind preflight for this project):**

```css
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
}

p, blockquote, figure, hr, pre, dl, ol, ul {
  margin: 0;
}

a {
  color: inherit;
  text-decoration: inherit;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

button, select { text-transform: none; }
button, [type="button"], [type="reset"], [type="submit"] {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}

audio, canvas, embed, iframe, img, object, svg, video {
  display: block;
  vertical-align: middle;
}

img, video {
  max-width: 100%;
  height: auto;
}

ol, ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

summary { display: list-item; }
textarea { resize: vertical; }
[hidden] { display: none; }
```

---

## Common Pitfalls

### Pitfall 1: `.rb-prose` collapses without `@apply prose prose-invert`
**What goes wrong:** The prose macro expands to ~400 lines of typography rules. Removing Tailwind without extracting these leaves `.rb-prose` with no paragraph spacing, no heading hierarchy, collapsed lists.
**How to avoid:** Extract prose rules verbatim from `assets/css/main.css` (compiled output). The compiled file already contains the fully expanded prose block starting with `.rb-prose{--tw-prose-body:#374151;...}`. Copy and clean it into the new file.
**Warning signs:** All 276 biography pages render as unstyled text after migration.

### Pitfall 2: `theme()` calls resolve to nothing without PostCSS
**What goes wrong:** Any `theme('colors.light')` remaining in the new CSS file renders as `transparent`. There are 8 such calls in `tailwind.css`.
**How to avoid:** Replace all `theme('colors.X')` with `var(--color-X)` before writing the new file.

### Pitfall 3: Tailwind form-element reset disappearing
**What goes wrong:** Tailwind preflight zeros button appearance, input borders, and font inheritance. When removed, native browser defaults re-apply: buttons look raised/3D, inputs get grey borders, fonts change.
**How to avoid:** Include the minimal reset section above — specifically the button and input rules.

### Pitfall 4: Double `@apply` on `.rb-poem` — second overrides first
**What goes wrong:** `tailwind.css` has two `@apply` lines on `.rb-poem`. `@apply my-6 italic;` is overridden by `@apply my-28;`. Copying only the first apply produces wrong margins.
**How to avoid:** Use compiled `main.css` as ground truth: `margin-top: 7rem; margin-bottom: 7rem;` (from `my-28`).

### Pitfall 5: `.rb-sep` uses `.stars` via `@apply`
**What goes wrong:** `.rb-sep { @apply mx-auto my-24 text-center text-light/80 stars; }` — `.stars` is a project-defined class applied via `@apply`. This is unusual. The compiled output confirms `.rb-sep` gets the `.stars` rules (font-size: 48px, font-weight: 900, margin: 112px 0) merged into it. The explicit `margin: 112px 0` from `.stars` overrides the `my-24` from the same `@apply` line.
**How to avoid:** Apply the `.stars` rules (font-size, font-weight, margin) directly to `.rb-sep` in the new CSS. The final `.rb-sep` rule from compiled output is: `text-align: center; color: rgba(253,249,240,0.8); font-size: 48px; font-weight: 900; margin: 112px 0;`

### Pitfall 6: `renderBio` in `.eleventy.js` generates hardcoded Tailwind classes
**What goes wrong:** The `renderBio` function generates HTML with `class="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30"` etc. These classes will have no styles without Tailwind.
**How to avoid:** Replace these with a new semantic class (e.g. `.rb-yt-embed`) in the function, and add the corresponding rule to the plain CSS. Two patterns to replace: YouTube embed wrapper, and the `[MORE]` details block.

### Pitfall 7: `memory.njk` uses undefined classes `.card`, `.btn`, `.prose-dark`
**What goes wrong:** These class names appear in `memory.njk` but are not defined anywhere in `tailwind.css` or the compiled `main.css` as component classes. They currently only receive styling via Tailwind's scan of `p-6`, `flex`, etc. After migration, `.card`, `.btn`, `.prose-dark` produce nothing.
**How to avoid:** During template cleanup, replace these with correct project class names (`.rb-card`, `.rb-btn`, `.rb-prose`) or define new rules.

### Pitfall 8: `bodyClass` and `mainClass` in frontmatter contain Tailwind utilities
**What goes wrong:** `biography.njk` has `bodyClass: bg-dark text-light` and `mainClass: "mw-full pt-0!"` — these are injected into `<body class="min-h-screen font-serif {{ bodyClass }}">`. After removing Tailwind, `bg-dark`, `text-light`, `min-h-screen`, `font-serif`, `pt-0!` produce nothing.
**How to avoid:** Replace the frontmatter values with semantic class names (e.g. `bodyClass: rb-body-dark`) and define corresponding rules. Or inline the required declarations directly into the component CSS.

---

## Code Examples

### CSS Custom Properties (Design Tokens)
```css
/* Source: tailwind.config.cjs inspection */
:root {
  color-scheme: dark;
  --header-h: 56px;

  --color-dark: #1c1d1e;
  --color-hub: #282828;
  --color-light: #fdf9f0;

  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 768px) {
  :root { --header-h: 98px; }
}
```

### Base Styles (replaces `html, body { @apply font-serif bg-dark text-light; }`)
```css
/* Source: compiled main.css inspection */
html, body {
  background-color: var(--color-dark);
  font-family: var(--font-serif);
  color: var(--color-light);
  font-size: 1.0625rem;
  line-height: 1.7;
  font-weight: 400;
}

body {
  background:
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)),
    url(/assets/images/noise-light.png) top left repeat;
}

@media (max-width: 640px) {
  body { font-size: 1rem; }
}
```

### Nav Panel (replaces utility classes in header.njk)
```css
/* Replaces: fixed inset-0 z-[50] hidden */
[data-nav-panel] {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: none;
}

/* Replaces: absolute inset-0 bg-black */
.rb-nav-backdrop {
  position: absolute;
  inset: 0;
  background-color: #000;
}

/* Replaces: relative z-10 flex min-h-full flex-col items-start justify-start px-8 pt-[140px] max-w-5xl mx-auto */
.rb-nav-content {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 140px 2rem 2rem;
  max-width: 64rem;
  margin: 0 auto;
}

/* Replaces: text-left space-y-6 text-3xl on nav ul */
.rb-nav-list {
  text-align: left;
  font-size: 1.875rem;
}
.rb-nav-list li + li {
  margin-top: 1.5rem;
}
```

### Hub Grid (replaces `mt-6 grid gap-4 sm:grid-cols-3`)
```css
.rb-hub-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .rb-hub-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

### Footer (replaces utility classes)
```css
.rb-footer {
  border-top: 1px solid rgb(24 24 27);
  padding: 2.5rem 0;
}

.rb-footer-inner {
  margin: 0 auto;
  max-width: 64rem;
  padding: 0 1rem;
  font-size: 0.75rem;
  color: rgb(113 113 122);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
```

### YouTube Embed (replaces hardcoded classes in renderBio)
```css
/* New semantic class to replace Tailwind utilities in .eleventy.js */
.rb-yt-embed {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgb(39 39 42);
  background: rgba(0, 0, 0, 0.3);
}

.rb-yt-embed-ratio {
  aspect-ratio: 16/9;
}

.rb-yt-embed-ratio iframe {
  width: 100%;
  height: 100%;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Tailwind v2 (purge config) | Tailwind v3 (JIT + content scanning) | Not relevant — being removed entirely |
| PostCSS plugin in Eleventy | Separate CLI process | CSS already decoupled from Eleventy build; no `.eleventy.js` changes needed |
| Tailwind utility classes in HTML | Semantic component classes in CSS | What this phase achieves |

**Autoprefixer note:** Autoprefixer was used to add vendor prefixes (`-webkit-backdrop-filter` etc.). The compiled output already contains `-webkit-backdrop-filter` where needed. In the new plain CSS file, these can be included explicitly since they are already in the compiled reference: `backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);`. No autoprefixer needed — they are already known.

---

## Open Questions

1. **`mw-full pt-0!` in `biography.njk` `mainClass`**
   - What we know: `mw-full` and `pt-0!` are not standard Tailwind classes (the `!` suffix means `!important` in Tailwind v3, i.e. `padding-top: 0 !important`). `mw-full` is not a standard utility — it may be custom or a typo for `max-w-full`.
   - What's unclear: Whether `mw-full` is intentional or dead code. The compiled `main.css` does not contain a `.mw-full` rule, so it currently has no effect.
   - Recommendation: Treat `mw-full` as dead code. For `pt-0!`, absorb into the biography layout component rule with `padding-top: 0`.

2. **`memory.njk` uses `.prose-dark` class on content div**
   - What we know: `.prose-dark` is not defined in `tailwind.css` or any project CSS. It is also generated by `renderBio` in `.eleventy.js`. This suggests it was intended as a component class but was never implemented.
   - Recommendation: Replace with `.rb-prose` in both `memory.njk` and `renderBio` in `.eleventy.js`.

3. **`content-visibility: auto` on `.rb-bio-page` — keep during Phase 1?**
   - Decision per PITFALLS.md: YES — keep `content-visibility: auto` during Phase 1. It is still valid for the current vertical scroll model and removing it during CSS migration would be a scope expansion.
   - Recommendation: Keep unchanged in the new CSS.

---

## Validation Architecture

Visual parity is the primary success criterion (CSS-04). There is no automated test suite. Validation is manual.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — manual visual verification |
| Config file | None |
| Quick run command | `npx @11ty/eleventy --serve` |
| Full site command | `npx @11ty/eleventy` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method |
|--------|----------|-----------|---------------------|
| CSS-01 | No tailwindcss/postcss/autoprefixer in package.json | Manual | `cat package.json` — confirm no Tailwind references |
| CSS-01 | No `@tailwind` or `@apply` in any CSS file | Manual | Check `assets/css/main.css` contains no `@tailwind` or `@apply` |
| CSS-02 | Single `assets/css/main.css` file used by all pages | Manual | Check `<link>` tag in built HTML, check file exists and is human-readable |
| CSS-03 | CSS custom properties for colors and fonts in `:root` | Manual | Inspect `:root` block in new `main.css` |
| CSS-04 | Visual parity on all pages | Manual | Side-by-side browser comparison — all 5 page types (home, biografi, minnen, memory detail, appendix) |

### Page Types to Verify Visually

| Page | URL | Key visual elements |
|------|-----|-------------------|
| Home (hub) | `/` | Video background, pattern overlay, hero title, nav |
| Biography | `/biografi/` | Title block, controls bar, prose content, accordions |
| Minnen | `/minnen/` | Grid cards |
| Memory detail | `/minnen/{slug}/` | Content layout |
| Appendix | `/appendix/` | Sticky nav, content columns |

### Wave 0 Gaps

None — no test infrastructure needed. Validation is visual.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `/assets/css/tailwind.css` — source CSS with all `@apply` directives (full inventory above)
- `/assets/css/main.css` — compiled Tailwind output (ground truth for what each rule produces)
- `/tailwind.config.cjs` — brand colors and font stacks
- `/package.json` — scripts and devDependencies to remove
- `/.eleventy.js` — passthrough copy configuration, `renderBio` function with hardcoded classes
- `/layouts/*.njk` — Tailwind utility class usage in templates
- `/includes/*.njk` — Tailwind utility class usage in includes

### Secondary (HIGH confidence — prior codebase research)
- `.planning/research/STACK.md` — Decision 4: Tailwind removal strategy (extract-and-rewrite)
- `.planning/research/PITFALLS.md` — Pitfalls 2, 6, 7, 13 (prose collapse, @apply, colors, reset)
- `.planning/codebase/STACK.md` — confirmed dependency versions

---

## Metadata

**Confidence breakdown:**
- `@apply` inventory: HIGH — counted directly from source file
- Tailwind utility classes in templates: HIGH — counted directly from all `.njk` files
- CSS custom properties needed: HIGH — from `tailwind.config.cjs`
- Prose rules strategy: HIGH — compiled output confirmed as ground truth
- Visual parity verification: HIGH — manual, no ambiguity

**Research date:** 2026-03-04
**Valid until:** Stable — this is a snapshot of the current codebase state. Valid until templates or CSS source files change.
