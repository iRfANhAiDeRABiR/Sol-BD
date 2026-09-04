import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, quote, or newline, escape quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            validity: true,
            licenseType: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const timestamp = new Date().toISOString().split('T')[0];

    // 1. JSON Export
    if (format === 'json') {
      const jsonContent = JSON.stringify(products, null, 2);
      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="solutionsbd-products-export-${timestamp}.json"`,
        },
      });
    }

    // 2. CSV Export with UTF-8 BOM for Excel / Google Sheets compatibility
    const headers = [
      'id',
      'slug',
      'title',
      'brand',
      'category_name',
      'category_slug',
      'price',
      'original_price',
      'status',
      'sort_order',
      'is_featured',
      'is_flash_sale',
      'delivery_type',
      'image',
      'summary',
      'description',
      'tags',
      'variants_json',
    ];

    const rows = products.map((p) => {
      const defaultVariant = p.variants[0];
      const variantsRepresentation = JSON.stringify(
        p.variants.map((v) => ({
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          validity: v.validity,
          licenseType: v.licenseType,
          stock: v.stock,
        }))
      );

      return [
        escapeCsvValue(p.id),
        escapeCsvValue(p.slug),
        escapeCsvValue(p.title),
        escapeCsvValue(p.brand),
        escapeCsvValue(p.category?.name || ''),
        escapeCsvValue(p.category?.slug || ''),
        escapeCsvValue(defaultVariant?.price ?? 0),
        escapeCsvValue(defaultVariant?.originalPrice ?? ''),
        escapeCsvValue(p.status),
        escapeCsvValue(p.sortOrder ?? 0),
        escapeCsvValue(p.isFeatured ? 'true' : 'false'),
        escapeCsvValue(p.isFlashSale ? 'true' : 'false'),
        escapeCsvValue(p.deliveryType),
        escapeCsvValue(p.image),
        escapeCsvValue(p.summary || ''),
        escapeCsvValue(p.description || ''),
        escapeCsvValue(p.tags || '[]'),
        escapeCsvValue(variantsRepresentation),
      ].join(',');
    });

    // \uFEFF is the UTF-8 Byte Order Mark (BOM)
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="solutionsbd-products-export-${timestamp}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export products' },
      { status: 500 }
    );
  }
}

