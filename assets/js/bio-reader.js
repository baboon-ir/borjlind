(() => {
  if (!document.body.dataset.biography) return;

  const totalPages = Number.parseInt(document.body.dataset.totalPages || '276', 10);
  const STORAGE_KEY = 'rb-bio-read';
  const STORAGE_PAGE_KEY = 'rb-bio-page';

  let segmentMeta = [];
  try {
    segmentMeta = JSON.parse(
      document.getElementById('rb-segment-data')?.textContent || '[]'
    );
  } catch {}

  let chapterMeta = [];
  try {
    chapterMeta = JSON.parse(
      document.getElementById('rb-chapter-data')?.textContent || '[]'
    );
  } catch {}

  const segmentEls = Array.from(document.querySelectorAll('.rb-segment[data-segment-id]'));
  const pageAnchors = Array.from(document.querySelectorAll('.rb-page-anchor[data-page-number]'))
    .map((el) => ({
      el,
      number: Number.parseInt(el.dataset.pageNumber || '', 10),
    }))
    .filter((row) => Number.isFinite(row.number));

  const yearLabel = document.querySelector('[data-year-label]');
  const footerIndicator = document.querySelector('[data-footer-center]');

  let segmentPositions = [];
  let pagePositions = [];
  let currentSegmentId = null;
  let currentPageNumber = null;
  let frameId = null;
  let reflowId = null;
  let hashUpdateTimer = null;

  // ── Read-tracking via localStorage ──
  const getReadChapters = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  };

  const saveReadChapters = (ids) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  };

  const checkChapterCompletion = (pageNumber) => {
    if (!chapterMeta.length || !pageNumber) return;
    const readIds = getReadChapters();
    let changed = false;

    for (const ch of chapterMeta) {
      if (readIds.includes(ch.id)) continue;
      // Chapter is read when user has reached its last page
      if (pageNumber >= ch.end) {
        readIds.push(ch.id);
        changed = true;
      }
    }

    if (changed) {
      saveReadChapters(readIds);
      // Dispatch event so open nav can update dots live
      window.dispatchEvent(new CustomEvent('rb-read-updated', { detail: readIds }));
    }
  };

  // ── Save last page to localStorage as fallback ──
  const saveLastPage = (pageNumber) => {
    try { localStorage.setItem(STORAGE_PAGE_KEY, String(pageNumber)); } catch {}
  };

  // ── URL hash + position restore ──
  const updateHash = (pageNumber) => {
    const hash = `#p-${String(pageNumber).padStart(3, '0')}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  };

  const restorePosition = () => {
    // Priority 1: URL hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#p-')) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }

    // Priority 2: localStorage fallback
    try {
      const savedPage = localStorage.getItem(STORAGE_PAGE_KEY);
      if (savedPage) {
        const anchor = `p-${String(savedPage).padStart(3, '0')}`;
        const target = document.getElementById(anchor);
        if (target) {
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }
    } catch {}
  };

  const setYearLabel = (segmentId) => {
    if (!yearLabel) return;
    const match = segmentMeta.find((segment) => Number(segment.id) === Number(segmentId));
    yearLabel.textContent = match?.label || '';
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
        footerIndicator.textContent = `${currentPageNumber} av ${totalPages}`;
      }

      // Debounced hash update (avoid spamming history)
      clearTimeout(hashUpdateTimer);
      hashUpdateTimer = setTimeout(() => {
        updateHash(currentPageNumber);
        saveLastPage(currentPageNumber);
        checkChapterCompletion(currentPageNumber);
      }, 400);
    }
  };

  const onScroll = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(() => {
      updateFromScroll();
      frameId = null;
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
    wireReflowTriggers();
    recomputePositions();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Restore reading position after layout settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restorePosition();
      });
    });
  };

  window.addEventListener('DOMContentLoaded', setup);
})();
