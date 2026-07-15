(function () {
  // BENDITA SUERTE SALÓN — main.js. IIFE, sin módulos, sin build step.
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Sync repeated business data from manifest.js ---------- */
  function bindBrand() {
    if (!data.phoneDisplay) return;

    $$('[data-bind="phoneDisplay"]').forEach(function (el) { el.textContent = data.phoneDisplay; });
    $$('[data-bind-href="tel"]').forEach(function (el) { el.setAttribute("href", "tel:" + data.phoneHref); });

    var waText = encodeURIComponent(data.whatsappMessage || "Hola Bendita Suerte");
    var waBase = "https://wa.me/" + data.whatsappNumber + "?text=" + waText;
    $$('[data-bind-href="whatsapp"]').forEach(function (el) { el.setAttribute("href", waBase); });

    // Per-product WhatsApp inquiry links: "Hola, quiero consultar por <producto>"
    $$("[data-product-whatsapp]").forEach(function (el) {
      var product = el.getAttribute("data-product-whatsapp");
      var msg = encodeURIComponent("Hola Bendita Suerte, quiero consultar por: " + product);
      el.setAttribute("href", "https://wa.me/" + data.whatsappNumber + "?text=" + msg);
    });
  }

  /* ---------- Nav: solidify on scroll + mobile menu ---------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".nav-toggle");
    var menu = $(".mobile-menu");
    var close = $(".mobile-menu-close");
    if (!toggle || !menu) return;
    var open = function () {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    var shut = function () {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    toggle.addEventListener("click", open);
    if (close) close.addEventListener("click", shut);
    $$("a", menu).forEach(function (a) { a.addEventListener("click", shut); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") shut();
    });
  }

  /* ---------- Smooth anchor scrolling (native, nav-offset aware) ---------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (typeof IntersectionObserver === "undefined") {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -2% 0px" });
    items.forEach(function (el) { io.observe(el); });

    // Safety net: force-reveal anything still hidden after 6s
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Tilt on cards (fine pointer only) ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach(function (card) {
      var raf = null;
      card.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(700px) rotateX(" + (py * -5) + "deg) rotateY(" + (px * 5) + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseout", function (e) {
        if (card.contains(e.relatedTarget)) return;
        card.style.transform = "";
      });
    });
  }

  /* ---------- Today's hours highlight ---------- */
  function initHoursToday() {
    var rows = $$("[data-hours-row]");
    if (!rows.length) return;
    var names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    var today = names[new Date().getDay()];
    rows.forEach(function (row) {
      if (row.getAttribute("data-hours-row") === today) row.classList.add("is-today");
    });
  }

  /* ---------- Rating count-up ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = el.getAttribute("data-count-to").indexOf(".") > -1 ? 1 : 0;
      if (reduced || typeof IntersectionObserver === "undefined") {
        el.textContent = target.toFixed(decimals);
        return;
      }
      var done = false;
      var run = function () {
        if (done) return;
        done = true;
        var start = performance.now();
        var duration = 1100;
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run();
          io.unobserve(el);
        });
      }, { threshold: 0.02 });
      io.observe(el);
      // Safety net: if still un-animated after 6s (e.g. observer never fired), show final value
      setTimeout(function () {
        if (!done) { done = true; el.textContent = target.toFixed(decimals); }
      }, 6000);
    });
  }

  /* ---------- Lightbox for gallery ---------- */
  function initLightbox() {
    var items = $$("[data-lightbox] .gallery-item img");
    var lightbox = $(".lightbox");
    if (!items.length || !lightbox) return;
    var imgEl = $("img", lightbox);
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      imgEl.src = items[idx].currentSrc || items[idx].src;
      imgEl.alt = items[idx].alt || "";
    }
    function open(i) {
      show(i);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function shut() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    items.forEach(function (img, i) {
      img.closest(".gallery-item").addEventListener("click", function () { open(i); });
    });
    var closeBtn = $(".lightbox-close", lightbox);
    var prevBtn = $(".lightbox-prev", lightbox);
    var nextBtn = $(".lightbox-next", lightbox);
    if (closeBtn) closeBtn.addEventListener("click", shut);
    if (prevBtn) prevBtn.addEventListener("click", function () { show(idx - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(idx + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) shut(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") shut();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Floating reserve button — appears after scrolling past the hero ---------- */
  function initFloatingReserve() {
    var btn = $("#floating-reserve");
    var hero = $("#inicio");
    if (!btn || !hero) return;
    var onScroll = function () {
      var threshold = hero.offsetHeight * 0.7;
      if (window.scrollY > threshold) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Favorite (heart) toggle — local only, persisted per browser ---------- */
  function initFavButtons(scope) {
    $$("[data-fav]", scope).forEach(function (btn) {
      if (btn.dataset.favBound) return;
      btn.dataset.favBound = "1";
      var key = "bs-fav:" + btn.getAttribute("data-fav");
      var isFav = false;
      try { isFav = localStorage.getItem(key) === "1"; } catch (e) { /* privacy mode: skip persistence */ }
      btn.classList.toggle("is-fav", isFav);
      btn.setAttribute("aria-pressed", isFav ? "true" : "false");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var nowFav = !btn.classList.contains("is-fav");
        btn.classList.toggle("is-fav", nowFav);
        btn.setAttribute("aria-pressed", nowFav ? "true" : "false");
        try { localStorage.setItem(key, nowFav ? "1" : "0"); } catch (e2) { /* privacy mode: skip persistence */ }
      });
    });
  }

  /* ---------- Product carousel — category tabs + Embla infinite drag loop ----------
     Baseline (no JS): .embla__viewport is a native overflow-x:auto scroll-snap track,
     so all 9 products stay swipeable/scrollable with zero JavaScript.
     Enhancement (JS + Embla present): infinite loop, drag anywhere, arrows, autoplay,
     and the category tabs re-render the slide list from manifest.js data. */
  function initProductCarousel() {
    var wrap = $("[data-product-carousel]");
    var viewport = $("[data-embla-viewport]", wrap);
    var container = $("[data-embla-container]", wrap);
    var tabsBar = $("[data-category-filter]");
    if (!wrap || !viewport || !container) return;

    var allSlidesHTML = container.innerHTML; // hardcoded "Todos" markup, used as the reset state

    function escHTML(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function slideHTML(p) {
      var cartLabel = p.name + (p.sub ? " " + p.sub : "") + " (" + p.brand + ")";
      var cartId = p.id || cartLabel;
      var cartPrice = p.priceCLP != null ? p.priceCLP : 0;
      var visualInner = '<svg class="icon" aria-hidden="true"><use href="#icon-' + escHTML(p.icon) + '"/></svg>';
      var visualHTML = p.productUrl
        ? '<a class="shop-card-visual" href="' + escHTML(p.productUrl) + '" aria-label="Ver producto: ' + escHTML(p.name) + '">' + visualInner + '</a>'
        : '<div class="shop-card-visual">' + visualInner + '</div>';
      var nameHTML = p.productUrl
        ? '<a class="shop-card-title-link" href="' + escHTML(p.productUrl) + '">' + escHTML(p.name) + '</a>'
        : escHTML(p.name);
      return (
        '<article class="card shop-card embla__slide" data-category="' + escHTML(p.category) + '">' +
          '<button class="shop-fav" type="button" aria-label="Agregar a favoritos" data-fav="' + escHTML(p.name) + '">' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-heart"/></svg></button>' +
          visualHTML +
          '<div class="shop-card-info">' +
            '<p class="shop-price">' + escHTML(p.price) + '</p>' +
            '<h3>' + nameHTML + '</h3>' +
            '<p class="shop-line">' + escHTML(p.brand) + (p.sub ? " · " + escHTML(p.sub) : "") + '</p>' +
            '<details class="shop-detail"><summary>Ver detalle</summary><dl>' +
              '<div><dt>Composición</dt><dd>' + escHTML(p.composicion) + '</dd></div>' +
              '<div><dt>Modo de uso</dt><dd>' + escHTML(p.modoUso) + '</dd></div>' +
              '<div><dt>Tipo de cabello</dt><dd>' + escHTML(p.tipoCabello) + '</dd></div>' +
            '</dl></details>' +
            '<button class="btn btn-primary btn-sm btn-block" type="button" data-buy-now data-id="' + escHTML(cartId) + '" data-name="' + escHTML(cartLabel) + '" data-price="' + cartPrice + '">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"/></svg> Comprar ahora</button>' +
            '<button class="btn btn-cart btn-sm btn-block" type="button" data-add-to-cart data-id="' + escHTML(cartId) + '" data-name="' + escHTML(cartLabel) + '" data-price="' + cartPrice + '">' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-cart"/></svg> Agregar al carrito</button>' +
          '</div>' +
        '</article>'
      );
    }

    var emblaApi = null;
    var autoplay = null;
    var hasEmbla = typeof window.EmblaCarousel === "function";

    function reInit() {
      bindBrand(); // re-wire the whatsapp hrefs on the freshly rendered slides
      initFavButtons(container);
      if (hasEmbla) {
        if (emblaApi) { emblaApi.destroy(); }
        var plugins = [];
        if (typeof window.EmblaCarouselAutoplay === "function") {
          autoplay = window.EmblaCarouselAutoplay({ delay: 3800, stopOnInteraction: true, stopOnMouseEnter: true });
          plugins.push(autoplay);
        }
        emblaApi = window.EmblaCarousel(viewport, { loop: true, align: "start", dragFree: false }, plugins);
        viewport.classList.add("is-embla-active");
        wrap.classList.add("is-embla-ready");
      }
    }

    function applyFilter(category) {
      var products = (data.products || []).filter(function (p) { return !p.hidden; });
      if (!products.length) return; // no data available: keep the hardcoded "Todos" markup
      var html = category === "all"
        ? products.map(slideHTML).join("")
        : products.filter(function (p) { return p.category === category; }).map(slideHTML).join("");
      container.innerHTML = html || allSlidesHTML;
      reInit();
    }

    if (tabsBar) {
      $$(".filter-btn", tabsBar).forEach(function (tab) {
        tab.addEventListener("click", function () {
          $$(".filter-btn", tabsBar).forEach(function (t) {
            var active = t === tab;
            t.classList.toggle("is-active", active);
            t.setAttribute("aria-selected", active ? "true" : "false");
          });
          applyFilter(tab.getAttribute("data-category"));
        });
      });
    }

    var prevBtn = $("[data-embla-prev]", wrap);
    var nextBtn = $("[data-embla-next]", wrap);
    if (prevBtn) prevBtn.addEventListener("click", function () { if (emblaApi) emblaApi.scrollPrev(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { if (emblaApi) emblaApi.scrollNext(); });

    reInit();
  }

  /* ---------- Reviews carousel prev/next ---------- */
  function initReviewsCarousel() {
    var track = $("[data-reviews-carousel]");
    var prev = $("[data-carousel-prev]");
    var next = $("[data-carousel-next]");
    if (!track) return;
    var step = function () {
      var card = $(".review-card", track);
      return card ? card.getBoundingClientRect().width + 18 : 300;
    };
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -step() * 2, behavior: reduced ? "auto" : "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: step() * 2, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(bindBrand, "bindBrand");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initHoursToday, "initHoursToday");
    safe(initCountUp, "initCountUp");
    safe(initLightbox, "initLightbox");
    safe(initYear, "initYear");
    safe(initFloatingReserve, "initFloatingReserve");
    safe(initProductCarousel, "initProductCarousel");
    safe(initReviewsCarousel, "initReviewsCarousel");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
