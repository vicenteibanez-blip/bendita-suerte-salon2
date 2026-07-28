/* =============================================================
   BENDITA SUERTE SALÓN — api/popup-subscribe.js
   -------------------------------------------------------------
   Función serverless de Vercel (Node.js). Recibe el email que deja
   alguien en el popup de descuento (popup-descuento.js) y lo agrega
   a la lista de Brevo configurada abajo.

   Variable de entorno necesaria en Vercel (Settings → Environment
   Variables), configurada por el dueño del sitio — nunca por Claude:
     BREVO_API_KEY   (Brevo → Configuración → Claves API → SMTP & API)

   Nunca se valida solo del lado del navegador: el email se vuelve a
   validar acá antes de mandarlo a Brevo.
   ============================================================= */

const BREVO_LIST_ID = 3; // Brevo → Contactos → Listas → "Popup sitio web"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("popup-subscribe: falta BREVO_API_KEY en Vercel");
    res.status(500).json({ error: "El sitio aún no tiene configurado BREVO_API_KEY en Vercel." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  const email = body && String(body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Email inválido." });
    return;
  }

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: email,
        listIds: [BREVO_LIST_ID],
        // Si el email ya existía como contacto (ej. volvió a dejarlo en
        // otra visita), lo actualiza/asocia a la lista en vez de fallar
        // con un error de "contacto duplicado".
        updateEnabled: true,
      }),
    });

    // Brevo responde 201 si crea el contacto nuevo, o 204 (sin cuerpo)
    // si ya existía y solo se actualizó — ambos son éxito.
    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("popup-subscribe: Brevo rechazó el contacto:", errText);
      res.status(502).json({ error: "No se pudo guardar el email en este momento." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("popup-subscribe: error de red con Brevo:", err);
    res.status(500).json({ error: "No se pudo conectar con el servicio de email." });
  }
};
