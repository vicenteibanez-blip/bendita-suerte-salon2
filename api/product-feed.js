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

   Incluye los packs por mayor (x6/x12/x24, definidos como entradas
   hidden:true en manifest.js) como variantes del mismo producto,
   usando item_group_id — así, si alguien compra un pack, el evento
   de Compra queda bien representado en el catálogo (misma foto y
   página, precio y cantidad reales) en vez de perderse porque el
   SKU del pack no existía como producto de catálogo.
   ============================================================= */

const BRAND = require("../lib/manifest.js");

const PACK_RE = /-pack(\d+)$/;

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
  const allProducts = BRAND.products || [];

  // Productos "reales" del catálogo: con foto (Meta exige image_link y
  // rechaza imágenes rotas) y con página propia. Los packs por mayor
  // "cuelgan" de estos como variantes — si el producto base no tiene
  // foto (ej. Cera Matte Wax Brown), sus packs tampoco entran acá.
  const catalogable = {};
  allProducts.forEach(function (p) {
    if (!p.hidden && p.photo && p.productUrl) catalogable[p.id] = p;
  });

  const header = ["id", "item_group_id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand"];
  const rows = [header.join(",")];

  function pushRow(p, base, title, description) {
    const price = Number(p.priceCLP || 0).toFixed(2) + " CLP";
    const link = origin + "/" + base.productUrl;
    const imageLink = origin + "/" + base.photo;

    rows.push([
      csvField(p.id),
      csvField(base.id), // item_group_id: agrupa unidad + packs como el mismo producto
      csvField(title),
      csvField(description),
      csvField("in stock"),
      csvField("new"),
      csvField(price),
      csvField(link),
      csvField(imageLink),
      csvField(p.brand || base.brand || ""),
    ].join(","));
  }

  // 1) La unidad individual de cada producto.
  Object.keys(catalogable).forEach(function (id) {
    const p = catalogable[id];
    const title = p.sub ? p.name + " (" + p.brand + ") — " + p.sub : p.name + " (" + p.brand + ")";
    const description = p.composicion || p.sub || p.name;
    pushRow(p, p, title, description);
  });

  // 2) Los packs por mayor de cada producto (mismo item_group_id que su base).
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

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  // Cache corto: Meta vuelve a pedir el feed según la frecuencia que elijas
  // en Commerce Manager, no hace falta regenerarlo en cada request si llegan
  // varias seguidas.
  res.setHeader("Cache-Control", "public, max-age=1800");
  res.status(200).send(rows.join("\n"));
};
