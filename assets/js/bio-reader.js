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

  const yearToggle = document.querySelector('[data-year-toggle]');
  const footerIndicator = document.querySelector('[data-footer-center]');
  const tocPanel = document.querySelector('[data-toc-panel]');

  let segmentPositions = [];
  let pagePositions = [];
  let currentSegmentId = null;
  let currentPageNumber = null;
  let frameId = null;
  let reflowId = null;

  const setYearLabel = (segmentId) => {
    if (!yearToggle) return;
    const match = segmentMeta.find((segment) => Number(segment.id) === Number(segmentId));
    yearToggle.textContent = match?.label || 'Innehåll';
  };

  const binarySearchLastAtOrBefore = (list, targetY) => {
    if (!list.length) return null;

    let lo = 0;
    let hi = list.length - 1;
    let best = 0;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid].top <= targetY) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return list[best];
  };

  const recomputePositions = () => {
    segmentPositions = segmentEls
      .map((el) => ({
        el,
        id: el.dataset.segmentId,
        top: el.offsetTop,
      }))
      .sort((a, b) => a.top - b.top);

    pagePositions = pageAnchors
      .map((row) => ({
        number: row.number,
        top: row.el.offsetTop,
      }))
      .sort((a, b) => a.top - b.top);

    updateFromScroll();
  };

  const scheduleRecompute = () => {
    if (reflowId) return;
    reflowId = window.requestAnimationFrame(() => {
      recomputePositions();
      reflowId = null;
    });
  };

  const updateFromScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;

    const segmentProbeY = scrollTop + (window.innerHeight * 0.35);
    const pageProbeY = scrollTop + (window.innerHeight * 0.28);

    const segmentHit = binarySearchLastAtOrBefore(segmentPositions, segmentProbeY);
    if (segmentHit && segmentHit.id !== currentSegmentId) {
      currentSegmentId = segmentHit.id;
      setYearLabel(currentSegmentId);
    }

    const pageHit = binarySearchLastAtOrBefore(pagePositions, pageProbeY);
    if (pageHit && pageHit.number !== currentPageNumber) {
      currentPageNumber = pageHit.number;
      if (footerIndicator) {
        footerIndicator.textContent = `${currentPageNumber}`;
      }
    }
  };

  const onScroll = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(() => {
      updateFromScroll();
      frameId = null;
    });
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

  const wireReflowTriggers = () => {
    window.addEventListener('resize', scheduleRecompute, { passive: true });
    window.addEventListener('load', scheduleRecompute, { passive: true });

    document.querySelectorAll('.rb-page-prose img').forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', scheduleRecompute, { passive: true });
        img.addEventListener('error', scheduleRecompute, { passive: true });
      }
    });
  };

  const setup = () => {
    wireToc();
    wireReflowTriggers();
    recomputePositions();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  window.addEventListener('DOMContentLoaded', setup);
})();
