/* =============================================================
   BENDITA SUERTE SALÓN — meta-events.js
   -------------------------------------------------------------
   Dispara un evento de Meta por las DOS vías a la vez, con el mismo
   event_id: el Pixel del navegador (fbq) y la API de Conversiones
   del servidor (api/track-event.js). Así, si el navegador del
   cliente bloquea el Pixel, el evento igual le llega a Meta por el
   servidor — y como comparten event_id, Meta los trata como una
   sola señal, no la cuenta dos veces.

   Se carga ANTES que cart.js/checkout.js/main.js (que son los que
   usan window.BSMetaTrack.fire(...) al agregar al carrito, abrir el
   checkout, o hacer clic en "Reservar").
   ============================================================= */
(function () {
  "use strict";

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function newEventId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  function fire(eventName, customData) {
    var eventId = newEventId();

    if (window.fbq) {
      window.fbq("track", eventName, customData, { eventID: eventId });
    }

    try {
      var payload = JSON.stringify({
        eventName: eventName,
        eventId: eventId,
        eventSourceUrl: window.location.href,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        customData: customData,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track-event", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
      }
    } catch (e) {
      // La analítica nunca debe frenar la navegación del cliente.
    }
  }

  window.BSMetaTrack = { fire: fire };
})();
