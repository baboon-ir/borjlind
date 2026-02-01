const markdownIt = require("markdown-it");

const md = markdownIt({ html: true, linkify: true, breaks: false });

const pad3 = (n) => String(n).padStart(3, "0");

function escapeAttr(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderBio(text) {
  // [MORE] => details block
  const parts = String(text || "").split(/\n\s*\[MORE\]\s*\n/);
  const main = parts[0] || "";
  const more = parts.slice(1).join("\n\n").trim();

  const renderChunk = (chunk) => {
    const lines = chunk.split(/\r?\n/);
    const out = [];

    for (const line of lines) {
      const img = line.match(/^\s*\[IMAGE:\s*([^\]]+)\]\s*$/i);
      if (img) {
        const src = img[1].trim();
        out.push(
          `<figure class="my-5 rounded-2xl border border-zinc-800 bg-black/30 p-3">` +
            `<img class="w-full rounded-xl border border-zinc-800" src="/assets/images/${escapeAttr(src)}" alt="" loading="lazy" />` +
          `</figure>`
        );
        continue;
      }

      const vid = line.match(/^\s*\[VIDEO:\s*([^\]]+)\]\s*$/i);
      if (vid) {
        const url = vid[1].trim();
        out.push(
          `<div class="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">` +
            `<div class="aspect-video">` +
              `<iframe class="h-full w-full" src="${escapeAttr(url)}" title="video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` +
            `</div>` +
          `</div>`
        );
        continue;
      }

      out.push(line);
    }

    return `<div class="prose-dark">${md.render(out.join("\n"))}</div>`;
  };

  const mainHtml = renderChunk(main);
  if (!more) return mainHtml;

  const moreHtml = renderChunk(more);
  return (
    mainHtml +
    `<details class="mt-6 rounded-2xl border border-zinc-800 bg-black/30 p-4">` +
      `<summary class="cursor-pointer select-none text-sm text-zinc-200">Mer</summary>` +
      `<div class="mt-4">${moreHtml}</div>` +
    `</details>`
  );
}

module.exports = function (eleventyConfig) {
  // Assets
  eleventyConfig.addPassthroughCopy({ "assets/css/main.css": "assets/css/main.css" });
  eleventyConfig.addPassthroughCopy({ "assets/js/bio-reader.js": "assets/js/bio-reader.js" });

  // If you add images later, place them in assets/images/.
  eleventyConfig.addPassthroughCopy({ "assets/images": "assets/images" });

  // Filters
  eleventyConfig.addFilter("pad3", pad3);
  eleventyConfig.addFilter("bioRender", renderBio);

  // Collections
  eleventyConfig.addCollection("minnen", (api) => api.getFilteredByTag("minne"));

  eleventyConfig.addCollection("biografiPages", (api) => {
    const items = api.getFilteredByTag("biografiPage");
    const getNum = (it) => (it.data.page && it.data.page.number) || it.data.pageNum || it.data.pageNumber || 0;
    return items.sort((a, b) => getNum(a) - getNum(b));
  });

  // Full 1..276 list (creates placeholder entries for missing pages)
  eleventyConfig.addCollection("biografiAll", (api) => {
    const items = api.getFilteredByTag("biografiPage");
    const byNum = new Map();
    for (const it of items) {
      const n = (it.data.page && it.data.page.number) || 0;
      if (n) byNum.set(n, it);
    }

    const out = [];
    for (let n = 1; n <= 276; n++) {
      const found = byNum.get(n);
      if (found) {
        out.push(found);
      } else {
        out.push({
          data: { page: { number: n }, anchor: `p-${pad3(n)}` },
          templateContent: ""
        });
      }
    }
    return out;
  });

  // Redirect pagination data (1..276)
  eleventyConfig.addGlobalData("bioRedirectPages", () => {
    const arr = [];
    for (let i = 1; i <= 276; i++) {
      arr.push({ page: i, anchor: `p-${pad3(i)}` });
    }
    return arr;
  });

  // Ignore non-site markdown
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("**/.trash_restructure/**");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "includes",
      layouts: "layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"]
  };
};
