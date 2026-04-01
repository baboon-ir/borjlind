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

    openBtns.forEach((btn) => btn.addEventListener('click', openSiteNav));
    closeBtns.forEach((btn) => btn.addEventListener('click', closeSiteNav));
    if (backdrop) backdrop.addEventListener('click', closeSiteNav);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeSiteNav();
      }
    });

    // Close on link click (actual <a> links, not drill buttons)
    siteNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        closeSiteNav();
      });
    });

    // Initialize: show main level (hidden by default)
    showLevel('main');
  }

  /* Section-TOC removed — navigation handled by site-nav sidebar */
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
