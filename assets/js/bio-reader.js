(() => {
  if (!document.body.dataset.biography) return;

  let segmentMeta = [];
  try {
    segmentMeta = JSON.parse(
      document.getElementById('rb-segment-data')?.textContent || '[]'
    );
  } catch {}

  const segmentEls = Array.from(document.querySelectorAll('.rb-segment[data-segment-id]'));
  const pageAnchors = Array.from(document.querySelectorAll('.rb-page-anchor[data-page-number]'))
    .map((el) => ({
      el,
      number: Number.parseInt(el.dataset.pageNumber || '', 10),
    }))
    .filter((row) => Number.isFinite(row.number));

  const totalPages = pageAnchors.length
    ? pageAnchors[pageAnchors.length - 1].number
    : null;

  const yearToggle = document.querySelector('[data-year-toggle]');
  const footerIndicator = document.querySelector('[data-footer-center]');
  const tocPanel = document.querySelector('[data-toc-panel]');

  const setYearLabel = (segmentId) => {
    if (!yearToggle) return;
    const match = segmentMeta.find((segment) => Number(segment.id) === Number(segmentId));
    yearToggle.textContent = match?.label || 'Innehåll';
  };

  const getActiveSegmentId = () => {
    const threshold = window.innerHeight * 0.35;
    let current = segmentEls[0];

    for (const el of segmentEls) {
      if (el.getBoundingClientRect().top <= threshold) {
        current = el;
      } else {
        break;
      }
    }

    return current?.dataset.segmentId;
  };

  const getCurrentPageNumber = () => {
    if (!pageAnchors.length) return null;

    const threshold = window.innerHeight * 0.28;
    let current = pageAnchors[0].number;

    for (const row of pageAnchors) {
      if (row.el.getBoundingClientRect().top <= threshold) {
        current = row.number;
      } else {
        break;
      }
    }

    return current;
  };

  const updateFromScroll = () => {
    const activeId = getActiveSegmentId();
    if (activeId != null) setYearLabel(activeId);

    const currentPage = getCurrentPageNumber();
    if (footerIndicator && currentPage != null && totalPages != null) {
      footerIndicator.textContent = `Sida ${currentPage} / ${totalPages}`;
    }
  };

  const openToc = () => {
    if (!tocPanel) return;
    tocPanel.classList.add('is-open');
    tocPanel.setAttribute('aria-hidden', 'false');
  };

  const closeToc = () => {
    if (!tocPanel) return;
    tocPanel.classList.remove('is-open');
    tocPanel.setAttribute('aria-hidden', 'true');
  };

  const wireToc = () => {
    if (!tocPanel) return;

    yearToggle?.addEventListener('click', openToc);
    document.querySelector('[data-toc-close]')?.addEventListener('click', closeToc);

    tocPanel.querySelectorAll('[data-toc-segment]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number.parseInt(btn.dataset.tocSegment || '', 10);
        if (!Number.isFinite(idx)) return;

        const target = document.getElementById(`segment-${idx}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        closeToc();
      });
    });
  };

  const setup = () => {
    wireToc();
    updateFromScroll();

    let frameId = null;
    window.addEventListener('scroll', () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        updateFromScroll();
        frameId = null;
      });
    }, { passive: true });
  };

  window.addEventListener('DOMContentLoaded', setup);
})();
