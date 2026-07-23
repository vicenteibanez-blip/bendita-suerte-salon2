/* =============================================================
   BENDITA SUERTE SALÓN — api/track-event.js
   -------------------------------------------------------------
   Endpoint público que llaman main.js/cart.js/checkout.js justo
   después de disparar un evento del Pixel del navegador (fbq), para
   mandar ese MISMO evento también por la API de Conversiones de
   Meta — así llega aunque el navegador del cliente bloquee el Pixel.

   Solo reenvía eventos de una lista fija (allowlist) para que este
   endpoint público no se pueda usar para mandar cualquier evento
   arbitrario a la cuenta de Meta.

   A diferencia del webhook de pago (que no tiene el navegador del
   cliente disponible), acá SÍ llega una petición real del visitante,
   así que se manda su IP y user-agent — eso mejora bastante la
   calidad de coincidencia de Meta.
   ============================================================= */

const { sendMetaCapiEvent } = require("./_meta-capi");

const ALLOWED_EVENTS = new Set(["Lead", "AddToCart", "InitiateCheckout"]);
const MAX_CONTENT_IDS = 50;

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket && req.socket.remoteAddress;
}

function sanitizeCustomData(raw) {
  raw = raw || {};
  const out = { currency: "CLP" };
  if (raw.value != null) {
    const value = Number(raw.value);
    if (Number.isFinite(value) && value >= 0) out.value = value;
  }
  if (Array.isArray(raw.content_ids)) {
    out.content_ids = raw.content_ids.slice(0, MAX_CONTENT_IDS).map(String);
  }
  if (Array.isArray(raw.contents)) {
    out.contents = raw.contents.slice(0, MAX_CONTENT_IDS).map(function (it) {
      return { id: String((it && it.id) || ""), quantity: Number((it && it.quantity) || 1) };
    });
  }
  if (raw.num_items != null) {
    const numItems = Number(raw.num_items);
    if (Number.isFinite(numItems) && numItems >= 0) out.num_items = numItems;
  }
  if (raw.content_name) out.content_name = String(raw.content_name).slice(0, 200);
  if (raw.content_type) out.content_type = String(raw.content_type).slice(0, 40);
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const eventName = String(body.eventName || "");
    if (!ALLOWED_EVENTS.has(eventName)) {
      res.status(400).json({ error: "Evento no permitido." });
      return;
    }

    await sendMetaCapiEvent({
      eventName: eventName,
      eventId: body.eventId ? String(body.eventId).slice(0, 100) : undefined,
      eventSourceUrl: body.eventSourceUrl ? String(body.eventSourceUrl).slice(0, 500) : undefined,
      fbp: body.fbp ? String(body.fbp).slice(0, 200) : undefined,
      fbc: body.fbc ? String(body.fbc).slice(0, 200) : undefined,
      clientIpAddress: clientIp(req),
      clientUserAgent: req.headers["user-agent"],
      customData: sanitizeCustomData(body.customData),
    });

    res.status(204).end();
  } catch (err) {
    // Best-effort: un evento de analítica perdido nunca debe verse como
    // un error real para quien está navegando el sitio.
    console.error("track-event: error inesperado:", err);
    res.status(204).end();
  }
};
