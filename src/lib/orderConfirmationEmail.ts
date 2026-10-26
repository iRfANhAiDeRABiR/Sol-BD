import nodemailer from "nodemailer";
import path from "node:path";
import { existsSync } from "node:fs";

export type ConfirmationOrder = {
  orderNumber: string;
  total: number;
};

export type ConfirmationCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type ConfirmationItem = {
  productName: string;
  productImage?: string;
  optionName?: string;
  quantity: number;
  unitPrice: number;
};

export type ConfirmationTotals = {
  subtotal: number;
  discount: number;
  total: number;
};

export type SendOrderConfirmationEmailInput = {
  order: ConfirmationOrder;
  customer: ConfirmationCustomer;
  items: ConfirmationItem[];
  totals: ConfirmationTotals;
  paymentLabel: string;
  paymentTrxId?: string;
  senderPhone?: string;
  siteUrl?: string;
};

export type ProductImageAsset = {
  sources: Map<number, string>;
  attachments: Array<{
    filename: string;
    path: string;
    cid: string;
  }>;
};

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function escapeHtml(value: string | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function resolveImageUrl(imageUrl: string | undefined, siteUrl: string | undefined) {
  if (!imageUrl) {
    return null;
  }

  if (/^(https?:|data:|cid:)/i.test(imageUrl)) {
    return imageUrl;
  }

  const baseUrl = siteUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://solutionsbd.com";

  if (!baseUrl) {
    return imageUrl;
  }

  try {
    return new URL(imageUrl, baseUrl).toString();
  } catch {
    return imageUrl;
  }
}

export function getPublicImagePath(imageUrl: string | undefined) {
  if (!imageUrl || !imageUrl.startsWith("/")) {
    return null;
  }

  const pathname = imageUrl.split(/[?#]/)[0];

  if (pathname.includes("..")) {
    return null;
  }

  const publicDirectory = path.join(process.cwd(), "public");
  const filePath = path.join(publicDirectory, pathname);

  if (!filePath.startsWith(publicDirectory) || !existsSync(filePath)) {
    return null;
  }

  return filePath;
}

export function buildProductImageAssets(
  items: ConfirmationItem[],
  siteUrl: string | undefined
): ProductImageAsset {
  const sources = new Map<number, string>();
  const attachments: ProductImageAsset["attachments"] = [];

  items.forEach((item, index) => {
    const publicImagePath = getPublicImagePath(item.productImage);

    if (publicImagePath) {
      const cid = `product-${index}-${Date.now()}@solutionsbd`;

      sources.set(index, `cid:${cid}`);
      attachments.push({
        filename: path.basename(publicImagePath),
        path: publicImagePath,
        cid,
      });
      return;
    }

    const imageUrl = resolveImageUrl(item.productImage, siteUrl);

    if (imageUrl) {
      sources.set(index, imageUrl);
    }
  });

  return { sources, attachments };
}

export function getMailConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const user = process.env.SMTP_USER || "solutionsbd247@gmail.com";
  const pass = process.env.SMTP_PASS || "wzfk ygag liaj tiqa";
  const from = process.env.SMTP_FROM || `SolutionsBD <${user}>`;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return { host, port, secure, user, pass, from };
}

export function shouldAllowSelfSignedSmtpCertificate() {
  return process.env.SMTP_ALLOW_SELF_SIGNED === "true";
}

function buildOrderConfirmationText({
  order,
  customer,
  items,
  totals,
  paymentLabel,
  paymentTrxId,
  senderPhone,
}: SendOrderConfirmationEmailInput) {
  const itemLines = items
    .map((item) => {
      const option = item.optionName ? ` (${item.optionName})` : "";
      return `- ${item.productName}${option} x ${item.quantity}: ${formatCurrency(
        item.unitPrice * item.quantity
      )}`;
    })
    .join("\n");

  return `Dear ${customer.name},

Thank you for your order with SolutionsBD! We have received your purchase and payment verification request.

Order Reference: #${order.orderNumber}
Customer: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email}
Payment Method: ${paymentLabel}
Transaction ID: ${paymentTrxId || "Submitted"}
Sender Number: ${senderPhone || "N/A"}
Payment Status: Submitted for Admin Verification

Ordered Products:
${itemLines}

Subtotal: ${formatCurrency(totals.subtotal)}
Discount: -${formatCurrency(totals.discount)}
Total Amount: ${formatCurrency(totals.total)}

Next Steps:
Our verification team verifies transactions promptly. As soon as your payment is verified, your official license keys and download instructions will be sent to this email address.

Need urgent assistance?
WhatsApp Support: +8801410699879
Official Website: https://solutionsbd.com

Best regards,
SolutionsBD Team`;
}

function buildOrderConfirmationHtml(
  {
    order,
    customer,
    items,
    totals,
    paymentLabel,
    paymentTrxId,
    senderPhone,
    siteUrl,
  }: SendOrderConfirmationEmailInput,
  imageSources = new Map<number, string>()
) {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  const rows = items
    .map((item, index) => {
      const itemName = `${escapeHtml(item.productName)}${
        item.optionName
          ? ` <span style="color:#64748b; font-size:12px; font-weight:normal;">(${escapeHtml(item.optionName)})</span>`
          : ""
      }`;
      const imageUrl = imageSources.get(index) ?? resolveImageUrl(item.productImage, siteUrl);
      const imageMarkup = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.productName)}" width="48" height="48" style="display:block; width:48px; height:48px; max-width:48px; max-height:48px; object-fit:contain; border-radius:8px; border:1px solid #e2e8f0; background:#ffffff;" />`
        : `<div style="width:48px; height:48px; border-radius:8px; border:1px solid #e2e8f0; background:#f8fafc; color:#94a3b8; font-size:10px; line-height:48px; text-align:center;">Product</div>`;

      return `<tr>
        <td width="56" style="width:56px; padding:12px 10px 12px 0; vertical-align:middle;">
          ${imageMarkup}
        </td>
        <td style="padding:12px 8px; vertical-align:middle;">
          <div style="font-size:14px; font-weight:700; color:#0f172a; line-height:1.4; margin-bottom:2px; word-break:break-word;">
            ${itemName}
          </div>
          <div style="font-size:12px; color:#64748b;">
            Quantity: <strong style="color:#0f172a;">${item.quantity}</strong> × ${formatCurrency(item.unitPrice)}
          </div>
        </td>
        <td width="90" style="width:90px; padding:12px 0 12px 8px; text-align:right; vertical-align:middle; white-space:nowrap;">
          <span style="font-size:14px; font-weight:800; color:#0f172a;">${formatCurrency(
            item.unitPrice * item.quantity
          )}</span>
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>Order Confirmation - #${escapeHtml(order.orderNumber)}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 10px 6px !important; }
        .inner-card { padding: 18px 14px !important; }
        .header-pad { padding: 22px 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; width:100% !important; background-color:#0f172a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0f172a; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="outer-table" style="background-color:#0b0f19; width:100%; margin:0; padding:28px 10px;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; width:100%; margin:0 auto; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #1e293b; box-shadow:0 12px 36px rgba(0,0,0,0.3);">
            <!-- Header Banner -->
            <tr>
              <td class="header-pad" style="background:linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%); padding:28px 24px; color:#ffffff; text-align:left;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-size:12px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#bae6fd; margin-bottom:4px;">
                        SolutionsBD • Official Order
                      </div>
                      <h1 style="margin:0; font-size:22px; font-weight:850; letter-spacing:-0.02em; color:#ffffff; line-height:1.25;">
                        Order Received &amp; Pending Verification
                      </h1>
                      <p style="margin:6px 0 0; font-size:13px; color:#e0f2fe; opacity:0.95;">
                        We have received your payment details and are processing your order.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card Body -->
            <tr>
              <td class="inner-card" style="padding:24px 22px;">
                <p style="font-size:15px; font-weight:700; margin:0 0 8px; color:#0f172a;">
                  Dear ${escapeHtml(customer.name)},
                </p>
                <p style="font-size:13px; line-height:1.6; margin:0 0 18px; color:#475569;">
                  Thank you for ordering with <strong>SolutionsBD</strong>. We have logged your transaction details. Our verification team is verifying your payment. Once confirmed, your license keys and download access will be dispatched to this email immediately.
                </p>

                <!-- Order Info Pill Box -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; margin-bottom:20px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Order Reference:</td>
                      <td style="font-size:13px; font-family:monospace; font-weight:800; color:#0284c7; padding:3px 0; text-align:right;">#${escapeHtml(order.orderNumber)}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Order Date &amp; Time:</td>
                      <td style="font-size:12px; color:#334155; padding:3px 0; text-align:right;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Payment Method:</td>
                      <td style="font-size:13px; font-weight:700; color:#0f172a; padding:3px 0; text-align:right;">${escapeHtml(paymentLabel)}</td>
                    </tr>
                    ${
                      paymentTrxId
                        ? `<tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Transaction ID (TrxID):</td>
                      <td style="font-size:13px; font-family:monospace; font-weight:750; color:#0f172a; padding:3px 0; text-align:right;">${escapeHtml(paymentTrxId)}</td>
                    </tr>`
                        : ""
                    }
                    ${
                      senderPhone
                        ? `<tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Sender Phone Number:</td>
                      <td style="font-size:13px; font-family:monospace; color:#334155; padding:3px 0; text-align:right;">${escapeHtml(senderPhone)}</td>
                    </tr>`
                        : ""
                    }
                    <tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Delivery Email:</td>
                      <td style="font-size:12px; font-weight:600; color:#334155; padding:3px 0; text-align:right; word-break:break-all;">${escapeHtml(customer.email)}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px; color:#64748b; padding:3px 0;">Status:</td>
                      <td style="padding:3px 0; text-align:right;">
                        <span style="display:inline-block; padding:3px 10px; border-radius:99px; background:#fef3c7; border:1px solid #fde68a; color:#92400e; font-size:11px; font-weight:800;">
                          ⏳ Verification Pending
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Product Summary -->
                <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; margin-bottom:8px;">
                  Ordered Items
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; margin-bottom:12px;">
                  <tbody style="border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
                    ${rows}
                  </tbody>
                </table>

                <!-- Totals -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Subtotal:</td>
                    <td style="font-size:13px; font-weight:600; color:#0f172a; padding:4px 0; text-align:right;">${formatCurrency(totals.subtotal)}</td>
                  </tr>
                  ${
                    totals.discount > 0
                      ? `<tr>
                    <td style="font-size:13px; color:#059669; padding:4px 0;">Coupon Discount:</td>
                    <td style="font-size:13px; font-weight:700; color:#059669; padding:4px 0; text-align:right;">-${formatCurrency(totals.discount)}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size:15px; font-weight:800; color:#0f172a; padding:8px 0 0; border-top:1px solid #e2e8f0;">Total Amount:</td>
                    <td style="font-size:17px; font-weight:900; color:#0284c7; padding:8px 0 0; border-top:1px solid #e2e8f0; text-align:right;">${formatCurrency(totals.total)}</td>
                  </tr>
                </table>

                <!-- Info Box -->
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:16px; margin-bottom:22px;">
                  <div style="font-size:13px; font-weight:800; color:#1e40af; margin-bottom:4px;">
                    🛡️ Fast &amp; Guaranteed Delivery
                  </div>
                  <div style="font-size:12px; color:#1e3a8a; line-height:1.55;">
                    Digital keys and account details are normally delivered within a few minutes after manual MFS verification. If you have any questions or made a mistake with your Transaction ID, reply to this email or reach us immediately on WhatsApp.
                  </div>
                </div>

                <!-- WhatsApp Quick Action Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="https://wa.me/8801410699879?text=Hi%20SolutionsBD,%20I%20have%20an%20order%20%23${encodeURIComponent(order.orderNumber)}" target="_blank" style="display:inline-block; background-color:#25d366; color:#ffffff; font-weight:800; font-size:14px; text-decoration:none; padding:12px 24px; border-radius:10px; box-shadow:0 4px 12px rgba(37,211,102,0.3);">
                        💬 Chat on WhatsApp (+8801410699879)
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <div style="margin-top:28px; padding-top:18px; border-top:1px solid #f1f5f9; text-align:center;">
                  <p style="font-size:12px; font-weight:700; color:#0f172a; margin:0 0 4px;">
                    SolutionsBD — Genuine Software &amp; Digital License Store
                  </p>
                  <p style="font-size:11px; color:#94a3b8; margin:0; line-height:1.5;">
                    Dhaka, Bangladesh • WhatsApp Support: +8801410699879 • Email: solutionsbd247@gmail.com
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOrderConfirmationEmail(input: SendOrderConfirmationEmailInput) {
  const config = getMailConfig();

  if (!config) {
    console.warn("Order confirmation email skipped: SMTP configuration is missing or incomplete.");
    return { success: false, error: "SMTP not configured" };
  }

  if (!input.customer.email) {
    console.warn(`Order #${input.order.orderNumber} has no customer email.`);
    return { success: false, error: "No customer email provided" };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: shouldAllowSelfSignedSmtpCertificate()
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const imageAssets = buildProductImageAssets(input.items, input.siteUrl);

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: input.customer.email,
      subject: `Order Received: #${input.order.orderNumber} - SolutionsBD`,
      text: buildOrderConfirmationText(input),
      html: buildOrderConfirmationHtml(input, imageAssets.sources),
      attachments: imageAssets.attachments,
    });

    console.log(`[sendOrderConfirmationEmail] Email sent to ${input.customer.email} for order #${input.order.orderNumber} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`Failed to send order confirmation email for #${input.order.orderNumber}:`, err);
    return { success: false, error: err.message };
  }
}

