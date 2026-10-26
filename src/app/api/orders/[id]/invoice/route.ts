import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoiceGenerator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    if (!rawId) {
      return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
    }

    const cleanId = decodeURIComponent(rawId).trim().replace(/^#+/, "");

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
        ],
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const primaryPayment = order.payments && order.payments.length > 0 ? order.payments[0] : null;

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const siteUrl = host ? `${proto}://${host}` : undefined;

    const pdfBytes = await generateInvoicePdf(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        notes: order.notes,
        couponCode: order.couponCode,
        subtotal: order.totalAmount + (order.discountAmount || 0),
        discount: order.discountAmount || 0,
        total: order.totalAmount,
        status: order.orderStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName || "Digital Software License",
          variantName: item.variantName || "Standard License",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
        })),
        payment: {
          method: primaryPayment?.paymentMethod || order.paymentMethod,
          transactionId: primaryPayment?.transactionId || order.paymentTrxId,
          senderNumber: primaryPayment?.senderPhone || order.senderPhone,
          amount: primaryPayment?.amount || order.totalAmount,
          status: primaryPayment?.paymentStatus || order.paymentStatus,
          verifiedAt: primaryPayment?.verifiedAt || null,
        },
      },
      siteUrl
    );

    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get("download") === "true";
    const dispositionType = forceDownload ? "attachment" : "inline";

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="Invoice-${order.orderNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600, no-transform",
      },
    });
  } catch (error: any) {
    console.error("Failed to generate order invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF", details: error.message },
      { status: 500 }
    );
  }
}

