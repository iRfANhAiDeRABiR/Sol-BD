import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export interface InvoiceOrderItem {
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoicePaymentInfo {
  method?: string | null;
  transactionId?: string | null;
  senderNumber?: string | null;
  amount?: number | null;
  status?: string | null;
  verifiedAt?: Date | string | null;
}

export interface InvoiceOrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  notes?: string | null;
  couponCode?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: Date | string;
  items: InvoiceOrderItem[];
  payment?: InvoicePaymentInfo | null;
}

export function safePdfText(input: string | null | undefined, fallback = ""): string {
  if (!input) return fallback;
  const cleaned = String(input)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

export function formatBdt(amount: number | null | undefined): string {
  const val = typeof amount === "number" ? amount : 0;
  return `BDT ${val.toLocaleString("en-US")}`;
}

export function formatPaymentMethod(method?: string | null): string {
  if (!method) return "Mobile Banking";
  const m = method.toUpperCase();
  if (m.includes("BKASH")) return "bKash";
  if (m.includes("NAGAD")) return "Nagad";
  if (m.includes("ROCKET")) return "Rocket";
  if (m.includes("UPAY")) return "Upay";
  if (m.includes("BANK")) return "Bank Transfer";
  return method;
}

export function formatInvoiceDate(d?: Date | string | null): string {
  if (!d) return "N/A";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "N/A";
  return dateObj.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Generates an executive, modern PDF invoice buffer for an order.
 */
export async function generateInvoicePdf(
  order: InvoiceOrderData,
  siteUrl?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const darkNavy = rgb(15 / 255, 23 / 255, 42 / 255);        // #0f172a
  const brandBlue = rgb(2 / 255, 132 / 255, 199 / 255);      // #0284c7
  const emerald = rgb(5 / 255, 150 / 255, 105 / 255);        // #059669
  const emeraldLight = rgb(236 / 255, 253 / 255, 245 / 255);// #ecfdf5
  const amber = rgb(217 / 255, 119 / 255, 6 / 255);          // #d97706
  const amberLight = rgb(254 / 255, 243 / 255, 199 / 255);   // #fef3c7
  const mutedText = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748b
  const slateText = rgb(51 / 255, 65 / 255, 85 / 255);      // #334155
  const borderGrey = rgb(226 / 255, 232 / 255, 240 / 255);  // #e2e8f0
  const lightBg = rgb(248 / 255, 250 / 255, 252 / 255);     // #f8fafc

  const isConfirmed =
    order.status === "COMPLETED" ||
    order.status === "PAID" ||
    order.payment?.status === "VERIFIED";

  // 1. Top Decorative Brand Bar
  page.drawRectangle({
    x: 0,
    y: pageHeight - 6,
    width: pageWidth,
    height: 6,
    color: brandBlue,
  });

  // 2. Company Brand Name
  page.drawText("SOLUTIONSBD", {
    x: 40,
    y: pageHeight - 44,
    size: 20,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Premier Genuine Software & Digital Licensing Partner", {
    x: 40,
    y: pageHeight - 62,
    size: 8.5,
    font: fontRegular,
    color: mutedText,
  });

  page.drawText("Web: www.solutionsbd.com  |  WhatsApp: +8801410699879  |  Email: solutionsbd247@gmail.com", {
    x: 40,
    y: pageHeight - 74,
    size: 7.5,
    font: fontRegular,
    color: mutedText,
  });

  // 3. Invoice Title & Ref (Top Right)
  const invTitle = "OFFICIAL SALES INVOICE";
  const invWidth = fontBold.widthOfTextAtSize(invTitle, 15);
  page.drawText(invTitle, {
    x: pageWidth - 40 - invWidth,
    y: pageHeight - 42,
    size: 15,
    font: fontBold,
    color: darkNavy,
  });

  const invoiceNo = `REF #${order.orderNumber}`;
  const invNoWidth = fontBold.widthOfTextAtSize(invoiceNo, 10);
  page.drawText(invoiceNo, {
    x: pageWidth - 40 - invNoWidth,
    y: pageHeight - 57,
    size: 10,
    font: fontBold,
    color: brandBlue,
  });

  const dateLabel = `Date: ${formatInvoiceDate(order.createdAt)}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateLabel, 8.5);
  page.drawText(dateLabel, {
    x: pageWidth - 40 - dateWidth,
    y: pageHeight - 71,
    size: 8.5,
    font: fontRegular,
    color: mutedText,
  });

  // Status Badge (Top Right)
  const badgeText = isConfirmed ? "PAID & VERIFIED" : "VERIFICATION PENDING";
  const badgeColor = isConfirmed ? emerald : amber;
  const badgeBg = isConfirmed ? emeraldLight : amberLight;
  const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 8.5);
  const pillW = badgeWidth + 20;
  const pillH = 18;
  const pillX = pageWidth - 40 - pillW;
  const pillY = pageHeight - 96;

  page.drawRectangle({
    x: pillX,
    y: pillY,
    width: pillW,
    height: pillH,
    color: badgeBg,
    borderColor: badgeColor,
    borderWidth: 1,
  });
  page.drawText(badgeText, {
    x: pillX + 10,
    y: pillY + 5,
    size: 8.5,
    font: fontBold,
    color: badgeColor,
  });

  // Divider Line
  page.drawLine({
    start: { x: 40, y: pageHeight - 108 },
    end: { x: pageWidth - 40, y: pageHeight - 108 },
    thickness: 1,
    color: borderGrey,
  });

  // 4. Two Info Columns: "Customer (Billed To)" & "Payment Verification Details"
  const colY = pageHeight - 124;
  const colW = (pageWidth - 80 - 20) / 2;

  // Box 1: Billed To
  page.drawRectangle({
    x: 40,
    y: colY - 80,
    width: colW,
    height: 80,
    color: lightBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });
  page.drawText("BILLED TO / CUSTOMER", {
    x: 52,
    y: colY - 14,
    size: 8,
    font: fontBold,
    color: brandBlue,
  });
  page.drawText(safePdfText(order.customerName, "Valued Customer"), {
    x: 52,
    y: colY - 30,
    size: 10,
    font: fontBold,
    color: darkNavy,
  });
  page.drawText(`Email: ${safePdfText(order.customerEmail, "N/A")}`, {
    x: 52,
    y: colY - 46,
    size: 8.5,
    font: fontRegular,
    color: slateText,
  });
  page.drawText(`Phone: ${safePdfText(order.customerPhone, "N/A")}`, {
    x: 52,
    y: colY - 60,
    size: 8.5,
    font: fontRegular,
    color: slateText,
  });

  // Box 2: Payment Details
  const col2X = 40 + colW + 20;
  page.drawRectangle({
    x: col2X,
    y: colY - 80,
    width: colW,
    height: 80,
    color: lightBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });
  page.drawText("PAYMENT TRANSACTION DETAILS", {
    x: col2X + 12,
    y: colY - 14,
    size: 8,
    font: fontBold,
    color: brandBlue,
  });

  const methodLabel = formatPaymentMethod(order.payment?.method);
  page.drawText(`Method: ${methodLabel}`, {
    x: col2X + 12,
    y: colY - 30,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  const trxStr = safePdfText(order.payment?.transactionId, "Submitted");
  page.drawText(`TrxID: ${trxStr}`, {
    x: col2X + 12,
    y: colY - 46,
    size: 8.5,
    font: fontRegular,
    color: slateText,
  });

  const senderStr = safePdfText(order.payment?.senderNumber, "N/A");
  page.drawText(`Sender: ${senderStr}`, {
    x: col2X + 12,
    y: colY - 60,
    size: 8.5,
    font: fontRegular,
    color: slateText,
  });

  // 5. Products Table Header
  const tableTopY = colY - 105;
  const tableW = pageWidth - 80;
  const rowH = 24;

  page.drawRectangle({
    x: 40,
    y: tableTopY - rowH,
    width: tableW,
    height: rowH,
    color: darkNavy,
  });

  page.drawText("ITEM DESCRIPTION", {
    x: 50,
    y: tableTopY - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("EDITION / LICENSE", {
    x: 270,
    y: tableTopY - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("QTY", {
    x: 410,
    y: tableTopY - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("TOTAL (BDT)", {
    x: 475,
    y: tableTopY - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // 6. Products Table Rows
  let curY = tableTopY - rowH;
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const bgRowColor = isEven ? rgb(1, 1, 1) : lightBg;

    page.drawRectangle({
      x: 40,
      y: curY - rowH,
      width: tableW,
      height: rowH,
      color: bgRowColor,
      borderColor: borderGrey,
      borderWidth: 0.5,
    });

    const pTitle = safePdfText(item.productName, "Digital Software");
    page.drawText(pTitle.length > 36 ? pTitle.slice(0, 34) + "..." : pTitle, {
      x: 50,
      y: curY - 16,
      size: 8.5,
      font: fontBold,
      color: darkNavy,
    });

    const vName = safePdfText(item.variantName, "Standard Edition");
    page.drawText(vName.length > 24 ? vName.slice(0, 22) + "..." : vName, {
      x: 270,
      y: curY - 16,
      size: 8,
      font: fontRegular,
      color: slateText,
    });

    page.drawText(String(item.quantity), {
      x: 418,
      y: curY - 16,
      size: 8.5,
      font: fontRegular,
      color: slateText,
    });

    const lineTotal = formatBdt(item.lineTotal || item.unitPrice * item.quantity);
    page.drawText(lineTotal, {
      x: 475,
      y: curY - 16,
      size: 8.5,
      font: fontBold,
      color: darkNavy,
    });

    curY -= rowH;
  });

  // 7. Totals & QR Code Section
  curY -= 14;

  // QR Code on Left
  const qrBaseUrl = siteUrl || "https://solutionsbd.com";
  const qrTarget = `${qrBaseUrl}/downloads?order=${encodeURIComponent(order.orderNumber)}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrTarget, { margin: 1, width: 90 });
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBytes = Buffer.from(qrBase64, "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: 45,
      y: curY - 78,
      width: 72,
      height: 72,
    });

    page.drawText("Scan to verify & download:", {
      x: 125,
      y: curY - 26,
      size: 8,
      font: fontBold,
      color: darkNavy,
    });
    page.drawText("Official software download center", {
      x: 125,
      y: curY - 38,
      size: 7.5,
      font: fontRegular,
      color: mutedText,
    });
    page.drawText("solutionsbd.com/downloads", {
      x: 125,
      y: curY - 50,
      size: 7.5,
      font: fontBold,
      color: brandBlue,
    });
  } catch (qrErr) {
    // Ignore QR error if occurs
  }

  // Summary Table on Right
  const summaryBoxW = 210;
  const summaryX = pageWidth - 40 - summaryBoxW;

  // Subtotal
  page.drawText("Subtotal:", {
    x: summaryX,
    y: curY - 16,
    size: 9,
    font: fontRegular,
    color: slateText,
  });
  const subTotalStr = formatBdt(order.subtotal);
  page.drawText(subTotalStr, {
    x: pageWidth - 40 - fontBold.widthOfTextAtSize(subTotalStr, 9),
    y: curY - 16,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  // Discount
  if (order.discount > 0) {
    curY -= 18;
    page.drawText("Discount:", {
      x: summaryX,
      y: curY - 16,
      size: 9,
      font: fontRegular,
      color: emerald,
    });
    const discStr = `-${formatBdt(order.discount)}`;
    page.drawText(discStr, {
      x: pageWidth - 40 - fontBold.widthOfTextAtSize(discStr, 9),
      y: curY - 16,
      size: 9,
      font: fontBold,
      color: emerald,
    });
  }

  // Total Paid
  curY -= 22;
  page.drawRectangle({
    x: summaryX - 8,
    y: curY - 22,
    width: summaryBoxW + 8,
    height: 28,
    color: lightBg,
    borderColor: brandBlue,
    borderWidth: 1,
  });

  page.drawText("TOTAL PAID:", {
    x: summaryX,
    y: curY - 13,
    size: 10,
    font: fontBold,
    color: darkNavy,
  });
  const totalStr = formatBdt(order.total);
  page.drawText(totalStr, {
    x: pageWidth - 40 - fontBold.widthOfTextAtSize(totalStr, 11),
    y: curY - 13,
    size: 11,
    font: fontBold,
    color: brandBlue,
  });

  // 8. Security & Authentic Digital Stamp Footer
  const footerY = 60;
  page.drawLine({
    start: { x: 40, y: footerY + 24 },
    end: { x: pageWidth - 40, y: footerY + 24 },
    thickness: 1,
    color: borderGrey,
  });

  page.drawText("AUTHENTIC DIGITAL SALES INVOICE — SOLUTIONSBD BANGLADESH", {
    x: 40,
    y: footerY + 12,
    size: 8,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(
    "All software products sold by SolutionsBD are authentic and backed by genuine digital warranty. For support, WhatsApp +8801410699879.",
    {
      x: 40,
      y: footerY,
      size: 7,
      font: fontRegular,
      color: mutedText,
    }
  );

  return await pdfDoc.save();
}
