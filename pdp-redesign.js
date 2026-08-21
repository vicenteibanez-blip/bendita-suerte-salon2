/* =============================================================
   BENDITA SUERTE SALÓN — pdp-redesign.js
   -------------------------------------------------------------
   Toggle de sonido del video de la sección "Así se aplica" +
   empujoncito de scroll para enseñar que el carril de reseñas se
   desliza. Todo lo demás de la ficha (selector de cantidad, galería,
   carrito, carrusel de relacionados) sigue funcionando con
   product.js/main.js/cart.js sin cambios — este archivo no reemplaza
   nada, solo suma el comportamiento nuevo que no existía antes.
   ============================================================= */
(function () {
  "use strict";

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var video = document.querySelector("[data-proof-video]");
    var soundBtn = document.querySelector("[data-proof-sound]");
    if (video && soundBtn) {
      soundBtn.addEventListener("click", function () {
        video.muted = !video.muted;
        soundBtn.setAttribute("aria-pressed", String(!video.muted));
        soundBtn.setAttribute("aria-label", video.muted ? "Activar sonido" : "Silenciar");
        soundBtn.textContent = video.muted ? "🔇" : "🔊";
      });
    }

    /* ---------- Empujoncito para enseñar que las reseñas se deslizan ----------
       El carril de reseñas (#testimonios) es 100% manual — el usuario
       arrastra con el dedo/mouse, nada avanza de reseña solo (a pedido
       explícito, se sacó el carrusel automático que había antes). Para
       llamar la atención sobre que hay más tarjetas al costado, cuando
       la sección entra en pantalla el carril hace un pulso: se desliza
       un poco hacia la derecha, vuelve, y se repite en bucle — SIEMPRE
       yendo y volviendo al mismo lugar (nunca avanza a la reseña
       siguiente) — hasta que la persona misma toca/desliza el carril,
       momento en que el pulso se detiene para siempre y el control
       queda 100% en su gesto. */
    var rail = document.querySelector(".pdp-testimonial-carousel");
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rail && !reducedMotion && typeof IntersectionObserver !== "undefined") {
      var hintStarted = false;
      var stopped = false;
      var pulseTimer = null;

      var restoreSnap = function () { rail.style.scrollSnapType = ""; };
      var stopHint = function () {
        stopped = true;
        if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
        restoreSnap();
      };
      rail.addEventListener("pointerdown", stopHint, { once: true, passive: true });
      rail.addEventListener("wheel", stopHint, { once: true, passive: true });

      function pulse() {
        if (stopped) return;
        rail.style.scrollSnapType = "none"; // si no, el snap devuelve el scroll a 0 al instante
        rail.scrollTo({ left: 56, behavior: "smooth" });
        pulseTimer = setTimeout(function () {
          if (stopped) return;
          rail.scrollTo({ left: 0, behavior: "smooth" });
          pulseTimer = setTimeout(pulse, 1400); // pausa antes del próximo pulso
        }, 700);
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || hintStarted) return;
          hintStarted = true;
          io.unobserve(rail);
          pulseTimer = setTimeout(pulse, 500);
        });
      }, { threshold: 0.6 });
      io.observe(rail);
    }
  });
})();
