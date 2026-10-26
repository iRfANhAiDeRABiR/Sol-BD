import { NextResponse } from "next/server";
import crypto from "crypto";
import { answerTelegramCallbackQuery, updateTelegramMessageStatus } from "@/lib/telegram";
import { processTelegramOrderAction } from "@/lib/orderVerificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const cb = body?.callback_query;

    if (!cb || !cb.data) {
      return NextResponse.json({ ok: true, message: "No callback_query in payload" });
    }

    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Verify secret token header if configured
    if (secretToken) {
      const headerToken = request.headers.get("x-telegram-bot-api-secret-token") || "";
      const secretBuf = Buffer.from(secretToken);
      const headerBuf = Buffer.from(headerToken);

      const isValidToken =
        secretBuf.length === headerBuf.length &&
        crypto.timingSafeEqual(secretBuf, headerBuf);

      if (!isValidToken) {
        console.warn("[Telegram Webhook] Invalid secret token header received.");
        return NextResponse.json({ error: "Forbidden: Invalid secret token" }, { status: 403 });
      }
    }

    // Verify sender ID or chat ID matches authorized Telegram admin
    const senderId = String(cb.from?.id ?? "");
    const chatId = String(cb.message?.chat?.id ?? "");

    if (adminChatId) {
      if (senderId !== adminChatId && chatId !== adminChatId) {
        console.warn(
          `[Telegram Webhook] Unauthorized attempt from sender: ${senderId}, chat: ${chatId} (expected ${adminChatId})`
        );
        return NextResponse.json({ error: "Forbidden: Unauthorized Telegram sender" }, { status: 403 });
      }
    }

    const dataStr = String(cb.data).trim();
    let action: "CONFIRMED" | "INVALID" | "DONE" | null = null;
    let orderNumber: string | null = null;

    if (dataStr.startsWith("confirm_")) {
      action = "CONFIRMED";
      orderNumber = dataStr.replace(/^confirm_/, "");
    } else if (dataStr.startsWith("invalid_")) {
      action = "INVALID";
      orderNumber = dataStr.replace(/^invalid_/, "");
    } else if (
      dataStr.startsWith("done_") ||
      dataStr.startsWith("confirmed_done_") ||
      dataStr.startsWith("invalid_done_")
    ) {
      action = "DONE";
      orderNumber = dataStr.replace(/^(done|confirmed_done|invalid_done)_/, "");
    }

    if (!action || !orderNumber) {
      return NextResponse.json({ ok: true, ignored: "Unknown callback data" });
    }

    const adminName = cb.from?.username ? `@${cb.from.username}` : cb.from?.first_name || "Admin";

    if (action === "DONE") {
      await answerTelegramCallbackQuery(cb.id, `Order #${orderNumber} is already finalized.`);
      return NextResponse.json({ ok: true, action: "DONE", orderNumber });
    }

    // Process order in database (updates Prisma & dispatches customer email)
    const result = await processTelegramOrderAction({
      orderNumber,
      action,
      adminName,
    });

    // Provide visual toast feedback in Telegram
    await answerTelegramCallbackQuery(
      cb.id,
      action === "CONFIRMED"
        ? `✅ Order #${orderNumber} Confirmed by ${adminName}!`
        : `❌ Order #${orderNumber} Rejected as Invalid by ${adminName}!`
    );

    // Update message text & inline keyboard in Telegram
    if (cb.message?.chat?.id && cb.message?.message_id) {
      await updateTelegramMessageStatus({
        chatId: cb.message.chat.id,
        messageId: cb.message.message_id,
        orderNumber,
        action,
        adminName,
        originalText: cb.message.text,
      });
    }

    return NextResponse.json({
      ok: true,
      action,
      orderNumber,
      dbUpdated: result.success,
      emailSent: result.emailSent,
    });
  } catch (err: any) {
    console.error("[Telegram Webhook] Error processing update:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const setWebhook = searchParams.get("setWebhook");
  const deleteWebhook = searchParams.get("deleteWebhook");

  if (setWebhook) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: setWebhook }),
      });
      const data = await res.json();
      return NextResponse.json({ action: "setWebhook", result: data });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (deleteWebhook === "true") {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: "POST",
      });
      const data = await res.json();
      return NextResponse.json({ action: "deleteWebhook", result: data });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json({
      botTokenConfigured: true,
      adminChatIdConfigured: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
      webhookInfo: data.result,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

