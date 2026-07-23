/* =============================================================
   BENDITA SUERTE SALÓN — api/_meta-capi.js
   -------------------------------------------------------------
   Helper para mandar eventos a la API de Conversiones de Meta desde
   el servidor (no desde el navegador). El nombre empieza con "_"
   a propósito: así Vercel NO lo trata como una función/endpoint
   propia, solo como un módulo que importan otros archivos de /api.

   Se usa junto con el Pixel del navegador (ver el snippet en el
   <head> de cada página): mandamos el MISMO evento con el MISMO
   event_id desde los dos lados, así Meta los reconoce como uno solo
   y no cuenta la compra dos veces.

   Requiere la variable de entorno META_CAPI_ACCESS_TOKEN en Vercel
   (Settings → Environment Variables), configurada por el dueño del
   sitio — nunca hardcodeada acá.
   ============================================================= */

const crypto = require("crypto");

const PIXEL_ID = "2102602733654553";
const GRAPH_API_VERSION = "v21.0";

function sha256(value) {
  return crypto.createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");
}

// Normaliza un teléfono chileno a formato E.164 sin "+" (ej: 56912345678)
// antes de hashearlo, para que coincida con cómo el Pixel del navegador
// normaliza los datos de contacto.
function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("56")) return digits;
  if (digits.length === 9) return "56" + digits;
  return digits;
}

// Nunca lanza: si falla, solo loguea. Un evento de analítica perdido
// no puede tumbar el flujo real de pago/checkout.
async function sendMetaCapiEvent(options) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("meta-capi: falta META_CAPI_ACCESS_TOKEN en Vercel, se omite el evento " + options.eventName);
    return;
  }

  const userData = {};
  if (options.email) userData.em = [sha256(options.email)];
  if (options.phone) {
    const normalized = normalizePhone(options.phone);
    if (normalized) userData.ph = [sha256(normalized)];
  }
  if (options.fbp) userData.fbp = options.fbp;
  if (options.fbc) userData.fbc = options.fbc;
  // IP/user-agent del visitante: solo existen cuando el evento llega desde
  // una petición real del navegador (api/track-event.js). El webhook de
  // pago no los tiene (es un aviso servidor-a-servidor de MercadoPago), por
  // eso ahí se compensa con email/teléfono en su lugar.
  if (options.clientIpAddress) userData.client_ip_address = options.clientIpAddress;
  if (options.clientUserAgent) userData.client_user_agent = options.clientUserAgent;

  const event = {
    event_name: options.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: options.eventId,
    action_source: "website",
    event_source_url: options.eventSourceUrl,
    user_data: userData,
    custom_data: options.customData || {},
  };

  try {
    const res = await fetch(
      "https://graph.facebook.com/" + GRAPH_API_VERSION + "/" + PIXEL_ID + "/events?access_token=" + encodeURIComponent(accessToken),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      }
    );
    if (!res.ok) {
      console.error("meta-capi: Meta rechazó el evento " + options.eventName + ":", await res.text());
    }
  } catch (err) {
    console.error("meta-capi: error de red enviando " + options.eventName + ":", err);
  }
}

module.exports = { sendMetaCapiEvent };
