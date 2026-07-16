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
  "polvo-textura-10": { name: "Polvo de Textura '10 (ROQVEL)", priceCLP: 10000 },
  "polvo-textura-13": { name: "Polvo de Textura '13 (ROQVEL)", priceCLP: 10000 },
  "polvo-textura-15": { name: "Polvo de Textura '15 (ROQVEL)", priceCLP: 10000 },
  "cera-deluxe-matte-wax-peony": { name: "Cera Deluxe Matte Wax Peony (ROQVEL)", priceCLP: 12000 },
  // Packs por mayor de la página de producto (producto-cera-deluxe-matte-wax-peony.html).
  // priceCLP acá es el precio del PACK completo (no por unidad) — coincide con
  // lib/manifest.js (products, hidden:true) y con el selector de cantidad de la página.
  "cera-deluxe-matte-wax-peony-pack6": { name: "Cera Deluxe Matte Wax Peony (ROQVEL) — Pack x6", priceCLP: 51000 },
  "cera-deluxe-matte-wax-peony-pack12": { name: "Cera Deluxe Matte Wax Peony (ROQVEL) — Pack x12 (mayorista)", priceCLP: 92400 },
  "cera-deluxe-matte-wax-peony-pack24": { name: "Cera Deluxe Matte Wax Peony (ROQVEL) — Pack x24 (mayorista)", priceCLP: 172800 },
  "cera-deluxe-matte-pasta-fuchsia": { name: "Cera Deluxe Matte Pasta Fuchsia (ROQVEL)", priceCLP: 12000 },
  "cera-aqua-wax-orange": { name: "Cera Aqua Wax Orange (ROQVEL)", priceCLP: 10000 },
  "cera-aqua-wax-red": { name: "Cera Aqua Wax Red (ROQVEL)", priceCLP: 10000 },
  "cera-aqua-wax-blue": { name: "Cera Aqua Wax Blue (ROQVEL)", priceCLP: 10000 },
  "cera-spider-wax-purple": { name: "Cera Spider Wax Purple (ROQVEL)", priceCLP: 10000 },
  "cera-matte-wax-brown": { name: "Cera Matte Wax Brown (ROQVEL)", priceCLP: 10000 },
  "cera-cream-wax-fiber-effect": { name: "Cera Cream Wax Fiber Effect (ROQVEL)", priceCLP: 10000 },
  "cera-matte-pomade-green": { name: "Cera Matte Pomade Green (ROQVEL)", priceCLP: 10000 },
  "curl-cream-rolda": { name: "Curl Cream (Rolda)", priceCLP: 10000 },
  "aceite-barba-maxcare": { name: "Aceite de Barba (MaxCare)", priceCLP: 10000 },

  // Packs por mayor de cada página de producto — mismo criterio que
  // cera-deluxe-matte-wax-peony-packN de arriba: priceCLP es el precio
  // del PACK completo, no por unidad. Curl Cream no tiene packs.
  "cera-deluxe-matte-pasta-fuchsia-pack6": { name: "Cera Deluxe Matte Pasta Fuchsia (ROQVEL) — Pack x6", priceCLP: 51000 },
  "cera-deluxe-matte-pasta-fuchsia-pack12": { name: "Cera Deluxe Matte Pasta Fuchsia (ROQVEL) — Pack x12 (mayorista)", priceCLP: 92400 },
  "cera-deluxe-matte-pasta-fuchsia-pack24": { name: "Cera Deluxe Matte Pasta Fuchsia (ROQVEL) — Pack x24 (mayorista)", priceCLP: 172800 },

  "polvo-textura-09-pack6": { name: "Polvo de Textura '09 (ROQVEL) — Pack x6", priceCLP: 48000 },
  "polvo-textura-09-pack12": { name: "Polvo de Textura '09 (ROQVEL) — Pack x12 (mayorista)", priceCLP: 84000 },
  "polvo-textura-09-pack24": { name: "Polvo de Textura '09 (ROQVEL) — Pack x24 (mayorista)", priceCLP: 144000 },

  "polvo-textura-10-pack6": { name: "Polvo de Textura '10 (ROQVEL) — Pack x6", priceCLP: 48000 },
  "polvo-textura-10-pack12": { name: "Polvo de Textura '10 (ROQVEL) — Pack x12 (mayorista)", priceCLP: 84000 },
  "polvo-textura-10-pack24": { name: "Polvo de Textura '10 (ROQVEL) — Pack x24 (mayorista)", priceCLP: 144000 },

  "polvo-textura-13-pack6": { name: "Polvo de Textura '13 (ROQVEL) — Pack x6", priceCLP: 48000 },
  "polvo-textura-13-pack12": { name: "Polvo de Textura '13 (ROQVEL) — Pack x12 (mayorista)", priceCLP: 84000 },
  "polvo-textura-13-pack24": { name: "Polvo de Textura '13 (ROQVEL) — Pack x24 (mayorista)", priceCLP: 144000 },

  "polvo-textura-15-pack6": { name: "Polvo de Textura '15 (ROQVEL) — Pack x6", priceCLP: 48000 },
  "polvo-textura-15-pack12": { name: "Polvo de Textura '15 (ROQVEL) — Pack x12 (mayorista)", priceCLP: 84000 },
  "polvo-textura-15-pack24": { name: "Polvo de Textura '15 (ROQVEL) — Pack x24 (mayorista)", priceCLP: 144000 },

  "cera-aqua-wax-orange-pack6": { name: "Cera Aqua Wax Orange (ROQVEL) — Pack x6", priceCLP: 35400 },
  "cera-aqua-wax-orange-pack12": { name: "Cera Aqua Wax Orange (ROQVEL) — Pack x12 (mayorista)", priceCLP: 62400 },
  "cera-aqua-wax-orange-pack24": { name: "Cera Aqua Wax Orange (ROQVEL) — Pack x24 (mayorista)", priceCLP: 112800 },

  "cera-aqua-wax-red-pack6": { name: "Cera Aqua Wax Red (ROQVEL) — Pack x6", priceCLP: 35400 },
  "cera-aqua-wax-red-pack12": { name: "Cera Aqua Wax Red (ROQVEL) — Pack x12 (mayorista)", priceCLP: 62400 },
  "cera-aqua-wax-red-pack24": { name: "Cera Aqua Wax Red (ROQVEL) — Pack x24 (mayorista)", priceCLP: 112800 },

  "cera-aqua-wax-blue-pack6": { name: "Cera Aqua Wax Blue (ROQVEL) — Pack x6", priceCLP: 35400 },
  "cera-aqua-wax-blue-pack12": { name: "Cera Aqua Wax Blue (ROQVEL) — Pack x12 (mayorista)", priceCLP: 62400 },
  "cera-aqua-wax-blue-pack24": { name: "Cera Aqua Wax Blue (ROQVEL) — Pack x24 (mayorista)", priceCLP: 112800 },

  "cera-spider-wax-purple-pack6": { name: "Cera Spider Wax Purple (ROQVEL) — Pack x6", priceCLP: 35400 },
  "cera-spider-wax-purple-pack12": { name: "Cera Spider Wax Purple (ROQVEL) — Pack x12 (mayorista)", priceCLP: 62400 },
  "cera-spider-wax-purple-pack24": { name: "Cera Spider Wax Purple (ROQVEL) — Pack x24 (mayorista)", priceCLP: 112800 },

  "cera-matte-wax-brown-pack6": { name: "Cera Matte Wax Brown (ROQVEL) — Pack x6", priceCLP: 40800 },
  "cera-matte-wax-brown-pack12": { name: "Cera Matte Wax Brown (ROQVEL) — Pack x12 (mayorista)", priceCLP: 72000 },
  "cera-matte-wax-brown-pack24": { name: "Cera Matte Wax Brown (ROQVEL) — Pack x24 (mayorista)", priceCLP: 120000 },

  "cera-cream-wax-fiber-effect-pack6": { name: "Cera Cream Wax Fiber Effect (ROQVEL) — Pack x6", priceCLP: 35400 },
  "cera-cream-wax-fiber-effect-pack12": { name: "Cera Cream Wax Fiber Effect (ROQVEL) — Pack x12 (mayorista)", priceCLP: 62400 },
  "cera-cream-wax-fiber-effect-pack24": { name: "Cera Cream Wax Fiber Effect (ROQVEL) — Pack x24 (mayorista)", priceCLP: 112800 },

  "cera-matte-pomade-green-pack6": { name: "Cera Matte Pomade Green (ROQVEL) — Pack x6", priceCLP: 40800 },
  "cera-matte-pomade-green-pack12": { name: "Cera Matte Pomade Green (ROQVEL) — Pack x12 (mayorista)", priceCLP: 72000 },
  "cera-matte-pomade-green-pack24": { name: "Cera Matte Pomade Green (ROQVEL) — Pack x24 (mayorista)", priceCLP: 120000 },

  "aceite-barba-maxcare-pack6": { name: "Aceite de Barba (MaxCare) — Pack x6", priceCLP: 36000 },
  "aceite-barba-maxcare-pack12": { name: "Aceite de Barba (MaxCare) — Pack x12 (mayorista)", priceCLP: 60000 },
  "aceite-barba-maxcare-pack24": { name: "Aceite de Barba (MaxCare) — Pack x24 (mayorista)", priceCLP: 108000 },
};

const MAX_QTY_PER_ITEM = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida un RUT chileno (formato + dígito verificador, módulo 11).
// Nunca confiamos en la validación del navegador: se puede saltar con
// devtools, así que la revisamos de nuevo acá antes de cobrar.
function isValidRUT(input) {
  const clean = String(input || "").replace(/[.\s]/g, "").toUpperCase();
  const match = clean.match(/^(\d{1,8})-?([0-9K])$/);
  if (!match) return false;
  const body = match[1];
  const dv = match[2];
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const expected = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dv === expected;
}

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
  const factura = body.factura || {};

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
  // El envío a domicilio es "por pagar": el comprador solo paga el producto
  // aquí (nunca se agrega un costo de despacho a la orden de MercadoPago).
  // El flete se paga aparte, directo al courier, cuando le llega el pedido.
  // El courier exige un RUT asociado al envío, por eso es obligatorio acá
  // (pero no para retiro en local).
  const deliveryType = delivery.type === "despacho" ? "despacho" : "retiro";
  let rut = "";
  if (deliveryType === "despacho") {
    const direccion = String(delivery.direccion || "").trim();
    const comuna = String(delivery.comuna || "").trim();
    rut = String(delivery.rut || "").trim();
    if (!direccion || !comuna) {
      res.status(400).json({ error: "Falta la dirección o la comuna para el despacho." });
      return;
    }
    if (!isValidRUT(rut)) {
      res.status(400).json({ error: "El RUT ingresado para el envío no es válido." });
      return;
    }
  }

  // --- Validar datos de factura (opcional, independiente del tipo de entrega) ---
  const wantsFactura = Boolean(factura.requiere);
  let rutEmpresa = "";
  let razonSocial = "";
  if (wantsFactura) {
    rutEmpresa = String(factura.rutEmpresa || "").trim();
    razonSocial = String(factura.razonSocial || "").trim();
    if (!isValidRUT(rutEmpresa)) {
      res.status(400).json({ error: "El RUT de la empresa para la factura no es válido." });
      return;
    }
    if (!razonSocial || razonSocial.length > 160) {
      res.status(400).json({ error: "Falta la razón social para la factura." });
      return;
    }
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
    notification_url: origin + "/api/mp-webhook",
    external_reference: externalReference,
    statement_descriptor: "BENDITA SUERTE",
    metadata: {
      entrega: deliveryType,
      direccion: delivery.direccion || "",
      comuna: delivery.comuna || "",
      referencia: delivery.referencia || "",
      rut: rut,
      factura: wantsFactura ? "si" : "no",
      rut_empresa: rutEmpresa,
      razon_social: razonSocial,
    },
  };

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
