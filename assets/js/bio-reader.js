(() => {
  const KEY = "bio:last";
  const TOTAL = 276;

  const pad3 = (n) => String(n).padStart(3, "0");
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const getCurrentAnchor = () => {
    const pages = document.querySelectorAll(".rb-bio-page[id^='p-']");
    let best = null;
    let bestTop = -Infinity;
    for (const el of pages) {
      const r = el.getBoundingClientRect();
      if (r.top <= 140 && r.top > bestTop) {
        bestTop = r.top;
        best = el;
      }
    }
    return best?.id || null;
  };

  const getCurrentPageNumber = () => {
    const anchor = getCurrentAnchor();
    if (!anchor) return 1;
    const match = anchor.match(/p-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const updatePageDisplay = () => {
    const input = document.querySelector("[data-page-input]");
    if (!input) return;
    const currentPage = getCurrentPageNumber();
    input.value = currentPage;
    
    // Update URL hash to match current page
    const anchor = getCurrentAnchor();
    if (anchor && location.hash !== `#${anchor}`) {
      history.replaceState(null, '', `#${anchor}`);
    }
  };

  const save = () => {
    try {
      const anchor = getCurrentAnchor();
      const payload = { anchor, y: window.scrollY, updatedAt: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {}
  };

  const restore = () => {
    if (location.hash) return; // respect explicit hash
    let payload = null;
    try {
      payload = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {}
    if (!payload) return;

    const { anchor, y } = payload;
    requestAnimationFrame(() => {
      if (anchor && document.getElementById(anchor)) {
        document.getElementById(anchor).scrollIntoView({ block: "start" });
        if (typeof y === "number") setTimeout(() => window.scrollTo(0, y), 0);
      } else if (typeof y === "number") {
        window.scrollTo(0, y);
      }
    });

    const btn = document.querySelector("[data-continue]");
    if (btn) btn.hidden = false;
  };

  const gotoPage = (n) => {
    const page = clamp(Number(n), 1, TOTAL);
    location.hash = `p-${pad3(page)}`;
  };

  const setup = () => {
    if (!document.body.dataset.biography) return;

    restore();

    // Page input - manual change
    const pageInput = document.querySelector("[data-page-input]");
    if (pageInput) {
      pageInput.addEventListener("change", (e) => {
        const n = Number(e.target.value);
        if (!Number.isFinite(n)) return;
        gotoPage(n);
      });
      pageInput.addEventListener("blur", (e) => {
        const n = Number(e.target.value);
        if (!Number.isFinite(n)) return;
        gotoPage(n);
      });
      // Initialize with current page
      updatePageDisplay();
    }

    // Continue reading
    const cont = document.querySelector("[data-continue]");
    cont?.addEventListener("click", () => {
      let payload = null;
      try { payload = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
      if (!payload) return;
      if (payload.anchor && document.getElementById(payload.anchor)) {
        document.getElementById(payload.anchor).scrollIntoView({ block: "start" });
        if (typeof payload.y === "number") setTimeout(() => window.scrollTo(0, payload.y), 0);
      }
    });

    // To top
    document.querySelector("[data-top]")?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Throttled save on scroll
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          save();
          updatePageDisplay();
          ticking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("hashchange", () => {
      setTimeout(() => {
        save();
        updatePageDisplay();
      }, 50);
    });
  };

  window.addEventListener("DOMContentLoaded", setup);
})();
