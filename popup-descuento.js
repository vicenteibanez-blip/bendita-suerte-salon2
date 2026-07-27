/* =============================================================
   BENDITA SUERTE SALÓN — popup-descuento.js
   -------------------------------------------------------------
   Popup de captura de email: 10% OFF en la primera compra de
   PRODUCTOS (no aplica a servicios/reservas de hora).

   Cómo se integra: este archivo construye su propio HTML e inyecta
   el modal directo en <body> — la página solo necesita cargar este
   .js (con defer) + popup-descuento.css. Así el "snippet a incluir"
   por página queda en 2 líneas, sin duplicar un bloque de HTML
   grande en cada archivo (a diferencia del modal de checkout, que
   sí vive hardcodeado en cada página).

   Para pruebas/QA — resetear el popup sin esperar 30 días:
     localStorage.removeItem("bs_popup_dismissed_at");
     localStorage.removeItem("bs_popup_email");
   o simplemente, desde la consola del navegador:
     BSPopupDescuento.reset();
   ============================================================= */
(function () {
  "use strict";

  var STORAGE_DISMISSED_KEY = "bs_popup_dismissed_at";
  var STORAGE_EMAIL_KEY = "bs_popup_email";
  var SUPPRESS_DAYS = 30;
  var SUPPRESS_MS = SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  var SHOW_DELAY_MS = 4000; // entre 3 y 5 segundos, pedido explícito
  var DISCOUNT_CODE = "BIENVENIDA10";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var HTML = ""
    + '<div class="bs-popup-overlay" id="bs-popup-overlay" hidden>'
    + '  <div class="bs-popup" role="dialog" aria-modal="true" aria-labelledby="bs-popup-title" aria-describedby="bs-popup-desc">'
    + '    <button type="button" class="bs-popup-close" id="bs-popup-close" aria-label="Cerrar">&times;</button>'
    + '    <div class="bs-popup-media" style="background-image:url(&quot;assets/img/hero.webp&quot;)">'
    + '      <div class="bs-popup-content">'
    + '        <div id="bs-popup-step-form">'
    + '          <p class="bs-popup-kicker">¡Tu primera vez no se repite!</p>'
    + '          <h2 id="bs-popup-title" class="bs-popup-title">Empieza hoy con<br><span>10% OFF</span></h2>'
    + '          <p id="bs-popup-desc" class="bs-popup-condition">Válido solo en tu primera compra de <strong>productos</strong>.</p>'
    + '          <form id="bs-popup-form" class="bs-popup-form" novalidate>'
    + '            <div class="bs-popup-field">'
    + '              <label class="sr-only" for="bs-popup-email">Tu email</label>'
    + '              <input type="email" id="bs-popup-email" name="email" placeholder="Tu email" autocomplete="email" required />'
    + '            </div>'
    + '            <label class="bs-popup-checkbox" for="bs-popup-consent">'
    + '              <input type="checkbox" id="bs-popup-consent" name="consent" />'
    + '              <span>Acepto recibir promociones y novedades por email.</span>'
    + '            </label>'
    + '            <p class="bs-popup-social">+85 personas aprovecharon este descuento el último mes ¿Qué esperas?</p>'
    + '            <button type="submit" class="bs-popup-submit" id="bs-popup-submit" disabled>'
    + '              <span class="bs-popup-submit-text">¡Quiero mi 10% OFF!</span>'
    + '            </button>'
    + '            <p class="bs-popup-error" id="bs-popup-error" hidden></p>'
    + '          </form>'
    + '          <button type="button" class="bs-popup-dismiss" id="bs-popup-dismiss">No, gracias, prefiero pagar el precio completo</button>'
    + '        </div>'
    + '        <div class="bs-popup-success" id="bs-popup-success" hidden>'
    + '          <p class="bs-popup-success-title">¡Listo! 🍀</p>'
    + '          <p>Tu código de descuento es:</p>'
    + '          <p class="bs-popup-code">' + DISCOUNT_CODE + '</p>'
    + '          <p class="bs-popup-success-note">También te lo enviamos a tu correo. Válido solo en tu primera compra de productos.</p>'
    + '          <button type="button" class="bs-popup-success-close" id="bs-popup-success-close">Seguir navegando</button>'
    + '        </div>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '</div>';

  // ---------- Envío del email — acá se conecta el servicio real ----------
  // TODO(integración pendiente): hoy no hay backend conectado. Reemplazar
  // el cuerpo de esta función por la llamada real, por ejemplo:
  //   - Mailchimp / Brevo: fetch a su API REST con la API key en un
  //     endpoint propio (nunca la key en el frontend).
  //   - Un endpoint propio tipo /api/popup-subscribe (mismo patrón que
  //     ya usa el sitio en api/create-preference.js) que guarde el email
  //     donde corresponda (planilla, base de datos, ESP).
  //   - Google Sheets vía un webhook (ej. Apps Script publicado como Web App).
  // Debe devolver una Promise: resolve() si se guardó bien, reject(err) si
  // falló, para que el popup muestre el estado de error y deje reintentar.
  function submitPopupEmail(email) {
    return new Promise(function (resolve) {
      // Simula la latencia de una llamada real para que se note el estado
      // de carga del botón. Por ahora esto SIEMPRE resuelve OK porque solo
      // guarda en localStorage — cuando se conecte el servicio real, este
      // setTimeout se reemplaza por el fetch() de verdad (que si puede
      // rechazar la Promise, y el bloque .catch() de abajo ya está listo
      // para mostrarlo).
      setTimeout(function () {
        try {
          localStorage.setItem(STORAGE_EMAIL_KEY, email);
        } catch (e) { /* modo privado / storage lleno: no es crítico */ }
        resolve();
      }, 700);
    });
  }

  function isSuppressed() {
    try {
      var raw = localStorage.getItem(STORAGE_DISMISSED_KEY);
      if (!raw) return false;
      var dismissedAt = Number(raw);
      if (!dismissedAt) return false;
      return Date.now() - dismissedAt < SUPPRESS_MS;
    } catch (e) {
      return false; // sin acceso a localStorage (modo privado estricto): mostrar igual
    }
  }

  function markSuppressed() {
    try { localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now())); } catch (e) { /* ignore */ }
  }

  // Helper de QA — se define ACÁ (fuera del bloque que depende de
  // isSuppressed()) a propósito: si solo existiera cuando el popup se
  // inyecta, nunca estaría disponible justo cuando hace falta, que es
  // cuando el popup está suprimido y quieres volver a verlo.
  window.BSPopupDescuento = {
    reset: function () {
      try {
        localStorage.removeItem(STORAGE_DISMISSED_KEY);
        localStorage.removeItem(STORAGE_EMAIL_KEY);
      } catch (e) { /* ignore */ }
      console.log("[BSPopupDescuento] localStorage limpio. Recarga la página para ver el popup de nuevo.");
    },
  };

  function ready(fn) {
    document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (isSuppressed()) return;
    if (!document.body) return;

    document.body.insertAdjacentHTML("beforeend", HTML);

    var overlay = document.getElementById("bs-popup-overlay");
    var modal = overlay.querySelector(".bs-popup");
    var closeBtn = document.getElementById("bs-popup-close");
    var dismissBtn = document.getElementById("bs-popup-dismiss");
    var form = document.getElementById("bs-popup-form");
    var emailInput = document.getElementById("bs-popup-email");
    var consentInput = document.getElementById("bs-popup-consent");
    var submitBtn = document.getElementById("bs-popup-submit");
    var errorEl = document.getElementById("bs-popup-error");
    var stepForm = document.getElementById("bs-popup-step-form");
    var stepSuccess = document.getElementById("bs-popup-success");
    var successCloseBtn = document.getElementById("bs-popup-success-close");

    var lastFocusedEl = null;

    function updateSubmitState() {
      var validEmail = EMAIL_RE.test(emailInput.value.trim());
      submitBtn.disabled = !(validEmail && consentInput.checked);
    }
    emailInput.addEventListener("input", function () {
      emailInput.classList.remove("is-invalid");
      updateSubmitState();
    });
    consentInput.addEventListener("change", updateSubmitState);

    function trapFocus(e) {
      if (e.key !== "Tab") return;
      var focusables = Array.prototype.slice
        .call(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopup({ suppress: true });
      } else {
        trapFocus(e);
      }
    }

    function openPopup() {
      lastFocusedEl = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("popup-open-lock");
      // Forzamos un reflow leyendo offsetHeight ANTES de agregar .is-open,
      // para que la transición de opacidad/transform de la CSS se anime de
      // verdad (si quitamos [hidden] y agregamos la clase en el mismo tick,
      // el navegador colapsa los dos cambios y salta directo al final, sin
      // animación). A propósito NO se usa requestAnimationFrame acá: rAF se
      // pausa en pestañas en segundo plano, y como el timer de 3-5s puede
      // disparar mientras el usuario está en otra pestaña, eso dejaba el
      // popup con opacity:0 pero igual capturando clics (invisible y a la
      // vez bloqueando toda la página) hasta que volvía a esa pestaña.
      // eslint-disable-next-line no-unused-expressions
      overlay.offsetHeight;
      overlay.classList.add("is-open");
      emailInput.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closePopup(opts) {
      opts = opts || {};
      overlay.classList.remove("is-open");
      document.body.classList.remove("popup-open-lock");
      document.removeEventListener("keydown", onKeydown);
      if (opts.suppress) markSuppressed();
      window.setTimeout(function () {
        overlay.hidden = true;
        if (lastFocusedEl && typeof lastFocusedEl.focus === "function") lastFocusedEl.focus();
      }, 300); // debe coincidir con la duración de la transición en el CSS
    }

    closeBtn.addEventListener("click", function () { closePopup({ suppress: true }); });
    dismissBtn.addEventListener("click", function () { closePopup({ suppress: true }); });
    successCloseBtn.addEventListener("click", function () { closePopup({ suppress: true }); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closePopup({ suppress: true });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!EMAIL_RE.test(email)) {
        emailInput.classList.add("is-invalid");
        emailInput.focus();
        return;
      }
      if (!consentInput.checked) return; // el botón ya debería estar deshabilitado, doble resguardo

      errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.querySelector(".bs-popup-submit-text").textContent = "Enviando…";

      submitPopupEmail(email)
        .then(function () {
          markSuppressed(); // dejó su email: no volver a mostrarlo por 30 días
          stepForm.hidden = true;
          stepSuccess.hidden = false;
          successCloseBtn.focus();
        })
        .catch(function () {
          errorEl.textContent = "No pudimos guardar tu email. Intenta de nuevo en unos segundos.";
          errorEl.hidden = false;
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
          submitBtn.querySelector(".bs-popup-submit-text").textContent = "¡Quiero mi 10% OFF!";
        });
    });

    window.setTimeout(openPopup, SHOW_DELAY_MS);
  });
})();
