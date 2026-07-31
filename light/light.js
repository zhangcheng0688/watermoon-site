/* STADIUM DAYLIGHT — subtle hero parallax (dot grid drifts with the cursor) */
(function () {
  "use strict";
  var hero = document.querySelector(".hero");
  var grid = document.querySelector(".hero-grid-bg");
  if (!hero || !grid) return;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  function tick() {
    raf = null;
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    grid.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }

  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
    request();
  }, { passive: true });
  hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; request(); });
})();
