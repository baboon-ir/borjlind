# Codebase Concerns

**Analysis Date:** 2026-03-06

## Technical Risks

**Page and chapter limits are duplicated in code and content metadata**
- `TOTAL_PAGES` is still hardcoded to `276` in [`.eleventy.js`](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js), while chapter boundaries live separately in [`_data/chapters.js`](/Users/hakanfilip/my-workspace/projects/borjlind/_data/chapters.js).
- Impact: any extension, removal, or split of the biography requires synchronized edits in multiple places. If one value drifts, redirects, collections, TOC data, and the reader can disagree.
- Risk level: High for maintainability, medium for production correctness.

**Missing biography files are masked by placeholder generation**
- The `biografiAll` collection in [`.eleventy.js`](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js) silently creates empty placeholder entries for any page from `1..276` that does not exist on disk.
- Impact: build output can look structurally correct while content is missing. This makes editorial mistakes harder to detect during review.
- Risk level: High for content integrity.

**Reader behavior depends on fragile CSS-columns pagination**
- The biography reader combines server-rendered chapter HTML in [`layouts/biography.njk`](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/biography.njk) with client-side `scrollLeft` pagination in [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js) and CSS columns in [`assets/css/main.css`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css).
- Impact: layout correctness depends on browser column behavior, computed widths, image heights, details expansion, and viewport height. This is a brittle rendering model for mixed prose and media.
- Risk level: High for UX stability.

**Custom markdown pipeline is powerful but tightly coupled**
- [`.eleventy.js`](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js) contains bespoke parsing for `[MORE]`, `[yt-video][URL]`, and multiple `markdown-it-container` variants, including token mutation for accordions.
- Impact: small refactors or dependency upgrades can break rendering semantics across all 276 biography pages. The logic also repeats the YouTube replacement regex in several branches.
- Risk level: Medium-high for maintenance.

**Raw HTML in markdown is enabled**
- `markdown-it` is configured with `html: true` in [`.eleventy.js`](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js), and `renderBio` additionally special-cases raw `<div class="">...</div>` blocks.
- Impact: content authors effectively have code execution rights over markup structure. That is acceptable for trusted editorial content, but it increases the blast radius of malformed or copied HTML.
- Risk level: Medium.

## Maintainability Risks

**Concern doc had drifted from the actual codebase**
- The previous version referenced old files and behaviors that are no longer the primary path in the current reader.
- Impact: future planning can be misled unless codebase maps are refreshed after reader changes.
- Risk level: High for project hygiene.

**Styling mixes semantic classes, leftover utility naming, and inline styles**
- The markdown renderer injects markup such as `<div class="w-full gap-1">` and an inline-styled divider image from [`.eleventy.js`](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js), while the rest of the project has moved to handwritten CSS in [`assets/css/main.css`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css).
- Impact: the rendering layer now has presentation rules split between templates, JS-rendered HTML, and CSS. This makes future visual changes more error-prone.
- Risk level: Medium.

**The reader has no automated safety net**
- There are no visible tests around collections, chapter assembly, pagination math, or markdown rendering.
- Impact: regressions in build output, anchor generation, and navigation are likely to be caught only by manual browsing.
- Risk level: High.

## Performance Risks

**The biography page ships a very large DOM**
- [`layouts/biography.njk`](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/biography.njk) renders all chapter content into one page, even though only one chapter is visible at a time.
- Impact: initial HTML size, DOM memory use, and relayout cost grow with every additional biography page, image, and expandable block.
- Risk level: Medium now, high if the biography expands materially.

**Resize and content reflow recalc on the client**
- [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js) recomputes column width and page count on resize, but not on all layout-changing events.
- Impact: the reader can report stale page counts or land on awkward offsets after content height changes.
- Risk level: Medium.

**Image delivery depends on a third-party host**
- Biography pages reference many images on `pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev` rather than local assets.
- Impact: performance and reliability depend on an external object store and network path outside the repository. Broken links or host latency degrade the reader even when the site itself is healthy.
- Risk level: Medium-high.

## UX Risks

**Accordion expansion can desynchronize pagination**
- The README explicitly calls out that accordion toggles should trigger page-count recalculation, but [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js) still does not listen for `<details>` toggle events.
- Impact: after opening accordion content, the visible page indicator and stored `bio:pos` state can become inaccurate.
- Risk level: High.

**Saved reading position is device-relative, not content-relative**
- The reader stores `{ chapter, page }` in `localStorage` under `bio:pos` in [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).
- Impact: because a "page" is just a CSS column index, the same saved position can point to different text after viewport changes, font rendering differences, or future content edits.
- Risk level: High for continuity of reading experience.

**TOC overlay is only partially accessible**
- The TOC panel toggles `aria-hidden` and click handlers in [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js), but there is no visible focus management, escape-key handling, or active-chapter marking.
- Impact: keyboard and assistive-technology users have a weaker navigation experience, and sighted users get no active state in the chapter list.
- Risk level: Medium.

**Global interaction model suppresses normal browser behaviors**
- [`assets/css/main.css`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css) disables selection on the biography container, and the reader relies on pointer gesture capture in [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).
- Impact: copy/paste, text selection, and some assistive interaction patterns are degraded in the main reading surface.
- Risk level: Medium.

**`scrollTo({ behavior: 'instant' })` is a portability risk**
- [`assets/js/bio-reader.js`](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js) uses `'instant'` as the non-animated scroll behavior.
- Impact: support is less predictable than `'auto'`, so cross-browser behavior may vary silently.
- Risk level: Low-medium.

## Content Risks

**The imported biography text still contains visible OCR/import artifacts**
- Sample pages such as [`content/pages/biografi/pages/page-56.md`](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-56.md) and [`content/pages/biografi/pages/page-121.md`](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-121.md) contain spacing and tokenization errors like `tvåbarn`, `iövervåningen`, `såfulla`, `Tvåkaffe`, and `värdligt`-style word merges.
- Impact: this is now a reader-facing quality issue, not just an import-stage cleanup task.
- Risk level: High for editorial polish.

**Image accessibility is inconsistent**
- Some biography images use descriptive alt text, while others are empty or filename-based, for example in [`content/pages/biografi/pages/page-35.md`](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-35.md).
- Impact: screen-reader quality and generated figure captions are inconsistent across the book.
- Risk level: Medium.

**Content formatting conventions are easy to break**
- The site relies on exact markers like `[MORE]`, `::: indent`, `::: poem`, `::: accordion`, and bespoke raw HTML patterns.
- Impact: minor authoring mistakes can degrade rendering without obvious build failures.
- Risk level: Medium-high.

## Recommended Watchlist

**Highest-priority follow-ups**
- Add a build-time validation step that fails on missing biography pages, invalid frontmatter, and broken chapter ranges.
- Recompute pagination when accordions open or close.
- Move from page-index persistence to anchor-based persistence where possible.
- Audit and clean OCR artifacts across biography pages before treating content as final.
- Decide whether remote `r2.dev` images are an intentional dependency or should be mirrored into repository-managed assets.

---

*Concerns audit refreshed against current reader implementation, selected biography pages, and minnen content.*
