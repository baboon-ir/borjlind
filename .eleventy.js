const embedEverything = require("eleventy-plugin-embed-everything");
const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");
const markdownItImplicitFigures = require("markdown-it-implicit-figures");
const fs = require("node:fs");
const path = require("node:path");

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
      return '<hr class="rb-part">\n';
    }
    return '';
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

      return `<div class="rb-accordion">
        <div class="rb-accordion-excerpt">${md.renderInline(summary)}</div>
        <details class="rb-accordion-details">
          <summary class="rb-accordion-btn">LÄS MER</summary>
          <div class="rb-accordion-content">${contentHtml}</div>
        </details>
      </div>\n`;
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

md.use(markdownItContainer, 'fullpage', {
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="rb-fullpage">\n';
    } else {
      return '</div>\n';
    }
  }
});

const pad3 = (n) => String(n).padStart(3, "0");
const TOTAL_PAGES = 276; // single source of truth — TECH-01
const PROLOG_END_PAGE = 4;
const EPILOG_START_PAGE = 276;
const CHAPTERS_DIR = path.join(__dirname, "content/pages/biografi/chapters");
const YEAR_GROUP_RANGES = [
  { label: "1942–1955", start: 1, end: 27 },
  { label: "1956–1968", start: 28, end: 55 },
  { label: "1969–1975", start: 56, end: 83 },
  { label: "1976–1982", start: 84, end: 110 },
  { label: "1983–1990", start: 111, end: 138 },
  { label: "1991–1998", start: 139, end: 165 },
  { label: "1999–2006", start: 166, end: 193 },
  { label: "2007–2012", start: 194, end: 220 },
  { label: "2013–2017", start: 221, end: 248 },
  { label: "2018–2024", start: 249, end: 276 },
];

function getYearGroupForPage(pageNumber) {
  const found = YEAR_GROUP_RANGES.find((range) => pageNumber >= range.start && pageNumber <= range.end);
  return found ? found.label : "Okänt år";
}

function isMediaOnlyMarkdown(markdown) {
  const normalized = String(markdown || "").trim();
  if (!normalized) return false;
  // Single image-only pages should keep dedicated media-page behavior.
  return /^!\[[^\]]*]\([^)]+\)$/.test(normalized);
}

function loadChapterPageContentMap() {
  const pageMap = new Map();
  if (!fs.existsSync(CHAPTERS_DIR)) return pageMap;

  const chapterFiles = fs
    .readdirSync(CHAPTERS_DIR)
    .filter((file) => /^chapter-\d+.*\.md$/i.test(file))
    .sort();

  for (const file of chapterFiles) {
    const fullPath = path.join(CHAPTERS_DIR, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const markerRegex = /<!--\s*PAGE\s+(\d+)\s+START\s*-->\s*([\s\S]*?)\s*<!--\s*PAGE\s+\1\s+END\s*-->/g;
    let match;
    while ((match = markerRegex.exec(content)) !== null) {
      const pageNumber = Number.parseInt(match[1], 10);
      if (!Number.isFinite(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) continue;
      pageMap.set(pageNumber, match[2].trim());
    }
  }

  return pageMap;
}

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
          return `<div class="rb-yt-embed"><div class="rb-yt-embed-ratio"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
        });
        renderedSections.push(`<div class="rb-prose">${md.render(before)}</div>`);
      }
      // Render the div section with custom styling
      let sectionContent = match[1].trim();
      sectionContent = sectionContent.replace(/\[yt-video\]\[(https?:\/\/[^\]]+)\]/g, (m, url) => {
        const ytId = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]+)/);
        const id = ytId ? ytId[1] : '';
        if (!id) return '';
        return `<div class="rb-yt-embed"><div class="rb-yt-embed-ratio"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
      });
      renderedSections.push(`<div class="rb-section rb-prose">${md.render(sectionContent)}</div>`);
      lastIndex = divSectionRegex.lastIndex;
    }
    // Render any remaining content after the last div
    if (lastIndex < chunk.length) {
      let after = chunk.slice(lastIndex);
      after = after.replace(/\[yt-video\]\[(https?:\/\/[^\]]+)\]/g, (m, url) => {
        const ytId = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]+)/);
        const id = ytId ? ytId[1] : '';
        if (!id) return '';
        return `<div class="rb-yt-embed"><div class="rb-yt-embed-ratio"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
      });
      renderedSections.push(`<div class="rb-prose">${md.render(after)}</div>`);
    }
    // Wrap paragraphs starting with "Fotnot" in a footnote container
    let html = renderedSections.join("\n");
    html = html.replace(/<p>\s*(Fotnot[\s\S]*?)<\/p>/g, '<div class="rb-footnote"><p>$1</p></div>');
    return html;
  };

  const mainHtml = renderChunk(main);
  if (!more) return mainHtml;

  const moreHtml = renderChunk(more);
  return (
    mainHtml +
    `<details class="rb-more-block">` +
      `<summary class="rb-more-summary">Mer</summary>` +
      `<div class="rb-more-content">${moreHtml}</div>` +
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
  eleventyConfig.addPassthroughCopy({ "assets/js/section-reader.js": "assets/js/section-reader.js" });

  // If you add images later, place them in assets/images/.
  eleventyConfig.addPassthroughCopy({ "assets/images": "assets/images" });
  // Favicon at root for browsers that look for /favicon.png
  eleventyConfig.addPassthroughCopy({ "assets/images/fav.png": "favicon.png" });

  // Filters
  eleventyConfig.addFilter("pad3", pad3);
  eleventyConfig.addFilter("bioRender", renderBio);

  // Collections
  eleventyConfig.addCollection("minnen", (api) => api.getFilteredByTag("minne"));

  eleventyConfig.addCollection("biografiPages", () => {
    const chapterPageContentMap = loadChapterPageContentMap();
    const items = [];
    for (let n = 1; n <= TOTAL_PAGES; n++) {
      const templateContent = chapterPageContentMap.get(n);
      if (!templateContent) continue;
      items.push({
        data: {
          page: { number: n },
          anchor: `p-${pad3(n)}`,
          yearGroup: getYearGroupForPage(n),
          mediaPage: isMediaOnlyMarkdown(templateContent),
        },
        templateContent,
      });
    }
    return items;
  });

  // Full 1..276 list (creates placeholder entries for missing pages)
  eleventyConfig.addCollection("biografiAll", () => {
    const chapterPageContentMap = loadChapterPageContentMap();

    const out = [];
    for (let n = 1; n <= TOTAL_PAGES; n++) {
      const templateContent = chapterPageContentMap.get(n);
      if (templateContent) {
        out.push({
          data: {
            page: { number: n },
            anchor: `p-${pad3(n)}`,
            yearGroup: getYearGroupForPage(n),
            mediaPage: isMediaOnlyMarkdown(templateContent),
          },
          templateContent,
        });
      } else {
        out.push({
          data: {
            page: { number: n },
            anchor: `p-${pad3(n)}`,
            yearGroup: getYearGroupForPage(n),
            mediaPage: false,
          },
          templateContent: ""
        });
      }
    }
    return out;
  });


  // Year group map derived from the canonical ranges used by chapter source.
  eleventyConfig.addCollection("yearGroupMap", () => {
    return YEAR_GROUP_RANGES.map((range) => ({
      yearGroup: range.label,
      firstPage: range.start,
    }));
  });

  // Nav data: year groups with their chapters for sidebar navigation
  const chapters = require("./_data/chapters.js");
  eleventyConfig.addGlobalData("navBioData", () => {
    return YEAR_GROUP_RANGES.map((range) => {
      const groupChapters = chapters.filter(
        (ch) => ch.start >= range.start && ch.start <= range.end
      );
      return {
        yearGroup: range.label,
        firstPage: range.start,
        chapters: groupChapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          startPage: ch.start,
        })),
      };
    });
  });

  // Segment-based collection for e-book reader:
  // Prolog (1..PROLOG_END_PAGE) + year groups + Epilog (EPILOG_START_PAGE..TOTAL_PAGES)
  eleventyConfig.addCollection("biografiSegments", () => {
    const chapterPageContentMap = loadChapterPageContentMap();

    const pageRows = [];
    for (let n = 1; n <= TOTAL_PAGES; n++) {
      const templateContent = chapterPageContentMap.get(n) || "";
      pageRows.push({
        number: n,
        anchor: `p-${pad3(n)}`,
        mediaPage: isMediaOnlyMarkdown(templateContent),
        yearGroup: getYearGroupForPage(n),
        item: templateContent
          ? {
              data: {
                page: { number: n },
                anchor: `p-${pad3(n)}`,
                mediaPage: isMediaOnlyMarkdown(templateContent),
                yearGroup: getYearGroupForPage(n),
              },
              templateContent,
            }
          : null,
      });
    }

    const segments = [];
    const clampedPrologEnd = Math.max(1, Math.min(PROLOG_END_PAGE, TOTAL_PAGES));
    const validEpilogStart = (
      Number.isInteger(EPILOG_START_PAGE) &&
      EPILOG_START_PAGE > clampedPrologEnd + 1 &&
      EPILOG_START_PAGE <= TOTAL_PAGES
    )
      ? EPILOG_START_PAGE
      : null;

    segments.push({
      id: segments.length,
      type: "prolog",
      label: "Prolog",
      start: 1,
      end: clampedPrologEnd,
    });

    const middleStart = clampedPrologEnd + 1;
    const middleEnd = validEpilogStart ? (validEpilogStart - 1) : TOTAL_PAGES;
    if (middleStart <= middleEnd) {
      let runStart = middleStart;
      let runLabel = pageRows[middleStart - 1].yearGroup;

      for (let n = middleStart + 1; n <= middleEnd + 1; n++) {
        const currentLabel = n <= middleEnd ? pageRows[n - 1].yearGroup : null;
        if (currentLabel !== runLabel) {
          segments.push({
            id: segments.length,
            type: "year",
            label: runLabel || "Okänt år",
            start: runStart,
            end: n - 1,
          });
          runStart = n;
          runLabel = currentLabel;
        }
      }
    }

    if (validEpilogStart) {
      segments.push({
        id: segments.length,
        type: "epilog",
        label: "Epilog",
        start: validEpilogStart,
        end: TOTAL_PAGES,
      });
    }

    return segments.map((seg) => {
      const pages = [];
      for (let n = seg.start; n <= seg.end; n++) {
        pages.push(pageRows[n - 1]);
      }
      return { ...seg, pages };
    });
  });

  eleventyConfig.addFilter("segmentsMeta", (segments) =>
    segments.map(({ id, type, label, start, end }) => ({ id, type, label, start, end }))
  );

  // Redirect pagination data (1..276)
  eleventyConfig.addGlobalData("bioRedirectPages", () => {
    const arr = [];
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      arr.push({ page: i, anchor: `p-${pad3(i)}` });
    }
    return arr;
  });

  // TECH-01: expose total page count to templates and JS
  eleventyConfig.addGlobalData("TOTAL_PAGES", TOTAL_PAGES);

  // NAV-02: safe JSON serialization for inline script tags
  eleventyConfig.addFilter("json", (val) => JSON.stringify(val));

  // Ignore non-site markdown
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("**/.trash_restructure/**");
  eleventyConfig.ignores.add(".planning/**");
  eleventyConfig.ignores.add("content/pages/biografi/chapters/**");
  eleventyConfig.ignores.add("gemini.md");
  eleventyConfig.ignores.add("gemini-brief.md");
  eleventyConfig.ignores.add("gemini-report.md");

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
