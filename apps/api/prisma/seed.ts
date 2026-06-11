import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
});

async function seedUsers() {
  const passwordHash = await hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'admin@tudo.test' },
    update: {
      name: 'Admin Cafe TUDO',
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Admin Cafe TUDO',
      email: 'admin@tudo.test',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'kasir@tudo.test' },
    update: {
      name: 'Kasir Cafe TUDO',
      passwordHash,
      role: UserRole.CASHIER,
    },
    create: {
      name: 'Kasir Cafe TUDO',
      email: 'kasir@tudo.test',
      passwordHash,
      role: UserRole.CASHIER,
    },
  });
}

async function seedCategories() {
  const categories = [
    { id: 1, name: 'Kopi', description: 'Espresso, kopi susu, dan signature coffee' },
    { id: 2, name: 'Non-Kopi', description: 'Matcha, teh, cokelat, dan minuman segar' },
    { id: 3, name: 'Snack', description: 'Menu ringan untuk menemani minuman' },
    { id: 4, name: 'Makanan', description: 'Menu utama Cafe TUDO' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { ...category, isActive: true },
      create: { ...category, isActive: true },
    });
  }
}

async function seedMenus() {
  const menus = [
    {
      id: 1,
      categoryId: 1,
      name: 'Espresso',
      description: 'Kopi hitam pekat dengan ekstraksi tinggi.',
      price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=300&q=80',
      isAvailable: true,
    },
    {
      id: 2,
      categoryId: 1,
      name: 'Cappuccino',
      description: 'Espresso dengan susu steamed dan busa tebal.',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=300&q=80',
      isAvailable: true,
    },
    {
      id: 3,
      categoryId: 2,
      name: 'Matcha Latte',
      description: 'Teh hijau bubuk kualitas premium dengan susu.',
      price: 28000,
      imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=300&q=80',
      isAvailable: true,
    },
    {
      id: 4,
      categoryId: 3,
      name: 'Kentang Goreng',
      description: 'Kentang goreng renyah dengan taburan garam dan bumbu pilihan.',
      price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1623101344464-9646b99e504c?auto=format&fit=crop&w=300&q=80',
      isAvailable: true,
    },
    {
      id: 5,
      categoryId: 4,
      name: 'Rice Bowl Teriyaki',
      description: 'Nasi hangat, ayam teriyaki, telur, dan salad segar.',
      price: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=300&q=80',
      isAvailable: true,
    },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: menu,
      create: menu,
    });
  }
}

async function seedTables() {
  const tables = ['M-01', 'M-02', 'M-03', 'M-04'];

  for (const tableNumber of tables) {
    await prisma.cafeTable.upsert({
      where: { tableNumber },
      update: {
        qrCode: `QR-${tableNumber}`,
        qrUrl: `/t/${tableNumber}`,
        isActive: true,
      },
      create: {
        tableNumber,
        qrCode: `QR-${tableNumber}`,
        qrUrl: `/t/${tableNumber}`,
        isActive: true,
      },
    });
  }
}

async function main() {
  await seedUsers();
  await seedCategories();
  await seedMenus();
  await seedTables();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
