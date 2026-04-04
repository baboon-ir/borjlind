/**
 * section-reader.js
 * Multi-level site-nav drawer + section-TOC drawer.
 * Context-aware: opens directly to sub-nav when on biografi/minnen/appendix.
 */
(() => {
  /* ── Multi-level Site-nav drawer ── */
  const siteNav = document.querySelector('[data-site-nav]');
  if (siteNav) {
    const openBtns = document.querySelectorAll('[data-site-nav-open]');
    const closeBtns = siteNav.querySelectorAll('[data-site-nav-close]');
    const backdrop = siteNav.querySelector('[data-site-nav-backdrop]');
    const levels = siteNav.querySelectorAll('[data-nav-level]');
    const drillBtns = siteNav.querySelectorAll('[data-nav-goto]');
    const backBtns = siteNav.querySelectorAll('[data-nav-back]');

    const navContext = document.body.dataset.navContext || null;
    let currentLevel = 'main';

    const showLevel = (levelName, animClass) => {
      levels.forEach((el) => {
        const isTarget = el.dataset.navLevel === levelName;
        if (isTarget) {
          el.hidden = false;
          el.classList.add('is-active');
          if (animClass) {
            el.classList.add(animClass);
            el.addEventListener('animationend', () => el.classList.remove(animClass), { once: true });
          }
        } else {
          el.classList.remove('is-active', 'slide-from-left');
          el.hidden = true;
        }
      });
      currentLevel = levelName;
    };

    const openSiteNav = () => {
      // Decide which level to show based on page context
      if (navContext && navContext !== 'home') {
        showLevel(navContext);
      } else {
        showLevel('main');
      }

      siteNav.classList.add('is-open');
      siteNav.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('rb-site-nav-open');
    };

    const closeSiteNav = () => {
      siteNav.classList.remove('is-open');
      siteNav.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('rb-site-nav-open');

      // Reset to main after close transition
      setTimeout(() => {
        if (!siteNav.classList.contains('is-open')) {
          showLevel('main');
        }
      }, 350);
    };

    // Drill into sub-level
    drillBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.navGoto;
        if (target) showLevel(target);
      });
    });

    // Back to main level
    backBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        showLevel('main', 'slide-from-left');
      });
    });

    // ── Read-indicator dots ──
    const STORAGE_KEY = 'rb-bio-read';

    const updateReadDots = () => {
      let readIds = [];
      try { readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}

      siteNav.querySelectorAll('[data-chapter-id]').forEach((link) => {
        const chId = Number(link.dataset.chapterId);
        const dot = link.querySelector('.rb-read-dot');
        if (readIds.includes(chId)) {
          if (!dot) {
            const span = document.createElement('span');
            span.className = 'rb-read-dot';
            span.setAttribute('aria-label', 'Läst');
            link.appendChild(span);
          }
        } else if (dot) {
          dot.remove();
        }
      });
    };

    // Wire open buttons — update dots each time nav opens
    openBtns.forEach((btn) => btn.addEventListener('click', () => {
      openSiteNav();
      updateReadDots();
    }));
    closeBtns.forEach((btn) => btn.addEventListener('click', closeSiteNav));
    if (backdrop) backdrop.addEventListener('click', closeSiteNav);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeSiteNav();
      }
    });

    // Close on link click (actual <a> links, not drill buttons)
    // For year-anchor links on the biography page, scroll to the element directly
    siteNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        closeSiteNav();
        const href = a.getAttribute('href') || '';
        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1 && document.body.dataset.biography) {
          const rawId = decodeURIComponent(href.slice(hashIdx + 1));
          const target = document.getElementById(rawId);
          if (target) {
            e.preventDefault();
            history.replaceState(null, '', '#' + encodeURIComponent(rawId));
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 360);
          }
        }
      });
    });

    // Live update when bio-reader dispatches read event
    window.addEventListener('rb-read-updated', () => updateReadDots());

    // Initialize: show main level (hidden by default)
    showLevel('main');
    updateReadDots();
  }
})();

/* ── Accordion toggle text ── */
(() => {
  document.querySelectorAll('.rb-accordion-details').forEach((details) => {
    const btn = details.querySelector('.rb-accordion-btn');
    if (!btn) return;
    details.addEventListener('toggle', () => {
      btn.textContent = details.open ? 'STÄNG' : 'LÄS MER';
    });
  });
})();
