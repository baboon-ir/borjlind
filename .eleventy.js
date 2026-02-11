const embedEverything = require("eleventy-plugin-embed-everything");
const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");
const markdownItImplicitFigures = require("markdown-it-implicit-figures");

const md = markdownIt({ html: true, linkify: true, breaks: false });

// Lazy-load all images
const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  tokens[idx].attrPush(['loading', 'lazy']);
  return defaultImageRender(tokens, idx, options, env, self);
};

// Add implicit figures support - converts images with alt text to <figure> with <figcaption>
md.use(markdownItImplicitFigures, {
  dataType: false,  // Don't wrap images in a block
  figcaption: true,  // Use alt text as caption
  tabindex: false,   // Don't add tabindex
  link: false        // Don't wrap in links
});

// Add container support for ::: center, ::: indent, ::: poem, ::: video
md.use(markdownItContainer, 'center', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-center">\n';
    } else {
      return '</div>\n';
    }
  }
});

md.use(markdownItContainer, 'minne', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-minne">\n';
    } else {
      return '</div>\n';
    }
  }
});

md.use(markdownItContainer, 'quote', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<blockquote class="rb-quote">\n';
    } else {
      return '</blockquote>\n';
    }
  }
});

md.use(markdownItContainer, 'part', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-part"><img style="border: none; width: 68px !important; height: auto;" src="/assets/images/divider.png" class="mx-auto"></div>\n';
    } else {
      return '';
    }
  }
});

// Empty renderer for hidden accordion tokens
md.renderer.rules['accordion_hidden'] = function () { return ''; };

md.use(markdownItContainer, 'accordion', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      // Find the matching container_accordion_close
      let closeIdx = idx + 1;
      let depth = 1;
      while (closeIdx < tokens.length) {
        if (tokens[closeIdx].type === 'container_accordion_open') depth++;
        if (tokens[closeIdx].type === 'container_accordion_close') {
          depth--;
          if (depth === 0) break;
        }
        closeIdx++;
      }

      // Extract first paragraph as summary, rest as content
      let summary = '';
      let contentStartIdx = idx + 1;

      for (let i = idx + 1; i < closeIdx; i++) {
        if (tokens[i].type === 'paragraph_open') {
          if (tokens[i + 1] && tokens[i + 1].type === 'inline') {
            summary = tokens[i + 1].content;
          }
          let pClose = i + 2;
          while (pClose < closeIdx && tokens[pClose].type !== 'paragraph_close') pClose++;
          contentStartIdx = pClose + 1;
          break;
        }
      }

      // Collect content tokens (after summary, before close)
      let contentTokens = [];
      for (let i = contentStartIdx; i < closeIdx; i++) {
        contentTokens.push(tokens[i]);
      }

      // Render content HTML before hiding tokens
      const contentHtml = md.renderer.render(contentTokens, md.options, {});

      // Hide all inner tokens so markdown-it doesn't render them again
      for (let i = idx + 1; i < closeIdx; i++) {
        tokens[i].type = 'accordion_hidden';
        tokens[i].tag = '';
        tokens[i].nesting = 0;
        tokens[i].children = null;
        tokens[i].content = '';
      }

      return `<div class="w-full gap-1"><span class="read-more">Läs mer</span><details class="rb-accordion" style="border-top:0.5px solid #ccc;border-bottom:0.5px solid #ccc;">
        <summary>${md.renderInline(summary)}</summary>
        <div class="rb-accordion-content">${contentHtml}</div>
      </details></div>\n`;
    } else {
      return '';
    }
  }
});

md.use(markdownItContainer, 'indent', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-indent">\n';
    } else {
      return '</div>\n';
    }
  }
});

md.use(markdownItContainer, 'poem', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-poem">\n';
    } else {
      return '</div>\n';
    }
  }
});

md.use(markdownItContainer, 'video', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-video">\n';
    } else {
      return '</div>\n';
    }
  }
});

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
    // Custom section parsing: handle <div class=""> blocks
    const divSectionRegex = /<div class="">([\s\S]*?)<\/div>/g;
    let renderedSections = [];
    let lastIndex = 0;
    while (true) {
      const match = divSectionRegex.exec(chunk);
      if (!match) break;
      // Render everything before the div
      if (match.index > lastIndex) {
        let before = chunk.slice(lastIndex, match.index);
        // Replace [yt-video][URL] with embed
        before = before.replace(/\[yt-video\]\[(https?:\/\/[^\]]+)\]/g, (m, url) => {
          // Extract YouTube ID
          const ytId = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]+)/);
          const id = ytId ? ytId[1] : '';
          if (!id) return '';
          return `<div class="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30"><div class="aspect-video"><iframe class="h-full w-full" src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
        });
        renderedSections.push(`<div class="prose-dark">${md.render(before)}</div>`);
      }
      // Render the div section with custom styling
      let sectionContent = match[1].trim();
      sectionContent = sectionContent.replace(/\[yt-video\]\[(https?:\/\/[^\]]+)\]/g, (m, url) => {
        const ytId = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]+)/);
        const id = ytId ? ytId[1] : '';
        if (!id) return '';
        return `<div class="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30"><div class="aspect-video"><iframe class="h-full w-full" src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
      });
      renderedSections.push(`<div class="rb-section prose-dark">${md.render(sectionContent)}</div>`);
      lastIndex = divSectionRegex.lastIndex;
    }
    // Render any remaining content after the last div
    if (lastIndex < chunk.length) {
      let after = chunk.slice(lastIndex);
      after = after.replace(/\[yt-video\]\[(https?:\/\/[^\]]+)\]/g, (m, url) => {
        const ytId = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]+)/);
        const id = ytId ? ytId[1] : '';
        if (!id) return '';
        return `<div class="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30"><div class="aspect-video"><iframe class="h-full w-full" src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
      });
      renderedSections.push(`<div class="prose-dark">${md.render(after)}</div>`);
    }
    return renderedSections.join("\n");
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
  // Embeds
  eleventyConfig.addPlugin(embedEverything);

  // Assets
  eleventyConfig.addPassthroughCopy({ "assets/css/main.css": "assets/css/main.css" });
  eleventyConfig.addPassthroughCopy({ "assets/js/bio-reader.js": "assets/js/bio-reader.js" });
  eleventyConfig.addPassthroughCopy({ "assets/js/nav.js": "assets/js/nav.js" });

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

  // Set custom markdown library with container support
  eleventyConfig.setLibrary("md", md);

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "includes",
      layouts: "layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"]
  };
};
