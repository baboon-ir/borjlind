# Phase 3 Research: Design Polish (Ecosystem)

Scope reminder: this phase is visual/readability polish only. Do not add reader capabilities.

## Standard Stack

Use this stack for Phase 3.

- Use Eleventy + Nunjucks as-is for markup structure and build-time composition (`layouts/biography.njk`, `includes/bio-toc.njk`) instead of runtime templating.
- Use one authored CSS source of truth (`assets/css/main.css`) with semantic custom properties (`--rb-*`) for palette/typography/surfaces.
- Use native CSS features first: `@layer`, logical properties (`padding-inline`), `ch`, `dvh`, `env(safe-area-inset-*)`, `text-wrap`, `color-mix()`.
- Use existing vanilla JS (`assets/js/bio-reader.js`) unchanged unless a visual-only hook is impossible in CSS.
- Use WCAG-driven acceptance checks for contrast and spacing resilience (1.4.3, 1.4.12, 1.4.8) as release gate.

Confidence: High

## Architecture Patterns

Use this implementation pattern.

1. Use a 3-tier token architecture in CSS.
- Tier 1: foundation tokens in `:root` (raw palette, font stacks).
- Tier 2: reader semantic tokens (`--rb-bg`, `--rb-text`, `--rb-surface`, `--rb-border`, `--rb-text-muted`).
- Tier 3: component mapping (`.rb-reader-kicker`, `.rb-reader-footer`, `.rb-toc-panel`, `.rb-page-prose`).

2. Use cascade layering to prevent specificity escalation.
- Define order once: `@layer reset, base, components, utilities;`
- Put long-form prose rules in `components`, temporary one-off fixes in `utilities`.

3. Use typographic constraints as hard system rails.
- Keep prose measure locked around `65ch` (inside WCAG visual-presentation max width guidance).
- Keep body line-height unitless (`1.72`) to preserve scaling behavior.
- Keep body size at `17px` equivalent (`1.0625rem`) and subtle tracking on prose (`0.01em`).

4. Use logical spacing for mobile symmetry.
- Replace asymmetric physical paddings with `padding-inline` tokens to enforce equal insets.

5. Use progressive enhancement for modern polish features.
- Gate newer features behind `@supports` (`text-wrap: pretty`, `color-mix(...)`) and keep static fallback values first.

6. Keep behavior architecture unchanged.
- Style around existing hooks (`data-year-toggle`, `data-toc-panel`, `data-footer-center`) and existing sticky shell.

Confidence: High

## Don't Hand-Roll

Use platform primitives instead of custom implementations.

- Do not hand-roll safe-area detection. Use `env(safe-area-inset-*)` for sticky top/bottom chrome offsets.
- Do not hand-roll viewport height JS fixes. Use `dvh`/`svh` units (because `vh` maps to `lvh`).
- Do not hand-roll color interpolation math. Use `color-mix()` with fixed fallbacks.
- Do not hand-roll heading/break balancing logic in JS. Use `text-wrap: balance` (headings) and `text-wrap: pretty` (prose where needed).
- Do not hand-roll template data merge logic. Use Eleventy Data Cascade precedence.
- Do not hand-roll interaction animation toggles. Use `@media (prefers-reduced-motion: reduce)`.
- Do not add client runtime libraries for typography/reader chrome polish.

Confidence: High

## Common Pitfalls

1. Sticky surfaces not sticking.
- Cause: ancestor `overflow` creates a different scrolling mechanism; missing inset (`top`/`bottom`) makes sticky behave like relative.
- Preventive rule: audit ancestors for `overflow` and ensure explicit `top`/`bottom` on sticky elements.

2. Inconsistent mobile insets and visual rhythm drift.
- Current code has asymmetric paragraph insets on mobile (`16px` left / `24px` right), which conflicts with phase intent.
- Preventive rule: centralize one symmetric inline inset token and apply via logical properties.

3. Warm palette drops below readable contrast.
- Cause: "soft" charcoal + off-white combinations are easy to under-contrast for small text.
- Preventive rule: enforce WCAG 1.4.3 contrast checks for body and control text before merge.

4. Text-spacing override failures (accessibility regressions).
- Cause: fixed heights/overflow clipping in compact chrome or headings.
- Preventive rule: test SC 1.4.12 overrides (line/paragraph/letter/word spacing) and require no clipping/overlap.

5. `color-scheme` side effects on browser UI.
- Cause: `color-scheme` also affects default form controls, scrollbars, and UA UI.
- Preventive rule: keep `color-scheme: dark` intentional and verify control appearance on Safari/Chrome/Firefox.

6. Overusing `text-wrap: pretty` on huge content blocks.
- Cause: better wrap quality uses slower algorithm.
- Preventive rule: limit to long-form containers where typography benefit is visible.

7. Backdrop blur assumptions on older devices.
- Cause: `backdrop-filter` baseline is recent; older environments may not render it.
- Preventive rule: always provide opaque/translucent color fallback before blur.

8. `content-visibility: auto` interactions misunderstood.
- Cause: off-screen content rendering can be skipped; can alter perceived timing of layout work.
- Preventive rule: keep intrinsic size declared and test scroll-linked indicators after typography/spacing changes.

Confidence: Medium-High

## Code Examples

Use this pattern directly in `assets/css/main.css`.

```css
@layer reset, base, components, utilities;

@layer base {
  :root {
    /* Foundation */
    --rb-bg: #1a1917;
    --rb-text: #f1ece2;
    --rb-surface: #23211f;
    --rb-border: rgba(241, 236, 226, 0.18);
    --rb-text-muted: #a9a093;

    --rb-font-body: Iowan Old Style, Palatino Linotype, URW Palladio L, P052, serif;
    --rb-body-size: 1.0625rem; /* 17px */
    --rb-body-leading: 1.72;
    --rb-body-tracking: 0.01em;
    --rb-measure: 65ch;

    --rb-inline-inset-mobile: 1rem;
    --rb-inline-inset-desktop: 1.5rem;
  }
}

@layer components {
  .rb-bio-container {
    background: var(--rb-bg);
    color: var(--rb-text);
  }

  .rb-page-prose {
    max-width: var(--rb-measure);
    margin-inline: auto;
    font-family: var(--rb-font-body);
    font-size: var(--rb-body-size);
    line-height: var(--rb-body-leading);
    letter-spacing: var(--rb-body-tracking);
    text-wrap: pretty;
  }

  .rb-prose :where(h1, h2, h3, h4) {
    text-wrap: balance;
    letter-spacing: 0.005em;
  }

  .rb-reader-kicker,
  .rb-reader-footer,
  .rb-toc-inner {
    background-color: rgba(35, 33, 31, 0.72); /* fallback first */
    backdrop-filter: blur(8px);
    border-color: var(--rb-border);
  }

  @media (max-width: 768px) {
    .rb-page-prose,
    .rb-prose > * {
      padding-inline: var(--rb-inline-inset-mobile);
    }
  }

  @media (min-width: 769px) {
    .rb-page-prose,
    .rb-prose > * {
      padding-inline: var(--rb-inline-inset-desktop);
    }
  }

  .rb-reader-footer {
    position: sticky;
    bottom: 0;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  }
}

@layer utilities {
  @media (prefers-reduced-motion: reduce) {
    .rb-toc-panel,
    .rb-reader-kicker,
    .rb-reader-footer {
      transition: none !important;
      animation: none !important;
    }
  }

  @supports (color: color-mix(in oklab, black, white)) {
    :root {
      --rb-border: color-mix(in oklab, var(--rb-text) 22%, transparent);
    }
  }
}
```

Use this quick verification checklist during implementation.

```md
- [ ] Body text contrast >= 4.5:1 against reader background
- [ ] Prose measure stays at ~65ch on desktop
- [ ] Mobile prose uses symmetric inline insets
- [ ] Sticky top/bottom chrome respects safe-area insets on iOS
- [ ] Text spacing override (1.4.12 values) causes no clipping/overlap
- [ ] Reduced-motion media query disables non-essential transitions
```

Confidence: High

## Sources

Primary documentation used:

- W3C WCAG 2.2 Understanding SC 1.4.12 Text Spacing: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing
- W3C WCAG Understanding SC 1.4.8 Visual Presentation: https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation
- W3C WCAG Understanding SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- W3C WCAG Understanding SC 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- W3C Technique C39 (`prefers-reduced-motion`): https://www.w3.org/WAI/WCAG21/Techniques/css/C39
- MDN `line-height`: https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
- MDN `color-scheme`: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- MDN `env()`: https://developer.mozilla.org/en-US/docs/Web/CSS/env
- MDN `<length>` (`vh`, `dvh`, `svh`, `lvh`, `ch`): https://developer.mozilla.org/en-US/docs/Web/CSS/length
- MDN `content-visibility`: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
- MDN `position` (sticky behavior): https://developer.mozilla.org/en-US/docs/Web/CSS/position
- MDN `@layer`: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
- MDN `text-wrap`: https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
- MDN `color-mix()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
- MDN `oklch()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
- MDN `padding-inline`: https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline
- Eleventy Data Cascade: https://www.11ty.dev/docs/data-cascade/
- Eleventy Layouts: https://www.11ty.dev/docs/layouts/
- Eleventy Nunjucks support: https://www.11ty.dev/docs/languages/nunjucks/
