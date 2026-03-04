---
phase: 1
slug: css-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual visual verification (static site, no test suite) |
| **Config file** | None |
| **Quick run command** | `npx @11ty/eleventy --serve` |
| **Full suite command** | `npx @11ty/eleventy` |
| **Estimated runtime** | ~5 seconds (Eleventy build) |

---

## Sampling Rate

- **After every task commit:** Run `npx @11ty/eleventy` to confirm the build still succeeds
- **After every plan wave:** Visual inspection of all 5 page types in browser
- **Before `/gsd:verify-work`:** Full visual parity check must pass
- **Max feedback latency:** ~5 seconds (build time)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| CSS reset extraction | 01 | 1 | CSS-02 | manual | `npx @11ty/eleventy` | ❌ W0 | ⬜ pending |
| @apply expansion | 01 | 1 | CSS-01, CSS-02 | manual | `npx @11ty/eleventy` | ❌ W0 | ⬜ pending |
| CSS custom properties | 01 | 1 | CSS-03 | manual | `npx @11ty/eleventy` | ❌ W0 | ⬜ pending |
| Template class cleanup | 01 | 2 | CSS-04 | manual | `npx @11ty/eleventy` | ❌ W0 | ⬜ pending |
| Tailwind removal | 01 | 2 | CSS-01 | manual | `grep tailwind package.json` | ❌ W0 | ⬜ pending |
| Visual parity check | 01 | 2 | CSS-04 | manual | Side-by-side browser | N/A | ⬜ pending |

---

## Wave 0 Requirements

None — no test infrastructure needed. Validation is manual (visual parity is the primary criterion and cannot be automated).

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual parity — all 5 page types | CSS-04 | CSS rendering is visual; no screenshot diffing tool configured | Open `/`, `/biografi/`, `/minnen/`, `/minnen/{slug}/`, `/appendix/` side-by-side with Tailwind version |
| No Tailwind references in package.json | CSS-01 | Simple file check | `cat package.json \| grep -i tailwind` — must return nothing |
| No `@apply` or `@tailwind` in CSS | CSS-01 | Simple grep check | `grep -r "@apply\|@tailwind" assets/css/` — must return nothing |
| CSS custom properties in `:root` | CSS-03 | Inspect built CSS | Check `assets/css/main.css` `:root` block contains `--color-dark`, `--color-hub`, `--color-light`, `--font-serif`, `--font-sans`, `--font-mono` |
| Single `main.css` linked in all pages | CSS-02 | Inspect HTML output | Check `<link>` tag in `_site/index.html` and other built pages |

**5 page types to verify visually:**

| Page | URL | Key visual elements |
|------|-----|---------------------|
| Home (hub) | `/` | Video background, pattern overlay, hero title, nav |
| Biography | `/biografi/` | Title block, controls bar, prose content, accordions |
| Minnen | `/minnen/` | Grid cards |
| Memory detail | `/minnen/{slug}/` | Content layout, typography |
| Appendix | `/appendix/` | Sticky nav, content columns |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
