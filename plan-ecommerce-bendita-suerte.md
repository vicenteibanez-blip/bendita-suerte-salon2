# Plan maestro: llevar benditasuertesalon.cl al siguiente nivel de eCommerce

Este documento traduce todas las ideas que planteaste en una secuencia de trabajo concreta, con **prompts listos para pegar en Claude Code** en tu propio proyecto. Está pensado para que avances fase por fase, sin bloquearte, y sabiendo en cada momento qué le toca al código y qué te toca a ti (fotos, precios, contenido).

---

## Cómo usar esto

1. Abre Claude Code en la carpeta del proyecto de `benditasuertesalon.cl`.
2. Pega primero el **Prompt base** (sección siguiente) — idealmente guárdalo como `CLAUDE.md` en la raíz del repo, así cada sesión futura ya tiene el contexto del negocio sin que tengas que repetirlo.
3. Luego avanza fase por fase, en el orden sugerido. Cada fase trae: objetivo, qué preparar tú antes, el prompt para Claude Code, y cómo saber que quedó bien.
4. No tienes que hacerlas todas de una sesión. Cada fase es un commit/PR independiente.

---

## Prompt base (guardar como `CLAUDE.md` o pegar al inicio de cada sesión)

```
Este proyecto es la web de Bendita Suerte Salón (benditasuertesalon.cl), una barbería
en Chile que además vende productos de barbería (ceras, aceites de barba, shampoo, etc.)
que ella misma usa en sus cortes.

Contexto de negocio clave:
- Hay dos tipos de cliente completamente distintos y NO deben ver la misma experiencia:
  1. Cliente que quiere RESERVAR UN CORTE: objetivo = reservar en menos de 30 segundos.
  2. Cliente que quiere COMPRAR PRODUCTOS: se divide en (a) persona normal comprando
     1 producto para uso propio, y (b) dueño de barbería comprando al por mayor
     (12, 24, 48+ unidades) con precios especiales.
- La ventaja competitiva real del negocio: son una barbería física, prueban los
  productos en clientes reales, y pueden mostrar resultados reales (fotos, reseñas,
  antes/después) en vez de marketing genérico.
- El copy de producto debe vender el RESULTADO/beneficio (ej. "peinado que dura todo
  el día sin dejar el cabello duro"), no solo las características técnicas.
- Toda la urgencia y prueba social debe basarse en datos REALES del negocio (stock
  real, ventas reales, reseñas reales con foto). Nunca simular contadores falsos ni
  inventar reseñas.

Antes de tocar código en cualquier fase: explora la estructura actual del proyecto
(framework, sistema de rutas, dónde vive el catálogo de productos, cómo funciona hoy
la reserva de citas, si hay CMS o los datos están hardcodeados) y dime qué encontraste
antes de proponer cambios, para que la implementación encaje con lo que ya existe en
vez de reescribir todo desde cero.
```

---

## Fase 0 — Auditoría técnica (antes de tocar nada)

**Objetivo:** que Claude Code entienda el proyecto real antes de proponer arquitectura, para que el plan de abajo se adapte a tu stack (no al revés).

**Prompt:**
```
Antes de implementar cambios, audita el proyecto y dame un resumen breve de:
1. Framework/stack usado (y si es sitio estático, WordPress headless, Next.js, etc.)
2. Cómo está estructurado hoy el catálogo de productos (¿archivo de datos, CMS,
   base de datos?) y qué campos tiene cada producto actualmente.
3. Cómo funciona hoy el sistema de reserva de citas (¿es un widget externo, una
   página propia, un link a Calendly/Fresha/etc.?).
4. Cómo está la navegación principal hoy (menú, home, rutas de la tienda).
5. Si existe ya algún sistema de reseñas, carrito, o checkout, y cuál es.
No cambies nada todavía, solo dame el diagnóstico y qué tan fácil o difícil sería
cada una de las fases que te voy a ir pidiendo después.
```

---

## Fase 1 — Separar "Reservar corte" de "Tienda" (arquitectura base)

Esta es la fase más importante: todo lo demás se apoya en esta separación.

**Qué preparas tú:** nada de contenido todavía, solo decidir el texto exacto del botón de reserva (ej. "Reservar corte" vs "Agendar hora").

**Prompt:**
```
Reestructura la navegación principal de la home para separar claramente dos caminos,
sin que el cliente que solo quiere reservar corte tenga que ver la tienda:

- Un CTA principal y muy visible: "Reservar corte" → lleva directo al flujo de
  reserva existente, en el menor número de clics posible (objetivo: reservar en
  menos de 30 segundos).
- Un segundo CTA: "Tienda" → lleva a una página intermedia con dos opciones:
    "Comprar para mí" (precios normales, catálogo minorista)
    "Comprar para Barberías" (precios mayoristas, ver Fase 2)

No elimines funcionalidad existente, solo reorganiza la IA (información/arquitectura)
y los CTAs. Mantén el diseño visual consistente con el resto del sitio. Si el sitio
usa un sistema de rutas, crea rutas separadas y claras, por ejemplo:
/reservar, /tienda, /tienda/mayorista.
```

**Criterio de éxito:** desde la home, un usuario nuevo entiende en 2 segundos si quiere reservar o comprar, sin tener que leer.

---

## Fase 2 — Sección mayorista B2B ("Comprar para Barberías")

**Qué preparas tú (importante, el código no puede inventarlo):**
- Tabla real de precios/descuentos por volumen (ej. 12 = X% off, 24 = Y%, 48 = Z%).
- A dónde debe llegar el formulario de contacto mayorista (tu WhatsApp, email o CRM).
- Confirmar si quieres mostrar precios directamente o pedir "Solicitar precio" (más común en B2B para poder negociar).

**Prompt:**
```
Crea una página /tienda/mayorista dedicada a clientes B2B (dueños de barbería) con:

1. Encabezado: "¿Tienes barbería? Obtén precios especiales desde 12 unidades."
2. Lista de beneficios con check ✔: descuentos por volumen, despacho a todo Chile,
   atención personalizada, reposición constante.
3. Un bloque con los tramos de descuento: [aquí voy a darte las cifras reales:
   12 unidades = __%, 24 unidades = __%, 48 unidades = __%]
4. Un formulario "Solicitar precio mayorista" con campos: nombre, nombre de la
   barbería, teléfono/WhatsApp, ciudad, producto(s) de interés, cantidad estimada
   mensual. Al enviarlo debe [definir: enviar email a __ / mensaje a WhatsApp
   Business API / guardar en una hoja de cálculo — dime cuál prefieres si no está
   ya resuelto en el proyecto].
5. Esta página no debe mezclarse visualmente con la tienda minorista: usa un tono
   más "profesional/B2B" en el copy (menos emocional, más orientado a rentabilidad
   del negocio del cliente).
```

---

## Fase 3 — Fichas de producto: copy, fotos, video, urgencia real

Esta fase mezcla trabajo de código (estructura) con trabajo tuyo (contenido real). Van encadenadas porque el componente no sirve de nada sin las fotos/datos reales.

**Qué preparas tú antes de pedir el código (esto es lo más grande de todo el proyecto en términos de tiempo):**
- Por producto: foto frontal, trasera, textura, envase abierto, producto aplicado en una mano, foto con moneda/regla para tamaño, y un video corto (10 seg) de aplicación.
- Un dato real de urgencia por producto: unidades restantes, fecha de última reposición, o unidades vendidas este mes (los que tengas, no hace falta tener los tres).
- El copy AIDA de cada producto (o dime cuáles quieres que te ayude a redactar primero, con la ficha técnica del producto y te devuelvo el copy).

**Prompt (estructura del componente, sin inventar contenido):**
```
Rediseña el componente de ficha de producto para que soporte:

1. Galería de imágenes con múltiples slots por producto (frontal, trasera, textura,
   abierta, aplicada, en mano, con referencia de tamaño) + un video corto embebido.
   Si el modelo de datos actual del producto no tiene campos para esto, agrégalos
   (array de imágenes con "tipo" o "alt", y un campo opcional de video_url).
2. Estructura de copy en formato AIDA en vez de solo nombre + descripción plana:
   - Título orientado a beneficio/resultado (no solo el nombre técnico)
   - Bloque de "atención" (hook/pregunta)
   - Bloque de "interés" (qué hace)
   - Bloque de "deseo" (para quién es, casos de uso)
   - Bloque de "acción" (CTA + garantía de despacho)
   Agrega estos campos al modelo de datos del producto si no existen.
3. Un bloque de "urgencia real" que muestre SOLO datos que vienen de campos reales
   del producto (unidades_restantes, ultima_reposicion, ventas_mes) — si un campo
   está vacío, no mostrar esa línea. Nunca uses un contador inventado o con
   cuenta regresiva falsa.
4. No borres productos ni datos existentes: migra lo que haya al nuevo modelo.

Por ahora usa datos de ejemplo/placeholder para que yo vea la estructura funcionando;
después te voy a pasar el contenido real producto por producto para reemplazarlo.
```

*Cuando tengas las fotos/videos/copy reales de al menos 1-2 productos, pégaselos a Claude Code producto por producto para ir reemplazando los placeholders — no hace falta esperar a tener todo el catálogo listo.*

---

## Fase 4 — Prueba social: reseñas reales, comparativa, contadores

**Qué preparas tú (proceso operativo, no técnico):**
- Después de cada corte donde vendas producto, pide una foto/opinión corta al cliente (por WhatsApp o en el momento). Vas a ir acumulando estas reseñas para subirlas.
- Cifras reales que quieras mostrar como prueba social (clientes atendidos, cortes realizados, productos vendidos) — solo las que puedas respaldar.
- Los puntos reales de comparación de tu producto vs. la competencia genérica (para la tabla comparativa) — solo afirmaciones que puedas sostener.

**Prompt:**
```
Agrega a la ficha de producto y/o a la home:

1. Un sistema de reseñas con foto: cada reseña tiene nombre (o iniciales), texto
   corto, calificación, y una imagen opcional subida por el cliente/negocio (no
   generada). Debe poder agregarse manualmente por ahora (yo las voy a ir subiendo
   producto por producto), no hace falta integrar un sistema externo de reseñas
   todavía.
2. Un bloque de "prueba social" reutilizable con cifras reales que yo te voy a pasar
   (ej. "Más de X clientes atendidos", "Usada diariamente en Bendita Suerte Salón"),
   como componente que pueda usarse tanto en home como en fichas de producto.
3. Una tabla comparativa "Nuestra cera vs. otras" con filas editables (atributo,
   check/cruz/advertencia) — que yo pueda definir el contenido real después.
No inventes cifras ni reseñas de ejemplo con nombres que parezcan reales; usa
placeholders explícitos tipo "[Nombre cliente]" / "[Cifra real aquí]" para que
quede claro qué falta completar.
```

---

## Fase 5 — Packs y cross-selling

**Qué preparas tú:** definir los packs reales y sus precios (ej. Pack Inicio, Pack Barber x6, Pack Mayorista x12, Pack Premium) y qué productos van relacionados entre sí para el cross-sell.

**Prompt:**
```
Implementa:

1. Un tipo de producto "pack" que agrupe varios productos existentes con un precio
   propio (posiblemente con descuento vs. comprarlos sueltos). Debe poder crearse
   sin duplicar el inventario de los productos individuales.
2. En cada ficha de producto, un bloque "Clientes también compraron" que muestre
   2-4 productos relacionados (por ahora puedes usar una relación simple manual
   por producto: campo "productos_relacionados"; no hace falta un motor de
   recomendación automático todavía).
Dame la lista de productos existentes para que yo te diga qué packs armar y qué
productos relacionar entre sí.
```

---

## Fase 6 — Sección de confianza "¿Por qué comprar en Bendita Suerte?"

Esta es rápida de implementar y se puede hacer en paralelo con cualquier otra fase.

**Prompt:**
```
Agrega una sección (en home y/o en la tienda) titulada "¿Por qué comprar en Bendita
Suerte?" con 4 puntos con check ✅:
- Somos barbería real
- Probamos todos los productos antes de venderlos
- Recomendaciones según tu tipo de cabello
- Atención por WhatsApp
Hazla como un componente reutilizable con estos 4 puntos como datos, para que yo
pueda editar el texto fácilmente después sin tocar el layout.
```

---

## Fase 7 — Contenido: antes/después y videos educativos

**Qué preparas tú:** el contenido en sí (fotos antes/después, videos cortos de aplicación, diferencia mate/brillo, cantidad a usar, cómo lavar). Esto es contenido que ya generas naturalmente en tu trabajo diario de barbero.

**Prompt:**
```
Crea:
1. Un componente "Antes / Después" (dos imágenes lado a lado o en carrusel) que
   pueda insertarse en fichas de producto y en la home.
2. Una sección "Aprende" o "Tips" con espacio para videos cortos embebidos
   (YouTube/Instagram/TikTok embed o video propio), con título y descripción por
   video, pensada para ir agregando contenido sin rediseñar cada vez.
Usa placeholders hasta que te pase el contenido real.
```

---

## Fase 8 — Quiz "Encuentra tu cera ideal"

La dejaría para el final: es la que más valor agrega en reducir indecisión, pero depende de que ya tengas el catálogo bien etiquetado (tipo de cabello, acabado, fijación) de las fases anteriores.

**Prompt:**
```
Crea un quiz corto de 3 preguntas para recomendar producto:
1. ¿Qué tipo de cabello tienes? (liso / ondulado / rizado)
2. ¿Qué acabado buscas? (mate / brillo)
3. ¿Qué fijación quieres? (baja / media / alta)
Al final debe mostrar el producto recomendado según reglas simples basadas en estos
tres atributos (agrega estos atributos al modelo de datos del producto si no
existen: tipo_cabello, acabado, fijacion). El resultado debe llevar directo a la
ficha del producto recomendado con un botón de compra.
```

---

## Orden recomendado (resumen)

| Fase | Qué es | Por qué en ese orden |
|---|---|---|
| 0 | Auditoría técnica | Sin esto, cualquier prompt de código puede chocar con lo que ya existe |
| 1 | Separar Reservar vs Tienda | Es la base de toda la navegación; todo lo demás cuelga de aquí |
| 2 | Mayorista B2B | Alto impacto en ingresos y relativamente independiente del resto |
| 3 | Fichas de producto (copy/fotos/video/urgencia) | Es donde más se juega la conversión del cliente minorista |
| 4 | Reseñas / comparativa / prueba social | Refuerza lo construido en la fase 3, necesita que existan fichas ya mejoradas |
| 5 | Packs y cross-selling | Se apoya en que el catálogo y precios ya estén ordenados |
| 6 | Sección de confianza | Rápida, se puede meter en cualquier momento libre |
| 7 | Antes/después y videos | Contenido que se puede ir sumando de forma continua, no bloquea nada |
| 8 | Quiz de recomendación | Depende de que el catálogo ya tenga los atributos bien definidos |

**Nota:** las fases 6 y 7 puedes intercalarlas en cualquier momento sin romper el orden de las demás — son las de menor dependencia técnica.

---

## Lo que solo tú puedes preparar (no lo puede generar el código)

- Fotos y videos reales de productos (ángulos + aplicación).
- Precios mayoristas por tramo de volumen.
- Proceso para pedir reseñas con foto a tus clientes reales después de cada corte.
- Cifras reales de prueba social (clientes atendidos, cortes realizados, ventas).
- Definición de packs y sus precios.
- Contenido de antes/después y videos educativos cortos.
- A dónde debe llegar el formulario de contacto mayorista (WhatsApp/email/CRM).

Sin esto, el código queda con placeholders — lo cual está bien como paso intermedio, pero la conversión real solo llega cuando reemplazas los placeholders por contenido real.
