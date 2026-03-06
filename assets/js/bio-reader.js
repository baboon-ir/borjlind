(() => {
  if (!document.body.dataset.biography) return;

  // --- Segment metadata (baked at build time) ---
  let segmentMeta = [];
  try {
    segmentMeta = JSON.parse(
      document.getElementById('rb-segment-data')?.textContent || '[]'
    );
  } catch {}

  const TOTAL_SEGMENTS = segmentMeta.length;
  if (!TOTAL_SEGMENTS) return;

  const KEY = 'bio:pos:v2';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const formatSpan = (start, end) => (start === end ? `${start}` : `${start}-${end}`);

  // column = screen column index inside active segment
  let state = { segment: -1, column: 0 };

  // --- Element helpers ---
  const getSegmentEl = (idx) => document.getElementById(`segment-${idx}`);

  // --- Init CSS columns for a segment element ---
  // column-width must equal clientWidth so each column = one full screen
  const initColumns = (el) => {
    if (!el) return;
    el.style.columnWidth = el.clientWidth + 'px';
  };

  // --- Total screen-columns in an active segment ---
  const getColumnCount = (el) => {
    if (!el) return 1;
    return Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
  };

  const getVisibleSourcePages = (el, columnIdx) => {
    const anchors = Array.from(el.querySelectorAll('.rb-page-anchor[data-page-number]'))
      .map((anchor) => ({
        number: Number.parseInt(anchor.dataset.pageNumber || '', 10),
        left: anchor.offsetLeft,
      }))
      .filter((row) => Number.isFinite(row.number))
      .sort((a, b) => a.left - b.left);

    if (!anchors.length) return { first: null, last: null };

    const left = columnIdx * el.clientWidth;
    const right = left + el.clientWidth;
    const visible = [];

    for (let i = 0; i < anchors.length; i++) {
      const start = anchors[i].left;
      const end = (i + 1 < anchors.length) ? anchors[i + 1].left : el.scrollWidth;
      if (end > left && start < right) visible.push(anchors[i].number);
    }

    if (!visible.length) {
      let fallback = anchors[0].number;
      for (const row of anchors) {
        if (row.left <= left) fallback = row.number;
      }
      return { first: fallback, last: fallback };
    }

    return { first: visible[0], last: visible[visible.length - 1] };
  };

  const getColumnForSourcePage = (el, sourcePage) => {
    const target = el.querySelector(`.rb-page-anchor[data-page-number="${sourcePage}"]`);
    if (!target || !el.clientWidth) return 0;
    return clamp(Math.floor(target.offsetLeft / el.clientWidth), 0, getColumnCount(el) - 1);
  };

  const updateUI = (el) => {
    const footerEl = document.querySelector('[data-footer-center]');
    const yearEl = document.querySelector('[data-year-toggle]');
    const meta = segmentMeta[state.segment] || {};
    if (!footerEl || !meta.start || !meta.end) return;

    const visible = getVisibleSourcePages(el, state.column);
    const visibleStart = visible.first ?? meta.start;
    // SIDA should always be a single page number, never a range.
    const current = `${visibleStart}`;
    footerEl.textContent = current;
    if (yearEl) yearEl.textContent = meta.label || "";
  };

  // --- Navigate to segment + column ---
  const showPosition = (segmentIdx, columnIdx, animate = true) => {
    segmentIdx = clamp(segmentIdx, 0, TOTAL_SEGMENTS - 1);
    const sameSegment = state.segment === segmentIdx;
    let el;

    if (!sameSegment) {
      // Deactivate old segment only when actually switching
      const prev = document.querySelector('.rb-segment.is-active');
      if (prev) {
        prev.classList.remove('is-active');
        prev.style.columnWidth = '';
      }
      el = getSegmentEl(segmentIdx);
      if (!el) return;
      el.classList.add('is-active');
      initColumns(el);
    } else {
      // Same segment — never touch is-active or columnWidth
      el = getSegmentEl(segmentIdx);
      if (!el) return;
    }

    const totalColumns = getColumnCount(el);
    columnIdx = clamp(columnIdx === Infinity ? totalColumns - 1 : columnIdx, 0, totalColumns - 1);

    el.scrollTo({
      left: columnIdx * el.clientWidth,
      behavior: animate && sameSegment ? 'smooth' : 'auto',
    });

    state = { segment: segmentIdx, column: columnIdx };
    updateUI(el);
    save();
  };

  const goNext = () => {
    const el = getSegmentEl(state.segment);
    const totalColumns = getColumnCount(el);
    if (state.column < totalColumns - 1) {
      showPosition(state.segment, state.column + 1);
    } else if (state.segment < TOTAL_SEGMENTS - 1) {
      showPosition(state.segment + 1, 0, false);
    }
  };

  const goPrev = () => {
    if (state.column > 0) {
      showPosition(state.segment, state.column - 1);
    } else if (state.segment > 0) {
      showPosition(state.segment - 1, Infinity, false);
    }
  };

  // --- LocalStorage ---
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  };

  // --- Buttons ---
  const wireButtons = () => {
    document.querySelector('[data-prev]')?.addEventListener('click', goPrev);
    document.querySelector('[data-next]')?.addEventListener('click', goNext);
  };

  // --- Keyboard ---
  const wireKeyboard = () => {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
    });
  };

  // --- Pointer/swipe ---
  const wireSwipe = () => {
    const container = document.querySelector('[data-segments]');
    if (!container) return;

    const EDGE_PX = 20;
    const ANGLE_LIMIT = 30;
    const MIN_DIST = 40;
    let startX, startY, tracking = false;

    container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      if (e.clientX < EDGE_PX || e.clientX > window.innerWidth - EDGE_PX) return;
      startX = e.clientX; startY = e.clientY;
      tracking = true;
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
      if (!tracking) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI);
      if (angle > ANGLE_LIMIT) { tracking = false; return; }
      if (Math.abs(dx) > 8) e.preventDefault();
    });

    container.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < MIN_DIST) return;
      if (dx < 0) goNext(); else goPrev();
    });

    container.addEventListener('pointercancel', () => { tracking = false; });
  };

  // --- TOC ---
  const wireToc = () => {
    const panel = document.querySelector('[data-toc-panel]');
    if (!panel) return;

    const openToc  = () => { panel.classList.add('is-open');    panel.setAttribute('aria-hidden', 'false'); };
    const closeToc = () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true');  };

    document.querySelector('[data-toc-toggle]')?.addEventListener('click', openToc);
    document.querySelector('[data-year-toggle]')?.addEventListener('click', openToc);
    document.querySelector('[data-toc-close]')?.addEventListener('click', closeToc);

    panel.querySelectorAll('[data-toc-segment]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.tocSegment, 10);
        if (Number.isFinite(idx)) showPosition(idx, 0, false);
        closeToc();
      });
    });
  };

  const getHashSourcePage = () => {
    const match = window.location.hash.match(/^#p-(\d{1,3})$/);
    if (!match) return null;
    const sourcePage = Number.parseInt(match[1], 10);
    return Number.isFinite(sourcePage) ? sourcePage : null;
  };

  const jumpToSourcePage = (sourcePage) => {
    const segmentIdx = segmentMeta.findIndex(
      (segment) => sourcePage >= segment.start && sourcePage <= segment.end
    );
    if (segmentIdx < 0) return false;

    showPosition(segmentIdx, 0, false);
    const el = getSegmentEl(segmentIdx);
    if (!el) return false;
    const targetColumn = getColumnForSourcePage(el, sourcePage);
    showPosition(segmentIdx, targetColumn, false);
    return true;
  };

  // --- Resize: re-init columns, clamp page ---
  const wireResize = () => {
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const el = getSegmentEl(state.segment);
        if (!el) return;
        el.style.columnWidth = '';
        initColumns(el);
        const totalColumns = getColumnCount(el);
        const column = clamp(state.column, 0, totalColumns - 1);
        el.scrollLeft = column * el.clientWidth;
        state.column = column;
        updateUI(el);
      }, 150);
    });
  };

  // --- Init ---
  const setup = () => {
    wireButtons();
    wireKeyboard();
    wireSwipe();
    wireToc();
    wireResize();

    const hashPage = getHashSourcePage();
    // Keep the dedicated cover as initial page. Deep-link from page 2+ still works.
    if (hashPage && hashPage > 1 && jumpToSourcePage(hashPage)) return;

    // No hash: always start from the beginning.
    showPosition(0, 0, false);
  };

  window.addEventListener('DOMContentLoaded', setup);
})();
