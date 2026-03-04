# Codebase Concerns

**Analysis Date:** 2026-03-04

## Tech Debt

**Hardcoded paths in Python scripts:**
- Issue: Multiple Python scripts contain absolute hardcoded paths (`/Users/hakanfilip/Documents/borjlind/...`) that will break if the project is moved or cloned elsewhere
- Files:
  - `fix-formatting.py` (line 28)
  - `fix-spacing.py` (line 248)
  - `fix-spacing-3.py` (line 155)
- Impact: Scripts cannot be run without manual path modification; automation/CI pipelines will fail
- Fix approach: Use `Path(__file__).parent` pattern (already used in some scripts like `fix-swedish-chars-and-frontmatter.py` and `import-biography.py`) to make paths relative to script location

**Hardcoded page count (276):**
- Issue: The page count "276" is hardcoded in multiple locations (`.eleventy.js` lines 268, 285; `bio-reader.js` line 3; `bio-page.njk` line 5)
- Files:
  - `.eleventy.js` (lines 268, 285)
  - `assets/js/bio-reader.js` (line 3)
  - `includes/bio-page.njk` (line 5)
- Impact: If biography is extended or shortened, multiple files must be updated simultaneously; easy to miss one location and cause inconsistency
- Fix approach: Extract page count as a configurable value in `.eleventy.js` global data and reference it in all locations

**Multiple Python data-fixing scripts:**
- Issue: Nine separate Python scripts (`fix-spacing.py`, `fix-spacing-3.py`, `fix-spacing-and-urls.py`, `fix-formatting.py`, `fix-swedish-chars-and-frontmatter.py`, `add-frontmatter-to-html.py`, `import-biography.py`, `renumber-pages.py`, `shift-up-pages.py`) implement overlapping fixes for OCR and data import issues
- Files: All `.py` files in project root (1036 lines total)
- Impact: Difficult to maintain; if new data needs similar processing, unclear which script to use; fixes may conflict or be duplicated; no documentation of intended execution order
- Fix approach: Consolidate into a single modular data-processing pipeline with clear stages (import → normalize Swedish chars → fix spacing → fix formatting); document execution order; remove scripts once data is final

**Inconsistent file naming patterns:**
- Issue: Biography pages use inconsistent names: some are `page-NNN.md` (historical) while frontmatter suggests they should be `NNN.md` (modern). Current files are named `page-1.md` through `page-276.md`
- Files:
  - `content/pages/biografi/pages/page-*.md` (276 files)
  - Referenced in `.eleventy.js` collections as `biografiPages` and `biografiAll`
- Impact: Naming mismatch may confuse future maintainers; refactoring scripts (e.g., `renumber-pages.py`) expect `NNN.md` format but actual files use `page-NNN.md`
- Fix approach: Rename all files to `NNN.md` format and update `.eleventy.js` collection filters accordingly

## Known Bugs

**Placeholder pages rendered when content missing:**
- Symptoms: Pages 1-276 always render, even if source file is missing. Missing pages show "(Demo saknar innehål för den här sidan.)" placeholder
- Files:
  - `.eleventy.js` (lines 258-280: `biografiAll` collection creates empty placeholder objects)
  - `includes/bio-page.njk` (lines 13-14: renders placeholder for empty content)
- Trigger: Any page between 1-276 that doesn't have a corresponding `page-NNN.md` file
- Workaround: None; must create empty content files for all 276 page numbers to avoid placeholders

**Page numbering mismatch in meta display:**
- Symptoms: `bio-page.njk` hardcodes `/276` in page metadata display, but actual page count varies
- Files: `includes/bio-page.njk` (line 5)
- Trigger: If biography extends beyond 276 pages, metadata will display incorrect total
- Workaround: Manually update template when page count changes

**YouTube embed regex fragility:**
- Symptoms: YouTube URL extraction in `.eleventy.js` uses simple regex that may fail for some URL formats
- Files: `.eleventy.js` (lines 186-191, 197-201, 209-213: regex `(?:v=|youtu.be\/|embed\/)([\w-]+)`)
- Trigger: YouTube URLs with unusual parameters or formats; international YouTube domain variations
- Workaround: Stick to standard `youtube.com/embed/` and `youtu.be/` URLs
- Impact: Embedded videos may fail silently

## Security Considerations

**Markdown HTML passthrough enabled:**
- Risk: `.eleventy.js` enables `html: true` in markdown-it configuration (line 6), allowing arbitrary HTML/JavaScript in markdown content
- Files: `.eleventy.js` (line 6)
- Current mitigation: Content is controlled (historical biography text), not user-generated; no form inputs
- Recommendations:
  - Add Content Security Policy headers (if deploying to platform that supports them)
  - Document that content files must be treated as code (security-sensitive)
  - Consider sanitizing HTML output if ever allowing user-generated content

**localStorage used without validation:**
- Risk: `bio-reader.js` stores/retrieves user scroll position from localStorage without validation
- Files: `assets/js/bio-reader.js` (lines 42-70)
- Current mitigation: Data is local-only; try-catch blocks prevent crashes from malformed data
- Recommendations:
  - Add schema validation for localStorage payload (validate `anchor` format, `y` is number)
  - Consider clearing stale entries (>30 days old based on `updatedAt`)

## Performance Bottlenecks

**Full biography as single page:**
- Problem: All 276 biography pages render as a single HTML page at `/biografi/`
- Files:
  - `.eleventy.js` (collection renders all pages in `layouts/biography.njk`)
  - `layouts/biography.njk` (lines 13-18: loops all pages)
- Cause: Architecture choice; enables smooth scrolling/hash navigation but creates large DOM
- Current capacity: 276 pages × ~50-200 lines each = ~20KB-50KB HTML before compression
- Improvement path:
  - If page count exceeds 500+, consider pagination (separate pages per 20-50 pages with client-side scroll restoration)
  - Monitor bundle size and Core Web Vitals (LCP, FID, CLS) on `/biografi/`
  - Lazy-load images beyond viewport (already enabled with `loading="lazy"` in `.eleventy.js`)

**Accordion rendering in markdown:**
- Problem: `.eleventy.js` accordion handler re-renders content tokens twice (lines 107, 119)
- Files: `.eleventy.js` (lines 69-126: accordion container handler)
- Cause: Content must be rendered before hiding tokens to avoid double-rendering by markdown-it
- Impact: For pages with multiple accordions, creates unnecessary rendering overhead
- Improvement path:
  - Profile `bioRender` filter output for pages with accordions
  - Consider pre-compiling accordion content at build time instead of runtime
  - For large biographies with many accordions, consider lazy-rendering accordion content

## Fragile Areas

**SVG divider image hardcoded in config:**
- Files: `.eleventy.js` (line 59: divider image path in `rb-part` container)
- Why fragile: Image path `/assets/images/divider.png` is embedded in JavaScript string; moving or renaming image breaks rendering without error
- Safe modification: Always verify image exists before renaming; search codebase for all references to `/assets/images/divider.png`
- Test coverage: No tests for markdown container rendering; visual inspection only

**Markdown-it plugin render function mutation:**
- Files: `.eleventy.js` (lines 69-126: accordion handler mutates token types)
- Why fragile: Token type manipulation (`tokens[i].type = 'accordion_hidden'`) is unusual pattern; relies on markdown-it implementation details
- Safe modification:
  - Test with different markdown-it versions before upgrading
  - Document why token mutation is necessary (prevent double-rendering)
  - Consider adding comments explaining the token lifecycle
- Test coverage: Accordion rendering not covered by automated tests

**bio-reader.js scroll position restoration:**
- Files: `assets/js/bio-reader.js` (lines 50-70)
- Why fragile: Restores scroll to `y` coordinate without checking if page layout changed; if content is added/removed before user's last position, restoration fails
- Safe modification:
  - Prioritize anchor-based restoration over y-coordinate
  - Only fall back to y if anchor doesn't exist
  - Add timestamp validation (clear localStorage > 7 days old)
- Test coverage: No automated tests for scroll restoration

**Hardcoded 140px scroll threshold:**
- Files: `assets/js/bio-reader.js` (line 14: `r.top <= 140`)
- Why fragile: Magic number tied to header height; if header layout changes, page detection breaks
- Safe modification:
  - Extract as configurable constant
  - Calculate dynamically from header element height
  - Document relationship to header height
- Test coverage: No tests; behavior verified only manually in different viewports

**Collection filtering by page number:**
- Files: `.eleventy.js` (lines 252-256: sorts `biografiPages` collection by `page.number`)
- Why fragile: Assumes frontmatter `page.number` always exists and is numeric; missing/invalid data breaks sort
- Safe modification:
  - Add validation that extracts page number safely
  - Log warnings if page number is missing/invalid
  - Provide fallback sort (by filename) if parsing fails
- Test coverage: No tests for collection sorting

## Scaling Limits

**Page count hardcoded to 276:**
- Current capacity: 276 pages; placeholder system creates entries for all numbers
- Limit: If extending beyond 276, must update three locations (`.eleventy.js`, `bio-reader.js`, `bio-page.njk`)
- Scaling path:
  - Make page count a build-time configuration in `.eleventy.js`
  - Pass as global data to templates and client-side script
  - Document how to extend biography

**Single-page rendering:**
- Current capacity: 276 pages × ~100 lines average = ~27KB HTML (before Tailwind CSS)
- Limit: At 1000+ pages, single-page DOM may degrade performance on slow devices
- Scaling path:
  - Consider multi-page approach (e.g., 50 pages per file) with client-side nav
  - Or paginate server-side while maintaining hash-based restoration
  - Monitor Core Web Vitals at higher page counts

## Dependencies at Risk

**markdown-it-implicit-figures:**
- Risk: Small plugin (`0.12.0`); limited maintenance; used for `<figure>` wrapping
- Impact: If plugin breaks, must manually implement figure wrapping or revert to plain `<img>` tags
- Migration plan: Pin version; if issues arise, implement figure rendering in `.eleventy.js` filter instead of plugin

**eleventy-plugin-embed-everything:**
- Risk: Broad embed plugin; may have security implications if updated
- Impact: Embeds (YouTube, Vimeo, etc.) may break if plugin deprecated
- Migration plan: Audit which embeds are actually used; if only YouTube, implement custom filter in `.eleventy.js`

**Node 14+ requirement:**
- Risk: Old Node versions may not be available for CI/deployment
- Files: `package.json` not pinned to specific Node version; no `.nvmrc` file
- Mitigation: Add `.nvmrc` with LTS version; document minimum Node requirement in README

## Missing Critical Features

**No backup/version control for content files:**
- Problem: 276 individual markdown files represent years of biographical research; no git history or backup strategy documented
- Files: All `content/pages/biografi/pages/page-*.md`
- Blocks: Recovery from accidental deletion; understanding edit history; collaborative editing
- Recommendation: Ensure `.planning/` and all content is committed to git; consider automating daily backups to cold storage

**No data validation or schema:**
- Problem: Frontmatter (page number, anchor, tags) has no schema validation; invalid data fails silently
- Files: All 276 page files + `.eleventy.js` collection logic
- Blocks: Detecting corrupted content; bulk editing; automated data migration
- Recommendation: Add frontmatter schema validation (YAML schema or Zod) to build pipeline; add linting for markdown content

**No automated testing:**
- Problem: No tests for markdown rendering, scroll restoration, page navigation, or collection generation
- Files: Entire codebase
- Blocks: Safe refactoring; preventing regressions; documenting expected behavior
- Recommendation: Add smoke tests for:
  - Page count matches expected (276)
  - All pages have valid frontmatter
  - All images/videos referenced exist
  - Scroll restoration localStorage roundtrips correctly

## Test Coverage Gaps

**Markdown rendering pipeline:**
- What's not tested: Custom markdown containers (`::: accordion`, `::: poem`, etc.), YouTube embed extraction, figure generation, bioRender filter
- Files:
  - `.eleventy.js` (lines 25-156: all container handlers, image lazy-loading, bioRender)
  - `assets/js/bio-reader.js` (no tests at all)
- Risk: Markdown changes break silently; users see incorrect formatting or missing content
- Priority: High (affects 276 content pages)

**Page collection generation:**
- What's not tested: `biografiAll` collection placeholder generation, page number sorting, anchor generation
- Files: `.eleventy.js` (lines 259-280)
- Risk: Missing page numbers not detected; incorrect sort order silently renders wrong layout
- Priority: High (affects navigation)

**Client-side interactivity:**
- What's not tested: Scroll position restoration, page number input, "continue reading" button, navigation toggle, scroll-to-top
- Files:
  - `assets/js/bio-reader.js` (entire file)
  - `assets/js/nav.js` (entire file)
- Risk: Users experience broken scroll restoration or nav in specific browsers/devices
- Priority: Medium (affects UX but not content)

**Build output validation:**
- What's not tested: Generated HTML structure, CSS output, asset copying, permalink redirects
- Files: `.eleventy.js` entire configuration
- Risk: Build succeeds but outputs invalid or broken HTML
- Priority: Medium (critical for deployment)

---

*Concerns audit: 2026-03-04*
