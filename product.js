/* =============================================================
   BENDITA SUERTE SALÓN — product.js
   -------------------------------------------------------------
   Lógica específica de las páginas de producto individual
   (producto-cera-deluxe-matte-wax-peony.html y las que se repliquen
   de esta plantilla). No reemplaza cart.js/checkout.js: los botones
   "Agregar al carrito" / "Comprar ahora" siguen usando el mismo
   mecanismo de siempre (data-add-to-cart / data-buy-now, delegado en
   cart.js), este script solo actualiza sus atributos data-id /
   data-name / data-price según la cantidad elegida.
   ============================================================= */
(function () {
  "use strict";

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function formatCLP(n) { return "$" + Math.round(Number(n) || 0).toLocaleString("es-CL"); }
  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  /* ---------- Selector de cantidad (venta por mayor) ----------
     Cada tarjeta es un <label> con un radio oculto. Al cambiar,
     actualizamos el precio mostrado y los atributos data-id/
     data-name/data-price de los botones de compra (principales y
     el de la barra fija), para que el carrito cobre el precio del
     pack elegido — nunca el precio unitario base. */
  function initTierSelector() {
    var radios = $$('input[name="qty-tier"]');
    if (!radios.length) return;

    var totalEl = $("#pdp-price-total");
    var unitEl = $("#pdp-price-unit");
    var compareEl = $("#pdp-price-compare");
    var ctaButtons = $$("[data-pdp-cta]");
    var stickyName = $("#sticky-buy-name");
    var stickyPrice = $("#sticky-buy-price");
    var baseUnitPrice = Number(radios[0].getAttribute("data-unit-price")) || 0;

    function applyTier(radio) {
      var card = radio.closest(".tier-card");
      $$(".tier-card").forEach(function (c) { c.classList.toggle("is-selected", c === card); });

      var qty = Number(radio.getAttribute("data-qty")) || 1;
      var unit = Number(radio.getAttribute("data-unit-price")) || 0;
      var total = Number(radio.getAttribute("data-total-price")) || 0;
      var sku = radio.getAttribute("data-sku");
      var skuName = radio.getAttribute("data-sku-name");

      if (totalEl) totalEl.textContent = formatCLP(total);
      if (unitEl) unitEl.textContent = formatCLP(unit) + " c/u" + (qty > 1 ? " · " + qty + " unidades" : "");
      if (compareEl) {
        var regularTotal = baseUnitPrice * qty;
        compareEl.hidden = qty <= 1;
        compareEl.textContent = qty > 1 ? formatCLP(regularTotal) : "";
      }

      ctaButtons.forEach(function (btn) {
        btn.setAttribute("data-id", sku);
        btn.setAttribute("data-name", skuName);
        btn.setAttribute("data-price", String(total));
      });

      if (stickyName) stickyName.textContent = skuName;
      if (stickyPrice) stickyPrice.textContent = formatCLP(total);
    }

    radios.forEach(function (radio) {
      radio.addEventListener("change", function () { applyTier(radio); });
    });

    var preChecked = radios.filter(function (r) { return r.checked; })[0] || radios[0];
    preChecked.checked = true;
    applyTier(preChecked);
  }

  /* ---------- Galería de fotos: miniaturas ---------- */
  function initGallery() {
    var thumbs = $$(".pdp-thumb");
    var slides = $$(".pdp-gallery-slide");
    if (!thumbs.length || !slides.length) return;
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var target = thumb.getAttribute("data-slide-target");
        thumbs.forEach(function (t) { t.classList.toggle("is-active", t === thumb); });
        slides.forEach(function (s) { s.classList.toggle("is-active", s.getAttribute("data-slide") === target); });
      });
    });
  }

  /* ---------- Barra de compra fija (mobile) ----------
     Aparece apenas la caja de compra principal sale de pantalla por
     arriba, para que el botón de compra esté siempre a mano. */
  function initStickyBuyBar() {
    var bar = $("#sticky-buy-bar");
    var anchor = $("#pdp-buybox");
    if (!bar || !anchor) return;
    var onScroll = function () {
      var rect = anchor.getBoundingClientRect();
      bar.classList.toggle("is-visible", rect.bottom < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  ready(function () {
    initTierSelector();
    initGallery();
    initStickyBuyBar();
  });
})();
