# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Video Embedding:**
- YouTube - Video embeds in biography pages
  - Method: URL parsing and iframe generation via eleventy-plugin-embed-everything
  - URLs supported: `https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, direct links
  - Implementation: Auto-detected by plugin; also custom iframe rendering in `.eleventy.js`

**Content Embedding:**
- eleventy-plugin-embed-everything - Auto-embeds external content
  - Supported: YouTube, Vimeo, Twitter/X, Codepen, and more
  - No authentication required; public embeds only

## Data Storage

**Databases:**
- Not applicable - Static site generator with no server-side data storage

**File Storage:**
- Cloudflare R2 - Image storage
  - Domain: `pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev`
  - Usage: All biography page images (content/pages/biografi/pages/*.md reference this domain)
  - Connection: Direct HTTPS image URLs in markdown; no API client
  - Examples:
    - `https://pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev/img/39.png`
    - `https://pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev/img/102.png`

**Local Assets:**
- `/assets/` directory
  - CSS: `assets/css/tailwind.css`, `assets/css/main.css`
  - Images: `assets/images/` (divider.png, pattern.png, noise-light.png)
  - JavaScript: `assets/js/bio-reader.js`, `assets/js/nav.js`

**Caching:**
- None detected - Static site with no runtime caching layer

## Authentication & Identity

**Auth Provider:**
- None - Public static site
- No user login, authentication, or permissions system

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Build logs available via GitHub Actions (if deploy workflow enabled)
- No application-level logging

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (primary option, workflow disabled)
- Cloudflare Pages (alternative option)

**CI Pipeline:**
- GitHub Actions (`.github/workflows/deploy.yml.disabled`)
  - Trigger: Push to main branch or manual workflow_dispatch
  - Environment: Ubuntu latest
  - Steps:
    1. Checkout repository
    2. Setup Node.js 22 with npm cache
    3. Install dependencies (`npm ci`)
    4. Build site (`npm run build`)
    5. Configure GitHub Pages
    6. Upload `_site` artifact
    7. Deploy to GitHub Pages
  - Permissions: contents read, pages write, id-token write

## Environment Configuration

**Required env vars:**
- None - Static site requires no runtime environment variables

**Secrets location:**
- No secrets management configured
- Cloudflare R2 credentials (if needed to upload new images) not in repo

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## External Asset Domains

**Image CDN:**
- `pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev` - Cloudflare R2 bucket
  - Serves biography images (276 pages + misc images)
  - Public read access via HTTPS

**Video Hosting:**
- `youtube.com` / `youtu.be` - YouTube video embeds
  - Uses standard YouTube iframe embed

---

*Integration audit: 2026-03-04*
