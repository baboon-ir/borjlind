(function () {
  const root = document.documentElement;
  const btn = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  const closeBtn = document.querySelector('[data-nav-close]');
  if (!btn || !panel) return;

  function setOpen(open) {
    root.classList.toggle('rb-nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Stäng' : 'Meny';
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  // initial
  setOpen(false);

  btn.addEventListener('click', () => {
    const open = !root.classList.contains('rb-nav-open');
    setOpen(open);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => setOpen(false));
  }

  // close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // close when clicking backdrop
  panel.addEventListener('click', (e) => {
    if (e.target && e.target.matches('[data-nav-panel]')) setOpen(false);
  });

  // close on navigation click
  panel.addEventListener('click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a');
    if (a) setOpen(false);
  });

  // header scroll background
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
