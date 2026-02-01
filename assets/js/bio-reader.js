(() => {
  const KEY = "bio:last";
  const TOTAL = 276;

  const pad3 = (n) => String(n).padStart(3, "0");
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const getCurrentAnchor = () => {
    const pages = document.querySelectorAll(".bio-page[id^='p-']");
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

    // Jump-to-page
    const form = document.querySelector("[data-jump-form]");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[name='page']");
      const n = Number(input?.value);
      if (!Number.isFinite(n)) return;
      gotoPage(n);
    });

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
          ticking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("hashchange", () => setTimeout(save, 50));
  };

  window.addEventListener("DOMContentLoaded", setup);
})();
