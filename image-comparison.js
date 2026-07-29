/* =============================================================
   BENDITA SUERTE SALÓN — image-comparison.js
   -------------------------------------------------------------
   Comparador antes/después reutilizable. La clase se instancia
   por contenedor (nunca por ID global), así que en el futuro se
   podrían usar varias instancias en la misma página sin que se
   pisen entre sí. Sin dependencias externas — solo Pointer
   Events, IntersectionObserver y requestAnimationFrame nativos.
   ============================================================= */
(function () {
  "use strict";

  var STEP = 5; // % por pulsación de flecha de teclado
  var DEMO_KEYFRAMES = [50, 70, 40, 55, 50];
  var DEMO_DURATION_MS = 2000;
  var INTRO_TRANSITION_MS = 800; // debe calzar con la transition de .image-comparison en el CSS

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function ImageComparison(container, options) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    if (!this.container) return;
    this.options = options || {};

    this.handle = this.container.querySelector("[data-ic-handle]");
    if (!this.handle) return;

    this.pos = 50;
    this.rect = null;
    this.dragging = false;
    this.rafId = null;
    this.pendingPos = null;
    this.demoCancelled = false;
    this.demoRunning = false;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = this.onResize.bind(this);

    this.init();
  }

  ImageComparison.prototype.init = function () {
    this.setPos(50);
    this.handle.addEventListener("pointerdown", this.onPointerDown);
    this.handle.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onResize, { passive: true });
    this.initReveal();
  };

  ImageComparison.prototype.measure = function () {
    this.rect = this.container.getBoundingClientRect();
  };

  ImageComparison.prototype.onResize = function () {
    if (this.dragging) return;
    this.rect = null; // se vuelve a medir recién en el próximo pointerdown, no en cada resize
  };

  ImageComparison.prototype.setPos = function (pos) {
    this.pos = Math.max(0, Math.min(100, pos));
    this.container.style.setProperty("--pos", this.pos.toFixed(2) + "%");
    this.handle.setAttribute("aria-valuenow", String(Math.round(this.pos)));
  };

  // Coalesce: si llegan varios pointermove antes del próximo frame,
  // solo se aplica la última posición — nunca más de un cambio de
  // estilo por frame.
  ImageComparison.prototype.scheduleUpdate = function (pos) {
    var self = this;
    this.pendingPos = pos;
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(function () {
      self.rafId = null;
      if (self.pendingPos != null) {
        self.setPos(self.pendingPos);
        self.pendingPos = null;
      }
    });
  };

  ImageComparison.prototype.updateFromClientX = function (clientX) {
    if (!this.rect) this.measure();
    var pct = ((clientX - this.rect.left) / this.rect.width) * 100;
    this.scheduleUpdate(pct);
  };

  ImageComparison.prototype.onPointerDown = function (e) {
    this.cancelDemo();
    this.dragging = true;
    this.handle.classList.add("is-dragging");
    try { this.handle.setPointerCapture(e.pointerId); } catch (err) { /* no-op: navegador sin soporte total */ }
    this.measure();
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.updateFromClientX(e.clientX);
  };

  ImageComparison.prototype.onPointerMove = function (e) {
    if (!this.dragging) return;
    this.updateFromClientX(e.clientX);
  };

  ImageComparison.prototype.onPointerUp = function () {
    this.dragging = false;
    this.handle.classList.remove("is-dragging");
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
  };

  ImageComparison.prototype.onKeyDown = function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    this.cancelDemo();
    e.preventDefault();
    this.setPos(this.pos + (e.key === "ArrowRight" ? STEP : -STEP));
  };

  ImageComparison.prototype.initReveal = function () {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      this.container.classList.add("is-visible");
      return; // sin animación de entrada ni demo automática
    }
    if (!("IntersectionObserver" in window)) {
      this.playIntro();
      return;
    }
    var self = this;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          self.playIntro();
          io.unobserve(self.container);
        }
      });
    }, { threshold: 0.3 });
    io.observe(this.container);
  };

  ImageComparison.prototype.playIntro = function () {
    var self = this;
    this.container.classList.add("is-visible");
    // La demo automática arranca recién después de que termine la
    // transición de entrada — no compiten visualmente al mismo tiempo.
    window.setTimeout(function () { self.playDemo(); }, INTRO_TRANSITION_MS + 100);
  };

  ImageComparison.prototype.playDemo = function () {
    if (this.demoCancelled) return;
    this.demoRunning = true;
    var self = this;
    var segment = DEMO_DURATION_MS / (DEMO_KEYFRAMES.length - 1);
    var start = null;

    function step(ts) {
      if (self.demoCancelled) { self.demoRunning = false; return; }
      if (start === null) start = ts;
      var elapsed = ts - start;
      if (elapsed >= DEMO_DURATION_MS) {
        self.setPos(DEMO_KEYFRAMES[DEMO_KEYFRAMES.length - 1]);
        self.demoRunning = false;
        return;
      }
      var segIndex = Math.min(Math.floor(elapsed / segment), DEMO_KEYFRAMES.length - 2);
      var segT = easeInOutQuad(Math.min((elapsed - segIndex * segment) / segment, 1));
      var from = DEMO_KEYFRAMES[segIndex];
      var to = DEMO_KEYFRAMES[segIndex + 1];
      self.setPos(from + (to - from) * segT);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  // Cancela la demo automática apenas hay interacción real del
  // usuario (pointerdown o flecha de teclado), incluso a mitad de
  // camino, y nunca la vuelve a reproducir en esta carga de página
  // (sin localStorage/cookies — no se pidió persistencia entre
  // sesiones, solo "una vez por carga de página").
  ImageComparison.prototype.cancelDemo = function () {
    this.demoCancelled = true;
    this.demoRunning = false;
  };

  function ready(fn) {
    document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var nodes = document.querySelectorAll("[data-image-comparison]");
    for (var i = 0; i < nodes.length; i++) {
      new ImageComparison(nodes[i]);
    }
  });

  window.ImageComparison = ImageComparison;
})();
