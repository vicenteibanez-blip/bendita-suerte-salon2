/* =============================================================
   BENDITA SUERTE SALÓN — checkout.js
   -------------------------------------------------------------
   Toma el carrito (cart.js) + los datos del formulario y le pide
   a nuestra función serverless (api/create-preference.js) que cree
   el pago en MercadoPago. Nunca se ven datos de tarjeta en este
   sitio: el navegador es redirigido a la página de pago oficial
   de MercadoPago (Checkout Pro).
   ============================================================= */
(function () {
  "use strict";

  function $(sel, scope) { return (scope || document).querySelector(sel); }

  function ready(fn) { document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    var cartCheckoutBtn = $("#cart-checkout-btn");
    var overlay = $("#checkout-overlay");
    var modal = $("#checkout-modal");
    var closeBtn = $("#checkout-close");
    var form = $("#checkout-form");
    var addressWrap = $("#checkout-address");
    var totalEl = $("#checkout-total");
    var errorEl = $("#checkout-error");
    var submitBtn = $("#checkout-submit");

    if (!form || !window.BSCart) return; // markup/carrito no disponible en esta página

    var brand = window.__BRAND__ || {};
    var apiEndpoint = (brand.mercadopago && brand.mercadopago.apiEndpoint) || "/api/create-preference";

    function getDeliveryType() {
      var checked = form.querySelector('input[name="entrega"]:checked');
      return checked ? checked.value : "retiro";
    }

    function updateTotals() {
      // El envío a domicilio es "por pagar" (se paga aparte al courier),
      // así que el total a pagar aquí es siempre solo el subtotal de productos.
      var subtotal = window.BSCart.getSubtotal();
      if (totalEl) totalEl.textContent = window.BSCart.formatCLP(subtotal);
      addressWrap.hidden = getDeliveryType() !== "despacho";
      var addressInputs = addressWrap.querySelectorAll("input");
      addressInputs.forEach(function (input) {
        if (input.name === "direccion" || input.name === "comuna") {
          input.required = getDeliveryType() === "despacho";
        }
      });
    }

    function openModal() {
      if (window.BSCart.getCart().length === 0) return;
      window.BSCart.closeDrawer();
      updateTotals();
      hideError();
      overlay.hidden = false;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("cart-open-lock");
    }

    function closeModal() {
      overlay.hidden = true;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cart-open-lock");
    }

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    function hideError() {
      if (!errorEl) return;
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    // Expone openModal para el botón "Comprar ahora" de cada producto (cart.js).
    window.BSCheckout = { openModal: openModal };

    if (cartCheckoutBtn) cartCheckoutBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

    form.querySelectorAll('input[name="entrega"]').forEach(function (radio) {
      radio.addEventListener("change", updateTotals);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError();

      var cart = window.BSCart.getCart();
      if (cart.length === 0) {
        showError("Tu carrito está vacío.");
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var fd = new FormData(form);
      var deliveryType = fd.get("entrega");
      var payload = {
        items: cart.map(function (it) { return { id: it.id, name: it.name, qty: it.qty }; }),
        customer: {
          nombre: (fd.get("nombre") || "").trim(),
          email: (fd.get("email") || "").trim(),
          telefono: (fd.get("telefono") || "").trim(),
        },
        delivery: {
          type: deliveryType,
          direccion: deliveryType === "despacho" ? (fd.get("direccion") || "").trim() : "",
          comuna: deliveryType === "despacho" ? (fd.get("comuna") || "").trim() : "",
          referencia: deliveryType === "despacho" ? (fd.get("referencia") || "").trim() : "",
        },
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Redirigiendo a MercadoPago…";

      var genericError = "Ocurrió un error al conectar con MercadoPago. Intenta nuevamente en unos minutos.";

      fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          // La respuesta puede no ser JSON válido (ej. si la función de pago
          // aún no está desplegada/configurada y el hosting devuelve una
          // página de error HTML). Nunca dejamos que eso reviente con un
          // error críptico: siempre mostramos un mensaje claro en español.
          return res
            .json()
            .catch(function () { return null; })
            .then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.data && result.data.error) || genericError);
          }
          if (!result.data || !result.data.init_point) {
            throw new Error(genericError);
          }
          window.location.href = result.data.init_point;
        })
        .catch(function (err) {
          showError((err && err.message) || genericError);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-cart"/></svg> Pagar con MercadoPago';
        });
    });
  });
})();
