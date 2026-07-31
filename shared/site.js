/* WATERMOON × SLAM.SYSTEMS — shared interactions
   - i18n (data-i18n, localStorage "wm-lang", default EN)
   - scroll reveal (IntersectionObserver)
   - nav background on scroll
   - AI assistant floating placeholder (tooltip → WhatsApp) */
(function () {
  "use strict";
  var LANGS = ["en", "de", "es", "fr"];

  function getLang() {
    var l = null;
    try { l = localStorage.getItem("wm-lang"); } catch (e) {}
    return LANGS.indexOf(l) >= 0 ? l : "en";
  }

  function apply(lang) {
    var dict = (window.WM_I18N && window.WM_I18N[lang]) || window.WM_I18N.en;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute("data-i18n");
      if (dict[k] != null) nodes[i].textContent = dict[k];
    }
    document.documentElement.setAttribute("lang", lang);
    var btns = document.querySelectorAll("[data-lang-btn]");
    for (var j = 0; j < btns.length; j++) {
      var on = btns[j].getAttribute("data-lang-btn") === lang;
      btns[j].classList.toggle("active", on);
      btns[j].setAttribute("aria-pressed", on ? "true" : "false");
    }
    try { localStorage.setItem("wm-lang", lang); } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-lang-btn]") : null;
    if (b) apply(b.getAttribute("data-lang-btn"));
  });

  /* ---- scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  /* ---- nav scrolled state ---- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- AI assistant placeholder ---- */
  function initFab() {
    var a = document.createElement("a");
    a.className = "ai-fab";
    a.href = "https://wa.me/85244358635?text=Hi%20Watermoon%2C%20I%27d%20like%20to%20chat";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "AI assistant — coming soon");
    a.innerHTML =
      '<span class="ai-pulse" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      "</svg>" +
      '<span class="ai-tip" data-i18n="ai.tip">AI assistant — coming soon</span>';
    document.body.appendChild(a);
  }

  function init() {
    initReveal();
    initNav();
    initFab();
    apply(getLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
