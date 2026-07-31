/* =============================================================
   BENDITA SUERTE SALÓN — pdp-redesign.js
   -------------------------------------------------------------
   Solo el toggle de sonido del video de la sección "Así se aplica".
   Todo lo demás de la ficha (selector de cantidad, galería, carrito,
   carrusel de relacionados) sigue funcionando con product.js/main.js/
   cart.js sin cambios — este archivo no reemplaza nada, solo suma
   el comportamiento nuevo que no existía antes.
   ============================================================= */
(function () {
  "use strict";

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var video = document.querySelector("[data-proof-video]");
    var soundBtn = document.querySelector("[data-proof-sound]");
    if (!video || !soundBtn) return;

    soundBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      soundBtn.setAttribute("aria-pressed", String(!video.muted));
      soundBtn.setAttribute("aria-label", video.muted ? "Activar sonido" : "Silenciar");
      soundBtn.textContent = video.muted ? "🔇" : "🔊";
    });
  });
})();
