import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.findUnique({
    where: {
      id: Number(body.productId),
    },
  });

  const order = await prisma.order.create({
  data: {
    status: "Ожидает оплаты",
    telegram: body.telegram,
    payment: body.payment,
    comment: body.comment || "",
  },
  });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId && product) {
    const message = `
🔥 Новый заказ FunZona

📦 Товар: ${product.name}
💰 Цена: ${product.price}

👤 Telegram: ${body.telegram}
💳 Оплата: ${body.payment}

📝 Комментарий:
${body.comment || "Нет"}

🆔 Заказ #${order.id}
`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  }

  return NextResponse.json(order);
}