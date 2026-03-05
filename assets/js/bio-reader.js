(() => {
  // Guard: only run on biography page
  if (!document.body.dataset.biography) return;

  // --- Constants ---
  const container = document.querySelector('[data-bio-pages]');
  const TOTAL_PAGES = parseInt(container?.dataset.total || '276', 10);
  const KEY = 'bio:page';
  const EDGE_PX = 20;      // px from screen edge — give to iOS Safari back gesture
  const ANGLE_LIMIT = 30;  // degrees from horizontal — above = vertical scroll, abort
  const MIN_DIST = 40;     // minimum horizontal px to trigger page turn

  const pad3 = (n) => String(n).padStart(3, '0');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  let currentPage = 1;

  // --- Year groups (baked into HTML by plan 02-05) ---
  let yearGroups = [];
  try {
    yearGroups = JSON.parse(
      document.getElementById('rb-year-groups')?.textContent || '[]'
    );
  } catch {}

  const getYearGroup = (page) => {
    let label = yearGroups[0]?.yearGroup || '';
    for (const g of yearGroups) {
      if (g.firstPage <= page) label = g.yearGroup;
      else break;
    }
    return label;
  };

  // --- localStorage state (READER-07) ---
  const save = (n) => {
    try { localStorage.setItem(KEY, String(n)); } catch {}
  };
  const restore = () => {
    // Remove old scroll-position key if present (cleanup)
    try { localStorage.removeItem('bio:last'); } catch {}
    try {
      const n = parseInt(localStorage.getItem(KEY) || '1', 10);
      return Number.isFinite(n) ? clamp(n, 1, TOTAL_PAGES) : 1;
    } catch { return 1; }
  };

  // --- Page visibility (READER-01) ---
  const showPage = (n) => {
    n = clamp(n, 1, TOTAL_PAGES);
    const prev = document.querySelector('.rb-bio-page.is-active');
    if (prev) prev.classList.remove('is-active');
    const next = document.getElementById(`p-${pad3(n)}`);
    if (!next) return;
    next.classList.add('is-active');
    currentPage = n;
    updateIndicator();
    updateYearBadge();
    save(n);
  };

  const goNext = () => { if (currentPage < TOTAL_PAGES) showPage(currentPage + 1); };
  const goPrev = () => { if (currentPage > 1) showPage(currentPage - 1); };

  // --- UI updates ---
  const updateIndicator = () => {
    const el = document.querySelector('[data-page-indicator]');
    if (el) el.textContent = `${currentPage} / ${TOTAL_PAGES}`;
  };

  const updateYearBadge = () => {
    const el = document.querySelector('[data-year-badge]');
    if (el) el.textContent = getYearGroup(currentPage);
  };

  // --- Arrow buttons (READER-04) ---
  const wireButtons = () => {
    document.querySelector('[data-prev]')?.addEventListener('click', goPrev);
    document.querySelector('[data-next]')?.addEventListener('click', goNext);
  };

  // --- Keyboard navigation (READER-05) ---
  const wireKeyboard = () => {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
    });
  };

  // --- Pointer Events swipe (READER-02, READER-03) ---
  const wireSwipe = () => {
    if (!container) return;
    let startX, startY, tracking = false;

    container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      // iOS Safari edge-swipe exclusion zone (READER-03)
      if (e.clientX < EDGE_PX || e.clientX > window.innerWidth - EDGE_PX) return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
      if (!tracking) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Angle check: abort if gesture is more vertical than ANGLE_LIMIT degrees
      const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI);
      if (angle > ANGLE_LIMIT) {
        tracking = false;
        return;
      }
      // Lock horizontal scroll once intent is confirmed
      if (Math.abs(dx) > 8) e.preventDefault();
    });

    container.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < MIN_DIST) return;
      if (dx < 0) goNext();
      else goPrev();
    });

    container.addEventListener('pointercancel', () => { tracking = false; });
  };

  // --- TOC panel (NAV-03) ---
  const wireToc = () => {
    const panel = document.querySelector('[data-toc-panel]');
    if (!panel) return;

    const openToc = () => {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
    };
    const closeToc = () => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    };

    document.querySelector('[data-toc-toggle]')?.addEventListener('click', openToc);
    document.querySelector('[data-toc-close]')?.addEventListener('click', closeToc);

    // Year group jump buttons
    panel.querySelectorAll('[data-toc-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.tocPage, 10);
        if (Number.isFinite(page)) showPage(page);
        closeToc();
      });
    });
  };

  // --- Init ---
  const setup = () => {
    wireButtons();
    wireKeyboard();
    wireSwipe();
    wireToc();
    showPage(restore());
  };

  window.addEventListener('DOMContentLoaded', setup);
})();
