/* =============================================================
   BENDITA SUERTE SALÓN — api/product-feed.js
   -------------------------------------------------------------
   Genera un feed de catálogo (CSV) a partir de lib/manifest.js
   para que Meta Commerce Manager lo lea automáticamente y arme
   anuncios dinámicos / de catálogo (retargeting de producto).

   URL pública: https://tu-dominio.cl/api/product-feed

   En Meta: Commerce Manager → Catálogo → Agregar productos →
   Fuente de datos programada → pegar esta URL y elegir una
   frecuencia de actualización (diaria alcanza de sobra).

   No requiere ninguna variable de entorno: usa los mismos datos
   de lib/manifest.js que ya se muestran en el sitio, así que el
   catálogo de Meta se actualiza solo cuando cambies un precio o
   agregues un producto ahí.
   ============================================================= */

const BRAND = require("../lib/manifest.js");

function csvField(value) {
  const s = String(value == null ? "" : value);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async function handler(req, res) {
  const origin = baseUrl(req);
  const products = (BRAND.products || []).filter(function (p) {
    // Solo productos reales del catálogo: con foto (Meta exige image_link
    // y una imagen rota hace que rechace el producto) y con página propia.
    // Quedan afuera los packs por mayor (hidden:true, sin foto/página
    // propia) — esos son SKUs internos del checkout, no productos de
    // catálogo para mostrar en anuncios.
    return !p.hidden && p.photo && p.productUrl;
  });

  const header = ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand"];
  const rows = [header.join(",")];

  products.forEach(function (p) {
    const title = p.sub ? p.name + " (" + p.brand + ") — " + p.sub : p.name + " (" + p.brand + ")";
    const description = p.composicion || p.sub || p.name;
    const price = Number(p.priceCLP || 0).toFixed(2) + " CLP";
    const link = origin + "/" + p.productUrl;
    const imageLink = origin + "/" + p.photo;

    rows.push([
      csvField(p.id),
      csvField(title),
      csvField(description),
      csvField("in stock"),
      csvField("new"),
      csvField(price),
      csvField(link),
      csvField(imageLink),
      csvField(p.brand || ""),
    ].join(","));
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  // Cache corto: Meta vuelve a pedir el feed según la frecuencia que elijas
  // en Commerce Manager, no hace falta regenerarlo en cada request si llegan
  // varias seguidas.
  res.setHeader("Cache-Control", "public, max-age=1800");
  res.status(200).send(rows.join("\n"));
};
