#!/usr/bin/env node
/**
 * Verify all biography page .md files have required frontmatter keys.
 * Exits 0 if all pass, 1 if any fail.
 */

const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(
  __dirname,
  "..",
  "content",
  "pages",
  "biografi",
  "pages"
);

const files = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0]);
    const nb = parseInt(b.match(/\d+/)[0]);
    return na - nb;
  });

const total = files.length;
let yearGroupCount = 0;
const missing = [];

for (const filename of files) {
  const filepath = path.join(PAGES_DIR, filename);
  const content = fs.readFileSync(filepath, "utf-8");
  const hasYearGroup = content.includes("yearGroup:");
  if (hasYearGroup) {
    yearGroupCount++;
  } else {
    missing.push(filename);
  }
}

console.log(`Total .md files: ${total}`);
console.log(`yearGroup count: ${yearGroupCount} / ${total} .md files`);

if (missing.length > 0) {
  console.log(`\nMissing yearGroup (${missing.length} files):`);
  missing.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`\nAll ${total} files have yearGroup. ✓`);
  process.exit(0);
}
