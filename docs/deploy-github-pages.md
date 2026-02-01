# Deploy: GitHub Pages (via Actions)

This repo ships with a GitHub Actions workflow that builds the site and deploys `_site/`.

## Steps

1. Push to `main`.
2. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Wait for the workflow to finish.

## Notes

- The workflow uses `npm ci` and runs `npm run build`.
- Output directory is `_site/`.
