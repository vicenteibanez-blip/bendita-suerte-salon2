/* =============================================================
   BENDITA SUERTE SALÓN — cookie-consent.js
   -------------------------------------------------------------
   Banner mínimo de consentimiento para Google Consent Mode v2.
   El estado por defecto ("denied") ya se fija en el <head> de cada
   página (ver el snippet "Google Consent Mode v2" antes de GTM) —
   este script solo construye el banner, guarda la decisión del
   usuario en localStorage y llama gtag('consent','update',...)
   para actualizar ese estado cuando corresponda.
   ============================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "bs_consent"; // "granted" | "denied"

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  function updateConsent(granted) {
    if (typeof window.gtag !== "function") return;
    var state = granted ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.className = "cookie-consent";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Aviso de cookies");
    wrap.innerHTML =
      '<div class="cookie-consent-inner">' +
        '<p class="cookie-consent-text"><strong>Usamos cookies</strong> para medir el rendimiento del sitio y de nuestras campañas de publicidad. Puedes aceptar o rechazar su uso — esto no afecta tu posibilidad de reservar hora o comprar.</p>' +
        '<div class="cookie-consent-actions">' +
          '<button type="button" class="btn btn-ghost" data-consent-reject>Rechazar</button>' +
          '<button type="button" class="btn btn-primary" data-consent-accept>Aceptar</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  ready(function () {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* privacy mode: se muestra el banner cada vez */ }

    if (stored === "granted" || stored === "denied") {
      updateConsent(stored === "granted");
      return;
    }

    var banner = buildBanner();
    // Pequeño delay para que la animación de entrada (transform) se note.
    window.setTimeout(function () { banner.classList.add("is-visible"); }, 300);

    function decide(granted) {
      updateConsent(granted);
      try { localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied"); } catch (e) { /* privacy mode: ignore */ }
      banner.classList.remove("is-visible");
      window.setTimeout(function () { banner.remove(); }, 500);
    }

    banner.querySelector("[data-consent-accept]").addEventListener("click", function () { decide(true); });
    banner.querySelector("[data-consent-reject]").addEventListener("click", function () { decide(false); });
  });
})();
