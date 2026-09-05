import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            _count: {
              select: {
                licenseKeys: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }
    if (!['OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      summary,
      description,
      categoryId,
      newCategoryName,
      brand,
      image,
      isFeatured = false,
      isFlashSale = false,
      deliveryType = 'INSTANT_AUTO',
      tags = [],
      variants = [],
    } = body;

    if (!title || !description || !brand || !image) {
      return NextResponse.json(
        { error: 'Title, description, brand, and image are required.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = (customSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Handle Category: existing or create new
    let targetCategoryId = categoryId;
    if (newCategoryName && newCategoryName.trim()) {
      const catSlug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newCat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: newCategoryName.trim(),
          slug: catSlug,
          icon: 'Layers',
        },
      });
      targetCategoryId = newCat.id;
    }

    if (!targetCategoryId) {
      // Default to first category if none specified
      const firstCat = await prisma.category.findFirst();
      if (firstCat) {
        targetCategoryId = firstCat.id;
      } else {
        const defaultCat = await prisma.category.create({
          data: {
            name: 'General Software',
            slug: 'general',
            icon: 'Monitor',
          },
        });
        targetCategoryId = defaultCat.id;
      }
    }

    // Atomic transaction: Create Product + Variants + Initial License Keys
    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title,
          slug: uniqueSlug,
          summary: summary || null,
          description,
          categoryId: targetCategoryId,
          brand,
          image,
          isFeatured: Boolean(isFeatured),
          isFlashSale: Boolean(isFlashSale),
          deliveryType,
          tags: JSON.stringify(Array.isArray(tags) ? tags : [tags]),
        },
      });

      // Add Variants
      const variantList =
        variants && variants.length > 0
          ? variants
          : [
              {
                name: 'Standard Lifetime License',
                price: 999,
                originalPrice: 1500,
                validity: 'Lifetime',
                licenseType: 'LICENSE_KEY',
                initialKeys: '',
              },
            ];

      for (const v of variantList) {
        // Parse initial keys if provided
        const rawKeys = v.initialKeys || '';
        const keyList = rawKeys
          .split('\n')
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);

        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            name: v.name || 'Standard License',
            price: parseFloat(v.price) || 999,
            originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
            validity: v.validity || 'Lifetime',
            licenseType: v.licenseType || 'LICENSE_KEY',
            stock: keyList.length,
          },
        });

        // Insert initial license keys
        for (const keyCode of keyList) {
          await tx.licenseKey.create({
            data: {
              variantId: variant.id,
              keyCode,
              status: 'AVAILABLE',
            },
          });
        }
      }

      return product;
    });

    return NextResponse.json({
      success: true,
      product: createdProduct,
      slug: createdProduct.slug,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }
    if (!['OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

