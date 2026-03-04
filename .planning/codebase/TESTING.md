# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Status:** Not implemented

- No test framework installed (Jest, Vitest, Mocha not in `package.json`)
- No test files found in codebase (no `.test.js`, `.spec.js`, or `__tests__/` directories)
- No test configuration files present

**Why Testing is Minimal:**
- Project is primarily a **static site generator** (Eleventy + Tailwind + content)
- No backend API or complex business logic requiring unit tests
- Content is Markdown-driven; data validation minimal
- JavaScript modules are UI-focused (DOM manipulation, localStorage)

## Manual Testing Approach

**Browser-based validation:**
- No automated test runner; testing is performed manually or through build verification
- Build command: `npm run build` (runs Eleventy and Tailwind)
- Development command: `npm run dev` (runs both processes in watch mode)

**What Should Be Tested (Manual):**
- Biography page rendering: Navigate to `/biografi/` and verify all 276 pages load
- Page input field: Enter page numbers and verify scroll to correct anchor
- Continue reading: Verify localStorage persistence across page refreshes
- Navigation menu: Test open/close, keyboard (ESC), backdrop click
- Responsive design: Test mobile/tablet/desktop layouts
- Markdown rendering: Verify custom containers (`::: center`, `::: accordion`, etc.) render correctly
- Video embeds: Test YouTube embed parsing in biography content

## JavaScript Code Structure (Observable Tests)

**`bio-reader.js` (`/Users/hakanfilip/workspace/projects/private/borjlind/assets/js/bio-reader.js`):**

Key behaviors that should be tested:
1. **getCurrentAnchor()** - Returns page element ID at top of viewport
   - Should return null if no page visible
   - Should track position during scroll

2. **getCurrentPageNumber()** - Extracts page number from anchor
   - Should parse `p-NNN` format correctly
   - Should default to 1 if no anchor

3. **updatePageDisplay()** - Updates input field and URL hash
   - Should sync input value with scroll position
   - Should update `location.hash` without reload

4. **save()** - Persists scroll state to localStorage
   - Stores: `{ anchor, y, updatedAt }`
   - Should handle localStorage errors gracefully

5. **restore()** - Recovers scroll position from localStorage
   - Should not override explicit `location.hash`
   - Should use `requestAnimationFrame` for smooth scroll
   - Should call `scrollIntoView()` then restore Y position

6. **gotoPage(n)** - Navigate to page by number
   - Should clamp input to [1, 276]
   - Should set `location.hash` to trigger scroll

7. **setup()** - Initialization on DOMContentLoaded
   - Restores previous position
   - Attaches event listeners: `change`, `blur` on input; `click` on buttons
   - Throttles scroll save with `requestAnimationFrame`

**Example manual test (browser console):**
```javascript
// Verify storage key
localStorage.getItem("bio:last")

// Verify page anchor format
document.querySelector(".rb-bio-page[id^='p-']").id // Should be "p-NNN"

// Verify current page tracking
window.bio_reader?.getCurrentPageNumber?.() // If exposed
```

## Navigation Menu Testing (`nav.js`)

**`nav.js` (`/Users/hakanfilip/workspace/projects/private/borjlind/assets/js/nav.js`):**

Key behaviors:
1. **setOpen(open)** - Toggle menu visibility
   - Adds/removes `rb-nav-open` class on root
   - Sets `aria-expanded` on button
   - Sets `aria-hidden` on panel
   - Updates button text: "Meny" (open) / "Stäng" (closed)

2. **Button click** - Toggle menu on click
3. **ESC key** - Close menu on Escape press
4. **Backdrop click** - Close menu when clicking panel backdrop
5. **Link click** - Close menu when clicking any navigation link
6. **Header scroll background** - Add `is-scrolled` class when scrollY > 10

**Example manual test sequence:**
1. Click menu button → panel should appear, button text changes to "Stäng"
2. Press ESC → panel closes, text changes to "Meny"
3. Click backdrop → panel closes
4. Scroll down > 10px → header gets `is-scrolled` class

## Eleventy Build Testing

**Configuration file: `.eleventy.js`**

**What to verify in build output:**
1. **Collections work:**
   - `minnen` collection filters by `tag: "minne"`
   - `biografiPages` collection sorts by `page.number`
   - `biografiAll` collection creates 1..276 placeholders for missing pages

2. **Filters work:**
   - `pad3` filter pads numbers: `1` → `"001"`
   - `bioRender` filter handles `[MORE]` block splitting and video embeds

3. **Pass-through files:**
   - `assets/css/main.css` → output
   - `assets/js/bio-reader.js` → output
   - `assets/js/nav.js` → output
   - `assets/images/` directory → output

4. **Ignored files:**
   - `docs/` not included in site output
   - `README.md` not built as page
   - `.trash_restructure/` excluded

**Verify build output:**
```bash
npm run build
ls -la _site/  # Check generated files
grep -r "rb-center" _site/  # Verify custom containers rendered
```

## Content Data Testing

**No automated schema validation**, but content should follow patterns:

**Biography pages (`content/pages/biografi/pages/page-NNN.md`):**
- Required frontmatter: `page.number`, `anchor`, `tags`, `layout`
- Anchor format: `p-NNN` (3-digit zero-padded)
- Tags must include `biografiPage` for collection inclusion

**Example valid page:**
```yaml
---
page:
  number: 11
anchor: p-011
permalink: false
tags: [biografiPage]
layout: biography
---

[Content here]
```

## Markdown Rendering Tests

**Custom container parsing (from `.eleventy.js`):**

Test these markdown syntaxes render correctly:
```markdown
::: center
Content
:::

::: indent
Content
:::

::: poem
Content
:::

::: quote
Content
:::

::: accordion
Summary line
Content after summary
:::

::: video
Content
:::
```

**Video embed syntax:**
```markdown
[yt-video][https://www.youtube.com/watch?v=ZItDrGcdLRc]
```
Should render as embedded iframe with YouTube URL.

## Python Script Testing (Data Processing)

**No automated test suite**, but scripts have explicit purposes:

**`import-biography.py`:**
- Splits single biography export file by `## Page N/276` markers
- Creates individual `page-NNN.md` files with frontmatter
- Test: Run script on sample file, verify all 276 pages created with correct numbering

**`fix-spacing.py`:**
- Corrects OCR artifacts in biography text
- Statistics dict tracks fixes: `e_acute_fixes`, `split_word_fixes`, etc.
- Test: Run on sample page, verify statistics printed and file updated

**`fix-spacing-3.py`, `fix-spacing-and-urls.py`:**
- Additional pass-based text cleanup
- Test: Chain scripts together, verify cumulative fixes without data loss

**How to verify:**
```bash
# Check file was modified
python3 fix-spacing.py
git diff content/pages/biografi/pages/  # Review changes

# Verify frontmatter preserved
head -10 content/pages/biografi/pages/page-011.md  # Should have YAML frontmatter
```

## Coverage

**Requirements:** None enforced

**Current state:**
- JavaScript browser scripts: No unit test coverage
- Python data scripts: No test coverage
- Eleventy config: No test coverage
- Markdown content: Manual review only

**What would improve reliability:**
- Unit tests for `getCurrentAnchor()` with mocked DOM
- Integration tests verifying Eleventy collections produce correct output
- Validation script for biography page frontmatter (page numbers sequential, anchors correct)
- E2E tests with Playwright/Puppeteer for navigation flows and scroll restoration

## Testing Local Changes

**Recommended manual test workflow:**
```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:8080

# 3. Test biography navigation:
#    - Scroll through pages, check page number updates
#    - Refresh page, should restore scroll position
#    - Enter page number in input, verify jump

# 4. Test navigation menu:
#    - Click "Meny" button, panel opens
#    - Press ESC, panel closes
#    - Click backdrop, panel closes

# 5. Build and verify output
npm run build
ls -la _site/biografi/
```

## Quality Verification Checklist

- [ ] No TypeScript/linting errors (no linter configured; review manually)
- [ ] `npm run build` completes without errors
- [ ] Biography pages load and display correctly
- [ ] Page navigation via input field works
- [ ] Scroll position persists across page reload
- [ ] Mobile menu opens/closes
- [ ] No console errors in browser DevTools
- [ ] Custom markdown containers render with correct CSS classes

---

*Testing analysis: 2026-03-04*
