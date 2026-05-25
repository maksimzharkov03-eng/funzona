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

function priceToNumber(price: string) {
  return Number(String(price).replace(/\D/g, "")) || 0;
}

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

type OrderItemInput = {
  name?: string;
  category?: string;
  description?: string;
  price?: string;
  quantity?: number;
  totalPrice?: string;
};

function normalizeOrderItems(items: unknown): Required<OrderItemInput>[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item: any) => {
      const quantity = Math.max(1, Number(item?.quantity || 1));
      const price = String(item?.price || "0 ₽");
      const totalPrice =
        item?.totalPrice || formatRub(priceToNumber(price) * quantity);

      return {
        name: String(item?.name || "Товар без названия"),
        category: String(item?.category || "Товар"),
        description: String(item?.description || ""),
        price,
        quantity,
        totalPrice,
      };
    })
    .filter((item) => item.name.trim().length > 0);
}

function buildItemsText(items: Required<OrderItemInput>[]) {
  if (items.length === 0) return "";

  return items
    .map(
      (item, index) =>
        String(index + 1) +
        ". " +
        item.name +
        " — " +
        item.price +
        " × " +
        item.quantity +
        " = " +
        item.totalPrice
    )
    .join("\n");
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

    const items = normalizeOrderItems(body.items);
    const itemsText = buildItemsText(items);
    const totalFromItems = items.reduce(
      (sum, item) => sum + priceToNumber(item.price) * item.quantity,
      0
    );

    const productName =
      items.length > 0
        ? "Заказ из " + items.reduce((sum, item) => sum + item.quantity, 0) + " товаров"
        : body.productName || "Товар без названия";

    const productPrice =
      items.length > 0
        ? formatRub(totalFromItems)
        : body.productPrice || "Цена не указана";

    const commentParts = [];

    if (itemsText) {
      commentParts.push("Состав заказа:\n" + itemsText);
    }

    if (body.comment) {
      commentParts.push("Комментарий клиента:\n" + body.comment);
    }

    const orderComment = commentParts.join("\n\n");

    const order = await prisma.order.create({
      data: {
        status: "Ожидает оплаты",
        telegram: body.telegram,
        payment: body.payment || "Не указано",
        comment: orderComment,
        productName,
        productPrice,
        userLogin,
      },
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message =
        "🔥 Новый заказ FunZona\n\n" +
        "📦 " +
        productName +
        "\n" +
        "💰 Итого: " +
        productPrice +
        "\n\n" +
        (itemsText ? "🧾 Состав заказа:\n" + itemsText + "\n\n" : "") +
        "👤 Логин клиента: " +
        userLogin +
        "\n" +
        "💬 Telegram: " +
        body.telegram +
        "\n" +
        "💳 Оплата: " +
        (body.payment || "Не указано") +
        "\n\n" +
        "📝 Комментарий:\n" +
        (body.comment || "Нет") +
        "\n\n" +
        "🆔 Заказ #" +
        order.id;

      await fetch(
        "https://api.telegram.org/bot" + botToken + "/sendMessage",
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
