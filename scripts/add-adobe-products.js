const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAdobeProducts() {
  console.log('Adding Adobe Acrobat products to SolutionsBD catalog...');

  // 1. Get or create category
  let catCreative = await prisma.category.findUnique({
    where: { slug: 'creative-design' },
  });

  if (!catCreative) {
    catCreative = await prisma.category.create({
      data: {
        name: 'Creative & Design',
        slug: 'creative-design',
        icon: 'Palette',
        description: 'Adobe Creative Cloud, Canva Pro, Acrobat and multimedia software licenses.',
        sortOrder: 6,
        isActive: true,
      },
    });
  }

  const productsData = [
    // 1. Adobe Acrobat Standard DC
    {
      title: 'Adobe Acrobat Standard DC Subscription (Personal Email)',
      slug: 'adobe-acrobat-standard-dc',
      sku: 'SBD-ADB-ACR-STD',
      summary: 'Genuine Adobe Acrobat Standard subscription activated directly on your personal email. Full warranty throughout duration, official download & updates from adobe.com.',
      description: `### Adobe Acrobat Standard DC Subscription
Activate genuine **Adobe Acrobat Standard DC** directly on your **personal Adobe email account** with **full replacement warranty** and 100% official access.

#### Key Highlights & Features:
- **Personal Email Activation**: Seamlessly added to your personal Adobe ID account with full duration warranty.
- **Install from Official Adobe Website**: Download official software and automatic updates directly from [adobe.com](https://creativecloud.adobe.com/).
- **Full Warranty**: 100% replacement warranty during your active 1-Month or 3-Month subscription period.
- **Core Document Capabilities**:
  - **Create & Convert PDFs**: Turn Word, Excel, PowerPoint, and images into clean, professional PDFs with layout preservation.
  - **Edit PDF Text & Images**: Fix typos, update paragraphs, rearrange or crop images effortlessly.
  - **Export to Office**: Turn PDFs back into editable Word documents or Excel spreadsheets.
  - **Fill & Sign**: Electronically sign contracts and fill forms with smart autofill.
  - **Protect & Secure**: Password-protect sensitive PDFs to prevent unauthorized copying, printing, or editing.

#### How It Works:
1. Provide your **Adobe Account Email Address** at checkout.
2. Receive the official Adobe invitation / subscription confirmation on your email.
3. Sign in at [adobe.com](https://account.adobe.com/) and install Adobe Acrobat directly to your PC.`,
      categoryId: catCreative.id,
      brand: 'Adobe',
      image: '/img_content/adobe.png',
      isFeatured: true,
      isFlashSale: false,
      rating: 4.92,
      reviewCount: 38,
      deliveryType: 'ACCOUNT_INVITE',
      tags: JSON.stringify(['adobe', 'acrobat', 'acrobat standard', 'pdf', 'adobe acrobat', 'subscription', 'creative']),
      variants: [
        {
          name: '1 Month Subscription (Personal Email)',
          sku: 'ADB-ACR-STD-1M',
          price: 449,
          originalPrice: 799,
          licenseType: 'ACCOUNT_INVITE',
          validity: '1 Month',
          isDefault: true,
          stock: 99,
          keys: [
            'INVITE: 1-Month Adobe Acrobat Standard access activated on your personal email with full warranty',
          ],
        },
        {
          name: '3 Months Subscription (Personal Email)',
          sku: 'ADB-ACR-STD-3M',
          price: 999,
          originalPrice: 1799,
          licenseType: 'ACCOUNT_INVITE',
          validity: '3 Months',
          isDefault: false,
          stock: 99,
          keys: [
            'INVITE: 3-Months Adobe Acrobat Standard access activated on your personal email with full warranty',
          ],
        },
      ],
    },

    // 2. Adobe Acrobat Pro DC
    {
      title: 'Adobe Acrobat Pro DC Subscription (Personal Email)',
      slug: 'adobe-acrobat-pro-dc',
      sku: 'SBD-ADB-ACR-PRO',
      summary: '100% official Adobe Acrobat Pro DC subscription on your personal Adobe ID. Full warranty, advanced OCR, compare files, redact confidential data, install from adobe.com.',
      description: `### Adobe Acrobat Pro DC Subscription
Experience the full power of **Adobe Acrobat Pro DC**—the industry-leading PDF and digital document solution—activated directly on your **personal Adobe ID email** with **full duration warranty**.

#### Key Highlights & Pro Features:
- **Personal Email Activation**: Linked directly to your personal Adobe ID account with full warranty.
- **Install from Adobe Website**: Official desktop and mobile downloads from [adobe.com](https://www.adobe.com/).
- **Advanced Pro Features**:
  - **Full PDF Editing**: Edit text, fonts, paragraphs, and high-resolution graphics directly on the page.
  - **Optical Character Recognition (OCR)**: Convert scanned paper documents into searchable, editable text instantly.
  - **Compare Two Documents**: Review side-by-side differences between two PDF versions automatically.
  - **Permanently Redact**: Remove confidential numbers, names, and hidden metadata before sharing.
  - **Advanced Form Building & E-Sign**: Build smart interactive forms and request legal e-signatures.
  - **Multi-Device Sync**: Works across Windows, Mac, iPad, and Android with cloud document sync.
- **Full Warranty**: Complete warranty and replacement support for the full duration of your subscription.

#### Activation Steps:
1. Provide your **Adobe Account Email Address** at checkout.
2. Accept the official Adobe subscription invitation sent to your email.
3. Open Adobe Creative Cloud or log in at [adobe.com](https://account.adobe.com/) to enjoy all Pro features.`,
      categoryId: catCreative.id,
      brand: 'Adobe',
      image: '/img_content/adobe.png',
      isFeatured: true,
      isFlashSale: true,
      rating: 4.96,
      reviewCount: 84,
      deliveryType: 'ACCOUNT_INVITE',
      tags: JSON.stringify(['adobe', 'acrobat pro', 'acrobat pro dc', 'pdf editor', 'ocr', 'adobe acrobat', 'subscription', 'creative']),
      variants: [
        {
          name: '1 Month Subscription (Personal Email)',
          sku: 'ADB-ACR-PRO-1M',
          price: 799,
          originalPrice: 1500,
          licenseType: 'ACCOUNT_INVITE',
          validity: '1 Month',
          isDefault: true,
          stock: 99,
          keys: [
            'INVITE: 1-Month Adobe Acrobat Pro DC access activated on your personal email with full warranty',
          ],
        },
      ],
    },

    // 3. Adobe Acrobat Pro DC 2020
    {
      title: 'Adobe Acrobat Pro DC 2020 Lifetime (1 PC Windows)',
      slug: 'adobe-acrobat-pro-dc-2020-lifetime',
      sku: 'SBD-ADB-ACR-2020-LT',
      summary: 'Genuine 1 PC lifetime license key for Adobe Acrobat Pro DC 2020 on Windows. Lifetime use without uninstall, permanent offline activation, official direct installer.',
      description: `### Adobe Acrobat Pro DC 2020 Lifetime License Key for Windows
Buy original **Adobe Acrobat Pro DC 2020 Lifetime License Key** in Bangladesh for **1 PC on Windows 10 / 11**. One-time purchase for permanent lifetime use without recurring subscription costs!

#### Key Highlights:
- **1 PC Lifetime Validity**: Permanent license key for 1 Windows computer (64-bit and 32-bit supported).
- **Lifetime Use Without Uninstall**: Remains permanently activated as long as the software is not uninstalled or formatted.
- **Instant Key Delivery**: Genuine 24-digit digital serial key delivered immediately on screen and via email.
- **Offline Perpetual Pro Capabilities**:
  - Create, edit, combine, and organize multi-page PDF documents.
  - Optical Character Recognition (OCR) for converting paper scans into editable text.
  - Export PDFs into formatted Microsoft Word, Excel, or PowerPoint documents.
  - Digital signatures, 256-bit AES encryption, and document security permissions.
  - No monthly fees, no cloud subscription expirations — perpetual desktop freedom.

#### Step-by-Step Installation & Activation:
1. Download the official **Adobe Acrobat Pro 2020 installer** from our Downloads Center or official Adobe link.
2. Run \`Setup.exe\` and select **"I have a serial number"**.
3. Enter your purchased **24-digit license key**.
4. Finish installation and start using Adobe Acrobat Pro 2020 permanently!`,
      categoryId: catCreative.id,
      brand: 'Adobe',
      image: '/img_content/adobe.png',
      isFeatured: true,
      isFlashSale: false,
      rating: 4.95,
      reviewCount: 62,
      deliveryType: 'INSTANT_AUTO',
      tags: JSON.stringify(['adobe', 'acrobat pro 2020', 'lifetime', 'windows', 'license key', 'offline', 'pdf']),
      variants: [
        {
          name: '1 PC - Lifetime License Key (Windows)',
          sku: 'ADB-ACR-2020-1PC-LT',
          price: 3649,
          originalPrice: 6500,
          licenseType: 'LICENSE_KEY',
          validity: 'Lifetime',
          isDefault: true,
          stock: 10,
          keys: [
            '1118-1029-3847-5629-4820-1940',
            '1118-4920-5819-2048-3918-5029',
            '1118-3829-1940-5829-4019-3820',
            '1118-5820-3918-2049-5819-4029',
            '1118-2049-5819-3820-1940-4820',
            '1118-7719-8293-1049-5829-2019',
            '1118-9382-1049-5820-3918-4029',
            '1118-6201-4928-1049-5829-3918',
            '1118-4019-5829-2049-1039-4820',
            '1118-8492-1049-3918-5820-2049',
          ],
        },
      ],
    },
  ];

  for (const p of productsData) {
    const { variants, ...prodData } = p;
    console.log(`Creating/updating product: ${prodData.title} (${prodData.slug})`);

    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        ...prodData,
      },
      create: {
        ...prodData,
      },
    });

    for (const v of variants) {
      const { keys, ...varData } = v;
      let variant = await prisma.productVariant.findFirst({
        where: {
          productId: product.id,
          name: varData.name,
        },
      });

      if (!variant) {
        variant = await prisma.productVariant.create({
          data: {
            ...varData,
            productId: product.id,
          },
        });
      } else {
        variant = await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            ...varData,
          },
        });
      }

      if (keys && keys.length > 0) {
        for (const keyCode of keys) {
          const existingKey = await prisma.licenseKey.findFirst({
            where: {
              variantId: variant.id,
              keyCode: keyCode,
            },
          });
          if (!existingKey) {
            await prisma.licenseKey.create({
              data: {
                variantId: variant.id,
                keyCode: keyCode,
                status: 'AVAILABLE',
              },
            });
          }
        }

        const totalAvailable = await prisma.licenseKey.count({
          where: { variantId: variant.id, status: 'AVAILABLE' },
        });

        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: Math.max(totalAvailable, varData.stock) },
        });
      }
    }
  }

  console.log('Adobe Acrobat products added successfully!');
}

addAdobeProducts()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error adding Adobe products:', e);
    prisma.$disconnect();
    process.exit(1);
  });
