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

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  // Valida un RUT chileno (formato + dígito verificador, módulo 11).
  // Acepta con o sin puntos/guion: "12.345.678-9", "12345678-9", "123456789".
  function isValidRUT(input) {
    var clean = String(input || "").replace(/[.\s]/g, "").toUpperCase();
    var match = clean.match(/^(\d{1,8})-?([0-9K])$/);
    if (!match) return false;
    var body = match[1];
    var dv = match[2];
    var sum = 0;
    var mul = 2;
    for (var i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    var res = 11 - (sum % 11);
    var expected = res === 11 ? "0" : res === 10 ? "K" : String(res);
    return dv === expected;
  }

  ready(function () {
    var cartCheckoutBtn = $("#cart-checkout-btn");
    var overlay = $("#checkout-overlay");
    var modal = $("#checkout-modal");
    var closeBtn = $("#checkout-close");
    var form = $("#checkout-form");
    var addressWrap = $("#checkout-address");
    var rutInput = $("#checkout-rut");
    var facturaToggle = $("#checkout-factura-toggle");
    var facturaWrap = $("#checkout-factura");
    var rutEmpresaInput = $("#checkout-rut-empresa");
    var razonSocialInput = $("#checkout-razon-social");
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
      var isDespacho = getDeliveryType() === "despacho";
      addressWrap.hidden = !isDespacho;
      var addressInputs = addressWrap.querySelectorAll("input");
      addressInputs.forEach(function (input) {
        if (input.name === "direccion" || input.name === "comuna" || input.name === "rut") {
          input.required = isDespacho;
        }
      });
    }

    function updateFactura() {
      var wantsFactura = !!(facturaToggle && facturaToggle.checked);
      facturaWrap.hidden = !wantsFactura;
      if (rutEmpresaInput) rutEmpresaInput.required = wantsFactura;
      if (razonSocialInput) razonSocialInput.required = wantsFactura;
    }

    function openModal() {
      var cart = window.BSCart.getCart();
      if (cart.length === 0) return;
      window.BSCart.closeDrawer();
      updateTotals();
      updateFactura();
      hideError();
      overlay.hidden = false;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("cart-open-lock");
      if (window.BSMetaTrack) {
        window.BSMetaTrack.fire("InitiateCheckout", {
          content_ids: cart.map(function (it) { return it.id; }),
          contents: cart.map(function (it) { return { id: it.id, quantity: it.qty }; }),
          num_items: cart.reduce(function (sum, it) { return sum + it.qty; }, 0),
          value: window.BSCart.getSubtotal(cart),
          currency: "CLP",
        });
      }
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
    if (facturaToggle) facturaToggle.addEventListener("change", updateFactura);

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
      var wantsFactura = !!fd.get("factura");
      var rut = (fd.get("rut") || "").trim();
      var rutEmpresa = (fd.get("rutEmpresa") || "").trim();

      if (deliveryType === "despacho" && !isValidRUT(rut)) {
        showError("El RUT ingresado no es válido. Revísalo e inténtalo de nuevo.");
        if (rutInput) rutInput.focus();
        return;
      }
      if (wantsFactura && !isValidRUT(rutEmpresa)) {
        showError("El RUT de la empresa no es válido. Revísalo e inténtalo de nuevo.");
        if (rutEmpresaInput) rutEmpresaInput.focus();
        return;
      }

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
          rut: deliveryType === "despacho" ? rut : "",
        },
        factura: {
          requiere: wantsFactura,
          rutEmpresa: wantsFactura ? rutEmpresa : "",
          razonSocial: wantsFactura ? (fd.get("razonSocial") || "").trim() : "",
        },
        // _fbp/_fbc son las cookies que pone el Pixel de Meta en el navegador.
        // Se mandan al servidor para que, cuando se confirme el pago, el
        // webhook pueda enviar el evento de Compra a la API de Conversiones
        // "firmado" igual que lo haría el navegador — así Meta lo asocia
        // bien al clic de anuncio que originó la visita.
        meta: { fbp: getCookie("_fbp"), fbc: getCookie("_fbc") },
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
