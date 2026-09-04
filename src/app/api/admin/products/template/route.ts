import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function escapeCsv(val: string): string {
  return `"${val.replace(/"/g, '""')}"`;
}

export async function GET() {
  const headers = [
    'slug',
    'title',
    'brand',
    'category_name',
    'price',
    'original_price',
    'validity',
    'license_type',
    'stock',
    'is_featured',
    'is_flash_sale',
    'delivery_type',
    'image',
    'summary',
    'description',
    'tags',
    'variants_json',
  ];

  const sampleRows = [
    [
      escapeCsv('windows-11-pro-retail-sample'),
      escapeCsv('Windows 11 Pro Retail License Key'),
      escapeCsv('Microsoft'),
      escapeCsv('Windows OS'),
      escapeCsv('999'),
      escapeCsv('1800'),
      escapeCsv('Lifetime'),
      escapeCsv('LICENSE_KEY'),
      escapeCsv('10'),
      escapeCsv('true'),
      escapeCsv('true'),
      escapeCsv('INSTANT_AUTO'),
      escapeCsv('https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000'),
      escapeCsv('Genuine 25-digit retail product key for Windows 11 Pro.'),
      escapeCsv('### Activation Guide\n1. Open Settings > Activation\n2. Enter key'),
      escapeCsv('windows 11, retail key, lifetime'),
      escapeCsv('[{"name":"1 PC - Retail Lifetime","price":999,"originalPrice":1800,"validity":"Lifetime","licenseType":"LICENSE_KEY","stock":10},{"name":"2 PC Bundle - Retail Lifetime","price":1799,"originalPrice":3200,"validity":"Lifetime","licenseType":"LICENSE_KEY","stock":5}]'),
    ],
    [
      escapeCsv('idm-lifetime-sample'),
      escapeCsv('Internet Download Manager (IDM) 1 PC Lifetime'),
      escapeCsv('Tonec IDM'),
      escapeCsv('Utility & Tools'),
      escapeCsv('1899'),
      escapeCsv('2800'),
      escapeCsv('Lifetime'),
      escapeCsv('LICENSE_KEY'),
      escapeCsv('15'),
      escapeCsv('true'),
      escapeCsv('false'),
      escapeCsv('INSTANT_AUTO'),
      escapeCsv('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000'),
      escapeCsv('100% Genuine official IDM license key for 1 PC.'),
      escapeCsv('### Activation Steps\n1. Download IDM\n2. Enter serial'),
      escapeCsv('idm, download manager, lifetime'),
      escapeCsv('[{"name":"1 PC - Official Lifetime","price":1899,"originalPrice":2800,"validity":"Lifetime","licenseType":"LICENSE_KEY","stock":15}]'),
    ],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="product-import-template.csv"',
    },
  });
}

