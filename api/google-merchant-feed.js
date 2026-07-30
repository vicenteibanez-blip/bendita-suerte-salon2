/* =============================================================
   BENDITA SUERTE SALÓN — api/google-merchant-feed.js
   -------------------------------------------------------------
   Feed de catálogo (TSV) a partir de lib/manifest.js para que
   Google Merchant Center lo lea automáticamente y arme Shopping
   Ads. Mismo patrón que api/product-feed.js (usado por Meta), pero
   con los nombres de columna y reglas que exige Google:
     https://support.google.com/merchants/answer/7052112

   URL pública: https://tu-dominio.cl/api/google-merchant-feed

   En Merchant Center: Productos → Feeds → Agregar feed → "Obtención
   programada" (Scheduled fetch) → pegar esta URL, formato "Texto
   delimitado por tabulaciones", frecuencia diaria.

   No requiere ninguna variable de entorno: usa los mismos datos de
   lib/manifest.js que ya se muestran en el sitio.

   identifier_exists = "no" en todas las filas porque estos son
   productos de marca sin GTIN/MPN registrado en el catálogo — sin
   este campo, Google rechaza el producto por "falta de identificador
   único". Si en algún momento se cargan los GTIN reales de cada
   producto en manifest.js, hay que sacar esta columna y agregar gtin
   en su lugar (mejor para la calidad del anuncio).

   Incluye los packs por mayor (x6/x12/x24) como variantes del mismo
   producto vía item_group_id, igual que el feed de Meta.
   ============================================================= */

const BRAND = require("../lib/manifest.js");

const PACK_RE = /-pack(\d+)$/;

function tsvField(value) {
  const s = String(value == null ? "" : value);
  // TSV no admite tabs ni saltos de línea dentro de un campo.
  return s.replace(/\t/g, " ").replace(/[\r\n]+/g, " ").trim();
}

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  const origin = baseUrl(req);
  const allProducts = BRAND.products || [];

  const catalogable = {};
  allProducts.forEach(function (p) {
    if (!p.hidden && p.photo && p.productUrl) catalogable[p.id] = p;
  });

  const header = [
    "id", "item_group_id", "title", "description", "link", "image_link",
    "availability", "price", "condition", "brand", "identifier_exists",
  ];
  const rows = [header.join("\t")];

  function pushRow(p, base, title, description) {
    const price = Number(p.priceCLP || 0).toFixed(2) + " CLP";
    const link = origin + "/" + base.productUrl;
    const imageLink = origin + "/" + base.photo;

    rows.push([
      tsvField(p.id),
      tsvField(base.id),
      tsvField(title),
      tsvField(description),
      tsvField(link),
      tsvField(imageLink),
      tsvField("in stock"),
      tsvField(price),
      tsvField("new"),
      tsvField(p.brand || base.brand || ""),
      tsvField("no"),
    ].join("\t"));
  }

  Object.keys(catalogable).forEach(function (id) {
    const p = catalogable[id];
    const title = p.sub ? p.name + " (" + p.brand + ") — " + p.sub : p.name + " (" + p.brand + ")";
    const description = p.composicion || p.sub || p.name;
    pushRow(p, p, title, description);
  });

  allProducts.forEach(function (p) {
    if (!p.hidden) return;
    const match = p.id.match(PACK_RE);
    if (!match) return;
    const baseId = p.id.slice(0, -match[0].length);
    const base = catalogable[baseId];
    if (!base) return;
    const qty = match[1];
    const description = (base.composicion || base.sub || base.name) +
      " Disponible en pack de " + qty + " unidades para peluquerías y barberías (con factura).";
    pushRow(p, base, p.name, description);
  });

  res.setHeader("Content-Type", "text/tab-separated-values; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=1800");
  res.status(200).send(rows.join("\n"));
};
