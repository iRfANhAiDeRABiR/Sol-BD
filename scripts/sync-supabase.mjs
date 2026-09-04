import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const prisma = new PrismaClient();

const connectionUrl =
  process.env.SUPABASE_DATABASE_URL ||
  'postgresql://postgres.ifuajwskppenylmrkwlj:t18gzykHw9YyWzh9@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const cleanUrl = connectionUrl.split('?')[0];

const client = new pg.Client({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('--- SolutionsBD Database Sync to Supabase ---');
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();

  try {
    // 0. Ensure public.users table exists in Supabase
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        password TEXT,
        role TEXT DEFAULT 'CUSTOMER',
        wallet_balance NUMERIC DEFAULT 0.0,
        loyalty_points INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Public and admin full access to users'
        ) THEN
          CREATE POLICY "Public and admin full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
        END IF;
      END $$;
    `);

    console.log('Fetching local data from SQLite...');
    const users = await prisma.user.findMany();
    const categories = await prisma.category.findMany();
    const products = await prisma.product.findMany();
    const variants = await prisma.productVariant.findMany();
    const licenseKeys = await prisma.licenseKey.findMany();
    const coupons = await prisma.coupon.findMany();
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        payments: true,
      },
    });

    console.log(`Local SQLite Data:
  • Users:        ${users.length}
  • Categories:   ${categories.length}
  • Products:     ${products.length}
  • Variants:     ${variants.length}
  • License Keys: ${licenseKeys.length}
  • Coupons:      ${coupons.length}
  • Orders:       ${orders.length}
`);

    await client.query('BEGIN');

    // 1. Sync Users
    console.log(`Syncing ${users.length} users...`);
    for (const u of users) {
      await client.query(
        `
        INSERT INTO public.users (
          id, email, name, phone, password, role, is_active, wallet_balance, loyalty_points, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          is_active = EXCLUDED.is_active,
          wallet_balance = EXCLUDED.wallet_balance,
          loyalty_points = EXCLUDED.loyalty_points,
          updated_at = EXCLUDED.updated_at;
      `,
        [
          u.id,
          u.email,
          u.name,
          u.phone,
          u.password,
          u.role,
          u.isActive !== undefined ? u.isActive : true,
          u.walletBalance || 0,
          u.loyaltyPoints || 0,
          u.createdAt,
          u.updatedAt,
        ]
      );
    }

    // 2. Clean previous catalog & orders in Supabase
    console.log('Resetting Supabase catalog & order tables...');
    await client.query('DELETE FROM payments;');
    await client.query('DELETE FROM order_items;');
    await client.query('DELETE FROM orders;');
    await client.query('DELETE FROM license_keys;');
    await client.query('DELETE FROM product_variants;');
    await client.query('DELETE FROM products;');
    await client.query('DELETE FROM categories;');

    // 3. Insert Categories
    console.log(`Syncing ${categories.length} categories...`);
    for (const cat of categories) {
      await client.query(
        `
        INSERT INTO categories (
          id, name, slug, icon, description, sort_order, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          cat.id,
          cat.name,
          cat.slug,
          cat.icon,
          cat.description,
          cat.sortOrder,
          cat.isActive,
          cat.createdAt,
          cat.updatedAt,
        ]
      );
    }

    // 4. Insert Products
    console.log(`Syncing ${products.length} products...`);
    for (const prod of products) {
      let tagsArray = [];
      try {
        tagsArray = JSON.parse(prod.tags || '[]');
      } catch {
        tagsArray = [];
      }

      let deliveryType = 'INSTANT_KEY';
      if (prod.deliveryType === 'ACCOUNT_INVITE') {
        deliveryType = 'ACCOUNT_INVITE';
      } else if (prod.deliveryType === 'MANUAL_DELIVERY') {
        deliveryType = 'MANUAL_DELIVERY';
      } else if (prod.deliveryType === 'PHYSICAL_GOOD') {
        deliveryType = 'PHYSICAL_GOOD';
      }

      await client.query(
        `
        INSERT INTO products (
          id, category_id, title, slug, sku, brand, summary, description,
          thumbnail_url, gallery_urls, status, delivery_type, is_featured,
          is_flash_sale, rating, review_count, sort_order, tags, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20
        )
      `,
        [
          prod.id,
          prod.categoryId,
          prod.title,
          prod.slug,
          prod.sku,
          prod.brand,
          prod.summary,
          prod.description,
          prod.image,
          [prod.image],
          prod.status,
          deliveryType,
          prod.isFeatured,
          prod.isFlashSale,
          prod.rating,
          prod.reviewCount,
          prod.sortOrder,
          tagsArray,
          prod.createdAt,
          prod.updatedAt,
        ]
      );
    }

    // 5. Insert Variants
    console.log(`Syncing ${variants.length} product variants...`);
    for (const v of variants) {
      const priceCents = BigInt(Math.round(v.price * 100));
      const comparePriceCents = v.originalPrice ? BigInt(Math.round(v.originalPrice * 100)) : null;

      await client.query(
        `
        INSERT INTO product_variants (
          id, product_id, name, sku, price_cents, compare_at_price_cents,
          validity_period, is_default, stock_quantity, sort_order, is_active,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13
        )
      `,
        [
          v.id,
          v.productId,
          v.name,
          v.sku,
          priceCents.toString(),
          comparePriceCents ? comparePriceCents.toString() : null,
          v.validity || 'Lifetime',
          v.isDefault,
          v.stock || 0,
          0,
          true,
          v.createdAt,
          v.updatedAt,
        ]
      );
    }

    // 6. Insert License Keys
    console.log(`Syncing ${licenseKeys.length} license keys...`);
    for (const k of licenseKeys) {
      await client.query(
        `
        INSERT INTO license_keys (
          id, variant_id, key_code, status, order_id, order_item_id, sold_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `,
        [
          k.id,
          k.variantId,
          k.keyCode,
          k.status,
          null,
          null,
          k.soldAt,
          k.createdAt,
          k.createdAt,
        ]
      );
    }

    // 7. Sync Coupons
    console.log(`Syncing ${coupons.length} coupons...`);
    for (const c of coupons) {
      const discountPercent = c.discountPercent ? c.discountPercent.toString() : null;
      const discountCents = c.discountAmount ? BigInt(Math.round(c.discountAmount * 100)).toString() : null;
      const minSpendCents = c.minSpend ? BigInt(Math.round(c.minSpend * 100)).toString() : '0';

      await client.query(
        `
        INSERT INTO coupons (
          code, discount_percent, discount_cents, min_spend_cents, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (code) DO UPDATE SET
          discount_percent = EXCLUDED.discount_percent,
          discount_cents = EXCLUDED.discount_cents,
          min_spend_cents = EXCLUDED.min_spend_cents,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `,
        [
          c.code,
          discountPercent,
          discountCents,
          minSpendCents,
          c.isActive,
          c.createdAt,
          new Date(),
        ]
      );
    }

    // 8. Sync Orders, OrderItems, Payments
    console.log(`Syncing ${orders.length} orders, items, and payments...`);
    for (const o of orders) {
      const totalCents = BigInt(Math.round(o.totalAmount * 100));
      const discountCents = BigInt(Math.round((o.discountAmount || 0) * 100));
      const subtotalCents = totalCents + discountCents;

      let orderStatus = 'PENDING_PAYMENT';
      if (['COMPLETED', 'PAYMENT_SUBMITTED', 'PAID', 'PROCESSING', 'CANCELLED', 'REFUNDED'].includes(o.orderStatus)) {
        orderStatus = o.orderStatus;
      }

      await client.query(
        `
        INSERT INTO public.orders (
          id, order_number, customer_id, customer_name, customer_email, customer_phone,
          order_status, subtotal_cents, discount_cents, total_cents, coupon_code, currency,
          customer_notes, admin_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `,
        [
          o.id,
          o.orderNumber,
          null,
          o.customerName,
          o.customerEmail,
          o.customerPhone,
          orderStatus,
          subtotalCents.toString(),
          discountCents.toString(),
          totalCents.toString(),
          o.couponCode || null,
          'BDT',
          o.notes || null,
          o.deliveredKeys ? `Keys: ${o.deliveredKeys}` : null,
          o.createdAt,
          o.updatedAt,
        ]
      );

      for (const item of o.items) {
        const unitPriceCents = BigInt(Math.round(item.unitPrice * 100));
        const lineTotalCents = unitPriceCents * BigInt(item.quantity);

        await client.query(
          `
          INSERT INTO public.order_items (
            id, order_id, product_id, variant_id, product_name, variant_name,
            unit_price_cents, quantity, line_total_cents, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `,
          [
            item.id,
            o.id,
            null,
            item.variantId || null,
            item.productName || 'Software License',
            item.variantName || '1 PC License',
            unitPriceCents.toString(),
            item.quantity,
            lineTotalCents.toString(),
            o.createdAt,
          ]
        );
      }

      for (const p of o.payments) {
        let pMethod = 'BKASH_ONLINE';
        if (
          [
            'BKASH_ONLINE',
            'BKASH_MANUAL',
            'NAGAD_MANUAL',
            'ROCKET_MANUAL',
            'BANK_TRANSFER',
            'WALLET_CREDIT',
          ].includes(p.paymentMethod)
        ) {
          pMethod = p.paymentMethod;
        }

        let pStatus = 'PENDING';
        if (['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'].includes(p.paymentStatus)) {
          pStatus = p.paymentStatus;
        }

        const amtCents = BigInt(Math.round(p.amount * 100));

        await client.query(
          `
          INSERT INTO public.payments (
            id, order_id, payment_method, payment_status, amount_cents, currency,
            transaction_id, sender_phone, verified_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
        `,
          [
            p.id,
            o.id,
            pMethod,
            pStatus,
            amtCents.toString(),
            'BDT',
            p.transactionId || null,
            p.senderPhone || null,
            p.verifiedAt || null,
            p.createdAt,
            p.updatedAt,
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Sync successfully completed! All catalog, user, order, and payment data is live in Supabase.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Sync failed, changes rolled back:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
    await prisma.$disconnect();
  }
}

main().catch(console.error);
