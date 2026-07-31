/* SLAM DARK — LED particle field
   Dot-matrix wave + mouse disturbance + click ripples.
   rAF, adaptive density, DPR-capped, paused off-screen. */
(function () {
  "use strict";
  var canvas = document.getElementById("led-field");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;

  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var W = 0, H = 0, dots = [], SPACING = 26;
  var mouse = { x: -9999, y: -9999 };
  var ripples = [];
  var running = true, t = 0, raf = null;

  function build() {
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    SPACING = W < 700 ? 24 : 27;
    var cols = Math.ceil(W / SPACING) + 1;
    var rows = Math.ceil(H / SPACING) + 1;
    var cap = 2400;
    dots = [];
    var step = Math.max(1, Math.ceil(Math.sqrt((cols * rows) / cap)));
    for (var y = 0; y < rows; y += step) {
      for (var x = 0; x < cols; x += step) {
        dots.push({ x: x * SPACING, y: y * SPACING, p: (x * 0.7 + y * 1.3) });
      }
    }
  }

  function frame() {
    raf = null;
    if (!running) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    // advance ripples
    for (var r = ripples.length - 1; r >= 0; r--) {
      ripples[r].r += 3.4;
      ripples[r].a *= 0.965;
      if (ripples[r].a < 0.01) ripples.splice(r, 1);
    }

    var i, d, wave, dx, dy, dist, push, ox, oy, alpha, size, glow;
    for (i = 0; i < dots.length; i++) {
      d = dots[i];
      wave = Math.sin(d.x * 0.014 + t * 1.1) * Math.cos(d.y * 0.011 - t * 0.7);
      ox = 0; oy = wave * 5;
      alpha = 0.10 + (wave + 1) * 0.075;
      size = 1.1;

      // mouse disturbance
      dx = d.x - mouse.x; dy = d.y - mouse.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        push = (1 - dist / 150);
        ox += (dx / (dist || 1)) * push * 16;
        oy += (dy / (dist || 1)) * push * 16;
        alpha += push * 0.45;
        size += push * 0.9;
      }

      // click ripples
      for (r = 0; r < ripples.length; r++) {
        var rp = ripples[r];
        var rdx = d.x - rp.x, rdy = d.y - rp.y;
        var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        var band = Math.abs(rdist - rp.r);
        if (band < 34) {
          glow = (1 - band / 34) * rp.a;
          alpha += glow * 0.8;
          size += glow * 1.4;
          oy += Math.sin(band * 0.2) * glow * 6;
        }
      }

      if (alpha < 0.05) continue;
      ctx.beginPath();
      ctx.arc(d.x + ox, d.y + oy, size, 0, 6.2832);
      ctx.fillStyle = "rgba(53,224,230," + Math.min(alpha, 0.9).toFixed(3) + ")";
      ctx.fill();
    }

    // ripple rings
    ctx.lineWidth = 1;
    for (r = 0; r < ripples.length; r++) {
      ctx.beginPath();
      ctx.arc(ripples[r].x, ripples[r].y, ripples[r].r, 0, 6.2832);
      ctx.strokeStyle = "rgba(53,224,230," + (ripples[r].a * 0.5).toFixed(3) + ")";
      ctx.stroke();
    }

    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && running) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  hero.addEventListener("pointermove", function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
  hero.addEventListener("pointerdown", function (e) {
    var rect = hero.getBoundingClientRect();
    ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 4, a: 0.9 });
    if (ripples.length > 5) ripples.shift();
  });

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); }, 180);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) start(); else stop();
    }, { threshold: 0.02 }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) start(); else stop();
  });

  build();
  start();
})();
