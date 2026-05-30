import { prisma } from "@/app/lib/prisma";

type AlertOrder = {
  id: number;
  userLogin?: string | null;
  productName?: string | null;
  productPrice?: string | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return false;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  return res.ok;
}

export async function notifyAutoDeliveryFailure(order: AlertOrder, reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason || "Неизвестная ошибка");

  const duplicate = await prisma.autoDeliveryLog.findFirst({
    where: {
      orderId: order.id,
      provider: "NS Gifts",
      status: "manual-delivery-alert",
    },
  });

  if (duplicate) return false;

  const text = [
    "⚠️ <b>FunZona: требуется ручная выдача</b>",
    "",
    `Заказ: <b>#${order.id}</b>`,
    `Клиент: <b>${escapeHtml(order.userLogin || "не указан")}</b>`,
    `Товар: <b>${escapeHtml(order.productName || "не указан")}</b>`,
    `Сумма: <b>${escapeHtml(order.productPrice || "не указана")}</b>`,
    "",
    `Причина: <code>${escapeHtml(message).slice(0, 700)}</code>`,
    "",
    "Клиент уже оплатил заказ. Проверь его в админке и выдай товар вручную.",
  ].join("\n");

  const sent = await sendTelegramMessage(text);

  await prisma.autoDeliveryLog.create({
    data: {
      orderId: order.id,
      provider: "NS Gifts",
      status: "manual-delivery-alert",
      message: sent
        ? `Telegram-уведомление о ручной выдаче отправлено: ${message}`
        : `Нужна ручная выдача, но Telegram не настроен или не ответил: ${message}`,
      costUsd: null,
    },
  });

  return sent;
}
