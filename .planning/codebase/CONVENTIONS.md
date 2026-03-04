# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- JavaScript modules: `camelCase.js` (e.g., `bio-reader.js`, `nav.js`)
- Configuration files: `kebab-case.cjs` or full descriptive names (e.g., `postcss.config.cjs`, `tailwind.config.cjs`)
- Markdown content: `page-NNN.md` (zero-padded page numbers, e.g., `page-011.md`, `page-268.md`)
- Python scripts: `kebab-case.py` with lowercase (e.g., `fix-spacing.py`, `import-biography.py`)
- Layout/template files: `lowercase.njk` (e.g., `base.njk`, `home.njk`)
- Include/partial files: `kebab-case.njk` (e.g., `bio-controls.njk`, `nav-panel.njk`)

**JavaScript Variables:**
- camelCase for local variables and function names (e.g., `getCurrentAnchor()`, `gotoPage()`, `updatePageDisplay()`)
- UPPERCASE with underscores for constants (e.g., `const KEY = "bio:last"`, `const TOTAL = 276`)
- Short descriptive names for DOM query results (e.g., `btn`, `panel`, `root`, `header`)

**CSS/Tailwind Classes:**
- Custom component classes: `rb-` prefix (e.g., `rb-bio-page`, `rb-center`, `rb-indent`, `rb-poem`, `rb-video`, `rb-accordion`, `rb-section`, `rb-quote`, `rb-minne`)
- Data attributes for JavaScript hooks: `data-kebab-case` (e.g., `data-page-input`, `data-continue`, `data-top`, `data-nav-toggle`, `data-nav-panel`, `data-nav-close`, `data-header`, `data-biography`)
- Utility classes from Tailwind (no custom naming)

**Python Variables:**
- snake_case for function and variable names (e.g., `parse_biography_file()`, `create_page_file()`, `output_dir`, `page_num`)
- ALL_CAPS for module-level constants (e.g., `stats = {}` dictionary for tracking)

## Code Style

**Formatting:**
- No linter or formatter configured (ESLint, Prettier not present)
- JavaScript: 2-space indentation (observed in `.eleventy.js`)
- Python: 4-space indentation (PEP 8 style, observed in Python scripts)
- CSS: Tailwind CSS utility-first approach; no custom CSS framework

**Structure:**
- Immediately-invoked function expressions (IIFE) for browser scripts to avoid global scope pollution:
  ```javascript
  (() => {
    // code here
  })();
  // or
  (function () {
    // code here
  })();
  ```

## Import Organization

**JavaScript (Node/CommonJS):**
- Order: Standard library → Third-party packages → Local modules
- Example from `.eleventy.js`:
  ```javascript
  const embedEverything = require("eleventy-plugin-embed-everything");
  const markdownIt = require("markdown-it");
  const markdownItContainer = require("markdown-it-container");
  const markdownItImplicitFigures = require("markdown-it-implicit-figures");
  ```

**Eleventy Configuration:**
- Module exports use standard CommonJS pattern: `module.exports = function (eleventyConfig) { ... }`
- Plugins added via `eleventyConfig.addPlugin()`
- Filters registered with `eleventyConfig.addFilter()`
- Collections created with `eleventyConfig.addCollection()`

## Comment Style

**When to Comment:**
- Comments explain the "why", not the "what"
- Comments document complex regex patterns or non-obvious transformations
- Comments mark sections of code with `===` dividers in Python scripts
- Example: `// Lazy-load all images` explains intent

**Inline Comments:**
- Short comments on same line: `// comment`
- Block comments for multi-line explanations:
  ```javascript
  // Find the matching container_accordion_close
  // Collect content tokens (after summary, before close)
  ```

**Docstrings (Python):**
- Module-level docstrings at file start
- Function docstrings with triple quotes
- Example from `import-biography.py`:
  ```python
  def parse_biography_file(input_file):
      """Parse the input file and split by page markers"""
  ```

## Function Design

**Size:**
- Small, focused functions (typically 10-30 lines)
- Avoid nested functions unless necessary for closure/scope

**Parameters:**
- Keep parameter counts low (≤3 parameters preferred)
- Use destructuring for object parameters when applicable
- Example: `function renderBio(text) { ... }` with implicit null-coalescing

**Return Values:**
- Explicit return values for data-transforming functions
- Void functions used for side effects (DOM manipulation, localStorage writes)
- Example: `const getCurrentAnchor()` returns string or null

**Error Handling:**
- Try-catch blocks for defensive JSON/localStorage operations:
  ```javascript
  try {
    payload = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {}
  // Silent failure acceptable for non-critical operations
  ```
- Silent catch blocks used when graceful degradation is appropriate

## Module Design

**JavaScript Patterns:**
- Private state via closure/IIFE (browser scripts)
- No named exports; scripts use global event listeners (`window.addEventListener`, `DOMContentLoaded`)
- Configuration objects for constants (e.g., `const KEY = "..."`; `const TOTAL = 276`)

**Python Patterns:**
- Scripts use `if __name__ == "__main__":` guard for executable code
- Helper functions extracted to support `main()` entry point
- Statistics dictionaries (`stats = {}`) to track transformation results

**Eleventy Conventions:**
- Filters are pure functions that transform input to output
- Collections return arrays of processed items
- Global data functions return static data or computed values
- Pass-through copy defined explicitly with paths

## Markdown Content

**Frontmatter (YAML):**
```yaml
---
page:
  number: 11
anchor: p-011
permalink: false
tags: [biografiPage]
layout: biography
---
```

**Page number references:**
- Zero-padded 3-digit numbers: `p-001`, `p-011`, `p-276`
- Stored in `page.number` and `anchor` fields in frontmatter

**Custom Markdown Containers:**
- `::: center` → wraps in `.rb-center` div
- `::: indent` → wraps in `.rb-indent` div
- `::: poem` → wraps in `.rb-poem` div
- `::: quote` → wraps in `<blockquote class="rb-quote">`
- `::: minne` → wraps in `.rb-minne` div
- `::: accordion` → wraps in `<details>` with summary extraction
- `::: video` → wraps in `.rb-video` div
- `::: part` → inserts divider image

## Configuration

**Tailwind Custom Classes (tailwind.config.cjs):**
```javascript
theme: {
  extend: {
    colors: {
      dark: "#1c1d1e",
      hub: "#282828",
      light: "#fdf9f0"
    },
    fontFamily: {
      serif: ["ui-serif", "Georgia", ...],
      sans: ["ui-sans-serif", "system-ui", ...],
      mono: ["ui-monospace", "SFMono-Regular", ...]
    }
  }
}
```

**Build Configuration:**
- Eleventy config: `.eleventy.js`
- Tailwind config: `tailwind.config.cjs`
- PostCSS config: `postcss.config.cjs`
- No ESLint, Prettier, or TypeScript configuration

---

*Convention analysis: 2026-03-04*
