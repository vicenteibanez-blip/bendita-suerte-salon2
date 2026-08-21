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
       poquito hacia la derecha y vuelve — UNA sola vez, nunca más, y
       se cancela si la persona ya lo tocó/deslizó por su cuenta. No es
       un carrusel automático: es una demostración única del gesto. */
    var rail = document.querySelector(".pdp-testimonial-carousel");
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rail && !reducedMotion && typeof IntersectionObserver !== "undefined") {
      var hintDone = false;
      var cancelHint = function () { hintDone = true; };
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
               mientras dura el empujoncito y se repone al terminar. */
            rail.style.scrollSnapType = "none";
            rail.scrollTo({ left: 56, behavior: "smooth" });
            setTimeout(function () {
              rail.scrollTo({ left: 0, behavior: "smooth" });
              setTimeout(function () {
                rail.style.scrollSnapType = "";
              }, 500);
            }, 700);
          }, 500);
        });
      }, { threshold: 0.6 });
      io.observe(rail);
    }
  });
})();
