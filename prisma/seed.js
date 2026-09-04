const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SolutionsBD Digital Store Catalog with updated high-res assets...');

  // 1. Create Categories
  const catWindows = await prisma.category.upsert({
    where: { slug: 'windows' },
    update: {},
    create: {
      name: 'Windows OS',
      slug: 'windows',
      icon: 'Monitor',
      description: 'Genuine Microsoft Windows 10 and 11 license keys with instant activation.',
    },
  });

  const catOffice = await prisma.category.upsert({
    where: { slug: 'office' },
    update: {},
    create: {
      name: 'Microsoft Office',
      slug: 'office',
      icon: 'FileText',
      description: 'Microsoft Office 365, 2021, and 2024 genuine productivity suites.',
    },
  });

  const catAntivirus = await prisma.category.upsert({
    where: { slug: 'antivirus' },
    update: {},
    create: {
      name: 'Antivirus & Security',
      slug: 'antivirus',
      icon: 'ShieldCheck',
      description: 'Kaspersky, ESET, Bitdefender, and Norton genuine security keys.',
    },
  });

  const catDownload = await prisma.category.upsert({
    where: { slug: 'utility' },
    update: {},
    create: {
      name: 'Utility & Tools',
      slug: 'utility',
      icon: 'Download',
      description: 'Internet Download Manager (IDM) and utility tools official licenses.',
    },
  });

  const catCreative = await prisma.category.upsert({
    where: { slug: 'creative-design' },
    update: {},
    create: {
      name: 'Creative & Design',
      slug: 'creative-design',
      icon: 'Palette',
      description: 'Adobe Creative Cloud, Canva Pro, and multimedia software licenses.',
    },
  });

  const catVpn = await prisma.category.upsert({
    where: { slug: 'vpn-privacy' },
    update: {},
    create: {
      name: 'VPN & Privacy',
      slug: 'vpn-privacy',
      icon: 'Lock',
      description: 'NordVPN, ExpressVPN, Surfshark premium fast and secure connections.',
    },
  });

  // 2. Create Products with Variants & In-Stock Keys
  const products = [
    {
      title: 'Windows 11 Pro Retail License Key',
      slug: 'windows-11-pro-retail-key',
      summary: 'Genuine 25-digit retail product key for Windows 11 Pro 64/32 Bit. Lifetime validity.',
      description: `### Product Description
Buy original **Windows 11 Pro Retail License Key** in Bangladesh at the lowest price with **instant delivery**.

#### Key Highlights:
- **100% Genuine Retail Key**: Linked directly with Microsoft activation servers.
- **Lifetime Activation**: Reinstall or update without losing activation on the same PC.
- **Instant Delivery**: Key is automatically displayed on screen & emailed within 10 seconds.
- **Language & Architecture**: Global Multi-language, supports both 64-bit and 32-bit.

#### Step-by-Step Activation Instructions:
1. Open **Settings** on your Windows PC.
2. Navigate to **System > Activation**.
3. Click on **Change product key**.
4. Enter the 25-character digital key provided upon purchase.
5. Click **Next** and **Activate**. Enjoy genuine Windows 11 Pro!`,
      categoryId: catWindows.id,
      brand: 'Microsoft',
      image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: true,
      rating: 4.95,
      reviewCount: 142,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['windows 11', 'microsoft', 'retail key', 'best seller', 'instant']),
      variants: [
        {
          name: '1 PC - Retail Lifetime Key',
          price: 999,
          originalPrice: 1800,
          licenseType: 'LICENSE_KEY',
          validity: 'Lifetime',
          keys: [
            'W11PR-ABCD1-EFGH2-IJKL3-MN4OP',
            'W11PR-9988X-7766Y-5544Z-1122Q',
            'W11PR-KJHGF-DSAPO-IUYTR-EWQZX',
            'W11PR-LKJHG-FDSAQ-WERTY-UIOPZ',
            'W11PR-MNBVC-XZASD-FGHJK-LPOIU',
          ],
        },
        {
          name: '2 PC Bundle - Retail Lifetime Key',
          price: 1799,
          originalPrice: 3200,
          licenseType: 'LICENSE_KEY',
          validity: 'Lifetime',
          keys: [
            'W11PR-2PC01-BNDL2-KEY03-WIN11',
            'W11PR-2PC04-BNDL5-KEY06-WIN11',
          ],
        },
      ],
    },
    {
      title: 'Internet Download Manager (IDM) Official Lifetime',
      slug: 'idm-lifetime-official-license',
      summary: '100% Genuine official IDM license key for 1 PC with 3 years of free software updates.',
      description: `### Official IDM License Key in Bangladesh
Experience download speeds up to 5x faster with the world's most popular download accelerator.

#### Features:
- Official serial key registered directly under your name & email.
- Never expires (Lifetime license for 1 PC).
- 3 years of official free software version updates.
- Works smoothly with Chrome, Firefox, Edge, and all major browsers.

#### Activation Guide:
1. Download the latest official IDM installer from [internetdownloadmanager.com](https://www.internetdownloadmanager.com).
2. Install the program and click on **Registration** in the top menu bar.
3. Enter your Name, Email, and paste the serial key received from SolutionsBD.
4. Click **OK** to complete registration.`,
      categoryId: catDownload.id,
      brand: 'Tonec IDM',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: true,
      rating: 4.98,
      reviewCount: 310,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['idm', 'download manager', 'lifetime', 'tonec', 'fast']),
      variants: [
        {
          name: '1 PC - Official Lifetime License',
          price: 1899,
          originalPrice: 2800,
          licenseType: 'LICENSE_KEY',
          validity: 'Lifetime (3 Yr Updates)',
          keys: [
            'IDM-78291-KJS82-99210-91820',
            'IDM-19283-KAJS7-88291-77182',
            'IDM-44556-BBN88-77112-99001',
          ],
        },
      ],
    },
    {
      title: 'Microsoft Office 2021 Professional Plus Lifetime',
      slug: 'microsoft-office-2021-pro-plus',
      summary: 'Word, Excel, PowerPoint, Outlook, Access & Publisher. 1 PC Lifetime online binding key.',
      description: `### Genuine Office 2021 Pro Plus
Complete standalone office suite without any recurring monthly or yearly subscription fees.

#### Included Software:
- Microsoft Word 2021
- Microsoft Excel 2021
- Microsoft PowerPoint 2021
- Microsoft Outlook 2021
- Microsoft OneNote, Publisher & Access

#### Activation Process:
1. Go to official Microsoft setup portal: [setup.office.com](https://setup.office.com).
2. Sign in with your personal Microsoft Account.
3. Paste the 25-character activation key.
4. Download the official installer and enjoy genuine Office 2021!`,
      categoryId: catOffice.id,
      brand: 'Microsoft',
      image: 'https://images.unsplash.com/photo-1542744094-3a3172720449?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: false,
      rating: 4.92,
      reviewCount: 98,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['office 2021', 'word', 'excel', 'microsoft', 'lifetime']),
      variants: [
        {
          name: '1 PC - Online Phone/Web Bind Key',
          price: 1399,
          originalPrice: 2400,
          licenseType: 'LICENSE_KEY',
          validity: 'Lifetime',
          keys: [
            'OFF21-PRO01-KJHGF-99881-MSFT1',
            'OFF21-PRO02-LKJHG-77662-MSFT2',
            'OFF21-PRO03-MNBVC-55443-MSFT3',
          ],
        },
      ],
    },
    {
      title: 'Adobe Creative Cloud All Apps (1 Month / 1 Year)',
      slug: 'adobe-creative-cloud-all-apps',
      summary: 'Photoshop, Illustrator, Premiere Pro, After Effects + 100GB Cloud Storage on your own email.',
      description: `### Adobe Creative Cloud All Apps Subscription
Access 20+ creative apps directly activated on your personal Adobe email account.

#### Includes:
- Photoshop, Illustrator, Premiere Pro, After Effects, Lightroom, InDesign, Audition.
- 100GB Cloud Storage + Adobe Fonts + Firefly Generative AI credits.
- Official desktop and mobile app updates directly through Creative Cloud desktop.`,
      categoryId: catCreative.id,
      brand: 'Adobe',
      image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: false,
      rating: 4.88,
      reviewCount: 76,
      deliveryType: 'ACCOUNT_INVITE',
      tags: JSON.stringify(['adobe', 'photoshop', 'illustrator', 'premiere pro', 'creative cloud']),
      variants: [
        {
          name: '1 Month Subscription (Personal Email)',
          price: 699,
          originalPrice: 1200,
          licenseType: 'ACCOUNT_INVITE',
          validity: '1 Month',
          keys: [
            'INVITE: Please provide your Adobe ID email at checkout for instant invitation link',
          ],
        },
        {
          name: '1 Year Subscription (Personal Email)',
          price: 3499,
          originalPrice: 6500,
          licenseType: 'ACCOUNT_INVITE',
          validity: '1 Year',
          keys: [
            'INVITE: 1-Year team invite will be dispatched to your account email',
          ],
        },
      ],
    },
    {
      title: 'Canva Pro Subscription (Personal Email Team Invite)',
      slug: 'canva-pro-team-invite',
      summary: 'Unlimited premium templates, Brand Kits, Magic AI Tools, and 1TB Cloud Storage on your email.',
      description: `### Canva Pro Official Subscription
Upgrade your own Canva email to Pro with 100% genuine features and brand kits.`,
      categoryId: catCreative.id,
      brand: 'Canva',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: true,
      rating: 4.96,
      reviewCount: 185,
      deliveryType: 'ACCOUNT_INVITE',
      tags: JSON.stringify(['canva', 'canva pro', 'graphic design', 'templates']),
      variants: [
        {
          name: '1 Year Pro Team Invite',
          price: 299,
          originalPrice: 750,
          licenseType: 'ACCOUNT_INVITE',
          validity: '1 Year',
          keys: [
            'INVITE: https://canva.com/brand/join?invite=SBD_CANVA_2026',
            'INVITE: https://canva.com/brand/join?invite=SBD_CANVA_2026_B',
          ],
        },
      ],
    },
    {
      title: 'Kaspersky Total Security 1 Device 1 Year',
      slug: 'kaspersky-total-security-1-device',
      summary: 'Top-tier ransomware, virus, webcam protection, and safe money banking shield.',
      description: `### Kaspersky Total Security Official License
Defend your PC and confidential financial data against dangerous threats, spyware, and crypto malware.`,
      categoryId: catAntivirus.id,
      brand: 'Kaspersky',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
      isFeatured: false,
      isFlashSale: true,
      rating: 4.9,
      reviewCount: 65,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['kaspersky', 'antivirus', 'security', '1 year']),
      variants: [
        {
          name: '1 PC / 1 Year Global Activation',
          price: 549,
          originalPrice: 950,
          licenseType: 'LICENSE_KEY',
          validity: '1 Year',
          keys: [
            'KASP-9901-8812-7713-6614',
            'KASP-1122-3344-5566-7788',
          ],
        },
      ],
    },
    {
      title: 'NordVPN Premium 6 Devices 1 Year',
      slug: 'nordvpn-premium-1-year',
      summary: 'Ultra-fast global VPN with 6000+ servers, Threat Protection, and zero logs policy.',
      description: `### NordVPN Premium Official Subscription
Browse privately, bypass geo-restrictions, and secure public Wi-Fi on up to 6 devices simultaneously.`,
      categoryId: catVpn.id,
      brand: 'NordVPN',
      image: 'https://images.unsplash.com/photo-1510511459019-5dee85718698?w=1000&auto=format&fit=crop&q=80',
      isFeatured: true,
      isFlashSale: false,
      rating: 4.85,
      reviewCount: 52,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['nordvpn', 'vpn', 'privacy', 'netflix unblock']),
      variants: [
        {
          name: '1 Year Premium Account / Key',
          price: 1299,
          originalPrice: 2500,
          licenseType: 'LICENSE_KEY',
          validity: '1 Year',
          keys: [
            'NORD-PREM-1YR-0918-AKSMD',
            'NORD-PREM-1YR-8812-PLQMX',
          ],
        },
      ],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const createdProduct = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    });

    for (const v of variants) {
      const { keys, ...variantData } = v;
      let variant = await prisma.productVariant.findFirst({
        where: {
          productId: createdProduct.id,
          name: variantData.name,
        },
      });

      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            ...variantData,
            productId: createdProduct.id,
            stock: keys.length,
          },
        });
      } else {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: keys.length,
            price: variantData.price,
            originalPrice: variantData.originalPrice,
          },
        });
      }

      // Add license keys
      for (const keyCode of keys) {
        const existingKey = await prisma.licenseKey.findFirst({
          where: { variantId: variant.id, keyCode },
        });

        if (!existingKey) {
          await prisma.licenseKey.create({
            data: {
              variantId: variant.id,
              keyCode,
              status: 'AVAILABLE',
            },
          });
        }
      }
    }
  }

  // 3. Create Sample Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountPercent: 10,
      minSpend: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'EID50' },
    update: {},
    create: {
      code: 'EID50',
      discountAmount: 50,
      minSpend: 800,
      isActive: true,
    },
  });

  // 4. Create Owner / Admin User
  const owner = await prisma.user.upsert({
    where: { email: 'solutionsbd247@gmail.com' },
    update: {
      role: 'OWNER',
      name: 'SolutionsBD Owner',
      password: 't18gzykHw9YyWzh9',
      isActive: true,
    },
    create: {
      email: 'solutionsbd247@gmail.com',
      name: 'SolutionsBD Owner',
      phone: '+8801410699879',
      role: 'OWNER',
      password: 't18gzykHw9YyWzh9',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@solutionsbd.com' },
    update: {
      role: 'ADMIN',
      name: 'Irfan (SolutionsBD Staff)',
    },
    create: {
      email: 'admin@solutionsbd.com',
      name: 'Irfan (SolutionsBD Staff)',
      phone: '+8801410699879',
      role: 'ADMIN',
      password: 'admin123',
    },
  });

  // 5. Create Sample Orders & Payments for Dashboard Analytics
  const sampleVariantWin = await prisma.productVariant.findFirst({
    where: { product: { slug: 'windows-11-pro-retail-key' } },
  });
  const sampleVariantIDM = await prisma.productVariant.findFirst({
    where: { product: { slug: 'idm-lifetime-official-license' } },
  });
  const sampleVariantOffice = await prisma.productVariant.findFirst({
    where: { product: { slug: 'microsoft-office-2021-pro-plus' } },
  });

  // Generate 7 days of historical orders for chart
  const now = new Date();
  const pastOrders = [
    { daysAgo: 6, total: 2898, name: 'Tanvir Ahmed', email: 'tanvir@gmail.com', phone: '01711223344', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-882193', variant: sampleVariantWin },
    { daysAgo: 5, total: 1899, name: 'Rafiqul Islam', email: 'rafiq@hotmail.com', phone: '01822334455', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-991283', variant: sampleVariantIDM },
    { daysAgo: 4, total: 3298, name: 'Sadia Rahman', email: 'sadia@gmail.com', phone: '01933445566', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-102938', variant: sampleVariantOffice },
    { daysAgo: 3, total: 999, name: 'Mahmudul Hasan', email: 'mahmud@gmail.com', phone: '01644556677', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-492019', variant: sampleVariantWin },
    { daysAgo: 2, total: 2398, name: 'Anika Tabassum', email: 'anika@yahoo.com', phone: '01755667788', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-772819', variant: sampleVariantWin },
    { daysAgo: 1, total: 3798, name: 'Kamal Hossain', email: 'kamal@gmail.com', phone: '01866778899', status: 'COMPLETED', payStatus: 'PAID', method: 'BKASH_ONLINE', trx: 'BKO-382910', variant: sampleVariantOffice },
    // Today Pending Manual Payments (for Verification Queue)
    { daysAgo: 0, total: 999, name: 'Zubair Hossain', email: 'zubair@gmail.com', phone: '01311002233', status: 'PAYMENT_SUBMITTED', payStatus: 'SUBMITTED', method: 'BKASH_MANUAL', trx: 'BL99KJS882', senderPhone: '01844009988', variant: sampleVariantWin },
    { daysAgo: 0, total: 1899, name: 'Nazmul Haque', email: 'nazmul@gmail.com', phone: '01799887766', status: 'PAYMENT_SUBMITTED', payStatus: 'SUBMITTED', method: 'NAGAD_MANUAL', trx: '78NAGAD128', senderPhone: '01711998877', variant: sampleVariantIDM },
  ];

  for (let idx = 0; idx < pastOrders.length; idx++) {
    const o = pastOrders[idx];
    const orderDate = new Date(now.getTime() - o.daysAgo * 24 * 60 * 60 * 1000);
    const orderNumber = `SBD-2026-${8000 + idx}`;

    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) {
      const createdOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName: o.name,
          customerEmail: o.email,
          customerPhone: o.phone,
          totalAmount: o.total,
          orderStatus: o.status,
          paymentStatus: o.payStatus,
          paymentMethod: o.method,
          paymentTrxId: o.trx,
          senderPhone: o.senderPhone || null,
          createdAt: orderDate,
          updatedAt: orderDate,
          deliveredKeys: o.status === 'COMPLETED' ? JSON.stringify([{ variantName: 'Windows 11 Pro Retail', keyCode: `KEY-SAMPLE-${8000 + idx}` }]) : '[]',
          items: {
            create: [
              {
                variantId: o.variant?.id,
                productName: o.variant?.name || 'Software License',
                variantName: o.variant?.name || '1 PC License',
                quantity: 1,
                unitPrice: o.total,
              },
            ],
          },
          payments: {
            create: [
              {
                paymentMethod: o.method,
                paymentStatus: o.payStatus === 'PAID' ? 'VERIFIED' : 'SUBMITTED',
                amount: o.total,
                transactionId: o.trx,
                senderPhone: o.senderPhone || o.phone,
                verifiedById: o.payStatus === 'PAID' ? owner.id : null,
                verifiedAt: o.payStatus === 'PAID' ? orderDate : null,
                createdAt: orderDate,
              },
            ],
          },
        },
      });
    }
  }

  // 6. Seed Newsletter Subscribers
  const subscribers = [
    { email: 'developer@solutionsbd.com', source: 'footer' },
    { email: 'shopbd@gmail.com', source: 'checkout_optin' },
    { email: 'techlover@yahoo.com', source: 'footer' },
    { email: 'bangladesh_it@outlook.com', source: 'popup_modal' },
  ];

  for (const s of subscribers) {
    await prisma.subscriber.upsert({
      where: { email: s.email },
      update: {},
      create: s,
    });
  }

  console.log('Seeding completed successfully with Admin, Orders & Subscribers!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

