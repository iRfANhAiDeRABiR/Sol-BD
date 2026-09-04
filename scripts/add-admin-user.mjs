import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const prisma = new PrismaClient();

const adminData = {
  email: 'solutionsbd247@gmail.com',
  name: 'SolutionsBD Owner',
  phone: '+8801410699879',
  password: 't18gzykHw9YyWzh9',
  role: 'OWNER',
  isActive: true,
};

async function main() {
  console.log('--- Adding Admin User to SolutionsBD Databases ---');

  // 1. Add / Update in SQLite via Prisma
  console.log('1. Updating SQLite Database (dev.db)...');
  const user = await prisma.user.upsert({
    where: { email: adminData.email },
    update: {
      name: adminData.name,
      password: adminData.password,
      role: adminData.role,
      phone: adminData.phone,
      isActive: true,
    },
    create: {
      email: adminData.email,
      name: adminData.name,
      password: adminData.password,
      role: adminData.role,
      phone: adminData.phone,
      isActive: true,
    },
  });

  console.log('SQLite User Record:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  });

  // 2. Add / Update in Supabase PostgreSQL
  const connectionUrl = process.env.SUPABASE_DATABASE_URL ||
    'postgresql://postgres.ifuajwskppenylmrkwlj:t18gzykHw9YyWzh9@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

  const cleanUrl = connectionUrl.split('?')[0];
  console.log('2. Updating Supabase PostgreSQL (public.users)...');

  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    await client.query(`
      INSERT INTO public.users (
        id, email, name, phone, password, role, is_active, wallet_balance, loyalty_points, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0.0, 0, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `, [
      user.id,
      adminData.email,
      adminData.name,
      adminData.phone,
      adminData.password,
      adminData.role,
      true,
    ]);

    const res = await client.query('SELECT id, email, role, is_active FROM public.users WHERE email = $1', [adminData.email]);
    console.log('Supabase User Record:', res.rows[0]);
    console.log('SUCCESS: Admin user successfully synced to both databases!');
  } catch (err) {
    console.error('Supabase update warning:', err);
  } finally {
    try {
      await client.end();
    } catch {}
  }

  await prisma.$disconnect();
}

main().catch(console.error);

