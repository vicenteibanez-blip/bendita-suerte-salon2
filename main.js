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

    // Botón flotante de WhatsApp: 2 mensajes distintos según la intención
    // (reservar hora vs. consultar producto), mismo número que el resto del sitio.
    var waReservaMsg = encodeURIComponent("Hola! Me gustaría agendar una hora 💈");
    $$('[data-wa-tipo="reserva"]').forEach(function (el) { el.setAttribute("href", "https://wa.me/" + data.whatsappNumber + "?text=" + waReservaMsg); });
    var waProductoMsg = encodeURIComponent("Hola! Quiero consultar por un producto 🧴");
    $$('[data-wa-tipo="producto"]').forEach(function (el) { el.setAttribute("href", "https://wa.me/" + data.whatsappNumber + "?text=" + waProductoMsg); });

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

  /* ---------- Meta Pixel: Lead al hacer clic en cualquier "Reservar" ----------
     Delegado en el documento porque hay varios botones/links a Setmore
     repartidos por la página (hero, servicios, equipo, botón flotante). */
  function initLeadTracking() {
    if (!window.BSMetaTrack) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href*="setmore.com"]');
      if (!a) return;
      window.BSMetaTrack.fire("Lead", { content_name: "Reservar cita" });
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

  /* ---------- Floating WhatsApp button ----------
     En el home (con hero #inicio) aparece recién al pasar el hero,
     igual que el botón "Reservar" que reemplaza. En páginas sin hero
     (producto, mayorista) no hay nada que "pasar" primero, así que
     se muestra directo. Despliega un mini-menú de 2 intenciones al
     tocarlo.

     En mobile, las páginas de producto tienen su propia barra fija
     de compra (#sticky-buy-bar, ver product.js) que también vive
     abajo de la pantalla — si ambas estuvieran a la misma altura se
     superpondrían, así que este botón se "levanta" por encima de esa
     barra mientras esté visible (MutationObserver sobre su clase
     is-visible, para no depender del orden de los scroll listeners
     de cada script). */
  function initWaFloat() {
    var wrap = $("#wa-float");
    var toggleBtn = $("#wa-float-btn");
    var hero = $("#inicio");
    var stickyBar = $("#sticky-buy-bar");
    if (!wrap || !toggleBtn) return;

    if (hero) {
      var onScroll = function () {
        var threshold = hero.offsetHeight * 0.7;
        if (window.scrollY > threshold) wrap.classList.add("is-visible");
        else { wrap.classList.remove("is-visible"); closeMenu(); }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      wrap.classList.add("is-visible");
    }

    if (stickyBar) {
      var syncLift = function () {
        var lifted = stickyBar.classList.contains("is-visible");
        wrap.classList.toggle("is-lifted", lifted);
        if (lifted) wrap.style.setProperty("--wa-lift", stickyBar.offsetHeight + "px");
      };
      syncLift();
      new MutationObserver(syncLift).observe(stickyBar, { attributes: true, attributeFilter: ["class"] });
    }

    function openMenu() {
      wrap.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      wrap.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    toggleBtn.addEventListener("click", function () {
      if (wrap.classList.contains("is-open")) closeMenu(); else openMenu();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    // Elegir una opción cierra el menú — el propio link ya abre WhatsApp
    // en pestaña nueva (target="_blank"), no hace falta prevenir nada acá.
    $$(".wa-float-option", wrap).forEach(function (opt) {
      opt.addEventListener("click", closeMenu);
    });
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
      var visualInner = p.photo
        ? '<img src="' + escHTML(p.photo) + '" alt="" loading="lazy" />'
        : '<svg class="icon" aria-hidden="true"><use href="#icon-' + escHTML(p.icon) + '"/></svg>';
      var visualHTML = p.productUrl
        ? '<a class="shop-card-visual" href="' + escHTML(p.productUrl) + '" aria-label="Ver producto: ' + escHTML(p.name) + '">' + visualInner + '</a>'
        : '<div class="shop-card-visual">' + visualInner + '</div>';
      var infoTop =
        '<p class="shop-price">' + escHTML(p.price) + '</p>' +
        '<h3>' + escHTML(p.name) + '</h3>' +
        '<p class="shop-line">' + escHTML(p.brand) + (p.sub ? " · " + escHTML(p.sub) : "") + '</p>';
      // Todo el bloque precio/nombre/línea es un solo link (además de la
      // foto) para que en mobile no dependa de acertarle justo al título.
      var infoTopHTML = p.productUrl
        ? '<a class="shop-card-link" href="' + escHTML(p.productUrl) + '" aria-label="Ver producto: ' + escHTML(p.name) + '">' + infoTop + '</a>'
        : infoTop;
      return (
        '<article class="card shop-card embla__slide" data-category="' + escHTML(p.category) + '">' +
          '<button class="shop-fav" type="button" aria-label="Agregar a favoritos" data-fav="' + escHTML(p.name) + '">' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-heart"/></svg></button>' +
          visualHTML +
          '<div class="shop-card-info">' +
            infoTopHTML +
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

    // Embla's loop mode necesita bastante más contenido que el ancho del
    // viewport para calcular sus "loop points" sin saltos raros al llegar
    // al borde (con 9 tarjetas nomás, en pantallas anchas se ve el catálogo
    // "devolverse" a medio arrastre). El arreglo recomendado por Embla es
    // duplicar las slides reales; la copia queda con inert + aria-hidden
    // para que nunca sea clickeable ni la lean lectores de pantalla.
    function ensureLoopClone() {
      var oldClone = container.querySelector(":scope > [data-loop-clone]");
      if (oldClone) oldClone.remove();
      var realSlides = $$(".embla__slide", container);
      if (realSlides.length < 2) return;
      var cloneWrap = document.createElement("div");
      cloneWrap.setAttribute("data-loop-clone", "");
      cloneWrap.setAttribute("aria-hidden", "true");
      cloneWrap.setAttribute("inert", "");
      cloneWrap.className = "embla__loop-clone";
      realSlides.forEach(function (slide) {
        cloneWrap.appendChild(slide.cloneNode(true));
      });
      container.appendChild(cloneWrap);
    }

    function reInit() {
      bindBrand(); // re-wire the whatsapp hrefs on the freshly rendered slides
      initFavButtons(container);
      if (hasEmbla) {
        if (emblaApi) { emblaApi.destroy(); }
        ensureLoopClone();
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

  /* ---------- Carril de videos testimoniales (home) ----------
     "Coverflow" circular propio, sin librería externa. Cada tarjeta
     es position:absolute (centrada con left:50% + transform) y
     render() le calcula a cada una su posición según la DISTANCIA
     CIRCULAR más corta al índice activo (circularDistance) — con 5
     tarjetas eso da un rango -2..2, sin necesitar clones de DOM: el
     loop es "gratis" por aritmética modular, así que al pasar del
     último al primer elemento no hay salto ni tarjeta repetida.

     El ancho/alto de referencia para posicionar (cardWidth/Height)
     sale de offsetWidth/offsetHeight — nunca de getBoundingClientRect,
     que arrastra el scale ya aplicado y rompía el cálculo si la
     tarjeta de referencia no era la activa en ese momento (bug de la
     versión anterior). */
  function initVideoCarousel() {
    var wrap = $("[data-video-carousel]");
    var viewport = $("[data-video-viewport]", wrap);
    var track = $("[data-video-container]", wrap);
    if (!wrap || !viewport || !track) return;

    var prevBtn = $("[data-video-prev]", wrap);
    var nextBtn = $("[data-video-next]", wrap);
    var cards = $$(".video-card", track);
    var total = cards.length;
    if (!total) return;

    var activeIndex = 0;

    function circularDistance(i) {
      var half = Math.floor(total / 2);
      var d = ((i - activeIndex) % total + total) % total;
      if (d > half) d -= total;
      return d;
    }

    // Mismas proporciones/jerarquía en los 3 breakpoints (centro + 2
    // posiciones a cada lado, exteriores con velo blanco) — lo único
    // que cambia entre desktop/tablet/mobile es el ancho en px de la
    // tarjeta (definido en CSS, relativo al contenedor), nunca esta
    // relación de escalas/opacidades/offsets.
    function breakpointConfig() {
      return { maxDist: 2, innerScale: .82, innerOpacity: .88, outerScale: .67, outerOpacity: .45, innerOffsetRatio: .62, outerOffsetRatio: 1.08 };
    }

    function render() {
      var cfg = breakpointConfig();
      var cardWidth = cards[0].offsetWidth;
      var cardHeight = cards[0].offsetHeight;
      track.style.height = cardHeight + "px";

      cards.forEach(function (card, i) {
        var dist = circularDistance(i);
        var adist = Math.abs(dist);
        var isActive = dist === 0;
        var isInner = adist === 1;
        var isOuter = adist >= 2;
        var visible = adist <= cfg.maxDist;

        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-inner", isInner);
        card.classList.toggle("is-outer", isOuter);

        var scale, opacity, offsetRatio;
        if (isActive) {
          scale = 1; opacity = 1; offsetRatio = 0;
        } else if (isInner) {
          scale = cfg.innerScale; opacity = cfg.innerOpacity; offsetRatio = cfg.innerOffsetRatio;
        } else {
          scale = cfg.outerScale; opacity = cfg.outerOpacity; offsetRatio = cfg.outerOffsetRatio + (adist - 2) * 0.4;
        }

        var offsetPx = dist === 0 ? 0 : (dist / adist) * cardWidth * offsetRatio;
        card.style.transform = "translate(-50%, -50%) translateX(" + offsetPx.toFixed(1) + "px) scale(" + scale.toFixed(2) + ")";
        card.style.opacity = (visible || isActive) ? opacity.toFixed(2) : "0";
        card.style.pointerEvents = (visible || isActive) ? "" : "none";
      });
    }

    function goTo(index) {
      activeIndex = ((index % total) + total) % total; // módulo: loop circular real, sin clamping
      render();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(activeIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(activeIndex + 1); });

    // Sin flechas visibles, la navegación en desktop depende de poder
    // arrastrar con el mouse. Si el arrastre superó el umbral hay que
    // suprimir el click que el navegador dispara justo después del
    // mouseup — si no, un drag terminaría también "clickeando" la
    // tarjeta que quedó bajo el cursor.
    var suppressClick = false;
    var mouseStartX = null;
    var mouseDragged = false;

    function onMouseMove(e) {
      if (mouseStartX == null) return;
      if (Math.abs(e.clientX - mouseStartX) > 5) {
        mouseDragged = true;
        viewport.classList.add("is-dragging");
      }
    }
    function onMouseUp(e) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      viewport.classList.remove("is-dragging");
      if (mouseStartX == null) return;
      var dx = e.clientX - mouseStartX;
      mouseStartX = null;
      if (mouseDragged) {
        suppressClick = true;
        if (Math.abs(dx) >= 40) goTo(activeIndex + (dx < 0 ? 1 : -1));
      }
      mouseDragged = false;
    }
    viewport.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return; // solo clic izquierdo
      mouseStartX = e.clientX;
      mouseDragged = false;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    // Flechas de teclado — accesibilidad extra ahora que no hay
    // botones de flecha visibles para navegar sin mouse ni touch.
    wrap.tabIndex = 0;
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(activeIndex - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(activeIndex + 1); }
    });

    wrap.addEventListener("click", function (e) {
      if (suppressClick) { suppressClick = false; return; }
      var btn = e.target.closest("[data-video-play]");
      if (!btn) return;
      var cardEl = btn.closest(".video-card");
      if (!cardEl) return;
      var idx = cards.indexOf(cardEl);
      if (idx !== activeIndex) { goTo(idx); return; }
      var videoEl = $(".video-card-el", cardEl);
      if (!videoEl) return;
      cardEl.classList.add("is-playing");
      videoEl.play().catch(function () { /* autoplay bloqueado: el usuario ya tiene los controles nativos */ });
    });

    // Swipe táctil — necesario en mobile, donde no hay drag de mouse.
    var touchStartX = null;
    viewport.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (touchStartX == null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) < 40) return; // umbral mínimo, para no confundir un tap con un swipe
      goTo(activeIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });

    render();
    window.addEventListener("resize", render, { passive: true });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(bindBrand, "bindBrand");
    safe(initLeadTracking, "initLeadTracking");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initHoursToday, "initHoursToday");
    safe(initCountUp, "initCountUp");
    safe(initLightbox, "initLightbox");
    safe(initYear, "initYear");
    safe(initWaFloat, "initWaFloat");
    safe(initProductCarousel, "initProductCarousel");
    safe(initVideoCarousel, "initVideoCarousel");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
