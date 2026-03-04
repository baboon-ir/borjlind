# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
rolfborjlind-site/
├── .eleventy.js              # Eleventy config: collections, filters, markdown plugins
├── .gitignore                # Excludes _site, node_modules, etc.
├── .github/                  # GitHub workflows (CI/CD)
├── .planning/                # GSD planning documents
│   └── codebase/            # This folder
├── README.md                 # Project documentation
├── package.json              # NPM dependencies (11ty, tailwindcss, markdown-it plugins)
├── package-lock.json
├── postcss.config.cjs        # PostCSS: tailwindcss, autoprefixer
├── tailwind.config.cjs       # Tailwind theme: custom colors, fonts, plugins
│
├── assets/                   # Static files (not processed as templates)
│   ├── css/
│   │   ├── tailwind.css      # Tailwind source (import directives)
│   │   └── main.css          # Generated output (minified in production)
│   ├── images/               # Image files (jpg, png, svg) referenced in markdown
│   └── js/
│       ├── bio-reader.js     # Biography scroll state manager
│       └── nav.js            # Navigation menu toggle + header scroll effect
│
├── content/                  # Source content (Markdown)
│   └── pages/
│       ├── index.md          # Home page (/)
│       ├── appendix.md       # Appendix page (/appendix/)
│       ├── biografi/
│       │   ├── index.md      # Biography index (/biografi/)
│       │   └── pages/
│       │       ├── page-11.md         # Page 11 (example)
│       │       ├── page-35.md         # Page 35 (example)
│       │       └── ... (sparse: only ~10 pages for demo)
│       └── minnen/           # Memory collection
│           ├── index.md      # Memories list (/minnen/)
│           ├── filmsetet.md  # Memory detail (/minnen/filmsetet/)
│           ├── skrivbordet.md
│           └── vagen-hem.md
│
├── layouts/                  # Page templates (Nunjucks)
│   ├── base.njk              # Root layout (doctype, head, body, scripts)
│   ├── home.njk              # Home page layout (hub grid)
│   ├── biography.njk         # Biography page layout (stacked pages, controls)
│   ├── minnen.njk            # Memories list layout
│   ├── memory.njk            # Memory detail layout
│   ├── appendix.njk          # Appendix layout
│   └── page.njk              # Generic page layout
│
├── includes/                 # Reusable components (Nunjucks partials)
│   ├── header.njk            # Sticky header with nav menu
│   ├── footer.njk            # Footer content
│   ├── hub-grid.njk          # Memory card grid
│   ├── bio-controls.njk      # Page number input + continue button
│   └── bio-page.njk          # Single biography page section
│
├── docs/                     # Documentation (not rendered)
│   ├── deploy-github-pages.md
│   ├── deploy-cloudflare.md
│   └── decisions.md
│
├── _site/                    # Output directory (generated, excluded from git)
│
└── Python scripts (data processing, not core to site)
    ├── add-frontmatter-to-html.py
    ├── fix-formatting.py
    ├── fix-spacing.py
    ├── import-biography.py
    └── ... (5 total)
```

## Directory Purposes

**assets/:**
- Purpose: Static assets passed through to output unchanged
- Contains: CSS, JavaScript, images
- Key files: `css/main.css` (compiled Tailwind), `js/bio-reader.js`, `js/nav.js`, `images/*`

**content/pages/:**
- Purpose: Markdown source files organized by route
- Contains: YAML frontmatter + content body in CommonMark
- Key files: All `.md` files; biografi/pages/ has ~10 example pages out of 276 total

**layouts/:**
- Purpose: Nunjucks templates that wrap content
- Contains: Base layout, page-specific layouts, template variables
- Key files: `base.njk` (used by all), `biography.njk` (biography page collection)

**includes/:**
- Purpose: Reusable Nunjucks components (template fragments)
- Contains: Partials for header, footer, components
- Key files: `header.njk` (sticky nav), `bio-page.njk` (page section), `bio-controls.njk` (input+button)

**docs/:**
- Purpose: Project documentation, guides, decisions
- Contains: Deployment instructions, architecture notes
- Committed: Yes; not rendered by Eleventy

**.github/workflows/:**
- Purpose: CI/CD automation
- Contains: GitHub Actions workflows
- Committed: Yes

## Key File Locations

**Entry Points:**
- `content/pages/index.md`: Home page route, uses `layouts/home.njk`
- `content/pages/biografi/index.md`: Biography page route, uses `layouts/biography.njk`
- `content/pages/minnen/index.md`: Memories list route, uses `layouts/minnen.njk`
- `content/pages/appendix.md`: Appendix page route, uses `layouts/appendix.njk`

**Configuration:**
- `.eleventy.js`: Build config, collections, filters, markdown setup
- `tailwind.config.cjs`: Theme colors, fonts, plugin registration
- `postcss.config.cjs`: PostCSS processor setup
- `package.json`: Dependencies and npm scripts

**Core Logic:**
- `assets/js/bio-reader.js`: Scroll position tracking, page navigation
- `assets/js/nav.js`: Menu toggle, header scroll styling
- `.eleventy.js` (lines 168–230): `renderBio` filter for content transformation

**Testing:**
- No test files; static site with no unit/integration tests

## Naming Conventions

**Files:**
- Content: `<slug>.md` for single pages, `pages/<slug>/<n>.md` for numbered pages (e.g., `biografi/pages/page-11.md`)
- Layouts: `<page-type>.njk` (e.g., `home.njk`, `biography.njk`)
- Includes: `<component-name>.njk` (e.g., `header.njk`, `bio-page.njk`)
- Styles: `tailwind.css` (source), `main.css` (generated)
- Scripts: `<feature>.js` (e.g., `bio-reader.js`, `nav.js`)

**Directories:**
- kebab-case: `assets/`, `content/`, `layouts/`, `includes/`, `content/pages/minnen/`
- Plural form: `assets/css/`, `assets/js/`, `assets/images/`, `content/pages/`

**Data Attributes (HTML):**
- `data-page-input`: Page number input element
- `data-page="{{ n }}"`: Biography page section identifier
- `data-biography`: Marker on body to enable bio-reader.js
- `data-nav-toggle`: Menu button
- `data-nav-panel`: Menu panel
- `data-continue`: Continue reading button
- `data-header`: Header element (for scroll styling)

**CSS Classes (Tailwind + Custom):**
- Tailwind: Standard utilities (`flex`, `grid`, `text-sm`, `bg-dark`, `text-light`)
- Custom: `.rb-*` prefix for role-based styles (e.g., `.rb-bio-page`, `.rb-prose`, `.rb-header`)

## Where to Add New Code

**New Biography Page:**
- File: `content/pages/biografi/pages/page-NNN.md` (replace NNN with page number)
- Frontmatter:
  ```yaml
  ---
  page:
    number: NNN
  anchor: p-NNN
  tags: [biografiPage]
  layout: biography
  ---
  ```
- Rendered: Automatically added to `collections.biografiPages` and `collections.biografiAll`

**New Memory:**
- File: `content/pages/minnen/<slug>.md`
- Frontmatter:
  ```yaml
  ---
  title: Memory Title
  tags: [minne]
  layout: memory.njk
  ---
  ```
- Rendered: Automatically added to `collections.minnen`

**New Page (Static):**
- File: `content/pages/<slug>.md`
- Frontmatter:
  ```yaml
  ---
  title: Page Title
  layout: page.njk
  ---
  ```
- Route: `/slug/` (Eleventy auto-generates from directory structure)

**New Component/Include:**
- File: `includes/<component-name>.njk`
- Usage: `{% include "component-name.njk" %}` in layouts/content
- Context: Pass variables via `with { var: value }` syntax

**Utility/Filter:**
- Add to `.eleventy.js` via `eleventyConfig.addFilter(name, fn)`
- Example: `eleventyConfig.addFilter("example", (val) => val.toUpperCase())`

**Custom Markdown Block:**
- Register in `.eleventy.js` via `md.use(markdownItContainer, 'blockname', { render: (tokens, idx) => ... })`
- Usage in markdown: `::: blockname` … `:::`

## Special Directories

**_site/:**
- Purpose: Output directory for generated static site
- Generated: Yes (created by Eleventy during build)
- Committed: No (git-ignored)

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (created by npm install)
- Committed: No (git-ignored)

**.github/workflows/:**
- Purpose: CI/CD automation
- Generated: No (hand-written)
- Committed: Yes

**.planning/:**
- Purpose: GSD planning documents and analysis
- Generated: Partially (some auto-generated, some hand-written)
- Committed: Yes

**assets/images/:**
- Purpose: Image assets referenced in markdown (lazy-loaded)
- Generated: No (hand-uploaded)
- Committed: Yes

## Build & Development

**Development Mode:**
- Run: `npm run dev`
- Spawns: `npm-run-all --parallel dev:11ty dev:css`
  - `dev:11ty`: Eleventy server on port 8080, watches `content/`, `layouts/`, `includes/`, `assets/`
  - `dev:css`: Tailwind CLI watches CSS and generates `assets/css/main.css`

**Production Build:**
- Run: `npm run build`
- Spawns: `npm-run-all build:css build:11ty`
  - `build:css`: Tailwind with minification
  - `build:11ty`: Eleventy with production mode (optimizations)
- Output: `_site/` with minified CSS/HTML

## Import/Require Patterns

**No ES modules in client code** (vanilla JavaScript with IIFE pattern)

**Eleventy plugins** (required in `.eleventy.js`):
```javascript
const embedEverything = require("eleventy-plugin-embed-everything");
const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");
const markdownItImplicitFigures = require("markdown-it-implicit-figures");
```

**No shared JavaScript library** between pages (each script is self-contained IIFE)

---

*Structure analysis: 2026-03-04*
