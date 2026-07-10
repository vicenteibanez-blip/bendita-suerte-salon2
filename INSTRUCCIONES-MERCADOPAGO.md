# Cómo activar el pago con MercadoPago en tu sitio

Este documento es para ti (el dueño del sitio), no requiere saber programar. Sigue los pasos en orden. Nadie más que tú debe ingresar tus credenciales — ni siquiera Claude las escribe por ti en ningún formulario, por seguridad.

## Qué ya quedó listo en el sitio

- Botón "Agregar al carrito" en cada producto (ceras, pomadas, aceite de barba).
- Carrito lateral con cantidades y subtotal.
- Formulario de pago con tus datos, opción de retiro en local o despacho a domicilio.
- Una función automática (`api/create-preference.js`) que crea el cobro en MercadoPago de forma segura.
- Páginas de resultado: `exito.html`, `fallo.html`, `pendiente.html`.

Lo único que falta para que funcione de verdad es: (1) tus credenciales de MercadoPago y (2) publicar el sitio en un hosting que soporte la función de pago (recomendamos Vercel, gratis).

---

## Paso 1 — Crear tu cuenta de MercadoPago y obtener el Access Token

1. Ve a [mercadopago.cl](https://www.mercadopago.cl) y crea una cuenta (o inicia sesión) con los datos de tu barbería.
2. Entra al panel de desarrolladores: [mercadopago.cl/developers/panel](https://www.mercadopago.cl/developers/panel/app).
3. Crea una "aplicación" nueva (te pedirá un nombre, por ejemplo "Bendita Suerte Salón" y el tipo de integración — elige **Pagos online / Checkout Pro**).
4. Dentro de la aplicación, ve a la sección **"Credenciales de prueba"** y copia el **Access Token de prueba** (empieza con `TEST-...`). Úsalo primero para probar que todo funciona sin cobrar dinero real.
5. Cuando ya probaste que todo funciona (ver Paso 4), vuelve a la sección **"Credenciales de producción"** y copia el **Access Token de producción** (empieza con `APP_USR-...`). Ese es el que se usa para cobrar de verdad.

Guarda ambos tokens en un lugar privado (por ejemplo, un gestor de contraseñas). Son como una clave bancaria: no los compartas ni los pegues en ningún chat o formulario que no sea el panel oficial de Vercel.

---

## Paso 2 — Publicar el sitio en Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita (puedes usar tu email o tu cuenta de Google).
2. Una vez dentro, ve a **"Add New" → "Project"**.
3. Tienes dos formas de subir el sitio:
   - **Más simple:** arrastra la carpeta completa del proyecto (`PAGINA WEB BS CLOUDE`) directamente a la pantalla de Vercel cuando te lo pida ("Deploy" / importar carpeta).
   - **Alternativa (recomendada a futuro):** sube la carpeta a un repositorio de GitHub y conecta ese repositorio desde Vercel — así cada vez que edites un archivo, el sitio se actualiza solo.
4. En la configuración del proyecto, dejar el "Framework Preset" en **"Other"** (no es necesario ningún comando de build; el sitio es HTML/CSS/JS plano). Vercel detecta automáticamente la carpeta `api/` y la convierte en la función de pago.
5. Dale a **Deploy**. En 1-2 minutos tendrás una URL pública tipo `https://tu-sitio.vercel.app`.

---

## Paso 3 — Configurar tu Access Token en Vercel

Esta es la única parte que **debes hacer tú mismo**, escribiéndola directamente en el panel de Vercel (por tu seguridad, esto nunca se hace a través de un chat o de un tercero):

1. En tu proyecto de Vercel, ve a **Settings → Environment Variables**.
2. Crea una variable nueva:
   - **Name:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** pega aquí tu Access Token (empieza probando con el de prueba `TEST-...`)
   - **Environment:** selecciona "Production" (y también "Preview"/"Development" si quieres probar ahí).
3. Guarda, y vuelve a desplegar el proyecto (Vercel suele pedir un "Redeploy" para que la nueva variable tome efecto — hay un botón para eso en la pestaña "Deployments").

---

## Paso 4 — Probar antes de cobrar de verdad

Con el Access Token **de prueba** (`TEST-...`) configurado:

1. Entra a tu sitio publicado, agrega un producto al carrito y completa el formulario de pago.
2. Te va a redirigir a una página de pago de MercadoPago en modo prueba.
3. Usa una **tarjeta de prueba oficial de MercadoPago Chile** para simular el pago — la lista de tarjetas y los datos de prueba cambian de tanto en tanto, así que revisa siempre la página oficial y actualizada de MercadoPago en vez de una lista fija:
   - [Tarjetas de prueba — Checkout Pro](https://www.mercadopago.cl/developers/es/docs/checkout-pro/integration-test/test-purchases)
   - [Tarjetas de prueba — detalle](https://www.mercadopago.cl/developers/es/docs/checkout-api/integration-test/test-cards)
4. Confirma que después de "pagar" te devuelve a `exito.html` con un mensaje de compra exitosa, y que la venta aparece en tu panel de MercadoPago (modo prueba).

Cuando todo funcione bien:

5. Vuelve a **Settings → Environment Variables** en Vercel y reemplaza el valor de `MERCADOPAGO_ACCESS_TOKEN` por tu Access Token **de producción** (`APP_USR-...`).
6. Vuelve a hacer "Redeploy". Desde ese momento, los pagos son reales.

---

## Cómo te enteras de cada venta

Tienes dos avisos independientes, así que aunque falle uno te enteras por el otro:

1. **MercadoPago:** te notifica automáticamente en su app/panel (y por email si lo tienes activado). Revisa tu [panel de actividad de MercadoPago](https://www.mercadopago.cl/activities) después de cada venta.
2. **Correo propio por Resend:** apenas MercadoPago confirma que el pago quedó aprobado, el sitio manda dos correos automáticos:
   - A `benditasuerte.salon@gmail.com`, con el detalle de la venta (productos, cliente, retiro o despacho).
   - Al comprador (a su email de pago), confirmando su compra y cómo retirar o recibir su pedido.

   Esto lo hace la función `api/mp-webhook.js`, a la que MercadoPago avisa automáticamente (webhook) cada vez que cambia el estado de un pago.

Para que el correo por Resend funcione, agrega estas variables en Vercel (**Settings → Environment Variables**), igual que hiciste con `MERCADOPAGO_ACCESS_TOKEN`:

- **`RESEND_API_KEY`** (obligatoria): tu clave de API de Resend ([resend.com/api-keys](https://resend.com/api-keys)).
- **`RESEND_FROM_EMAIL`** (opcional): la dirección remitente, por ejemplo `Bendita Suerte Salón <avisos@tudominio.cl>` — requiere tener ese dominio verificado en Resend. Si no la configuras, se usa el remitente de prueba `onboarding@resend.dev`, que funciona pero puede llegar a spam con más frecuencia.

Después de agregar las variables, haz "Redeploy" en Vercel para que tomen efecto.

---

## Si más adelante cambias un precio

Los precios que se muestran en el sitio están en `lib/manifest.js` (campo `priceCLP` de cada producto). Pero por seguridad, el cobro real usa una copia de esos precios dentro de `api/create-preference.js` (objeto `PRODUCTS`), para que nadie pueda alterar el precio desde el navegador. **Si cambias un precio, tienes que cambiarlo en los dos archivos** para que el sitio y el cobro coincidan. Si prefieres, puedes pedirle a Claude que haga ese cambio por ti en ambos lugares.

## Costo de despacho

El costo fijo de despacho a domicilio está en `lib/manifest.js` (`shipping.flatFee`, hoy en $2.500) y duplicado en `api/create-preference.js` (`SHIPPING.flatFee`) por el mismo motivo de seguridad anterior — cámbialos juntos.
