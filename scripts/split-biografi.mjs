import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const exportPath = path.join(ROOT, "src/content/biografi/biografi_full_export.md");
const outDir = path.join(ROOT, "src/content/biografi/pages");

function pad3(n) {
  return String(n).padStart(3, "0");
}

function parse(markdownText) {
  const re = /^\s*#+\s*Page\s+(\d+)\s*\/\s*276\s*$/gmi;
  const hits = [];
  let m;
  while ((m = re.exec(markdownText)) !== null) {
    hits.push({ page: Number(m[1]), index: m.index });
  }
  if (!hits.length) return [];

  const pages = [];
  for (let i = 0; i < hits.length; i++) {
    const cur = hits[i];
    const next = hits[i + 1];
    const markerEnd = markdownText.indexOf("\n", cur.index);
    const start = markerEnd === -1 ? cur.index : markerEnd + 1;
    const end = next ? next.index : markdownText.length;
    const body = markdownText.slice(start, end).trim();
    pages.push({ page: cur.page, body });
  }
  return pages;
}

if (!fs.existsSync(exportPath)) {
  console.error(`Missing export file: ${exportPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(exportPath, "utf8");
const pages = parse(raw);

fs.mkdirSync(outDir, { recursive: true });

const LIMIT = Number(process.env.LIMIT || "20");
const subset = pages.filter((p) => p.page >= 1 && p.page <= LIMIT);

for (const p of subset) {
  const file = path.join(outDir, `p-${pad3(p.page)}.md`);
  fs.writeFileSync(file, p.body.trim() + "\n", "utf8");
}

console.log(`Wrote ${subset.length} pages to ${outDir}`);
