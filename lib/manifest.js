/* =============================================================
   BENDITA SUERTE SALÓN — datos de la marca
   -------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para actualizar
   textos, teléfono, horario, redes sociales, equipo, servicios,
   productos y la playlist de Spotify. No requiere saber programar:
   solo reemplaza el texto entre comillas "" y guarda el archivo.
   ============================================================= */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Bendita Suerte Salón",
    legalName: "Bendita Suerte Barbería / Peluquería",
    tagline: "Barbería clásica, suerte moderna.",
    description:
      "Barbería en Puente Alto especializada en cortes clásicos, barba, afeitado a navaja y combos. Reserva tu hora online.",

    /* ---------- Contacto ---------- */
    phoneDisplay: "+56 9 8697 6527",
    phoneHref: "+56986976527",
    whatsappNumber: "56986976527",
    whatsappMessage: "Hola Bendita Suerte, quiero agendar una hora ✂️🍀",
    email: "benditasuerte.salon@gmail.com",

    /* ---------- Dirección y ubicación ---------- */
    address: {
      street: "Av. Valle Del Sol 5556",
      city: "Puente Alto",
      region: "Región Metropolitana",
      country: "Chile",
      full: "Av. Valle Del Sol 5556, Puente Alto, Santiago",
    },
    parking: "Estacionamiento gratuito disponible para clientes.",
    geo: { lat: -33.5571081, lng: -70.5597532 },
    mapsUrl:
      "https://www.google.com/maps/place/Bendita+Suerte+Barberia+%2F+Peluqueria/@-33.5571081,-70.5597532,17z/data=!4m8!3m7!1s0x9662d1484d0c81e5:0xa7de1b11707bbf6a!8m2!3d-33.5571081!4d-70.5597532!9m1!1b1!16s%2Fg%2F11z131vkm6",
    mapsDirectionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=-33.5571081,-70.5597532&destination_place_id=0x9662d1484d0c81e5:0xa7de1b11707bbf6a",
    mapsEmbedSrc:
      "https://www.google.com/maps?q=-33.5571081,-70.5597532&hl=es&z=17&output=embed",

    /* ---------- Horario ---------- */
    hours: [
      { day: "Lunes", time: "9:00 – 19:45" },
      { day: "Martes", time: "9:00 – 19:45" },
      { day: "Miércoles", time: "9:00 – 19:45" },
      { day: "Jueves", time: "9:00 – 19:45" },
      { day: "Viernes", time: "9:00 – 19:45" },
      { day: "Sábado", time: "10:00 – 19:45" },
      { day: "Domingo", time: "10:00 – 14:00" },
    ],

    /* ---------- Reservas ---------- */
    setmoreUrl: "https://benditasuertesalon.setmore.com",

    /* ---------- Redes sociales ---------- */
    social: {
      instagram: "https://instagram.com/benditasuerte.salon",
      instagramHandle: "@benditasuerte.salon",
    },

    /* ---------- Reseñas de Google ---------- */
    rating: {
      value: 5.0,
      count: 35,
      isPlaceholder: false,
    },

    /* ---------- Playlist de Spotify ---------- */
    spotify: {
      playlistId: "1F1C9UqCqeot0nrNHnPtxF",
      playlistUrl: "https://open.spotify.com/playlist/1F1C9UqCqeot0nrNHnPtxF",
    },

    /* ---------- Servicios (duración y precio) ---------- */
    services: [
      {
        icon: "beard",
        name: "Barba",
        desc: "Afeitado clásico con toallas calientes, espuma de afeitar y aceite hidratante.",
        duration: "30 min",
        price: "$12.000",
      },
      {
        icon: "combo",
        name: "Corte de Cabello + Barba + Tratamiento Facial",
        desc: "Corte, afeitado con navaja, tratamiento facial exfoliante, lavado, masaje exprés y peinado con pomada.",
        duration: "1h 15min",
        price: "$28.000",
      },
      {
        icon: "razor",
        name: "Corte de Cabello + Barba",
        desc: "Corte, afeitado clásico con toallas calientes, lavado, masaje exprés y aceite hidratante de barba.",
        duration: "1h",
        price: "$22.000",
      },
      {
        icon: "scissors",
        name: "Corte de Cabello / Adulto",
        desc: "Clásico o degradé, con shaver/navaja y tijeras. Incluye lavado y masaje exprés.",
        duration: "45 min",
        price: "$13.000",
      },
      {
        icon: "beard",
        name: "Barba + Tratamiento Facial",
        desc: "Perfilado con navaja, toallas calientes, crema exfoliante e hidratante.",
        duration: "1h",
        price: "$22.000",
      },
      {
        icon: "scissors",
        name: "Corte de Cabello + Tratamiento Facial",
        desc: "Corte, toallas calientes, exfoliante e hidratante, lavado, masaje y peinado.",
        duration: "1h",
        price: "$22.000",
      },
      {
        icon: "kid",
        name: "Corte de Cabello / Niño",
        desc: "Corte + pomada y peinado de tendencia. Máximo 11 años, requiere alzador.",
        duration: "30 min",
        price: "$12.000",
      },
    ],

    /* ---------- Equipo ---------- */
    team: [
      {
        name: "Vicente Ibañez",
        role: "Barbero",
        instagram: "@vichofame",
        instagramUrl: "https://instagram.com/vichofame",
        bio: "5 años de experiencia, especializado en trabajos con tijera y degradados. Conocimientos en colorimetría y permanentes, realiza todo tipo de cortes.",
      },
      {
        name: "Martin Soto",
        role: "Barbero",
        instagram: "@martinsbelmarbs",
        instagramUrl: "https://instagram.com/martinsbelmarbs",
        bio: "5 años de experiencia, especializado en tijera y degradados. Busca que cada cliente se sienta cómodo, en un ambiente cercano, relajado y con buena conversación.",
      },
      {
        name: "Matias Sanchez",
        role: "Barbero",
        instagram: "@zoor.sty",
        instagramUrl: "https://instagram.com/zoor.sty",
        bio: "2 años de experiencia y formación en el área. Se caracteriza por su carisma y por crear un ambiente cómodo y relajado.",
      },
      {
        name: "Aracelli Ibañez",
        role: "Barbera",
        instagram: "@ara.kutz",
        instagramUrl: "https://instagram.com/ara.kutz",
        bio: "7 años de experiencia, detallista y con estilo propio, enfocada en lograr cortes limpios, precisos y adaptados a cada cliente.",
      },
    ],

    /* ---------- Galería ---------- */
    gallery: [
      { src: "assets/img/hero.webp", alt: "Barbero cortando cabello en Bendita Suerte Salón" },
      { src: "assets/img/about.webp", alt: "Interior clásico de la barbería" },
      { src: "assets/img/gallery-mirror.webp", alt: "Corte de cabello frente al espejo" },
      { src: "assets/img/gallery-tools.webp", alt: "Estación de herramientas del barbero" },
      { src: "assets/img/gallery-cut.webp", alt: "Corte de cabello en proceso" },
      { src: "assets/img/gallery-clippers.webp", alt: "Detalle de máquina de corte" },
      { src: "assets/img/gallery-chairs.webp", alt: "Sillas vintage de la barbería" },
    ],

    /* ---------- Categorías de productos (pestañas del catálogo) ---------- */
    productCategories: [
      { id: "all", label: "Todos" },
      { id: "ceras", label: "Ceras y Pomadas" },
      { id: "polvo", label: "Polvo de Textura" },
      { id: "barba", label: "Cuidado de Barba" },
      { id: "cabello", label: "Cuidado del Cabello" },
    ],

    /* ---------- Productos ---------- */
    products: [
      {
        id: "polvo-textura-09",
        icon: "jar",
        category: "polvo",
        brand: "ROQVEL",
        name: "Polvo de Textura '09",
        sub: "Hair Powder Mattifying Styling Powder",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-polvo-textura-09.html",
        composicion: "Fórmula en polvo a base de glicerina y agentes matificantes, con un ligero y agradable aroma.",
        modoUso: "Agitar el envase antes de usar. Aplicar sobre cabello seco espolvoreando una pequeña cantidad en raíces o largo del cabello. Trabajar con las yemas de los dedos levantando y dando forma. Agregar más producto si se desea más volumen. Se retira fácilmente con shampoo.",
        tipoCabello: "Todo tipo de cabello, especialmente fino, lacio o con tendencia grasa. Ideal para dar volumen y acabado mate sin dejar residuos.",
      },
      {
        id: "cera-deluxe-matte-wax-peony",
        icon: "tin",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Deluxe Matte Wax",
        sub: "Peony",
        price: "$13.000",
        priceCLP: 13000,
        productUrl: "producto-cera-deluxe-matte-wax-peony.html",
        composicion: "Ceras y agentes mate de fórmula profesional (línea Deluxe Matte).",
        modoUso: "Tomar una pequeña cantidad (tamaño de una arveja), calentar entre las palmas y aplicar desde medios a puntas, moldeando el estilo deseado.",
        tipoCabello: "Todo tipo y largo de cabello. Ideal para looks texturizados y desordenados con acabado mate, fijación fuerte y bajo brillo.",
      },
      // Packs por mayor de producto-cera-deluxe-matte-wax-peony.html. hidden:true
      // los excluye del carrusel de la tienda (ver main.js applyFilter), pero
      // siguen "existiendo" para que cart.js no los borre del carrito por error.
      {
        id: "cera-deluxe-matte-wax-peony-pack3",
        hidden: true,
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Deluxe Matte Wax Peony — Pack x3",
        price: "$35.100",
        priceCLP: 35100,
      },
      {
        id: "cera-deluxe-matte-wax-peony-pack6",
        hidden: true,
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Deluxe Matte Wax Peony — Pack x6",
        price: "$66.300",
        priceCLP: 66300,
      },
      {
        id: "cera-deluxe-matte-wax-peony-pack12",
        hidden: true,
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Deluxe Matte Wax Peony — Pack x12",
        price: "$124.800",
        priceCLP: 124800,
      },
      {
        id: "cera-deluxe-matte-pasta-fuchsia",
        icon: "tin",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Deluxe Matte",
        sub: "Pasta Fuchsia",
        price: "$13.000",
        priceCLP: 13000,
        productUrl: "producto-cera-deluxe-matte-pasta-fuchsia.html",
        composicion: "Fórmula mate de la línea Deluxe (ceras profesionales).",
        modoUso: "Aplicar una pequeña cantidad entre las palmas, distribuir en el cabello y moldear el peinado deseado.",
        tipoCabello: "Apto para todo tipo de cabello, ideal para estilos con textura y acabado mate de larga duración.",
      },
      {
        id: "cera-aqua-wax-orange",
        icon: "tin",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Aqua Wax con brillo",
        sub: "Orange",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-cera-aqua-wax-orange.html",
        composicion: "Base acuosa (fórmula Aqua), fácil de retirar con agua.",
        modoUso: "Tomar una pequeña cantidad, frotar entre las palmas y aplicar distribuyendo uniformemente en el cabello para dar forma al peinado.",
        tipoCabello: "Todo tipo de cabello. Recomendada para looks con brillo intenso y fijación duradera, ideal para peinados definidos y con volumen.",
      },
      {
        id: "cera-matte-wax-brown",
        icon: "tin",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Matte Wax",
        sub: "Brown",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-cera-matte-wax-brown.html",
        composicion: "Fórmula mate profesional, sin residuos.",
        modoUso: "Aplicar una pequeña cantidad entre las palmas y distribuir en el cabello, moldeando el estilo deseado.",
        tipoCabello: "Todo tipo y largo de cabello. Ideal para un acabado mate natural con fijación fuerte y bajo brillo, sin dejar residuos.",
      },
      {
        id: "cera-cream-wax-fiber-effect",
        icon: "jar",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Cream Wax",
        sub: "Fiber Effect",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-cera-cream-wax-fiber-effect.html",
        composicion: "Fórmula cremosa con fibras elásticas tipo \"web\".",
        modoUso: "Aplicar una pequeña cantidad entre las palmas y trabajar en el cabello para lograr definición y control.",
        tipoCabello: "Todo tipo de cabello. Ideal para máximo control y definición con efecto fibroso y elástico.",
      },
      {
        id: "cera-matte-pomade-green",
        icon: "jar",
        category: "ceras",
        brand: "ROQVEL",
        name: "Cera Matte Pomade",
        sub: "Green",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-cera-matte-pomade-green.html",
        composicion: "Pomada de fórmula mate profesional.",
        modoUso: "Tomar una pequeña cantidad, calentar entre las palmas y aplicar distribuyendo desde la raíz, moldeando el peinado.",
        tipoCabello: "Todo tipo de cabello. Ideal para estilos con fijación fuerte y acabado mate elegante.",
      },
      {
        id: "curl-cream-rolda",
        icon: "jar",
        category: "cabello",
        brand: "Rolda",
        name: "Curl Cream",
        sub: "Crema fijadora e hidratante de rulos",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-curl-cream-rolda.html",
        composicion: "Bio-Rol: mezcla de más de 10 aceites naturales (semilla de algodón, manteca de karité, macadamia y argán).",
        modoUso: "Aplicar sobre el cabello húmedo, distribuyendo desde medios a puntas con los dedos para definir el rizo. No enjuagar.",
        tipoCabello: "Cabello rizado, ondulado y con frizz. Define, hidrata y controla el encrespamiento sin apelmazar.",
      },
      {
        id: "aceite-barba-maxcare",
        icon: "bottle",
        category: "barba",
        brand: "MaxCare",
        name: "Aceite de Barba",
        sub: "MaxCare",
        price: "$10.000",
        priceCLP: 10000,
        productUrl: "producto-aceite-barba-maxcare.html",
        composicion: "Aceite de oliva, aceite de semilla de girasol, aceite de semilla de uva, vitamina E, fragancia.",
        modoUso: "Verter unas gotas en la palma, aplicar en la piel bajo la barba masajeando suavemente y extender por toda la barba y bigote. Para mejor distribución, usar un peine.",
        tipoCabello: "Todo tipo de barba. Hidrata, da brillo y suavidad, alivia la picazón, sin dejar sensación grasosa.",
      },
      {
        id: "producto-prueba-1000",
        icon: "jar",
        category: "prueba",
        brand: "Prueba",
        name: "Producto de Prueba",
        sub: "Solo para probar el proceso de compra — no es un producto real",
        price: "$1.000",
        priceCLP: 1000,
        composicion: "Producto de prueba, sin uso real.",
        modoUso: "Este producto existe solo para probar el flujo de compra (pago, datos y correo de confirmación). Elimínalo del catálogo antes de dejarlo visible a clientes reales.",
        tipoCabello: "No aplica.",
      },
      // Packs por mayor de cada página de producto (mismo criterio que los
      // packs de la Cera Deluxe Matte Wax Peony más arriba: hidden:true
      // los excluye del carrusel de la tienda, ver main.js applyFilter).
      { id: "cera-deluxe-matte-pasta-fuchsia-pack3", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Deluxe Matte Pasta Fuchsia — Pack x3", price: "$35.100", priceCLP: 35100 },
      { id: "cera-deluxe-matte-pasta-fuchsia-pack6", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Deluxe Matte Pasta Fuchsia — Pack x6", price: "$66.300", priceCLP: 66300 },
      { id: "cera-deluxe-matte-pasta-fuchsia-pack12", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Deluxe Matte Pasta Fuchsia — Pack x12", price: "$124.800", priceCLP: 124800 },

      { id: "polvo-textura-09-pack3", hidden: true, category: "polvo", brand: "ROQVEL", name: "Polvo de Textura '09 — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "polvo-textura-09-pack6", hidden: true, category: "polvo", brand: "ROQVEL", name: "Polvo de Textura '09 — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "polvo-textura-09-pack12", hidden: true, category: "polvo", brand: "ROQVEL", name: "Polvo de Textura '09 — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "cera-aqua-wax-orange-pack3", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Aqua Wax Orange — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "cera-aqua-wax-orange-pack6", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Aqua Wax Orange — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "cera-aqua-wax-orange-pack12", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Aqua Wax Orange — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "cera-matte-wax-brown-pack3", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Wax Brown — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "cera-matte-wax-brown-pack6", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Wax Brown — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "cera-matte-wax-brown-pack12", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Wax Brown — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "cera-cream-wax-fiber-effect-pack3", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Cream Wax Fiber Effect — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "cera-cream-wax-fiber-effect-pack6", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Cream Wax Fiber Effect — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "cera-cream-wax-fiber-effect-pack12", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Cream Wax Fiber Effect — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "cera-matte-pomade-green-pack3", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Pomade Green — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "cera-matte-pomade-green-pack6", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Pomade Green — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "cera-matte-pomade-green-pack12", hidden: true, category: "ceras", brand: "ROQVEL", name: "Cera Matte Pomade Green — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "curl-cream-rolda-pack3", hidden: true, category: "cabello", brand: "Rolda", name: "Curl Cream — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "curl-cream-rolda-pack6", hidden: true, category: "cabello", brand: "Rolda", name: "Curl Cream — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "curl-cream-rolda-pack12", hidden: true, category: "cabello", brand: "Rolda", name: "Curl Cream — Pack x12", price: "$96.000", priceCLP: 96000 },

      { id: "aceite-barba-maxcare-pack3", hidden: true, category: "barba", brand: "MaxCare", name: "Aceite de Barba — Pack x3", price: "$27.000", priceCLP: 27000 },
      { id: "aceite-barba-maxcare-pack6", hidden: true, category: "barba", brand: "MaxCare", name: "Aceite de Barba — Pack x6", price: "$51.000", priceCLP: 51000 },
      { id: "aceite-barba-maxcare-pack12", hidden: true, category: "barba", brand: "MaxCare", name: "Aceite de Barba — Pack x12", price: "$96.000", priceCLP: 96000 },
    ],

    /* ---------- Tienda online (carrito + pago con MercadoPago) ----------
       El envío a domicilio es "por pagar": el comprador paga solo el
       producto aquí en MercadoPago, y paga el flete aparte, directo al
       courier (Starken o Bluexpress, según disponibilidad) cuando le
       llega el pedido. No se cobra un monto de envío en este sitio. */
    shipping: {
      couriers: ["Starken", "Bluexpress"],
      note: "Envío por pagar directo al courier al recibir el pedido.",
    },
    mercadopago: {
      apiEndpoint: "/api/create-preference",
    },

    /* ---------- Reseñas de Google (5,0 · 35 reseñas) ---------- */
    reviews: [
      { name: "Adan Moraga", text: "Servicio impecable, buena atención al cliente y con buen tema de conversación." },
      { name: "José Palomino", text: "Excelente barbería, se nota el profesionalismo, la amabilidad y la asesoría en cada corte." },
      { name: "Felipe Vega", text: "Atención muy profesional, se nota el cuidado en cada detalle del corte y la buena disposición a escuchar lo que uno busca." },
      { name: "Alexis Saavedra", text: "Llevé a mi hijo y el resultado fue justo lo que esperábamos. Gran lugar, ameno, buena atención y muy profesionales." },
      { name: "Miguel Berrios Orozco", text: "Vicente muy preocupado de cumplir mis expectativas, profesional y dedicado al 100%." },
      { name: "Andrés Pacheco", text: "Aracelli ('Ara') es súper prolija, amable y muy respetuosa con los niños." },
      { name: "Jorge Pérez", text: "Excelentes profesionales, barbería cómoda, moderna y confortable." },
      { name: "Francisco Peña", text: "Buena ubicación y estacionamiento. El servicio de Aracelli es súper profesional y pulcro." },
      { name: "Ignacio Andrés Puga Hoces", text: "Servicio de primera, local bien cuidado, limpio y con un ambiente muy agradable." },
      { name: "Rodrigo", text: "Atención de primer nivel, se nota la dedicación con cada cliente. Local muy cómodo." },
      { name: "Gustavo Baeza", text: "El barbero Vicente 10/10, ambiente súper grato." },
      { name: "Bastian Banquer", text: "De las mejores barberías de Puente Alto y La Florida." },
      { name: "Changes", text: "El diseño y la estética están en otro nivel. Me corté con Martín, quedé feliz." },
      { name: "Sebastián Medina", text: "Todo pulento, bacán la atención." },
      { name: "Miguel Reyes", text: "Lo que más me gustó fue el masaje y el lavado de cabello que viene incluido, un plus que se agradece." },
      { name: "Cesar Ibarra", text: "La mejor barbería para comodidad y relajación." },
      { name: "Sebastián Mendoza", text: "Lugar cómodo y acogedor, servicio de calidad." },
      { name: "Sergio Ignacio Trujillo Saldías", text: "Muy buena infraestructura y herramientas de trabajo." },
      { name: "Jesús Janampa", text: "Muy buena atención." },
      { name: "Eduardo Daniel Oliva Contreras", text: "Martín 10/10, un crack absoluto." },
      { name: "Miguel Martínez", text: "Vicente me atendió de primer nivel, muy profesional y detallista." },
      { name: "Maty Calderon", text: "Personal muy atento y profesional, resolvieron todas mis dudas." },
      { name: "Camila Bustos Galaz", text: "Atendieron súper bien a mi hijo de 5 años." },
      { name: "Tomás Antonio Ibáñez Delgado", text: "Todo súper cómodo, buen corte y buen lavado." },
      { name: "Benjamin P", text: "Lugar hermoso y el corte 10/10." },
      { name: "Josue Vivanco", text: "Los cabros son buena onda." },
      { name: "Kevin Lara Gómez", text: "Los barberos están 100% dedicados, te asesoran según tu tipo de cabello." },
    ],
  };
})();
