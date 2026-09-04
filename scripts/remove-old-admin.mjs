import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Removing old admin account: admin@solutionsbd.com ---');

  // 1. Remove from SQLite (reassign relations first)
  const oldUser = await prisma.user.findUnique({
    where: { email: 'admin@solutionsbd.com' },
  });

  const newUser = await prisma.user.findUnique({
    where: { email: 'solutionsbd247@gmail.com' },
  });

  if (oldUser) {
    if (newUser) {
      await prisma.payment.updateMany({
        where: { verifiedById: oldUser.id },
        data: { verifiedById: newUser.id },
      });
      await prisma.order.updateMany({
        where: { userId: oldUser.id },
        data: { userId: newUser.id },
      });
    } else {
      await prisma.payment.updateMany({
        where: { verifiedById: oldUser.id },
        data: { verifiedById: null },
      });
      await prisma.order.updateMany({
        where: { userId: oldUser.id },
        data: { userId: null },
      });
    }

    await prisma.user.delete({
      where: { id: oldUser.id },
    });
    console.log('✔ Successfully deleted admin@solutionsbd.com from SQLite dev.db!');
  } else {
    console.log('Notice: admin@solutionsbd.com not found in SQLite.');
  }

  // 2. Remove from Supabase PostgreSQL
  const connectionUrl = process.env.SUPABASE_DATABASE_URL ||
    'postgresql://postgres.ifuajwskppenylmrkwlj:t18gzykHw9YyWzh9@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

  const cleanUrl = connectionUrl.split('?')[0];
  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query(`
      DELETE FROM public.users WHERE email = 'admin@solutionsbd.com' RETURNING email;
    `);
    console.log(`✔ Successfully deleted from Supabase PostgreSQL: ${result.rowCount} rows removed.`);
  } catch (err) {
    console.error('Supabase deletion error:', err);
  } finally {
    try {
      await client.end();
    } catch {}
  }

  // 3. List remaining registered users
  const remaining = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, phone: true },
  });
  console.log('Remaining registered users in SQLite:', remaining);

  await prisma.$disconnect();
}

main().catch(console.error);

