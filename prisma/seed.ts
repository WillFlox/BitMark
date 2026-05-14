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

  const categoryNames = ["Electrónica", "Ropa", "Hogar", "Deportes", "Libros"];
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
      image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1584990347449-a31e5e7cbe03?w=400&h=300&fit=crop",
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
      },
    });
  }
  console.log("✅ Productos creados");

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
