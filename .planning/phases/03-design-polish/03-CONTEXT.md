# Phase 3: Design Polish - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply design/readability polish to the existing biography reader experience, with focus on color comfort, typography, spacing rhythm, and reader UI surface tone. This phase does not add new reader capabilities or navigation features.

</domain>

<decisions>
## Implementation Decisions

### Reading palette and contrast
- Base background direction: warm charcoal (soft near-black), not pure black.
- Body text direction: warm off-white for long-read comfort, not high-contrast white.
- Secondary text (year label, metadata): medium-muted contrast for clear hierarchy.
- Accent usage: minimal; reserve accent for active/interactive states only.

### Typography system
- Body typography direction: move to a new literary serif stack (book-like, editorial tone).
- Body size target: optimize around 17px equivalent.
- Body line height target: ~1.72 for long-form readability.
- Body tracking target: subtle positive tracking (~0.01em).

### Reading measure and density
- Prose measure target: centered ~65ch max line length.
- Paragraph rhythm: moderate spacing (neither compact nor overly airy).
- Mobile insets: symmetric left/right padding for a calm centered text block.
- Heading behavior inside prose: subtle hierarchy so prose remains primary.

### Reader chrome and control tone
- Sticky top kicker: low-contrast glass treatment (present but understated).
- Bottom page indicator: quiet persistent presence.
- TOC panel: same palette as reader with slightly elevated surface contrast.
- Control shape language: subtle rounded controls with restrained borders.

### Locked from prior requirements/context
- Single-theme experience only (no dark/light mode toggle).
- Phase scope remains design polish only; no scope expansion into swipe/page-mode features in this phase.

### Claude's Discretion
- Exact token values for the final palette within the chosen warm-charcoal/off-white direction.
- Exact serif font stack and fallback sequence that best fits current deployment constraints.
- Precise spacing scale values for headings, paragraphs, and controls.
- Motion/transitions details (if any) as long as they preserve understated reading focus.

</decisions>

<specifics>
## Specific Ideas

- Long-form reading should feel calm and book-like, with reduced glare and controlled hierarchy.
- UI chrome should stay visible but non-distracting while content remains the visual priority.
- Typography should gain a more distinctive literary character than the current default-like serif stack.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `assets/css/main.css`: already tokenized with `:root` and reader-specific `--rb-*` variables; primary surface for Phase 3 polish.
- `layouts/biography.njk`: defines the current reader shell (`.rb-reader-kicker`, `.rb-bio-container`, `.rb-reader-footer`) and is the integration point for chrome-level polish.
- `includes/bio-toc.njk`: provides TOC structure and button hierarchy; supports panel tone refinements without feature changes.
- `assets/js/bio-reader.js`: already handles TOC open/close and footer/year labels; no new behavior required for this phase.

### Established Patterns
- `rb-*` class namespace is the consistent styling convention.
- Vanilla JS + data-attribute hooks are stable and should remain unchanged for design-only changes.
- Current reader uses sticky top/bottom UI and segment-scroll model; Phase 3 should polish this model rather than re-architect it.

### Integration Points
- Update reader color/typography/spacing tokens in `:root` and reader-specific blocks in `assets/css/main.css`.
- Refine text measure and rhythm through `.rb-bio-container`, `.rb-page-prose`, and `.rb-prose` rules.
- Tune chrome prominence via `.rb-reader-kicker`, `.rb-year-toggle`, `.rb-reader-footer`, `.rb-page-indicator`, `.rb-toc-*` selectors.
- Keep templates and JS hooks intact unless minor markup support is needed for purely visual adjustments.

</code_context>

<deferred>
## Deferred Ideas

- Any swipe/page-toggle redesign or new navigation capability remains outside this phase and belongs to reader-functionality phases.

</deferred>

---

*Phase: 03-design-polish*
*Context gathered: 2026-03-19*
