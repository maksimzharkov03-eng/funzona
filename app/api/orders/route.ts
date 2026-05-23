import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const login = searchParams.get("login");

    const orders = await prisma.order.findMany({
      where: login
        ? {
            userLogin: login,
          }
        : {},
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Ошибка загрузки заказов",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let userLogin = body.userLogin;

    if (!userLogin) {
      const token = (await cookies()).get("token")?.value;

      if (token) {
        try {
          const payload: any = await verifyToken(token);
          userLogin = payload.login;
        } catch {
          userLogin = "";
        }
      }
    }

    if (!body.telegram) {
      return NextResponse.json(
        { error: "Не указан Telegram" },
        { status: 400 }
      );
    }

    if (!userLogin) {
      return NextResponse.json(
        { error: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    const productName =
      body.productName || "Товар без названия";

    const productPrice =
      body.productPrice || "Цена не указана";

    const order = await prisma.order.create({
      data: {
        status: "Ожидает оплаты",
        telegram: body.telegram,
        payment: body.payment || "Не указано",
        comment: body.comment || "",
        productName,
        productPrice,
        userLogin,
      },
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `
🔥 Новый заказ FunZona

📦 Товар: ${productName}
💰 Цена: ${productPrice}

👤 Логин клиента: ${userLogin}
💬 Telegram: ${body.telegram}
💳 Оплата: ${body.payment || "Не указано"}

📝 Комментарий:
${body.comment || "Нет"}

🆔 Заказ #${order.id}
`;

      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.log("ORDER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message || "Ошибка создания заказа",
      },
      { status: 500 }
    );
  }
}
