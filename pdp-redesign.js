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
       arrastra con el dedo/mouse, nada se mueve solo (a pedido
       explícito, se sacó el carrusel automático que había antes). Para
       que la gente note que hay más tarjetas al costado, la primera
       vez que la sección entra en pantalla el carril se desliza un
       poquito hacia la derecha y se QUEDA ahí — a diferencia de la
       versión anterior, ya NO vuelve solo a 0. El empujón se sostiene
       como llamado a la acción hasta que la persona misma desliza (ahí
       el control vuelve 100% a su gesto). Se dispara UNA sola vez y se
       cancela si ya estaba tocando/deslizando antes de que ocurriera. */
    var rail = document.querySelector(".pdp-testimonial-carousel");
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rail && !reducedMotion && typeof IntersectionObserver !== "undefined") {
      var hintDone = false;
      var restoreSnap = function () { rail.style.scrollSnapType = ""; };
      var cancelHint = function () { hintDone = true; restoreSnap(); };
      rail.addEventListener("pointerdown", cancelHint, { once: true, passive: true });
      rail.addEventListener("wheel", cancelHint, { once: true, passive: true });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || hintDone) return;
          hintDone = true;
          io.unobserve(rail);
          setTimeout(function () {
            /* scroll-snap-type interrumpe un scrollTo() chico y lo
               vuelve a dejar en 0 al instante — se desactiva el snap
               para que el empujón se sostenga en su posición. Se repone
               recién cuando el usuario toca/desliza (cancelHint de
               arriba), así su gesto queda con el snap normal. */
            rail.style.scrollSnapType = "none";
            rail.scrollTo({ left: 56, behavior: "smooth" });
          }, 500);
        });
      }, { threshold: 0.6 });
      io.observe(rail);
    }
  });
})();
