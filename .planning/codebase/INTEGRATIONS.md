# External Integrations

**Analysis Date:** 2026-03-06

## Snapshot

- This is primarily a static Eleventy site with very few live integrations.
- External dependencies are mostly public media hosts plus optional deployment infrastructure.
- No authenticated API clients, backend services, or secret-driven runtime were found in the examined code.

## Public Media Hosts

- Cloudflare R2 public bucket at `pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev`
  Used directly from content and templates for hosted images and video.
  Evidence:
  [layouts/home.njk](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/home.njk),
  [content/pages/biografi/pages/page-4.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-4.md),
  [content/pages/biografi/pages/page-183.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-183.md).
- Usage pattern:
  markdown image URLs point straight at the bucket,
  the home page background video is loaded from `/vid/bongo.mp4` on the same bucket.
- Integration mode:
  no SDK, no signed URLs, no upload code in repo; the site just references public HTTPS assets.

## Video / Embed Integrations

- YouTube embeds are supported in two ways:
  via `eleventy-plugin-embed-everything`,
  and via custom `[yt-video][URL]` parsing in [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js).
- The custom renderer converts YouTube URLs into `https://www.youtube.com/embed/{id}` iframes.
- Example content input:
  [content/pages/biografi/pages/page-11.md](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/pages/page-11.md).
- Practical note:
  the custom embed path is specifically coded for YouTube URL variants; other providers depend on the Eleventy plugin and are not evidenced in current content.

## Build / Deployment Integrations

- GitHub Actions workflow exists in disabled form:
  [.github/workflows/deploy.yml.disabled](/Users/hakanfilip/my-workspace/projects/borjlind/.github/workflows/deploy.yml.disabled).
- The disabled workflow integrates with:
  `actions/checkout@v4`,
  `actions/setup-node@v4`,
  `actions/configure-pages@v5`,
  `actions/upload-pages-artifact@v3`,
  `actions/deploy-pages@v4`.
- Deployment target implied by workflow: GitHub Pages.
- Build artifact uploaded by the workflow: `_site`.
- README still mentions Cloudflare Pages as a possible deployment target in [README.md](/Users/hakanfilip/my-workspace/projects/borjlind/README.md), but there is no Cloudflare config file or deploy script in the files reviewed.

## Client-Side Browser Integrations

- `localStorage`
  The biography reader persists reading position under key `bio:pos` in [assets/js/bio-reader.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js).
- DOM dataset contract
  [layouts/biography.njk](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/biography.njk) sets `document.body.dataset.biography = '1'`, which activates the reader runtime.
- Inline JSON contract
  [layouts/biography.njk](/Users/hakanfilip/my-workspace/projects/borjlind/layouts/biography.njk) injects chapter metadata into `#rb-chapter-data`; [assets/js/bio-reader.js](/Users/hakanfilip/my-workspace/projects/borjlind/assets/js/bio-reader.js) consumes it on load.

## Content Pipeline Integrations

- Chapter metadata import
  [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js) imports [_data/chapters.js](/Users/hakanfilip/my-workspace/projects/borjlind/_data/chapters.js) and turns it into:
  `biografiChapters`,
  `TOTAL_CHAPTERS`,
  redirect/global page data.
- Redirect pagination
  [content/pages/biografi/redirect-page.njk](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/redirect-page.njk) and [content/pages/biografi/redirect-number.njk](/Users/hakanfilip/my-workspace/projects/borjlind/content/pages/biografi/redirect-number.njk) generate legacy redirect routes that bounce to `/biografi/#p-XXX`.
- Passthrough asset publishing
  [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js) publishes CSS, JS, and images into the built site without transformation.

## Authentication, Secrets, And Protected Services

- No user authentication or authorization system found.
- No API keys, tokens, or environment variables referenced in:
  [package.json](/Users/hakanfilip/my-workspace/projects/borjlind/package.json),
  [.eleventy.js](/Users/hakanfilip/my-workspace/projects/borjlind/.eleventy.js),
  [README.md](/Users/hakanfilip/my-workspace/projects/borjlind/README.md),
  [.github/workflows/deploy.yml.disabled](/Users/hakanfilip/my-workspace/projects/borjlind/.github/workflows/deploy.yml.disabled).
- If R2 uploads are managed elsewhere, that tooling is not present in this repo.

## What Is Not Present

- No database integration.
- No CMS integration.
- No analytics, error tracking, or observability SDK.
- No payment provider, email provider, webhook handler, or search backend.
- No external font service; typography uses system stacks in [assets/css/main.css](/Users/hakanfilip/my-workspace/projects/borjlind/assets/css/main.css).

## Practical Observations

- The previously documented "Cloudflare R2 credentials" integration is overstated for this repo; current code only consumes public asset URLs.
- The strongest real integration surface is content-to-public-media hosting, not application-to-API communication.
- GitHub Pages deployment is prepared but inactive because the workflow file is intentionally suffixed `.disabled`.
