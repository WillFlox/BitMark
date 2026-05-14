import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando base de datos...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@marketplace.com",
      password: await bcrypt.hash("password", 10),
      role: "admin",
    },
  });
  console.log(`✅ Admin creado: ${admin.email}`);

  const cliente = await prisma.user.create({
    data: {
      name: "Cliente Demo",
      email: "cliente@marketplace.com",
      password: await bcrypt.hash("password", 10),
      role: "customer",
    },
  });
  console.log(`✅ Cliente creado: ${cliente.email}`);

  const categoryNames = ["Electrónica", "Ropa", "Hogar", "Deportes", "Libros", "Videojuegos"];
  const categories: Record<string, number> = {};

  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    const cat = await prisma.category.create({ data: { name, slug } });
    categories[name] = cat.id;
  }
  console.log("✅ Categorías creadas");

  const products = [
    {
      name: "Auriculares Bluetooth",
      category: "Electrónica",
      price: 49.99,
      stock: 15,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      desc: "Auriculares inalámbricos con cancelación de ruido activa, hasta 30 h de batería y sonido HD.",
    },
    {
      name: "Smartwatch Pro",
      category: "Electrónica",
      price: 129.99,
      stock: 8,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      desc: "Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado y resistencia al agua.",
    },
    {
      name: "Teclado Mecánico",
      category: "Electrónica",
      price: 89.99,
      stock: 20,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
      desc: "Teclado mecánico TKL con switches rojos, retroiluminación RGB y construcción en aluminio.",
    },
    {
      name: "Mouse Inalámbrico",
      category: "Electrónica",
      price: 29.99,
      stock: 30,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      desc: "Mouse ergonómico inalámbrico con sensor óptico de 1600 DPI y hasta 12 meses de batería.",
    },
    {
      name: "Camiseta Premium",
      category: "Ropa",
      price: 19.99,
      stock: 50,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      desc: "Camiseta de algodón peinado 100%, corte slim fit disponible en varios colores.",
    },
    {
      name: "Sudadera con capucha",
      category: "Ropa",
      price: 34.99,
      stock: 25,
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop",
      desc: "Sudadera unisex de felpa interior, bolsillo canguro y capucha ajustable.",
    },
    {
      name: "Zapatillas Running",
      category: "Deportes",
      price: 79.99,
      stock: 12,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
      desc: "Zapatillas ligeras con suela de amortiguación reactiva, ideales para entrenamiento diario.",
    },
    {
      name: "Mochila 30L",
      category: "Deportes",
      price: 45.99,
      stock: 18,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
      desc: "Mochila impermeable de 30 L con compartimento acolchado para laptop de 15\" y sistema anti-robo.",
    },
    {
      name: "Lámpara de escritorio",
      category: "Hogar",
      price: 24.99,
      stock: 22,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
      desc: "Lámpara LED regulable de 5 niveles de brillo y temperatura de color, con puerto USB de carga.",
    },
    {
      name: "Juego de sartenes",
      category: "Hogar",
      price: 59.99,
      stock: 10,
      image: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=300&fit=crop",
      desc: "Set de 3 sartenes antiadherentes de acero inoxidable, aptos para todo tipo de cocinas.",
    },
    {
      name: "Clean Code",
      category: "Libros",
      price: 19.99,
      stock: 40,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
      desc: "El clásico de Robert C. Martin sobre cómo escribir código legible, mantenible y profesional.",
    },
    {
      name: "El Programador Pragmático",
      category: "Libros",
      price: 24.99,
      stock: 35,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      desc: "Guía esencial para desarrolladores que quieren llevar su carrera y su código al siguiente nivel.",
    },
    {
      name: "Tablet 10 pulgadas",
      category: "Electrónica",
      price: 199.99,
      stock: 14,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      desc: "Tablet con pantalla Full HD, 64 GB de almacenamiento y batería de larga duración para trabajo y ocio.",
    },
    {
      name: "Monitor 24 pulgadas",
      category: "Electrónica",
      price: 159.99,
      stock: 11,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
      desc: "Monitor IPS de 24\" con resolución Full HD, marcos finos y puertos HDMI y DisplayPort.",
    },
    {
      name: "Cargador inalámbrico",
      category: "Electrónica",
      price: 24.99,
      stock: 40,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
      desc: "Base de carga Qi de 15 W compatible con smartphones y auriculares inalámbricos.",
    },
    {
      name: "Altavoz Bluetooth",
      category: "Electrónica",
      price: 39.99,
      stock: 28,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
      desc: "Altavoz portátil resistente al agua con sonido estéreo y hasta 12 horas de reproducción.",
    },
    {
      name: "Webcam HD",
      category: "Electrónica",
      price: 54.99,
      stock: 19,
      image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&h=300&fit=crop",
      desc: "Cámara web 1080p con micrófono integrado, enfoque automático y clip universal para monitor.",
    },
    {
      name: "Pantalón vaquero",
      category: "Ropa",
      price: 44.99,
      stock: 32,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
      desc: "Jeans de corte recto en denim elástico, disponible en varios lavados y tallas.",
    },
    {
      name: "Chaqueta impermeable",
      category: "Ropa",
      price: 69.99,
      stock: 18,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop",
      desc: "Chaqueta ligera cortavientos con capucha plegable y bolsillos con cierre.",
    },
    {
      name: "Vestido casual",
      category: "Ropa",
      price: 39.99,
      stock: 22,
      image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=300&fit=crop",
      desc: "Vestido midi de algodón con corte fluido, ideal para el día a día.",
    },
    {
      name: "Bufanda de lana",
      category: "Ropa",
      price: 14.99,
      stock: 45,
      image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop",
      desc: "Bufanda suave de lana merino, cálida y transpirable para invierno.",
    },
    {
      name: "Gorra ajustable",
      category: "Ropa",
      price: 12.99,
      stock: 60,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop",
      desc: "Gorra de algodón con visera curva y cierre trasero ajustable.",
    },
    {
      name: "Pelota de fútbol",
      category: "Deportes",
      price: 29.99,
      stock: 35,
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop",
      desc: "Balón oficial tamaño 5 con costuras reforzadas y buen agarre en cualquier superficie.",
    },
    {
      name: "Mancuernas 5 kg",
      category: "Deportes",
      price: 34.99,
      stock: 24,
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
      desc: "Par de mancuernas de neopreno con agarre antideslizante para entrenamiento en casa.",
    },
    {
      name: "Colchoneta yoga",
      category: "Deportes",
      price: 22.99,
      stock: 40,
      image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop",
      desc: "Esterilla antideslizante de 6 mm de grosor con correa de transporte incluida.",
    },
    {
      name: "Botella deportiva",
      category: "Deportes",
      price: 16.99,
      stock: 55,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
      desc: "Botella de acero inoxidable de 750 ml, libre de BPA y con tapa a prueba de fugas.",
    },
    {
      name: "Gafas de natación",
      category: "Deportes",
      price: 18.99,
      stock: 30,
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop",
      desc: "Gafas con lentes antivaho, protección UV y ajuste ergonómico para piscina y mar.",
    },
    {
      name: "Almohada viscoelástica",
      category: "Hogar",
      price: 32.99,
      stock: 26,
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      desc: "Almohada de espuma viscoelástica con funda lavable que se adapta al cuello.",
    },
    {
      name: "Cuadro decorativo",
      category: "Hogar",
      price: 27.99,
      stock: 15,
      image: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=300&fit=crop",
      desc: "Lámina enmarcada de diseño abstracto, lista para colgar en salón o dormitorio.",
    },
    {
      name: "Juego de toallas",
      category: "Hogar",
      price: 36.99,
      stock: 20,
      image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop",
      desc: "Set de tres toallas de algodón egipcio en distintos tamaños, alta absorción.",
    },
    {
      name: "Cafetera de goteo",
      category: "Hogar",
      price: 42.99,
      stock: 12,
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop",
      desc: "Cafetera programable de 1,2 L con filtro permanente y apagado automático.",
    },
    {
      name: "Organizador de armario",
      category: "Hogar",
      price: 19.99,
      stock: 38,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      desc: "Caja plegable de tela con compartimentos para ropa, zapatos o accesorios.",
    },
    {
      name: "Diseño de patrones",
      category: "Libros",
      price: 29.99,
      stock: 28,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop",
      desc: "Clásico de la ingeniería de software con soluciones reutilizables a problemas comunes.",
    },
    {
      name: "Introducción a Python",
      category: "Libros",
      price: 17.99,
      stock: 42,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      desc: "Manual práctico para aprender Python desde cero con ejercicios y proyectos.",
    },
    {
      name: "Sapiens",
      category: "Libros",
      price: 21.99,
      stock: 30,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
      desc: "Breve historia de la humanidad de Yuval Noah Harari, desde el Paleolítico hasta hoy.",
    },
    {
      name: "Cien años de soledad",
      category: "Libros",
      price: 18.99,
      stock: 25,
      image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=300&fit=crop",
      desc: "Obra maestra de Gabriel García Márquez y referente del realismo mágico.",
    },
    {
      name: "El señor de los anillos",
      category: "Libros",
      price: 26.99,
      stock: 22,
      image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=300&fit=crop",
      desc: "Edición de bolsillo de la trilogía de Tolkien, épica de fantasía por excelencia.",
    },
  ];

  for (const p of products) {
    const slug = p.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    await prisma.product.create({
      data: {
        categoryId: categories[p.category],
        name: p.name,
        slug,
        description: p.desc,
        price: p.price,
        stock: p.stock,
        image: p.image,
        active: true,
        productType: "physical",
      },
    });
  }
  console.log("✅ Productos creados");

  const externalGames = [
    {
      name: "Outer Ring MMO",
      slug: "outer-ring-mmo",
      category: "Videojuegos",
      desc: "RPG de acción en tercera persona, sci-fi y free-to-play. Explora galaxias, descubre nuevos mundos y lucha en batallas épicas. Economía completamente dirigida por los jugadores impulsada por blockchain en la red SKALE.",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
      externalUrl: "https://blinkgalaxy.com/games",
      provider: "Blink Galaxy",
      tags: "MMO,RPG,Sci-Fi,Cyberpunk,Open World,Battle Royale,Play-to-Earn,SKALE,Zero Gas,Free to Play",
    },
    {
      name: "RacerLoop",
      slug: "racerloop",
      category: "Videojuegos",
      desc: "Carreras de gravedad cero del universo de Outer Ring. Compite en torneos de alta velocidad atravesando desiertos, estaciones espaciales y ciudades futuristas en planetas distantes.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      externalUrl: "https://blinkgalaxy.com/games",
      provider: "Blink Galaxy",
      tags: "Racing,Space,Play-to-Earn,SKALE,Zero Gas,Free to Play",
    },
  ];

  for (const g of externalGames) {
    await prisma.product.create({
      data: {
        categoryId: categories[g.category],
        name: g.name,
        slug: g.slug,
        description: g.desc,
        price: 0,
        stock: 0,
        image: g.image,
        active: true,
        productType: "external_game",
        externalUrl: g.externalUrl,
        provider: g.provider,
        tags: g.tags,
      },
    });
  }
  console.log("✅ Juegos externos (Blink Galaxy) creados");

  await prisma.shippingMethod.createMany({
    data: [
      { name: "Envío Estándar", description: "3 a 5 días hábiles", price: 5.99, estimatedDays: 4 },
      { name: "Envío Express", description: "Entrega al día siguiente", price: 14.99, estimatedDays: 1 },
      { name: "Retiro en punto", description: "Retira en nuestra sucursal", price: 0.0, estimatedDays: 2 },
    ],
  });
  console.log("✅ Métodos de envío creados");

  console.log("🎉 Base de datos sembrada exitosamente!");
  console.log("   Admin: admin@marketplace.com / password");
  console.log("   Cliente: cliente@marketplace.com / password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
