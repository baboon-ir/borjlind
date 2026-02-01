const fs = require("node:fs");
const path = require("node:path");
const markdownIt = require("markdown-it");

const md = markdownIt({ html: true, breaks: false, linkify: true });

function pad3(n) {
  return String(n).padStart(3, "0");
}

function parseBiografiExport(markdownText) {
  // Split by headings like: "## Page 12/276" (allow any heading level)
  const re = /^\s*#+\s*Page\s+(\d+)\s*\/\s*276\s*$/gmi;
  const indices = [];
  let match;
  while ((match = re.exec(markdownText)) !== null) {
    indices.push({ page: Number(match[1]), index: match.index, matchLen: match[0].length });
  }

  if (indices.length === 0) {
    return [];
  }

  const pages = [];
  for (let i = 0; i < indices.length; i++) {
    const cur = indices[i];
    const next = indices[i + 1];

    // Content begins after the marker line; find end-of-line
    const markerEnd = markdownText.indexOf("\n", cur.index);
    const start = markerEnd === -1 ? cur.index + cur.matchLen : markerEnd + 1;
    const end = next ? next.index : markdownText.length;
    const body = markdownText.slice(start, end).trim();

    pages.push({
      page: cur.page,
      id: `p-${pad3(cur.page)}`,
      markdown: body
    });
  }

  return pages;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/site.js": "assets/site.js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon.svg": "favicon.svg" });

  // Content sources used for build-time assembly only (don’t output as pages)
  eleventyConfig.ignores.add("src/content/**");

  eleventyConfig.addFilter("pad3", pad3);

  eleventyConfig.addCollection("minnen", (collectionApi) => {
    return collectionApi.getFilteredByTag("minne");
  });

  eleventyConfig.addShortcode("biografiPages", (pages) => {
    return pages
      .map((p) => {
        const html = md.render(p.markdown || "");
        return (
          `\n<section id="${p.id}" data-page="${p.page}" class="scroll-mt-24 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">\n` +
          `<div class="mb-4 flex items-center justify-between gap-4">` +
          `<div class="text-xs font-mono text-zinc-400">Page ${p.page}/276</div>` +
          `<a class="text-xs font-mono text-zinc-500 hover:text-zinc-200" href="#${p.id}">#${p.id}</a>` +
          `</div>` +
          `<div class="prose prose-invert max-w-none prose-a:text-zinc-100 prose-a:underline prose-hr:border-zinc-800">${html}</div>` +
          `\n</section>`
        );
      })
      .join("\n");
  });

  eleventyConfig.addGlobalData("biografi", () => {
    const pagesDir = path.join(process.cwd(), "src/content/biografi/pages");
    const exportPath = path.join(process.cwd(), "src/content/biografi/biografi_full_export.md");

    let pages = [];

    if (fs.existsSync(pagesDir)) {
      const files = fs
        .readdirSync(pagesDir)
        .filter((f) => /^p-\d{3}\.md$/i.test(f))
        .sort();

      for (const f of files) {
        const id = path.basename(f, ".md");
        const page = Number(id.split("-")[1]);
        const markdown = fs.readFileSync(path.join(pagesDir, f), "utf8");
        pages.push({ page, id, markdown });
      }
    } else if (fs.existsSync(exportPath)) {
      const raw = fs.readFileSync(exportPath, "utf8");
      pages = parseBiografiExport(raw);
    }

    const byPage = new Map(pages.map((p) => [p.page, p]));
    const full = [];
    for (let p = 1; p <= 276; p++) {
      const existing = byPage.get(p);
      full.push(
        existing || { page: p, id: `p-${pad3(p)}`, markdown: "*(Innehåll saknas i MVP-exporten.)*" }
      );
    }

    return { pages: full };
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
