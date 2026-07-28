# Bendita Suerte Salón — benditasuertesalon.cl

Barbería en Puente Alto, Chile, que además vende productos de barbería
(ceras, aceites de barba, polvos de textura, curl cream) que ella misma
usa en sus cortes.

## Contexto de negocio clave

- Hay dos tipos de cliente completamente distintos y NO deben verse forzados
  a navegar la experiencia del otro:
  1. **Reservar un corte**: objetivo = reservar en menos de 30 segundos.
  2. **Comprar productos**: se divide en (a) persona normal comprando 1-2
     productos para uso propio, y (b) dueño de barbería comprando al por
     mayor (12, 24, 48+ unidades) con precios especiales — este segundo
     segmento (B2B) todavía no tiene una experiencia dedicada en el sitio.
- Ventaja competitiva real: son una barbería física, prueban los productos
  en clientes reales, y pueden mostrar resultados reales (fotos, reseñas,
  antes/después) en vez de marketing genérico.
- El copy de producto debe vender el RESULTADO/beneficio (ej. "peinado que
  dura todo el día sin dejar el cabello duro"), no solo características.
- Toda urgencia y prueba social debe basarse en datos REALES del negocio
  (stock real, ventas reales, reseñas reales). Nunca simular contadores
  falsos ni inventar reseñas.

## Stack técnico (auditado)

- Sitio **estático vanilla HTML/CSS/JS, sin build step, sin framework**.
  No hay React/Vue/Next — cada página es un `.html` independiente.
- Hosting: **Vercel**, con funciones serverless Node.js en `api/*.js`.
- Catálogo de productos: **`lib/manifest.js`** — array `BRAND.products`
  hardcodeado (id, name, price, image, category, productUrl, etc.). Es
  módulo dual-mode: se carga como `<script>` en el navegador (expone
  `window.__BRAND__`) y también con `require()` desde funciones serverless
  (usado por `api/product-feed.js` para el feed de Meta Dynamic Ads).
- 16 páginas de producto (`producto-*.html`), todas con el mismo patrón:
  galería + tier grid (1/6/12/24 unidades) + carrito + checkout modal
  duplicado en cada HTML.
- **Reservas de hora**: no son un sistema propio — cada botón "Reservar"
  linkea directo a un servicio/barbero específico en **Setmore**
  (`benditasuertesalon.setmore.com/...`), sin pasar por el carrito del sitio.
- **Carrito y checkout de productos**: `cart.js` (localStorage) +
  `checkout.js` (modal de checkout con RUT, despacho/retiro, factura,
  cupón de descuento) → `api/create-preference.js` crea la preferencia de
  pago en **MercadoPago Checkout Pro** (única fuente de verdad de precios
  y stock de SKUs — nunca confiar en lo que mande el navegador).
- `api/mp-webhook.js`: recibe la confirmación de pago aprobado de
  MercadoPago, manda correo de aviso al dueño y de confirmación al
  comprador vía **Resend**, y dispara el evento `Purchase` a **Meta
  Conversions API**.
- Marketing: **Meta Pixel + Conversions API** (Lead/AddToCart/
  InitiateCheckout/Purchase, dedupe vía `event_id`), captura de email con
  popup (`popup-descuento.js`) conectado a **Brevo** (`api/popup-subscribe.js`).
- Cupón de descuento funcional: `BENDITASUERTE` (10% off), validado y
  recalculado siempre en el servidor (`api/create-preference.js`).
- Convención de cache-busting: `?v=YYYYMMDD` (o entero incremental para
  assets específicos) en cada `<link>`/`<script>`, hay que bumpearlo en
  las 16 páginas relevantes cada vez que se edita ese archivo.
- No existe hoy: página/flujo dedicado a clientes mayoristas (B2B),
  sistema de reseñas con foto subible, packs multi-producto, quiz de
  recomendación, contenido antes/después.

## Reglas de trabajo

- Antes de tocar código en una fase nueva, explorar primero cómo está
  hecho hoy (este archivo ya resume el estado, pero verificar si cambió).
- No reescribir de cero lo que ya funciona y está probado (ej. el flujo
  de reserva por Setmore y el catálogo minorista de la home ya cumplen el
  objetivo de "reservar en 30 segundos" / "comprar para mí" — evitar
  reestructurar navegación existente sin necesidad real).
- Nunca inventar cifras de prueba social, reseñas, o contadores de
  urgencia. Si falta el dato real, usar un placeholder explícito.
- Todo cambio de precio/descuento debe validarse y recalcularse en el
  servidor, nunca confiar en el cliente.
