/* =============================================================
   BENDITA SUERTE SALÓN — analytics.js
   -------------------------------------------------------------
   Punto único para instrumentar eventos de negocio (view_item,
   add_to_cart, begin_checkout, purchase, reservar_click, contacto
   WhatsApp/teléfono). Cada evento se manda por DOS caminos a la vez:

   1) dataLayer.push({event:..., ecommerce:...}) — formato que espera
      Google Tag Manager. Hoy no hay tags configurados en GTM para
      leer esto (eso se arma desde la consola de GTM, no desde
      código), pero el dataLayer queda listo para cuando se agreguen.
   2) gtag('event', ...) directo — como gtag.js YA está cargado y
      configurado (ver <head>), esto hace que GA4 y las conversiones
      de Google Ads reciban los eventos DESDE HOY, sin depender de
      que alguien configure GTM primero.

   El "ecommerce: null" antes de cada push de comercio electrónico
   es el patrón oficial de Google para que GTM no arrastre/mezcle
   los items del evento anterior con el nuevo (ver su guía de GA4
   ecommerce vía dataLayer).
   ============================================================= */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  function hasGtag() { return typeof window.gtag === "function"; }

  // Eventos de ecommerce (view_item, add_to_cart, begin_checkout, purchase):
  // params sigue la forma que espera gtag/GA4: {currency, value, items:[...], transaction_id?}
  function pushEcommerce(eventName, params) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(Object.assign({ event: eventName }, { ecommerce: params }));
    if (hasGtag()) window.gtag("event", eventName, params);
  }

  // Eventos simples sin estructura de ecommerce (reservar_click, contacto_whatsapp, contacto_telefono).
  function pushEvent(eventName, params) {
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    if (hasGtag()) window.gtag("event", eventName, params || {});
  }

  // Conversión de Google Ads. sendTo = "AW-XXXXXXXXX/ETIQUETA".
  function reportAdsConversion(sendTo, extraParams) {
    if (!sendTo || sendTo.indexOf("REEMPLAZAR") === 0) return; // placeholder sin configurar: no mandar basura a Ads
    if (hasGtag()) window.gtag("event", "conversion", Object.assign({ send_to: sendTo }, extraParams || {}));
  }

  // Conversiones mejoradas (Enhanced Conversions): se le pasan datos
  // en texto plano — gtag.js los hashea (SHA-256) en el navegador
  // antes de mandarlos, nunca viajan en texto plano a Google. Hay que
  // llamar esto ANTES del evento de conversión que se quiere mejorar.
  function normalizePhoneCL(phone) {
    var digits = String(phone || "").replace(/[^\d+]/g, "");
    if (!digits) return "";
    if (digits.charAt(0) === "+") return digits;
    if (digits.charAt(0) === "9" && digits.length === 9) return "+56" + digits; // 9XXXXXXXX -> +569XXXXXXXX
    if (digits.indexOf("56") === 0) return "+" + digits;
    return "+56" + digits;
  }

  function setEnhancedConversionData(email, phone) {
    if (!hasGtag()) return;
    var userData = {};
    if (email) userData.email = String(email).trim().toLowerCase();
    var normalizedPhone = normalizePhoneCL(phone);
    if (normalizedPhone) userData.phone_number = normalizedPhone;
    if (!userData.email && !userData.phone_number) return;
    window.gtag("set", "user_data", userData);
  }

  window.BSAnalytics = {
    pushEcommerce: pushEcommerce,
    pushEvent: pushEvent,
    reportAdsConversion: reportAdsConversion,
    setEnhancedConversionData: setEnhancedConversionData,
  };

  /* ---------- Clics en "Reservar" / WhatsApp / teléfono ----------
     Delegado a nivel de documento porque estos botones existen en
     casi todas las páginas (nav, footer, sección Servicios, barra
     flotante) — así no hay que enganchar cada uno a mano ni depender
     de main.js, que no se carga en exito/fallo/pendiente.html.

     "Reservar" SIEMPRE navega a Setmore (fuera del sitio) — no existe
     hoy una forma de saber si la reserva se completó ahí, así que
     esto mide la INTENCIÓN de reservar (clic), no la reserva
     confirmada. Para medir la reserva confirmada de verdad habría que
     revisar si Setmore ofrece un webhook o una URL de redirección de
     éxito configurable. */
  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    document.addEventListener("click", function (e) {
      var reservarLink = e.target.closest('a[href*="setmore.com"]');
      if (reservarLink) {
        pushEvent("reservar_click", { link_url: reservarLink.href });
        // Placeholder — reemplazar por el AW-XXXXXXXXX/ETIQUETA real de
        // la conversión "Reserva" (ver resumen final de IDs pendientes).
        reportAdsConversion("REEMPLAZAR_AW_RESERVA");
        return;
      }
      var waLink = e.target.closest('[data-bind-href="whatsapp"]');
      if (waLink) {
        pushEvent("contacto_whatsapp", { link_url: waLink.href });
        return;
      }
      var telLink = e.target.closest('a[href^="tel:"]');
      if (telLink) {
        pushEvent("contacto_telefono", { link_url: telLink.href });
      }
    });
  });
})();
