---
phase: 2
slug: ebook-reader
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — static site, no test runner |
| **Config file** | None — Wave 0 installs a minimal Node.js assertion script |
| **Quick run command** | `npx eleventy --dryrun 2>&1 \| grep -c "Writing"` |
| **Full suite command** | `npx eleventy && node scripts/validate-build.js` |
| **Estimated runtime** | ~15 seconds (build) + ~2 seconds (assertions) |

---

## Sampling Rate

- **After every task commit:** Run `npx eleventy --dryrun` (build check)
- **After every plan wave:** Run `npx eleventy && node scripts/validate-build.js`
- **Before `/gsd:verify-work`:** Full suite + manual device checklist must be green
- **Max feedback latency:** ~17 seconds

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| TECH-01 | No hardcoded 276 in templates/JS | Code grep | `grep -rn '"276"\|= 276\|\/276' assets/js/bio-reader.js includes/ layouts/` → 0 matches | Run after task |
| READER-01 | One page visible at a time | DOM smoke | Build: check `rb-bio-page is-active` appears exactly once | Wave 0 script |
| READER-02 | Swipe left/right navigates | Manual/device | Swipe on mobile — confirm page advances | iOS Safari + Chrome Android |
| READER-03 | iOS edge-swipe no back-nav | Manual/device | Swipe from left edge on iPhone — must NOT navigate back | Real device required |
| READER-04 | Arrow buttons navigate | Manual | Click ← → buttons, confirm page changes | Desktop + mobile |
| READER-05 | Keyboard ArrowLeft/ArrowRight | Manual | Press arrow keys on desktop | Desktop browser |
| READER-06 | Indicator shows "N / 276" | DOM smoke | Build: `data-page-indicator` element exists | Wave 0 script |
| READER-07 | localStorage saves/restores page | Manual | Go to page 50, close+reopen tab — must land on 50 | Any browser |
| READER-08 | Container uses `100dvh` | CSS grep | `grep -n "100dvh" assets/css/main.css` → match on reader container | Automated |
| READER-09 | No scroll model in bio-reader.js | Code grep | `grep -cn "scrollY\|scrollIntoView\|window\.scroll" assets/js/bio-reader.js` → 0 | Automated |
| NAV-01 | yearGroup frontmatter on 276 pages | Build smoke | `grep -l "yearGroup:" content/pages/biografi/pages/*.md \| wc -l` → 276 | Wave 0 script |
| NAV-02 | Year data baked into HTML | Build output | `grep -c "rb-year-groups" _site/biografi/index.html` → ≥1 | Automated |
| NAV-03 | TOC lists year periods | Manual | Open TOC, verify groups listed, click one, confirm page jump | Manual |
| NAV-04 | Current year indicated | Manual | Navigate through year boundaries, verify indicator updates | Manual |
| LAYOUT-01 | Media pages get dedicated layout | Manual | Navigate to image/video page, verify media fills page cleanly | Manual |
| LAYOUT-02 | Expanded accordion allows local scroll | Manual | Open `<details>` with long content, scroll within it | Manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/validate-build.js` — Node.js assertion script (no test framework): checks READER-01 (single active page), READER-06 (indicator element), NAV-01 (yearGroup count), NAV-02 (year groups in HTML)
- [ ] Script runs after `npx eleventy` and exits 0 on pass, 1 on fail

*Note: Zero-runtime-deps philosophy — no Jest, no Playwright. Minimal Node.js script that reads built HTML.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe navigation | READER-02 | Requires touch hardware | Swipe left/right on mobile — confirm page changes |
| iOS edge-swipe | READER-03 | Requires real iPhone (not simulator) | Swipe from left edge (≤20px) — browser must NOT go back |
| Keyboard navigation | READER-05 | Browser focus state | Press ← → arrow keys — page must change |
| localStorage restore | READER-07 | Requires tab close/reopen | Navigate to page 50, close tab, reopen — must land on 50 |
| TOC navigation | NAV-03 | Requires visual inspection | Open TOC, click a year group, confirm correct page loads |
| Year indicator | NAV-04 | Requires multi-page navigation | Navigate through pages — badge must update at year boundaries |
| Media page layout | LAYOUT-01 | Requires content inspection | Navigate to page with video/image — verify dedicated layout |
| Accordion scroll | LAYOUT-02 | Requires expanded state | Expand `<details>` — scroll within page without reader scrolling |

---

## Automated Check Commands

```bash
# TECH-01: No hardcoded 276
grep -rn '"276"\|= 276\|\/276' assets/js/bio-reader.js includes/ layouts/

# READER-08: 100dvh present on reader container
grep -n "100dvh" assets/css/main.css

# READER-09: No scroll model in new bio-reader.js
grep -cn "scrollY\|scrollIntoView\|window\.scroll" assets/js/bio-reader.js

# NAV-01: yearGroup in all 276 files
grep -l "yearGroup:" content/pages/biografi/pages/*.md | wc -l
# Expected: 276

# NAV-02: year groups baked into built HTML
grep -c "rb-year-groups" _site/biografi/index.html
# Expected: >= 1
```

---

## Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page turn latency | < 16ms (1 frame at 60fps) | Chrome DevTools — time from `pointerup` to paint |
| Build time with 276 pages | < 30s | `time npx eleventy` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
