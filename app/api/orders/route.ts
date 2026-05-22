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
  try {
    const body = await req.json();

    if (!body.telegram) {
      return NextResponse.json(
        { error: "Не указан Telegram" },
        { status: 400 }
      );
    }

    const productName = body.productName || "Товар без названия";
    const productPrice = body.productPrice || "Цена не указана";

    const order = await prisma.order.create({
      data: {
        status: "Ожидает оплаты",
        telegram: body.telegram,
        payment: body.payment || "Не указано",
        comment: body.comment || "",
      },
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `
🔥 Новый заказ FunZona

📦 Товар: ${productName}
💰 Цена: ${productPrice}

👤 Telegram: ${body.telegram}
💳 Оплата: ${body.payment || "Не указано"}

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
  } catch (error: any) {
    console.log("ORDER ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Ошибка создания заказа",
      },
      { status: 500 }
    );
  }
}