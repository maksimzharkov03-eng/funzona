import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getNsGiftsBalance } from "@/app/lib/auto-delivery";

export const dynamic = "force-dynamic";

type NsBalanceInfo = {
  available: boolean;
  amount: number | null;
  endpoint?: string;
  message?: string;
  raw?: unknown;
};

const LOW_BALANCE_LIMIT_USD = Number(process.env.NS_GIFTS_LOW_BALANCE_LIMIT_USD || 50);
const ALERT_INTERVAL_MS = Number(process.env.NS_GIFTS_LOW_BALANCE_ALERT_HOURS || 6) * 60 * 60 * 1000;
const ERROR_ALERT_AFTER_CONSECUTIVE_FAILURES = Number(process.env.NS_GIFTS_BALANCE_ERROR_ALERT_AFTER || 3);

function isAuthorized(req: Request) {
  const secret = process.env.NS_BALANCE_CRON_SECRET || process.env.CRON_SECRET;
  const url = new URL(req.url);
  const key = req.headers.get("x-cron-secret") || url.searchParams.get("key");

  return Boolean(secret && key && key === secret);
}

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

async function recentlyLogged(status: string) {
  const lastLog = await prisma.autoDeliveryLog.findFirst({
    where: {
      provider: "NS Gifts",
      status,
    },
    orderBy: { createdAt: "desc" },
  });

  return Boolean(lastLog && Date.now() - lastLog.createdAt.getTime() < ALERT_INTERVAL_MS);
}

async function logBalance(status: string, message: string) {
  await prisma.autoDeliveryLog.create({
    data: {
      orderId: null,
      provider: "NS Gifts",
      status,
      message: message.slice(0, 1000),
      costUsd: null,
    },
  });
}

async function handleLowBalance(balance: NsBalanceInfo) {
  if (!balance.available || typeof balance.amount !== "number" || balance.amount > LOW_BALANCE_LIMIT_USD) {
    return { alertSent: false, reason: "balance-ok" };
  }

  if (await recentlyLogged("balance-warning")) {
    return { alertSent: false, reason: "recent-warning-exists" };
  }

  const text = `⚠️ <b>FunZona: низкий баланс NS Gifts</b>\n\nТекущий баланс: <b>$${balance.amount.toFixed(
    2
  )}</b>\nПорог: <b>$${LOW_BALANCE_LIMIT_USD.toFixed(2)}</b>\n\nНужно пополнить NS Gifts, чтобы автовыдача Apple-кодов не остановилась.`;

  const sent = await sendTelegramMessage(text);

  await logBalance(
    "balance-warning",
    sent
      ? `Telegram-уведомление отправлено. Баланс NS Gifts: $${balance.amount.toFixed(2)}.`
      : `Баланс NS Gifts низкий ($${balance.amount.toFixed(2)}), но Telegram не настроен или не ответил.`
  );

  return { alertSent: sent, reason: sent ? "sent" : "telegram-failed" };
}

async function handleBalanceCheckError(message: string) {
  await logBalance("balance-check-error", message);

  const latestLogs = await prisma.autoDeliveryLog.findMany({
    where: {
      provider: "NS Gifts",
      status: {
        in: ["balance-check-error", "balance-warning"],
      },
    },
    orderBy: { createdAt: "desc" },
    take: ERROR_ALERT_AFTER_CONSECUTIVE_FAILURES,
  });

  const consecutiveErrors =
    latestLogs.length >= ERROR_ALERT_AFTER_CONSECUTIVE_FAILURES &&
    latestLogs.every((log) => log.status === "balance-check-error");

  if (!consecutiveErrors) {
    return {
      alertSent: false,
      reason: `waiting-for-${ERROR_ALERT_AFTER_CONSECUTIVE_FAILURES}-consecutive-errors`,
    };
  }

  if (await recentlyLogged("balance-check-error-alert")) {
    return { alertSent: false, reason: "recent-error-alert-exists" };
  }

  const text = `⚠️ <b>FunZona: NS Gifts не отвечает по балансу</b>\n\nОшибка повторилась ${ERROR_ALERT_AFTER_CONSECUTIVE_FAILURES} раза подряд.\nПоследняя ошибка: <code>${message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")}</code>\n\nАвтовыдача кодов может работать, но баланс сейчас проверить не удалось.`;

  const sent = await sendTelegramMessage(text);
  await logBalance(
    "balance-check-error-alert",
    sent ? `Telegram-уведомление отправлено после серии ошибок: ${message}` : `Серия ошибок, Telegram не ответил: ${message}`
  );

  return { alertSent: sent, reason: sent ? "sent" : "telegram-failed" };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const balance = (await getNsGiftsBalance()) as NsBalanceInfo;

    if (!balance.available) {
      const result = await handleBalanceCheckError(balance.message || "NS Gifts balance unavailable");

      return NextResponse.json({
        ok: false,
        balance,
        alert: result,
      });
    }

    const result = await handleLowBalance(balance);

    return NextResponse.json({
      ok: true,
      balance,
      lowBalanceLimitUsd: LOW_BALANCE_LIMIT_USD,
      alert: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const result = await handleBalanceCheckError(message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
        alert: result,
      },
      { status: 500 }
    );
  }
}
