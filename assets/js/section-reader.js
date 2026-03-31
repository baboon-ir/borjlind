/**
 * section-reader.js
 * Handles site-nav drawer and section-TOC drawer on Minnen, Appendix, Memory pages.
 * Also used by biography (site-nav only — bio-reader.js handles its own TOC).
 */
(() => {
  /* ── Site-nav drawer ── */
  const siteNav = document.querySelector('[data-site-nav]');
  if (siteNav) {
    const openBtns = document.querySelectorAll('[data-site-nav-open]');
    const closeBtn = siteNav.querySelector('[data-site-nav-close]');
    const backdrop = siteNav.querySelector('[data-site-nav-backdrop]');

    const openSiteNav = () => {
      siteNav.classList.add('is-open');
      siteNav.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('rb-site-nav-open');
    };

    const closeSiteNav = () => {
      siteNav.classList.remove('is-open');
      siteNav.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('rb-site-nav-open');
    };

    openBtns.forEach((btn) => btn.addEventListener('click', openSiteNav));
    if (closeBtn) closeBtn.addEventListener('click', closeSiteNav);
    if (backdrop) backdrop.addEventListener('click', closeSiteNav);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeSiteNav();
      }
    });

    // Close on link click
    siteNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeSiteNav);
    });
  }

  /* ── Section-TOC drawer (Minnen, Appendix) ── */
  if (!document.body.dataset.sectionReader) return;

  const tocPanel = document.querySelector('[data-section-toc]');
  if (tocPanel) {
    const openBtns = document.querySelectorAll('[data-section-toc-open]');
    const closeBtn = tocPanel.querySelector('[data-section-toc-close]');

    const openToc = () => {
      tocPanel.classList.add('is-open');
      tocPanel.setAttribute('aria-hidden', 'false');
    };

    const closeToc = () => {
      tocPanel.classList.remove('is-open');
      tocPanel.setAttribute('aria-hidden', 'true');
    };

    openBtns.forEach((btn) => btn.addEventListener('click', openToc));
    if (closeBtn) closeBtn.addEventListener('click', closeToc);

    // Close on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tocPanel.classList.contains('is-open')) {
        closeToc();
      }
    });

    // Close on link click + smooth scroll
    tocPanel.querySelectorAll('[data-section-toc-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.slice(1);
        const target = targetId && document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        closeToc();
      });
    });
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
