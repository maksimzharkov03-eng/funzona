import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { attemptAutoDeliveryForOrder, getNsGiftsBalance } from "@/app/lib/auto-delivery";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";

type NsBalanceInfo = {
  available: boolean;
  amount: number | null;
  endpoint?: string;
  message?: string;
  raw?: unknown;
};

const LOW_BALANCE_LIMIT_USD = 50;
const LOW_BALANCE_ALERT_INTERVAL_MS = 12 * 60 * 60 * 1000;

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

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

async function notifyLowNsBalance(balance: NsBalanceInfo) {
  if (!balance.available || typeof balance.amount !== "number" || balance.amount > LOW_BALANCE_LIMIT_USD) {
    return;
  }

  const lastAlert = await prisma.autoDeliveryLog.findFirst({
    where: {
      provider: "NS Gifts",
      status: "balance-warning",
    },
    orderBy: { createdAt: "desc" },
  });

  if (lastAlert && Date.now() - lastAlert.createdAt.getTime() < LOW_BALANCE_ALERT_INTERVAL_MS) {
    return;
  }

  const message = `⚠️ <b>FunZona: низкий баланс NS Gifts</b>\n\nТекущий баланс: <b>$${balance.amount.toFixed(
    2
  )}</b>\nНужно пополнить NS Gifts, чтобы автовыдача Apple-кодов не остановилась.`;

  const sent = await sendTelegramMessage(message);

  await prisma.autoDeliveryLog.create({
    data: {
      orderId: null,
      provider: "NS Gifts",
      status: "balance-warning",
      message: sent
        ? `Отправлено Telegram-уведомление о низком балансе: $${balance.amount.toFixed(2)}.`
        : `Баланс низкий ($${balance.amount.toFixed(2)}), но Telegram не настроен.`,
      costUsd: null,
    },
  });
}

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const balance = (await getNsGiftsBalance().catch((error) => ({
    available: false,
    amount: null,
    message: error instanceof Error ? error.message : String(error),
  }))) as NsBalanceInfo;

  await notifyLowNsBalance(balance);

  const [logs, orders] = await Promise.all([
    prisma.autoDeliveryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { autoDeliveryAt: { not: null } },
          { autoDeliveryProvider: { not: null } },
          { autoDeliveryCostUsd: { gt: 0 } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const deliveredOrders = orders.filter((order) => order.autoDeliveryAt || order.autoDeliveryCostUsd);
  const totalCostUsd = deliveredOrders.reduce((sum, order) => sum + (order.autoDeliveryCostUsd || 0), 0);
  const totalRevenueRub = deliveredOrders.reduce((sum, order) => sum + (order.autoDeliveryRevenueRub || 0), 0);

  return NextResponse.json({
    balance,
    lowBalanceLimitUsd: LOW_BALANCE_LIMIT_USD,
    logs,
    stats: {
      deliveredCount: deliveredOrders.length,
      totalCostUsd,
      totalRevenueRub,
    },
  });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const body = await req.json().catch(() => ({}));
  const orderId = Number(body.orderId);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Некорректный номер заказа." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден." }, { status: 404 });
  }

  if (order.status !== "Оплачен" && order.status !== "В работе") {
    return NextResponse.json(
      { error: "Повторная автовыдача доступна только для оплаченных заказов." },
      { status: 400 }
    );
  }

  const result = await attemptAutoDeliveryForOrder(order);

  return NextResponse.json({
    ok: true,
    order: result,
  });
}
