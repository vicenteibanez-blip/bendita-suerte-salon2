/* =============================================================
   BENDITA SUERTE SALÓN — cart.js
   -------------------------------------------------------------
   Carrito de compras 100% en el navegador (localStorage), sin
   backend. Se usa junto a checkout.js (que arma el pago) y a
   api/create-preference.js (que crea el pago en MercadoPago).

   No necesitas tocar este archivo para cambiar productos o
   precios: eso se edita en lib/manifest.js.
   ============================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "bs_cart";

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }

  function formatCLP(n) {
    n = Math.round(Number(n) || 0);
    return "$" + n.toLocaleString("es-CL");
  }

  /* ---------- Estado (localStorage) ---------- */
  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* privacy mode: ignore */ }
    render();
  }

  function addItem(id, name, price) {
    var cart = getCart();
    var existing = cart.filter(function (it) { return it.id === id; })[0];
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: Number(price) || 0, qty: 1 });
    }
    saveCart(cart);
    // No abrimos el panel automáticamente: así el cliente puede seguir agregando
    // varios productos seguidos sin que el overlay del carrito le bloquee los
    // clics sobre el resto de las tarjetas. Solo animamos el contador (badge)
    // como confirmación, y el cliente abre el carrito cuando quiera con el ícono.
    pulseBadge();
  }

  function pulseBadge() {
    var badge = $("#cart-badge");
    if (!badge) return;
    badge.classList.remove("cart-badge-pulse");
    // forzar reflow para poder re-disparar la animación en clics consecutivos
    void badge.offsetWidth;
    badge.classList.add("cart-badge-pulse");
  }

  function removeItem(id) {
    saveCart(getCart().filter(function (it) { return it.id !== id; }));
  }

  function updateQty(id, qty) {
    qty = Math.max(0, Math.round(qty));
    var cart = getCart();
    if (qty === 0) {
      saveCart(cart.filter(function (it) { return it.id !== id; }));
      return;
    }
    cart.forEach(function (it) { if (it.id === id) it.qty = qty; });
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getSubtotal(cart) {
    cart = cart || getCart();
    return cart.reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);
  }

  function getCount(cart) {
    cart = cart || getCart();
    return cart.reduce(function (sum, it) { return sum + it.qty; }, 0);
  }

  /* ---------- Render ---------- */
  function render() {
    var cart = getCart();
    var itemsWrap = $("#cart-items");
    var emptyWrap = $("#cart-empty");
    var footWrap = $("#cart-foot");
    var badge = $("#cart-badge");
    var subtotalEl = $("#cart-subtotal");
    if (!itemsWrap) return; // markup no presente en esta página (ej. exito.html)

    var count = getCount(cart);
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }

    if (cart.length === 0) {
      itemsWrap.innerHTML = "";
      if (emptyWrap) emptyWrap.hidden = false;
      if (footWrap) footWrap.hidden = true;
      return;
    }

    if (emptyWrap) emptyWrap.hidden = true;
    if (footWrap) footWrap.hidden = false;

    itemsWrap.innerHTML = cart.map(function (it) {
      return (
        '<div class="cart-item" data-cart-item="' + escAttr(it.id) + '">' +
          '<div class="cart-item-info">' +
            '<p class="cart-item-name">' + escHTML(it.name) + '</p>' +
            '<p class="cart-item-price">' + formatCLP(it.price) + '</p>' +
          '</div>' +
          '<div class="cart-item-qty">' +
            '<button type="button" class="qty-btn" data-qty-minus aria-label="Quitar una unidad"><svg class="icon" aria-hidden="true"><use href="#icon-minus"/></svg></button>' +
            '<span>' + it.qty + '</span>' +
            '<button type="button" class="qty-btn" data-qty-plus aria-label="Agregar una unidad"><svg class="icon" aria-hidden="true"><use href="#icon-plus"/></svg></button>' +
          '</div>' +
          '<button type="button" class="cart-item-remove" data-item-remove aria-label="Quitar producto"><svg class="icon" aria-hidden="true"><use href="#icon-trash"/></svg></button>' +
        '</div>'
      );
    }).join("");

    if (subtotalEl) subtotalEl.textContent = formatCLP(getSubtotal(cart));
  }

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escAttr(s) { return escHTML(s); }

  /* ---------- Drawer open/close ---------- */
  function openDrawer() {
    var drawer = $("#cart-drawer"), overlay = $("#cart-overlay"), toggle = $("#cart-toggle");
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open-lock");
  }

  function closeDrawer() {
    var drawer = $("#cart-drawer"), overlay = $("#cart-overlay"), toggle = $("#cart-toggle");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open-lock");
  }

  /* ---------- Wiring ---------- */
  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    render();

    var toggle = $("#cart-toggle");
    if (toggle) toggle.addEventListener("click", openDrawer);

    var close = $("#cart-close");
    if (close) close.addEventListener("click", closeDrawer);

    var overlay = $("#cart-overlay");
    if (overlay) overlay.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    // Delegación: funciona también para tarjetas de producto re-renderizadas
    // por el filtro de categorías (main.js) después de cargar la página.
    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest("[data-add-to-cart]");
      if (addBtn) {
        e.preventDefault();
        addItem(addBtn.getAttribute("data-id"), addBtn.getAttribute("data-name"), addBtn.getAttribute("data-price"));
        return;
      }
      var minusBtn = e.target.closest("[data-qty-minus]");
      if (minusBtn) {
        var itemEl = minusBtn.closest("[data-cart-item]");
        var id1 = itemEl.getAttribute("data-cart-item");
        var current1 = getCart().filter(function (it) { return it.id === id1; })[0];
        if (current1) updateQty(id1, current1.qty - 1);
        return;
      }
      var plusBtn = e.target.closest("[data-qty-plus]");
      if (plusBtn) {
        var itemEl2 = plusBtn.closest("[data-cart-item]");
        var id2 = itemEl2.getAttribute("data-cart-item");
        var current2 = getCart().filter(function (it) { return it.id === id2; })[0];
        if (current2) updateQty(id2, current2.qty + 1);
        return;
      }
      var removeBtn = e.target.closest("[data-item-remove]");
      if (removeBtn) {
        var itemEl3 = removeBtn.closest("[data-cart-item]");
        removeItem(itemEl3.getAttribute("data-cart-item"));
        return;
      }
    });
  });

  /* API pública para checkout.js */
  window.BSCart = {
    getCart: getCart,
    getSubtotal: getSubtotal,
    getCount: getCount,
    clearCart: clearCart,
    formatCLP: formatCLP,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    render: render,
  };
})();
