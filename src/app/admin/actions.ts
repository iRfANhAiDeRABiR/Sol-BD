'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminSession, setAdminSession, clearAdminSession, AdminRole } from '@/lib/admin-auth';
import { verifyPassword } from '@/lib/customer-auth';
import { syncUserSuspensionToSupabase } from '@/lib/sync-user-supabase';

// -------------------------------------------------------------
// 1. Admin Authentication Server Actions
// -------------------------------------------------------------

export async function loginAdminAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.password) {
      return { error: 'Invalid admin credentials. Please check and retry.' };
    }

    const isDirectMatch = user.password === password;
    const isHashMatch = user.password.includes(':') ? verifyPassword(password, user.password) : false;

    if (!isDirectMatch && !isHashMatch) {
      return { error: 'Invalid admin credentials. Please check and retry.' };
    }

    if ((user as any).isActive === false) {
      return { error: 'Access denied: This administrative account has been suspended.' };
    }

    if (!['OWNER', 'ADMIN', 'SUPPORT'].includes(user.role)) {
      return { error: 'Access denied: User does not possess administrative privileges.' };
    }

    await setAdminSession({
      id: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role as AdminRole,
    });
  } catch (err: any) {
    console.error('Login action error:', err);
    return { error: err.message || 'Authentication failed.' };
  }

  redirect('/admin');
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect('/admin/login');
}

// -------------------------------------------------------------
// 2. Order Management Server Actions
// -------------------------------------------------------------

export async function updateOrderStatus(orderId: string, newStatus: string, adminNotes?: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized. Please login.' };
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return { error: 'Order not found.' };
    }

    // If transitioning to COMPLETED and keys not allocated yet
    if (newStatus === 'COMPLETED' && existingOrder.orderStatus !== 'COMPLETED') {
      const allocatedKeysList: Array<{ variantName: string; keyCode: string }> = [];

      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          if (!item.variantId) continue;

          const availableKeys = await tx.licenseKey.findMany({
            where: {
              variantId: item.variantId,
              status: 'AVAILABLE',
            },
            take: item.quantity,
          });

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          for (const k of availableKeys) {
            await tx.licenseKey.update({
              where: { id: k.id },
              data: {
                status: 'SOLD',
                orderId: existingOrder.id,
                soldAt: new Date(),
              },
            });

            allocatedKeysList.push({
              variantName: `${variant?.product.title || ''} (${variant?.name || ''})`.trim(),
              keyCode: k.keyCode,
            });
          }

          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: Math.max(0, variant.stock - availableKeys.length),
              },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            orderStatus: 'COMPLETED',
            paymentStatus: 'PAID',
            notes: adminNotes !== undefined ? adminNotes : existingOrder.notes,
            deliveredKeys:
              allocatedKeysList.length > 0
                ? JSON.stringify(allocatedKeysList)
                : existingOrder.deliveredKeys,
          },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus,
          notes: adminNotes !== undefined ? adminNotes : existingOrder.notes,
          paymentStatus:
            newStatus === 'CANCELLED' ? 'FAILED' : newStatus === 'PAID' ? 'PAID' : existingOrder.paymentStatus,
        },
      });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Update order status error:', err);
    return { error: err.message || 'Failed to update order status.' };
  }
}

// -------------------------------------------------------------
// 3. Payment Verification Server Action (MFS TrxID Review)
// -------------------------------------------------------------

export async function verifyPayment(
  paymentId: string,
  decision: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized. Please login.' };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    if (!payment) {
      return { error: 'Payment record not found.' };
    }

    const order = payment.order;

    if (decision === 'VERIFIED') {
      const allocatedKeysList: Array<{ variantName: string; keyCode: string }> = [];

      await prisma.$transaction(async (tx) => {
        // 1. Update Payment
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: 'VERIFIED',
            verifiedById: session.id,
            verifiedAt: new Date(),
            rejectionReason: null,
          },
        });

        // 2. Allocate License Keys for each item
        for (const item of order.items) {
          if (!item.variantId) continue;

          const availableKeys = await tx.licenseKey.findMany({
            where: {
              variantId: item.variantId,
              status: 'AVAILABLE',
            },
            take: item.quantity,
          });

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          for (const k of availableKeys) {
            await tx.licenseKey.update({
              where: { id: k.id },
              data: {
                status: 'SOLD',
                orderId: order.id,
                soldAt: new Date(),
              },
            });

            allocatedKeysList.push({
              variantName: `${variant?.product.title || ''} (${variant?.name || ''})`.trim(),
              keyCode: k.keyCode,
            });
          }

          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: Math.max(0, variant.stock - availableKeys.length),
              },
            });
          }
        }

        // 3. Complete Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'COMPLETED',
            deliveredKeys:
              allocatedKeysList.length > 0
                ? JSON.stringify(allocatedKeysList)
                : order.deliveredKeys,
          },
        });
      });
    } else {
      // Rejection
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: 'REJECTED',
            verifiedById: session.id,
            verifiedAt: new Date(),
            rejectionReason: rejectionReason || 'TrxID mismatch or payment not received.',
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
            orderStatus: 'CANCELLED',
          },
        }),
      ]);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/payments');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${order.id}`);
    return { success: true };
  } catch (err: any) {
    console.error('Verify payment error:', err);
    return { error: err.message || 'Payment verification failed.' };
  }
}

// -------------------------------------------------------------
// 4. Product Catalog Server Actions
// -------------------------------------------------------------

export async function createProductAction(data: {
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  summary: string;
  description: string;
  image: string;
  deliveryType: string;
  sortOrder?: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  tags: string;
  variants: Array<{
    name: string;
    price: number;
    originalPrice?: number;
    validity: string;
    licenseType: string;
    initialKeys?: string;
  }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand: data.brand,
          categoryId: data.categoryId,
          summary: data.summary,
          description: data.description,
          image: data.image,
          deliveryType: data.deliveryType,
          sortOrder: Number(data.sortOrder || 0),
          isFeatured: Boolean(data.isFeatured),
          isFlashSale: Boolean(data.isFlashSale),
          tags: JSON.stringify(data.tags.split(',').map((t) => t.trim())),
        },
      });

      for (const v of data.variants) {
        const rawKeys = v.initialKeys
          ? v.initialKeys
              .split('\n')
              .map((k) => k.trim())
              .filter(Boolean)
          : [];

        const createdVariant = await tx.productVariant.create({
          data: {
            productId: created.id,
            name: v.name,
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
            validity: v.validity || 'Lifetime',
            licenseType: v.licenseType || 'LICENSE_KEY',
            stock: rawKeys.length,
          },
        });

        for (const keyCode of rawKeys) {
          await tx.licenseKey.create({
            data: {
              variantId: createdVariant.id,
              keyCode,
              status: 'AVAILABLE',
            },
          });
        }
      }

      return created;
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true, product };
  } catch (err: any) {
    console.error('Create product error:', err);
    return { error: err.message || 'Failed to create product.' };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true };
  } catch (err: any) {
    console.error('Delete product error:', err);
    return { error: err.message || 'Failed to delete product.' };
  }
}

export async function updateProductSortOrderAction(productId: string, sortOrder: number) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { sortOrder: Number(sortOrder || 0) },
      select: { id: true, title: true, sortOrder: true },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true, product: updated };
  } catch (err: any) {
    console.error('Update product sort order error:', err);
    return { error: err.message || 'Failed to update sort order.' };
  }
}

export async function updateProductAction(data: {
  id: string;
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  summary: string;
  description: string;
  image: string;
  deliveryType: string;
  status: string;
  sortOrder?: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  tags: string;
  variants: Array<{
    id?: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    validity: string;
    licenseType: string;
    stock?: number;
    initialKeys?: string;
  }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: data.id },
      include: { variants: true },
    });

    if (!existing) {
      return { error: 'Product not found.' };
    }

    // Slug conflict check (ensure slug is not taken by another product)
    const slugCheck = await prisma.product.findFirst({
      where: {
        slug: data.slug,
        id: { not: data.id },
      },
    });
    if (slugCheck) {
      return { error: `Slug "${data.slug}" is already in use by another product.` };
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Product details
      let formattedTags: string;
      try {
        if (typeof data.tags === 'string') {
          formattedTags = JSON.stringify(
            data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          );
        } else {
          formattedTags = JSON.stringify(data.tags);
        }
      } catch {
        formattedTags = '[]';
      }

      const prod = await tx.product.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand: data.brand,
          categoryId: data.categoryId,
          summary: data.summary,
          description: data.description,
          image: data.image,
          deliveryType: data.deliveryType,
          status: data.status || 'ACTIVE',
          sortOrder: Number(data.sortOrder || 0),
          isFeatured: Boolean(data.isFeatured),
          isFlashSale: Boolean(data.isFlashSale),
          tags: formattedTags,
        },
      });

      // 2. Handle Variants
      const incomingVariantIds = data.variants.map((v) => v.id).filter(Boolean) as string[];

      // Clean up deleted variants if they are not bound to orders
      for (const existingVar of existing.variants) {
        if (!incomingVariantIds.includes(existingVar.id)) {
          const orderItemsCount = await tx.orderItem.count({
            where: { variantId: existingVar.id },
          });
          if (orderItemsCount === 0) {
            await tx.licenseKey.deleteMany({
              where: { variantId: existingVar.id },
            });
            await tx.productVariant.delete({
              where: { id: existingVar.id },
            });
          }
        }
      }

      // Upsert/update variants
      for (const v of data.variants) {
        let variantId = v.id;
        const newKeys = v.initialKeys
          ? v.initialKeys
              .split('\n')
              .map((k) => k.trim())
              .filter(Boolean)
          : [];

        if (variantId && existing.variants.some((ev) => ev.id === variantId)) {
          // Update existing variant
          await tx.productVariant.update({
            where: { id: variantId },
            data: {
              name: v.name,
              price: Number(v.price),
              originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
              validity: v.validity || 'Lifetime',
              licenseType: v.licenseType || 'LICENSE_KEY',
              stock: v.stock !== undefined ? Number(v.stock) + newKeys.length : undefined,
            },
          });
        } else {
          // Create new variant
          const createdVar = await tx.productVariant.create({
            data: {
              productId: prod.id,
              name: v.name,
              price: Number(v.price),
              originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
              validity: v.validity || 'Lifetime',
              licenseType: v.licenseType || 'LICENSE_KEY',
              stock: newKeys.length,
            },
          });
          variantId = createdVar.id;
        }

        // If new keys provided, insert into available pool
        if (newKeys.length > 0 && variantId) {
          for (const keyCode of newKeys) {
            await tx.licenseKey.create({
              data: {
                variantId,
                keyCode,
                status: 'AVAILABLE',
              },
            });
          }
          const availableCount = await tx.licenseKey.count({
            where: { variantId, status: 'AVAILABLE' },
          });
          await tx.productVariant.update({
            where: { id: variantId },
            data: { stock: availableCount },
          });
        }
      }

      return prod;
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${data.id}`);
    revalidatePath('/shop');
    revalidatePath(`/product/${updated.slug}`);
    revalidatePath('/');
    return { success: true, product: updated };
  } catch (err: any) {
    console.error('Update product error:', err);
    return { error: err.message || 'Failed to update product.' };
  }
}

// -------------------------------------------------------------
// 5. License Key Pool Management
// -------------------------------------------------------------

export async function uploadLicenseKeys(variantId: string, rawKeysText: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  const keys = rawKeysText
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    return { error: 'No valid keys provided.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const keyCode of keys) {
        await tx.licenseKey.create({
          data: {
            variantId,
            keyCode,
            status: 'AVAILABLE',
          },
        });
      }

      const availableCount = await tx.licenseKey.count({
        where: { variantId, status: 'AVAILABLE' },
      });

      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: availableCount },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    return { success: true, count: keys.length };
  } catch (err: any) {
    console.error('Upload keys error:', err);
    return { error: err.message || 'Failed to upload keys.' };
  }
}

// -------------------------------------------------------------
// 6. Category Management
// -------------------------------------------------------------

export async function createCategoryAction(data: {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  try {
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: data.icon || 'Monitor',
        description: data.description || '',
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    return { success: true, category: cat };
  } catch (err: any) {
    console.error('Create category error:', err);
    return { error: err.message || 'Failed to create category.' };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  try {
    const productsCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productsCount > 0) {
      return {
        error: `Cannot delete category: ${productsCount} products are assigned to it. Please reassign or delete those products first.`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: any) {
    console.error('Delete category error:', err);
    return { error: err.message || 'Failed to delete category.' };
  }
}

export async function updateCategoryAction(data: {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  try {
    const existing = await prisma.category.findUnique({
      where: { id: data.id },
    });
    if (!existing) return { error: 'Category not found.' };

    const slugCheck = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        id: { not: data.id },
      },
    });
    if (slugCheck) {
      return { error: `Slug "${data.slug}" is already in use by another category.` };
    }

    const updated = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: data.icon || existing.icon,
        description: data.description !== undefined ? data.description : existing.description,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : existing.sortOrder,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true, category: updated };
  } catch (err: any) {
    console.error('Update category error:', err);
    return { error: err.message || 'Failed to update category.' };
  }
}

// -------------------------------------------------------------
// 7. Subscriber CRM Action
// -------------------------------------------------------------

export async function toggleSubscriberAction(subscriberId: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized.' };

  try {
    const sub = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    });

    if (!sub) return { error: 'Subscriber not found.' };

    await prisma.subscriber.update({
      where: { id: subscriberId },
      data: { isActive: !sub.isActive },
    });

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to toggle subscriber.' };
  }
}

// -------------------------------------------------------------
// 8. User Control & Suspension Server Actions
// -------------------------------------------------------------

export async function toggleUserSuspensionAction(userId: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized. Admin session required.' };

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) return { error: 'User record not found.' };

    if (targetUser.id === session.id) {
      return { error: 'You cannot suspend your own administrative account.' };
    }

    if (targetUser.role === 'OWNER') {
      return { error: 'Security restriction: The OWNER account cannot be suspended.' };
    }

    const nextState = !(targetUser as any).isActive;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: nextState } as any,
    });

    // Asynchronously update Supabase in background
    syncUserSuspensionToSupabase(targetUser.email, nextState).catch(() => {});

    revalidatePath('/admin/customers');
    revalidatePath('/account');

    return {
      success: true,
      isActive: nextState,
      message: `User account ${targetUser.email} is now ${nextState ? 'ACTIVE' : 'SUSPENDED'}.`,
    };
  } catch (err: any) {
    console.error('Toggle suspension error:', err);
    return { error: err.message || 'Failed to update user suspension status.' };
  }
}

export async function updateUserRoleAction(userId: string, newRole: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized. Admin session required.' };

  if (!['OWNER', 'ADMIN'].includes(session.role)) {
    return { error: 'Access denied: Only Admins or Owners can modify user roles.' };
  }

  const validRoles = ['CUSTOMER', 'SUPPORT', 'ADMIN'];
  if (!validRoles.includes(newRole)) {
    return { error: `Invalid role specified: ${newRole}` };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) return { error: 'User record not found.' };

    if (targetUser.role === 'OWNER') {
      return { error: 'The OWNER role cannot be modified.' };
    }

    if (targetUser.id === session.id) {
      return { error: 'You cannot change your own role.' };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath('/admin/customers');
    return {
      success: true,
      role: updated.role,
      message: `User role updated to ${newRole}.`,
    };
  } catch (err: any) {
    console.error('Update user role error:', err);
    return { error: err.message || 'Failed to update user role.' };
  }
}


