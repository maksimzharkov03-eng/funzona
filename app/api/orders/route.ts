import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      product: true,
      user: true,
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const order = await prisma.order.create({
    data: {
      status: "Ожидает оплаты",
      telegram: body.telegram,
      payment: body.payment,
      comment: body.comment || "",
      productId: Number(body.productId),
    },
    include: {
      product: true,
    },
  });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const message = `
🔥 Новый заказ FunZona

📦 Товар: ${order.product.name}
💰 Цена: ${order.product.price}

👤 Telegram: ${body.telegram}
💳 Оплата: ${body.payment}

📝 Комментарий:
${body.comment || "Нет"}

🆔 Заказ #${order.id}
`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });

  return NextResponse.json(order);
}