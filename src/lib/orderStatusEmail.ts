import nodemailer from "nodemailer";
import {
  type ConfirmationItem,
  getMailConfig,
  shouldAllowSelfSignedSmtpCertificate,
  formatCurrency,
  escapeHtml,
  buildProductImageAssets,
} from "./orderConfirmationEmail";

export type OrderStatusAction = "CONFIRMED" | "INVALID";

export interface DeliveredKeyInfo {
  variantName: string;
  keyCode: string;
}

export interface OrderStatusEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  deliveredKeys?: string | DeliveredKeyInfo[] | null;
  items: Array<{
    productName?: string | null;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    variant?: {
      product?: {
        title?: string;
        image?: string | null;
      } | null;
    } | null;
  }>;
  payments?: Array<{
    paymentMethod?: string | null;
    transactionId?: string | null;
    senderPhone?: string | null;
    amount?: number | null;
    paymentStatus?: string | null;
    verifiedAt?: Date | null;
  }> | null;
  paymentMethod?: string | null;
  paymentTrxId?: string | null;
  senderPhone?: string | null;
}

export interface SendOrderStatusEmailInput {
  order: OrderStatusEmailData;
  action: OrderStatusAction;
  allocatedKeys?: DeliveredKeyInfo[];
  siteUrl?: string;
}

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return "bKash / Nagad / Rocket";
  const m = method.toUpperCase();
  if (m.includes("BKASH")) return "bKash";
  if (m.includes("NAGAD")) return "Nagad";
  if (m.includes("ROCKET")) return "Rocket";
  if (m.includes("UPAY")) return "Upay";
  if (m.includes("BANK")) return "Bank Transfer";
  return method;
}

function parseDeliveredKeys(order: OrderStatusEmailData, allocatedKeys?: DeliveredKeyInfo[]): DeliveredKeyInfo[] {
  if (allocatedKeys && allocatedKeys.length > 0) {
    return allocatedKeys;
  }
  if (!order.deliveredKeys) return [];
  if (Array.isArray(order.deliveredKeys)) return order.deliveredKeys;
  try {
    const parsed = JSON.parse(order.deliveredKeys);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Ignore JSON error
  }
  return [];
}

function buildStatusPlainText(input: SendOrderStatusEmailInput): string {
  const { order, action, allocatedKeys } = input;
  const isConfirm = action === "CONFIRMED";
  const primaryPayment = order.payments && order.payments.length > 0 ? order.payments[0] : null;
  const paymentMethod = formatPaymentMethod(primaryPayment?.paymentMethod || order.paymentMethod);
  const trxId = primaryPayment?.transactionId || order.paymentTrxId || "N/A";
  const senderNumber = primaryPayment?.senderPhone || order.senderPhone || "N/A";
  const keysList = parseDeliveredKeys(order, allocatedKeys);

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.productName || item.variant?.product?.title || "Digital License"} (${item.variantName || "Standard"}) x${item.quantity} = ${formatCurrency(
          item.unitPrice * item.quantity
        )}`
    )
    .join("\n");

  if (isConfirm) {
    const keysText = keysList.length > 0
      ? `\nYour License Key(s):\n${keysList.map((k) => `• ${k.variantName}: ${k.keyCode}`).join("\n")}\n`
      : "";

    return `Dear ${order.customerName},

Great news! Your payment has been verified and your order #${order.orderNumber} is confirmed.

Order ID: #${order.orderNumber}
Payment Status: Verified & Approved
Payment Method: ${paymentMethod}
Transaction ID: ${trxId}
Sender Number: ${senderNumber}
Delivery Email: ${order.customerEmail}
Phone: ${order.customerPhone || "N/A"}

Ordered Items:
${itemsList}

Total Paid: ${formatCurrency(order.total)}
${keysText}
Software Downloads & Activation:
You can download your purchased software directly from our Downloads Center:
https://solutionsbd.com/downloads

If you have any questions or require activation support, please reach us on WhatsApp: +8801410699879.

Best regards,
SolutionsBD Team`;
  }

  return `Dear ${order.customerName},

Payment Verification Notice for Order #${order.orderNumber}.

We were unable to verify the Transaction ID (TrxID) submitted for your order in our ${paymentMethod} records.

Order Reference: #${order.orderNumber}
Payment Status: Verification Failed (Invalid TrxID)
Payment Method: ${paymentMethod}
Submitted TrxID: ${trxId}
Submitted Sender: ${senderNumber}
Total Payable: ${formatCurrency(order.total)}

Ordered Items:
${itemsList}

How to resolve this:
1. Check your ${paymentMethod} SMS or statement for the exact Transaction ID and sender number.
2. If you have already sent the money, simply reply to this email or send your payment screenshot to our WhatsApp (+8801410699879) along with your Order Reference #${order.orderNumber}.
3. Our verification team will immediately confirm your order upon receiving proof.

WhatsApp Support: +8801410699879
Official Website: https://solutionsbd.com

Best regards,
SolutionsBD Team`;
}

function buildStatusHtml(
  input: SendOrderStatusEmailInput,
  imageSources: Map<number, string>
): string {
  const { order, action, allocatedKeys, siteUrl } = input;
  const isConfirm = action === "CONFIRMED";
  const primaryPayment = order.payments && order.payments.length > 0 ? order.payments[0] : null;
  const paymentMethod = formatPaymentMethod(primaryPayment?.paymentMethod || order.paymentMethod);
  const trxId = primaryPayment?.transactionId || order.paymentTrxId || "N/A";
  const senderNumber = primaryPayment?.senderPhone || order.senderPhone || "N/A";
  const keysList = parseDeliveredKeys(order, allocatedKeys);

  const nowFormatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  const rows = order.items
    .map((item, index) => {
      const pName = item.productName || item.variant?.product?.title || "Digital License";
      const vName = item.variantName;
      const itemName = `${escapeHtml(pName)}${
        vName ? ` <span style="color:#64748b; font-size:12px; font-weight:normal;">(${escapeHtml(vName)})</span>` : ""
      }`;
      const imageUrl = imageSources.get(index);
      const imageMarkup = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(pName)}" width="48" height="48" style="display:block; width:48px; height:48px; max-width:48px; max-height:48px; object-fit:contain; border-radius:8px; border:1px solid #e2e8f0; background:#ffffff;" />`
        : `<div style="width:48px; height:48px; border-radius:8px; border:1px solid #e2e8f0; background:#f8fafc; color:#94a3b8; font-size:10px; line-height:48px; text-align:center;">Product</div>`;

      const lineTotal = item.unitPrice * item.quantity;

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
          <span style="font-size:14px; font-weight:800; color:#0f172a;">${formatCurrency(lineTotal)}</span>
        </td>
      </tr>`;
    })
    .join("");

  const headerGradient = isConfirm
    ? "linear-gradient(135deg, #059669 0%, #0284c7 100%)"
    : "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";

  const headerTitle = isConfirm
    ? "Payment Verified &amp; Order Confirmed"
    : "Payment Verification Notice";

  const headerSubtitle = isConfirm
    ? `Great news, ${escapeHtml(order.customerName)}! Your payment has been successfully verified.`
    : `Action required for Order #${escapeHtml(order.orderNumber)} — Invalid TrxID`;

  const alertBox = isConfirm
    ? `<div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:16px; margin-bottom:20px;">
        <div style="font-size:15px; font-weight:800; color:#166534; margin-bottom:4px;">
          ✅ Payment Status: Verified &amp; Approved
        </div>
        <div style="font-size:13px; color:#15803d; line-height:1.5;">
          We have verified your payment of <strong>${formatCurrency(order.total)}</strong>. Your order is officially confirmed and ready!
        </div>
      </div>`
    : `<div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:16px; margin-bottom:20px;">
        <div style="font-size:15px; font-weight:800; color:#991b1b; margin-bottom:4px;">
          ❌ Payment Status: Verification Failed (ভুল TrxID)
        </div>
        <div style="font-size:13px; color:#b91c1c; line-height:1.5;">
          The Transaction ID (<strong>${escapeHtml(trxId)}</strong>) provided could not be verified in our ${escapeHtml(paymentMethod)} merchant statement.
        </div>
      </div>`;

  const statusPill = isConfirm
    ? `<span style="display:inline-block; padding:3px 10px; border-radius:99px; background:#dcfce7; border:1px solid #86efac; color:#15803d; font-size:11px; font-weight:800;">Verified &amp; Approved</span>`
    : `<span style="display:inline-block; padding:3px 10px; border-radius:99px; background:#fee2e2; border:1px solid #fca5a5; color:#991b1b; font-size:11px; font-weight:800;">Invalid TrxID</span>`;

  // Delivered Keys section for Confirmed Orders
  const keysBlock = isConfirm && keysList.length > 0
    ? `<div style="background:#0f172a; border-radius:14px; padding:20px; margin:22px 0; color:#ffffff;">
        <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#38bdf8; margin-bottom:12px;">
          🔑 Delivered License Keys
        </div>
        ${keysList.map((k) => `
          <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px 14px; margin-bottom:10px;">
            <div style="font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">
              ${escapeHtml(k.variantName)}
            </div>
            <div style="font-family:monospace; font-size:16px; font-weight:800; color:#4ade80; letter-spacing:0.05em; word-break:break-all;">
              ${escapeHtml(k.keyCode)}
            </div>
          </div>
        `).join("")}
        <div style="font-size:12px; color:#94a3b8; margin-top:10px; line-height:1.5;">
          Copy and enter the license key inside the software or follow our official activation guide at our Downloads Center.
        </div>
      </div>`
    : "";

  const actionBox = isConfirm
    ? `<div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:18px; margin-top:20px;">
        <div style="font-size:14px; font-weight:800; color:#1e40af; margin-bottom:6px;">
          📦 Software Downloads &amp; Activation
        </div>
        <div style="font-size:13px; color:#1e3a8a; line-height:1.55; margin-bottom:12px;">
          You can download clean, direct installers for all software from our Official Downloads Center:
        </div>
        <a href="${siteUrl || "https://solutionsbd.com"}/downloads" target="_blank" style="display:inline-block; background-color:#2563eb; color:#ffffff; font-weight:750; font-size:13px; text-decoration:none; padding:10px 20px; border-radius:8px;">
          Open SolutionsBD Download Center →
        </a>
      </div>`
    : `<div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:12px; padding:18px; margin-top:20px;">
        <div style="font-size:14px; font-weight:800; color:#92400e; margin-bottom:8px;">
          ⚠️ How to resolve this issue:
        </div>
        <ol style="margin:0; padding-left:18px; font-size:13px; color:#78350f; line-height:1.65;">
          <li style="margin-bottom:6px;">
            Check your <strong>${escapeHtml(paymentMethod)}</strong> statement or SMS for the correct Transaction ID (TrxID).
          </li>
          <li style="margin-bottom:6px;">
            If you already sent the payment, please <strong>reply directly to this email</strong> with your correct Transaction ID and a payment screenshot.
          </li>
          <li>
            Quote Order Reference <strong>#${escapeHtml(order.orderNumber)}</strong> so our team can approve your order immediately.
          </li>
        </ol>
      </div>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <title>${escapeHtml(headerTitle)}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; padding: 12px 8px !important; }
        .email-card { border-radius: 12px !important; }
        .email-header { padding: 22px 16px !important; }
        .email-body { padding: 18px 14px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#0b0f19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a; -webkit-font-smoothing:antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0f19;">
      <tr>
        <td align="center" style="padding:28px 12px;" class="email-container">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #1e293b; box-shadow:0 12px 36px rgba(0,0,0,0.3);" class="email-card">
            <!-- Header Banner -->
            <tr>
              <td style="background:${headerGradient}; padding:28px 24px; color:#ffffff;" class="email-header">
                <div style="font-size:12px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#ffffff; opacity:0.85; margin-bottom:4px;">
                  SolutionsBD Order Notification
                </div>
                <h1 style="margin:0; font-size:22px; font-weight:850; line-height:1.25; color:#ffffff;">
                  ${headerTitle}
                </h1>
                <p style="margin:8px 0 0; font-size:13px; opacity:0.95; line-height:1.4; color:#ffffff;">
                  ${escapeHtml(headerSubtitle)}
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 20px;" class="email-body">
                ${alertBox}

                <!-- Order Details Summary Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:20px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Order Reference:</td>
                          <td style="font-size:13px; font-family:monospace; font-weight:800; color:#0284c7; padding:4px 0; text-align:right;">#${escapeHtml(order.orderNumber)}</td>
                        </tr>
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Payment Method:</td>
                          <td style="font-size:13px; font-weight:700; color:#0f172a; padding:4px 0; text-align:right;">${escapeHtml(paymentMethod)}</td>
                        </tr>
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Transaction ID (TrxID):</td>
                          <td style="font-size:13px; font-family:monospace; font-weight:750; color:#0f172a; padding:4px 0; text-align:right;">${escapeHtml(trxId)}</td>
                        </tr>
                        ${
                          senderNumber !== "N/A"
                            ? `<tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Sender Number:</td>
                          <td style="font-size:13px; font-family:monospace; font-weight:600; color:#0f172a; padding:4px 0; text-align:right;">${escapeHtml(senderNumber)}</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Delivery Email:</td>
                          <td style="font-size:12px; font-weight:600; color:#0f172a; padding:4px 0; text-align:right; word-break:break-all;">${escapeHtml(order.customerEmail)}</td>
                        </tr>
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Status:</td>
                          <td style="padding:4px 0; text-align:right;">${statusPill}</td>
                        </tr>
                        <tr>
                          <td style="font-size:12px; color:#64748b; padding:4px 0;">Date &amp; Time:</td>
                          <td style="font-size:12px; color:#64748b; padding:4px 0; text-align:right;">${nowFormatted}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                ${keysBlock}

                <!-- Products Table -->
                <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; margin-bottom:8px;">
                  Ordered Items
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; margin-bottom:12px;">
                  <tbody style="border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
                    ${rows}
                  </tbody>
                </table>

                <!-- Totals Section -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Subtotal:</td>
                    <td style="font-size:13px; font-weight:600; color:#0f172a; padding:4px 0; text-align:right;">${formatCurrency(order.subtotal)}</td>
                  </tr>
                  ${
                    order.discount > 0
                      ? `<tr>
                    <td style="font-size:13px; color:#059669; padding:4px 0;">Discount:</td>
                    <td style="font-size:13px; font-weight:700; color:#059669; padding:4px 0; text-align:right;">-${formatCurrency(order.discount)}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size:15px; font-weight:800; color:#0f172a; padding:8px 0 0; border-top:1px solid #e2e8f0;">${isConfirm ? "Total Paid:" : "Total Payable:"}</td>
                    <td style="font-size:17px; font-weight:900; color:${isConfirm ? "#059669" : "#dc2626"}; padding:8px 0 0; border-top:1px solid #e2e8f0; text-align:right;">${formatCurrency(order.total)}</td>
                  </tr>
                </table>

                ${actionBox}

                <!-- WhatsApp Button -->
                <div style="margin-top:22px; text-align:center;">
                  <a href="https://wa.me/8801410699879?text=Hi%20SolutionsBD,%20regarding%20my%20Order%20%23${encodeURIComponent(order.orderNumber)}" target="_blank" style="display:inline-block; background-color:#25d366; color:#ffffff; font-weight:800; font-size:13px; text-decoration:none; padding:12px 24px; border-radius:10px; box-shadow:0 4px 12px rgba(37,211,102,0.3);">
                    💬 WhatsApp Support: +8801410699879
                  </a>
                </div>

                <!-- Footer Note -->
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

export async function sendOrderStatusEmail(input: SendOrderStatusEmailInput) {
  const config = getMailConfig();

  if (!config) {
    console.warn("Order status email skipped: SMTP configuration is incomplete.");
    return { success: false, error: "SMTP not configured" };
  }

  if (!input.order.customerEmail) {
    console.warn(`Order #${input.order.orderNumber} has no customer email.`);
    return { success: false, error: "No customer email" };
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

  const confirmationItems: ConfirmationItem[] = input.order.items.map((item) => ({
    productName: item.productName || item.variant?.product?.title || "Digital License",
    productImage: item.variant?.product?.image || undefined,
    optionName: item.variantName || undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  const imageAssets = buildProductImageAssets(confirmationItems, input.siteUrl);

  const isConfirm = input.action === "CONFIRMED";
  const subject = isConfirm
    ? `✅ Payment Verified & Order Confirmed - #${input.order.orderNumber} | SolutionsBD`
    : `❌ Payment Verification Notice (Invalid TrxID) - #${input.order.orderNumber} | SolutionsBD`;

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: input.order.customerEmail,
      subject,
      text: buildStatusPlainText(input),
      html: buildStatusHtml(input, imageAssets.sources),
      attachments: imageAssets.attachments,
    });
    console.log(`[sendOrderStatusEmail] Status email (${input.action}) dispatched to ${input.order.customerEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`Failed to send order status email for #${input.order.orderNumber}:`, err);
    return { success: false, error: err.message };
  }
}

