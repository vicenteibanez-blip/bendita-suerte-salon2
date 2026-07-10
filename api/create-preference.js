/* =============================================================
   BENDITA SUERTE SALÓN — api/create-preference.js
   -------------------------------------------------------------
   Función serverless de Vercel (Node.js). Crea una "preferencia
   de pago" en MercadoPago y devuelve la URL a la que hay que
   redirigir al cliente para que pague. El Access Token NUNCA se
   expone en el navegador: vive solo en la variable de entorno
   MERCADOPAGO_ACCESS_TOKEN configurada en el panel de Vercel.

   ⚠️ IMPORTANTE — sobre los precios:
   Por seguridad, los precios que se cobran NO se toman del
   navegador (alguien podría manipularlos), sino de la lista
   PRODUCTS de más abajo, que vive en el servidor. Si cambias un
   precio en lib/manifest.js, DEBES reflejar el mismo cambio aquí
   para que el cobro real coincida con lo que se muestra en el
   sitio.
   ============================================================= */

const PRODUCTS = {
  "polvo-textura-09": { name: "Polvo de Textura '09 (ROQVEL)", priceCLP: 10000 },
  "cera-deluxe-matte-wax-peony": { name: "Cera Deluxe Matte Wax Peony (ROQVEL)", priceCLP: 13000 },
  "cera-deluxe-matte-pasta-fuchsia": { name: "Cera Deluxe Matte Pasta Fuchsia (ROQVEL)", priceCLP: 13000 },
  "cera-aqua-wax-orange": { name: "Cera Aqua Wax Orange (ROQVEL)", priceCLP: 10000 },
  "cera-matte-wax-brown": { name: "Cera Matte Wax Brown (ROQVEL)", priceCLP: 10000 },
  "cera-cream-wax-fiber-effect": { name: "Cera Cream Wax Fiber Effect (ROQVEL)", priceCLP: 10000 },
  "cera-matte-pomade-green": { name: "Cera Matte Pomade Green (ROQVEL)", priceCLP: 10000 },
  "curl-cream-rolda": { name: "Curl Cream (Rolda)", priceCLP: 10000 },
  "aceite-barba-maxcare": { name: "Aceite de Barba (MaxCare)", priceCLP: 10000 },
  "producto-prueba-1000": { name: "Producto de Prueba", priceCLP: 1000 },
};

// Debe coincidir con lib/manifest.js -> shipping
const SHIPPING = { flatFee: 2500, freeFrom: 0 };

const MAX_QTY_PER_ITEM = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: "El sitio aún no tiene configurado MERCADOPAGO_ACCESS_TOKEN en Vercel. Revisa INSTRUCCIONES-MERCADOPAGO.md." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Solicitud inválida." });
    return;
  }

  const cartItems = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer || {};
  const delivery = body.delivery || {};

  if (cartItems.length === 0) {
    res.status(400).json({ error: "El carrito está vacío." });
    return;
  }

  // --- Validar y recalcular ítems usando SOLO los precios del servidor ---
  const mpItems = [];
  let subtotal = 0;
  for (const raw of cartItems) {
    const product = PRODUCTS[raw && raw.id];
    const qty = Math.floor(Number(raw && raw.qty));
    if (!product) {
      res.status(400).json({ error: "Uno de los productos del carrito ya no existe. Recarga la página e inténtalo de nuevo." });
      return;
    }
    if (!qty || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      res.status(400).json({ error: "Cantidad inválida para " + product.name + "." });
      return;
    }
    subtotal += product.priceCLP * qty;
    mpItems.push({
      title: product.name,
      quantity: qty,
      unit_price: product.priceCLP,
      currency_id: "CLP",
    });
  }

  // --- Validar datos del cliente ---
  const nombre = String(customer.nombre || "").trim();
  const email = String(customer.email || "").trim();
  const telefono = String(customer.telefono || "").trim();
  if (!nombre || nombre.length > 120) {
    res.status(400).json({ error: "Falta el nombre del cliente." });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "El email no es válido." });
    return;
  }
  if (!telefono || telefono.length > 40) {
    res.status(400).json({ error: "Falta el teléfono del cliente." });
    return;
  }

  // --- Validar entrega ---
  const deliveryType = delivery.type === "despacho" ? "despacho" : "retiro";
  let shipments;
  if (deliveryType === "despacho") {
    const direccion = String(delivery.direccion || "").trim();
    const comuna = String(delivery.comuna || "").trim();
    if (!direccion || !comuna) {
      res.status(400).json({ error: "Falta la dirección o la comuna para el despacho." });
      return;
    }
    const shippingCost = SHIPPING.freeFrom && subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flatFee;
    if (shippingCost > 0) {
      mpItems.push({
        title: "Despacho a domicilio",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "CLP",
      });
    }
    shipments = {
      receiver_address: {
        street_name: direccion,
        city_name: comuna,
        // MercadoPago exige street_number; si el cliente lo incluyó en la
        // dirección igual queda registrado ahí como texto libre.
        street_number: 0,
      },
    };
  }

  const origin = baseUrl(req);
  const externalReference = "BS-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

  const preferenceBody = {
    items: mpItems,
    payer: {
      name: nombre,
      email: email,
      phone: { number: telefono },
    },
    back_urls: {
      success: origin + "/exito.html",
      failure: origin + "/fallo.html",
      pending: origin + "/pendiente.html",
    },
    auto_return: "approved",
    external_reference: externalReference,
    statement_descriptor: "BENDITA SUERTE",
    metadata: {
      entrega: deliveryType,
      direccion: delivery.direccion || "",
      comuna: delivery.comuna || "",
      referencia: delivery.referencia || "",
    },
  };
  if (shipments) preferenceBody.shipments = shipments;

  try {
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      body: JSON.stringify(preferenceBody),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error("MercadoPago error:", data);
      res.status(502).json({ error: data && data.message ? data.message : "MercadoPago rechazó la solicitud de pago." });
      return;
    }

    res.status(200).json({ init_point: data.init_point, external_reference: externalReference });
  } catch (err) {
    console.error("Error creando preferencia MercadoPago:", err);
    res.status(500).json({ error: "No se pudo conectar con MercadoPago. Intenta nuevamente en unos minutos." });
  }
};
