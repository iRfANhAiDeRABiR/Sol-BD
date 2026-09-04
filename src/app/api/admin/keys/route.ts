import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true,
        _count: {
          select: {
            licenseKeys: true,
          },
        },
      },
    });

    const keyStats = await Promise.all(
      variants.map(async (v) => {
        const available = await prisma.licenseKey.count({
          where: { variantId: v.id, status: 'AVAILABLE' },
        });
        const sold = await prisma.licenseKey.count({
          where: { variantId: v.id, status: 'SOLD' },
        });
        return {
          variantId: v.id,
          variantName: v.name,
          productTitle: v.product.title,
          price: v.price,
          stock: v.stock,
          availableKeys: available,
          soldKeys: sold,
        };
      })
    );

    return NextResponse.json({ keyStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { variantId, rawKeys } = await request.json();

    if (!variantId || !rawKeys) {
      return NextResponse.json(
        { error: 'variantId and rawKeys are required.' },
        { status: 400 }
      );
    }

    // Split raw keys by newlines and filter empties
    const keyList = rawKeys
      .split('\n')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);

    if (keyList.length === 0) {
      return NextResponse.json({ error: 'No valid keys provided.' }, { status: 400 });
    }

    let insertedCount = 0;
    for (const key of keyList) {
      await prisma.licenseKey.create({
        data: {
          variantId,
          keyCode: key,
          status: 'AVAILABLE',
        },
      });
      insertedCount++;
    }

    // Update variant stock count
    const totalAvailable = await prisma.licenseKey.count({
      where: { variantId, status: 'AVAILABLE' },
    });

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: totalAvailable },
    });

    return NextResponse.json({
      success: true,
      insertedCount,
      totalAvailable,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

