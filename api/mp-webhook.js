/* =============================================================
   BENDITA SUERTE SALÓN — api/mp-webhook.js
   -------------------------------------------------------------
   Función serverless de Vercel (Node.js). MercadoPago llama a esta
   URL automáticamente cada vez que cambia el estado de un pago
   (creado, aprobado, rechazado, etc). Cuando el pago queda
   APROBADO, mandamos dos correos usando Resend: uno de aviso de
   venta al dueño de la barbería, y otro de confirmación de compra
   al comprador (a su email de pago en MercadoPago).

   Nunca confiamos en los datos que vienen en el aviso: solo usamos
   el ID de pago que trae, y le volvemos a preguntar a MercadoPago
   los datos reales de esa transacción (así nadie puede falsificar
   un aviso de "venta aprobada" llamando a esta URL directamente).

   Variables de entorno necesarias en Vercel (Settings → Environment
   Variables), configuradas por ti — nunca por Claude:
     MERCADOPAGO_ACCESS_TOKEN   (la misma que ya usa create-preference.js)
     RESEND_API_KEY             (tu clave de Resend)
     RESEND_FROM_EMAIL          (opcional; ej. "Bendita Suerte <avisos@tudominio.cl>".
                                  Si no la configuras, se usa el remitente de
                                  prueba de Resend: onboarding@resend.dev)
   ============================================================= */

const NOTIFY_EMAIL = "benditasuerte.salon@gmail.com";

// Debe coincidir con lib/manifest.js (address.full / phoneDisplay).
const SHOP_ADDRESS = "Av. Valle Del Sol 5556, Puente Alto, Santiago";
const SHOP_PHONE = "+56 9 8697 6527";

function escapeHTML(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function formatCLP(n) {
  return "$" + Math.round(Number(n) || 0).toLocaleString("es-CL");
}

async function sendEmail(resendApiKey, fromEmail, to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + resendApiKey,
    },
    body: JSON.stringify({ from: fromEmail, to: [to], subject: subject, html: html }),
  });
  if (!res.ok) {
    console.error("Resend error (" + to + "):", await res.text());
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    // MercadoPago a veces hace una verificación GET al guardar la URL: respondemos OK.
    res.status(200).json({ ok: true });
    return;
  }

  // Siempre respondemos 200 al final, incluso si algo falla, para que
  // MercadoPago no reintente el mismo aviso una y otra vez.
  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    // MercadoPago manda el ID del pago de dos formas distintas según la versión:
    // - Webhooks nuevos: { type: "payment", data: { id: "123" } }
    // - IPN antiguo (por query string): ?topic=payment&id=123
    const query = req.query || {};
    const type = body.type || query.topic;
    const paymentId = (body.data && body.data.id) || query.id || query["data.id"];

    if (type !== "payment" || !paymentId) {
      res.status(200).json({ ok: true, ignored: true });
      return;
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("mp-webhook: falta MERCADOPAGO_ACCESS_TOKEN");
      res.status(200).json({ ok: true });
      return;
    }

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(paymentId), {
      headers: { Authorization: "Bearer " + accessToken },
    });
    const payment = await mpRes.json();

    if (!mpRes.ok || !payment || payment.status !== "approved") {
      res.status(200).json({ ok: true, skipped: payment && payment.status });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("mp-webhook: falta RESEND_API_KEY, no se pudo avisar la venta");
      res.status(200).json({ ok: true });
      return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Bendita Suerte Salón <onboarding@resend.dev>";
    const payer = payment.payer || {};
    const items = (payment.additional_info && payment.additional_info.items) || [];
    const metadata = payment.metadata || {};

    const itemsHTML = items.length
      ? items.map(function (it) {
          return "<li>" + escapeHTML(it.quantity) + " × " + escapeHTML(it.title) + " — " + formatCLP((it.unit_price || 0) * (it.quantity || 1)) + "</li>";
        }).join("")
      : "<li>(sin detalle de productos)</li>";

    const entregaHTML = metadata.entrega === "despacho"
      ? "Despacho a domicilio — " + escapeHTML(metadata.direccion) + ", " + escapeHTML(metadata.comuna) +
        (metadata.referencia ? " (" + escapeHTML(metadata.referencia) + ")" : "")
      : "Retiro en local — " + escapeHTML(SHOP_ADDRESS);

    const ownerHTML =
      "<h2>Nueva venta aprobada 🍀</h2>" +
      "<p><strong>Monto total:</strong> " + formatCLP(payment.transaction_amount) + "</p>" +
      "<p><strong>Cliente:</strong> " + escapeHTML((payer.first_name || "") + " " + (payer.last_name || "")).trim() +
        "<br>Email: " + escapeHTML(payer.email || "-") +
        "<br>Teléfono: " + escapeHTML((payer.phone && payer.phone.number) || "-") + "</p>" +
      "<p><strong>Entrega:</strong> " + entregaHTML + "</p>" +
      "<p><strong>Productos:</strong></p><ul>" + itemsHTML + "</ul>" +
      "<p style=\"color:#777;font-size:.85em\">N° de operación MercadoPago: " + escapeHTML(payment.id) + "</p>";

    await sendEmail(
      resendApiKey,
      fromEmail,
      NOTIFY_EMAIL,
      "Nueva venta — " + formatCLP(payment.transaction_amount) + " · Bendita Suerte Salón",
      ownerHTML
    );

    if (payer.email) {
      const shippingNoteHTML = metadata.entrega === "despacho"
        ? "<p>El envío se hace efectivo dentro de <strong>3 días hábiles</strong>. El código de seguimiento te llegará a este correo apenas esté disponible.</p>"
        : "";

      const customerHTML =
        "<h2>¡Gracias por tu compra! 🍀</h2>" +
        "<p>Confirmamos que recibimos tu pago en <strong>Bendita Suerte Salón</strong>.</p>" +
        "<p><strong>Tu pedido:</strong></p><ul>" + itemsHTML + "</ul>" +
        "<p><strong>Total pagado:</strong> " + formatCLP(payment.transaction_amount) + "</p>" +
        "<p><strong>Entrega:</strong> " + entregaHTML + "</p>" +
        shippingNoteHTML +
        "<p>Cualquier duda, escríbenos al " + escapeHTML(SHOP_PHONE) + ".</p>" +
        "<p style=\"color:#777;font-size:.85em\">N° de operación MercadoPago: " + escapeHTML(payment.id) + "</p>";

      await sendEmail(
        resendApiKey,
        fromEmail,
        payer.email,
        "Confirmamos tu compra 🍀 · Bendita Suerte Salón",
        customerHTML
      );
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error en mp-webhook:", err);
    res.status(200).json({ ok: true });
  }
};
