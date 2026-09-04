import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { formatImageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function parseRFC4180Csv(text: string): string[][] {
  let content = text;
  // Remove UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawContent = '';
    let updateExisting = true;
    let fileName = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      fileName = file.name || '';
      updateExisting = formData.get('updateExisting') !== 'false';
      rawContent = await file.text();
    } else {
      const body = await request.json();
      rawContent = body.fileData || body.content || '';
      updateExisting = body.updateExisting !== false;
      fileName = body.fileName || '';
    }

    if (!rawContent || !rawContent.trim()) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }

    const isJson =
      fileName.endsWith('.json') ||
      rawContent.trim().startsWith('[') ||
      rawContent.trim().startsWith('{');

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const notices: string[] = [];

    // -------------------------------------------------------------
    // Helper to resolve or create category
    // -------------------------------------------------------------
    const resolveCategory = async (catNameOrSlug: string) => {
      const trimmed = (catNameOrSlug || '').trim();
      if (!trimmed) {
        let def = await prisma.category.findFirst({ where: { slug: 'utility' } });
        if (!def) {
          def = await prisma.category.create({
            data: { name: 'General Software', slug: 'general-software', icon: 'Monitor' },
          });
        }
        return def;
      }

      const cleanSlug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let cat = await prisma.category.findFirst({
        where: {
          OR: [{ slug: cleanSlug }, { name: { equals: trimmed } }],
        },
      });

      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: trimmed,
            slug: cleanSlug,
            icon: 'Monitor',
            description: `${trimmed} category software`,
          },
        });
      }
      return cat;
    };

    // -------------------------------------------------------------
    // 1. JSON Processing Mode
    // -------------------------------------------------------------
    if (isJson) {
      let parsedData: any[] = [];
      try {
        const parsed = JSON.parse(rawContent);
        parsedData = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err: any) {
        return NextResponse.json(
          { error: `Invalid JSON syntax: ${err.message}` },
          { status: 400 }
        );
      }

      for (const item of parsedData) {
        processedCount++;
        const title = item.title || item.name;
        if (!title) {
          notices.push(`Row ${processedCount}: Skipped due to missing product title`);
          skippedCount++;
          continue;
        }

        const slug =
          item.slug ||
          title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const category = await resolveCategory(
          item.category_slug || item.category_name || item.category?.name || item.category?.slug || ''
        );

        const existing = await prisma.product.findFirst({
          where: {
            OR: [
              ...(item.id ? [{ id: item.id }] : []),
              { slug },
            ],
          },
          include: { variants: true },
        });

        const productPayload = {
          title,
          slug,
          brand: item.brand || 'Microsoft',
          categoryId: category.id,
          summary: item.summary || item.shortDescription || '',
          description: item.description || item.descriptionHtml || `${title} genuine activation license.`,
          image: formatImageUrl(item.image || item.imageUrl),
          status: item.status || 'ACTIVE',
          sortOrder: Number(item.sortOrder || item.sort_order || 0),
          deliveryType: item.deliveryType || item.delivery_type || 'INSTANT_AUTO',
          isFeatured: Boolean(item.isFeatured || item.is_featured),
          isFlashSale: Boolean(item.isFlashSale || item.is_flash_sale),
          tags: typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags || []),
        };

        const incomingVariants = Array.isArray(item.variants)
          ? item.variants
          : item.variants_json
          ? JSON.parse(item.variants_json)
          : [
              {
                name: 'Standard Edition',
                price: Number(item.price || 999),
                originalPrice: item.originalPrice || item.original_price ? Number(item.originalPrice || item.original_price) : null,
                validity: item.validity || 'Lifetime',
                licenseType: item.licenseType || item.license_type || 'LICENSE_KEY',
                stock: Number(item.stock || 10),
              },
            ];

        if (existing) {
          if (!updateExisting) {
            skippedCount++;
            notices.push(`"${title}" exists and updateExisting is false. Skipped.`);
            continue;
          }

          // Update existing product
          await prisma.product.update({
            where: { id: existing.id },
            data: productPayload,
          });

          // Sync variants
          for (const v of incomingVariants) {
            const vName = v.name || 'Standard Edition';
            const matchedVariant = existing.variants.find((ev) => ev.name.toLowerCase() === vName.toLowerCase());

            if (matchedVariant) {
              await prisma.productVariant.update({
                where: { id: matchedVariant.id },
                data: {
                  price: Number(v.price || 999),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || 'Lifetime',
                  licenseType: v.licenseType || 'LICENSE_KEY',
                  stock: v.stock !== undefined ? Number(v.stock) : matchedVariant.stock,
                },
              });
            } else {
              await prisma.productVariant.create({
                data: {
                  productId: existing.id,
                  name: vName,
                  price: Number(v.price || 999),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || 'Lifetime',
                  licenseType: v.licenseType || 'LICENSE_KEY',
                  stock: Number(v.stock || 10),
                },
              });
            }
          }
          updatedCount++;
        } else {
          // Create new product with variants
          const created = await prisma.product.create({
            data: {
              ...productPayload,
              variants: {
                create: incomingVariants.map((v: any) => ({
                  name: v.name || 'Standard Edition',
                  price: Number(v.price || 999),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || 'Lifetime',
                  licenseType: v.licenseType || 'LICENSE_KEY',
                  stock: Number(v.stock || 10),
                })),
              },
            },
          });
          createdCount++;
        }
      }
    } else {
      // -------------------------------------------------------------
      // 2. CSV Processing Mode (RFC-4180)
      // -------------------------------------------------------------
      const rows = parseRFC4180Csv(rawContent);
      if (rows.length < 2) {
        return NextResponse.json(
          { error: 'CSV file must have at least a header row and one data row' },
          { status: 400 }
        );
      }

      const rawHeaders = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));
      const colMap: Record<string, number> = {};
      rawHeaders.forEach((h, idx) => {
        colMap[h] = idx;
      });

      const getCol = (row: string[], colNames: string[]): string => {
        for (const name of colNames) {
          const idx = colMap[name];
          if (idx !== undefined && row[idx] !== undefined) {
            return row[idx].trim();
          }
        }
        return '';
      };

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row.length === 0 || (row.length === 1 && !row[0].trim())) {
          continue; // empty row
        }

        processedCount++;

        const id = getCol(row, ['id']);
        const title = getCol(row, ['title', 'name', 'product_title', 'product_name']);
        if (!title) {
          notices.push(`Row ${r + 1}: Skipped due to missing product title`);
          skippedCount++;
          continue;
        }

        const customSlug = getCol(row, ['slug', 'url_slug']);
        const slug = customSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const brand = getCol(row, ['brand', 'developer', 'vendor']) || 'Microsoft';
        const categoryName = getCol(row, ['category_name', 'category', 'category_slug']);
        const price = Number(getCol(row, ['price', 'selling_price']) || 999);
        const originalPriceStr = getCol(row, ['original_price', 'compare_price', 'strike_price']);
        const originalPrice = originalPriceStr ? Number(originalPriceStr) : null;
        const validity = getCol(row, ['validity']) || 'Lifetime';
        const licenseType = getCol(row, ['license_type', 'delivery_type']) || 'LICENSE_KEY';
        const stock = Number(getCol(row, ['stock', 'quantity', 'keys_count']) || 10);
        const isFeatured = getCol(row, ['is_featured', 'featured']).toLowerCase() === 'true';
        const isFlashSale = getCol(row, ['is_flash_sale', 'flash_deal', 'flash_sale']).toLowerCase() === 'true';
        const image = formatImageUrl(getCol(row, ['image', 'image_url', 'thumbnail']));
        const summary = getCol(row, ['summary', 'short_description']);
        const description = getCol(row, ['description', 'description_html', 'details']) || `${title} genuine activation license with instant delivery.`;
        const tags = getCol(row, ['tags']) || JSON.stringify(['software', 'genuine']);
        const variantsJson = getCol(row, ['variants_json', 'variants']);

        const category = await resolveCategory(categoryName);

        let parsedVariants: any[] = [];
        if (variantsJson) {
          try {
            parsedVariants = JSON.parse(variantsJson);
          } catch {
            parsedVariants = [];
          }
        }

        if (parsedVariants.length === 0) {
          parsedVariants = [
            {
              name: 'Standard Retail License',
              price,
              originalPrice,
              validity,
              licenseType,
              stock,
            },
          ];
        }

        const existing = await prisma.product.findFirst({
          where: {
            OR: [
              ...(id ? [{ id }] : []),
              { slug },
            ],
          },
          include: { variants: true },
        });

        const productPayload = {
          title,
          slug,
          brand,
          categoryId: category.id,
          summary,
          description,
          image,
          status: 'ACTIVE',
          deliveryType: licenseType === 'ACCOUNT_INVITE' ? 'ACCOUNT_INVITE' : 'INSTANT_AUTO',
          isFeatured,
          isFlashSale,
          tags: tags.startsWith('[') ? tags : JSON.stringify(tags.split(',').map((t) => t.trim())),
        };

        if (existing) {
          if (!updateExisting) {
            skippedCount++;
            notices.push(`"${title}" already exists and updateExisting is unchecked. Skipped.`);
            continue;
          }

          // Update product
          await prisma.product.update({
            where: { id: existing.id },
            data: productPayload,
          });

          // Sync variants
          for (const v of parsedVariants) {
            const vName = v.name || 'Standard Retail License';
            const matched = existing.variants.find((ev) => ev.name.toLowerCase() === vName.toLowerCase());

            if (matched) {
              await prisma.productVariant.update({
                where: { id: matched.id },
                data: {
                  price: Number(v.price || price),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || validity,
                  licenseType: v.licenseType || licenseType,
                  stock: v.stock !== undefined ? Number(v.stock) : matched.stock,
                },
              });
            } else {
              await prisma.productVariant.create({
                data: {
                  productId: existing.id,
                  name: vName,
                  price: Number(v.price || price),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || validity,
                  licenseType: v.licenseType || licenseType,
                  stock: Number(v.stock || stock),
                },
              });
            }
          }
          updatedCount++;
        } else {
          // Create product
          await prisma.product.create({
            data: {
              ...productPayload,
              variants: {
                create: parsedVariants.map((v: any) => ({
                  name: v.name || 'Standard Retail License',
                  price: Number(v.price || price),
                  originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                  validity: v.validity || validity,
                  licenseType: v.licenseType || licenseType,
                  stock: Number(v.stock || stock),
                })),
              },
            },
          });
          createdCount++;
        }
      }
    }

    // Revalidate paths so changes appear instantly on frontend & admin
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/products');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      notices,
    });
  } catch (error: any) {
    console.error('Product import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}

