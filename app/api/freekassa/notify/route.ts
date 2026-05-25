import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function priceToCents(price: string) {
  const normalized = String(price)
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const value = Number(normalized || 0);

  return Math.round(value * 100);
}

function text(value: FormDataEntryValue | string | null) {
  return String(value || "").trim();
}

async function sendOwnerTelegram(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  try {
    await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (error) {
    console.log("PAYMENT TELEGRAM ERROR:", error);
  }
}

async function readFreeKassaPayload(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  const url = new URL(req.url);
  const fields = new Map<string, string>();

  url.searchParams.forEach((value, key) => fields.set(key, value));

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    Object.entries(body || {}).forEach(([key, value]) => {
      fields.set(key, String(value || ""));
    });
    return fields;
  }

  const form = await req.formData().catch(() => null);

  if (form) {
    form.forEach((value, key) => fields.set(key, text(value)));
  }

  return fields;
}

async function handleNotify(req: Request) {
  const fields = await readFreeKassaPayload(req);
  const merchantId = text(fields.get("MERCHANT_ID") || fields.get("m"));
  const amount = text(fields.get("AMOUNT") || fields.get("oa"));
  const orderId = text(fields.get("MERCHANT_ORDER_ID") || fields.get("o"));
  const sign = text(fields.get("SIGN") || fields.get("s")).toLowerCase();
  const expectedMerchantId = process.env.FREEKASSA_MERCHANT_ID || "";
  const secret2 = process.env.FREEKASSA_SECRET_2 || "";

  console.log("FREEKASSA NOTIFY:", {
    merchantId,
    amount,
    orderId,
    hasSign: Boolean(sign),
  });

  if (!expectedMerchantId || !secret2) {
    return new NextResponse("NO SETTINGS", { status: 500 });
  }

  if (merchantId !== expectedMerchantId) {
    return new NextResponse("WRONG MERCHANT", { status: 400 });
  }

  if (!amount || !orderId || !sign) {
    return new NextResponse("NO REQUIRED FIELDS", { status: 400 });
  }

  const expectedSign = md5(
    merchantId + ":" + amount + ":" + secret2 + ":" + orderId
  ).toLowerCase();

  if (sign !== expectedSign) {
    console.log("FREEKASSA WRONG SIGN:", { expectedSign, sign });
    return new NextResponse("WRONG SIGN", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!order) {
    return new NextResponse("ORDER NOT FOUND", { status: 404 });
  }

  const expectedCents = priceToCents(order.productPrice);
  const paidCents = priceToCents(amount);

  if (expectedCents !== paidCents) {
    console.log("FREEKASSA WRONG AMOUNT:", {
      orderId,
      expected: order.productPrice,
      amount,
      expectedCents,
      paidCents,
    });

    return new NextResponse("WRONG AMOUNT", { status: 400 });
  }

  if (order.status === "Оплачен" || order.status === "В работе" || order.status === "Выдан") {
    return new NextResponse("YES", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "Оплачен" },
  });

  const paymentText =
    "✅ Оплата получена по заказу #" +
    updated.id +
    "\n" +
    "Сумма: " +
    updated.productPrice +
    "\n" +
    "Клиент: " +
    (updated.userLogin || "не указан") +
    "\n" +
    "Товар: " +
    updated.productName;

  if (updated.userLogin) {
    await prisma.chatMessage.createMany({
      data: [
        {
          userLogin: updated.userLogin,
          sender: "system",
          text: paymentText,
          readByAdmin: false,
          readByUser: true,
        },
        {
          userLogin: updated.userLogin,
          sender: "admin",
          text:
            "Оплата по заказу #" +
            updated.id +
            " получена. Заказ передан в работу.",
          readByAdmin: true,
          readByUser: false,
        },
      ],
    });
  }

  await sendOwnerTelegram(
    "✅ Оплачен заказ FunZona\n\n" +
      "🆔 Заказ #" +
      updated.id +
      "\n" +
      "💰 Сумма: " +
      updated.productPrice +
      "\n" +
      "👤 Клиент: " +
      (updated.userLogin || "не указан") +
      "\n" +
      "📦 " +
      updated.productName
  );

  return new NextResponse("YES", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    return await handleNotify(req);
  } catch (error) {
    console.log("FREEKASSA NOTIFY ERROR:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  if (url.searchParams.has("MERCHANT_ORDER_ID") || url.searchParams.has("o")) {
    try {
      return await handleNotify(req);
    } catch (error) {
      console.log("FREEKASSA NOTIFY GET ERROR:", error);
      return new NextResponse("ERROR", { status: 500 });
    }
  }

  return new NextResponse("FreeKassa notify endpoint", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
