#!/usr/bin/env node
// validate-build.js — post-build HTML assertions (no test framework)
// Usage: node scripts/validate-build.js [--strict]
// --strict: also assert is-active count (use after Wave 2+ plans are wired)
const fs = require('fs');
const path = require('path');

const strict = process.argv.includes('--strict');
const siteDir = path.join(__dirname, '..', '_site');
const htmlPath = path.join(siteDir, 'biografi', 'index.html');

let passed = 0;
let failed = 0;
const fail = (msg) => { console.error('FAIL:', msg); failed++; };
const pass = (msg) => { console.log('PASS:', msg); passed++; };

if (!fs.existsSync(htmlPath)) {
  console.error('ERROR: _site/biografi/index.html not found — run npx eleventy first');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

// READER-06: data-page-indicator element must exist
if (html.includes('data-page-indicator')) {
  pass('READER-06: data-page-indicator present');
} else {
  fail('READER-06: data-page-indicator missing from built HTML');
}

// NAV-02: rb-year-groups script tag must exist (populated after plan 02-05)
if (html.includes('id="rb-year-groups"')) {
  pass('NAV-02: rb-year-groups script tag present');
} else {
  fail('NAV-02: rb-year-groups script tag missing from built HTML');
}

// READER-01: exactly one .rb-bio-page.is-active (strict mode only — JS sets this at runtime)
if (strict) {
  const matches = (html.match(/class="[^"]*rb-bio-page[^"]*is-active[^"]*"/g) || []).length;
  if (matches === 1) {
    pass('READER-01: exactly one rb-bio-page is-active in built HTML');
  } else {
    fail(`READER-01: expected 1 is-active page, found ${matches}`);
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
