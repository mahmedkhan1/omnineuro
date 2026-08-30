/* ============================================================================
   OmniNeuro — pitch.js  (investor deck)
   1. Reading-progress bar
   2. Scroll-reveal for .reveal blocks
   3. "Save as PDF" button -> window.print()
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. PROGRESS BAR -------------------------------------------------------- */
  var bar = document.getElementById("progress");
  function updateBar() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    bar.style.width = (pct * 100).toFixed(1) + "%";
  }
  updateBar();
  window.addEventListener("scroll", updateBar, { passive: true });
  window.addEventListener("resize", updateBar);

  /* 2. SCROLL REVEAL ---------------------------------------------------------- */
  var blocks = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    blocks.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -40px 0px" });
    blocks.forEach(function (el) { io.observe(el); });
  }

  /* 3. SAVE AS PDF ------------------------------------------------------------ */
  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }
})();
