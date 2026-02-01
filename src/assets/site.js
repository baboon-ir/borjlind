(() => {
  const STORAGE_KEY = "borjlind:biografi:scroll";

  function pad3(n) {
    return String(n).padStart(3, "0");
  }

  function getCurrentAnchorId() {
    const sections = document.querySelectorAll("section[id^='p-']");
    let best = null;
    let bestTop = -Infinity;
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 120 && rect.top > bestTop) {
        bestTop = rect.top;
        best = s;
      }
    }
    return best?.id || null;
  }

  function saveScroll() {
    try {
      const anchor = getCurrentAnchorId();
      const payload = {
        ts: Date.now(),
        anchor,
        scrollY: window.scrollY
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function restoreScroll() {
    if (location.hash) return; // respect explicit hash

    let payload = null;
    try {
      payload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {}
    if (!payload) return;

    const anchorId = payload.anchor;
    const scrollY = payload.scrollY;

    // Prefer anchor restore; fall back to scrollY.
    requestAnimationFrame(() => {
      if (anchorId && document.getElementById(anchorId)) {
        document.getElementById(anchorId).scrollIntoView({ block: "start" });
        // Nudge with stored scrollY delta if available
        if (typeof scrollY === "number") {
          // Give layout a moment, then adjust
          setTimeout(() => window.scrollTo({ top: scrollY, behavior: "instant" }), 0);
        }
      } else if (typeof scrollY === "number") {
        window.scrollTo({ top: scrollY, behavior: "instant" });
      }
    });
  }

  function setupJumpToPage() {
    const form = document.querySelector("[data-jump-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[name='page']");
      const n = Number(input?.value);
      if (!Number.isFinite(n) || n < 1 || n > 276) return;
      location.href = `/biografi/#p-${pad3(n)}`;
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "biografi") {
      restoreScroll();
      setupJumpToPage();

      let ticking = false;
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          saveScroll();
          ticking = false;
        });
      }, { passive: true });

      window.addEventListener("hashchange", () => {
        // When user jumps, store immediately.
        setTimeout(saveScroll, 50);
      });
    }
  });
})();
