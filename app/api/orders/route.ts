import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import crypto from "node:crypto";
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

const SBP_FEE_RATE = 0.025;

function calculateSbpClientFee(amount: number) {
  return Math.ceil(Math.max(0, amount) * SBP_FEE_RATE);
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

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function encodePaymentOrderId(orderId: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let value = Math.max(1, orderId);
  let code = "";

  while (value > 0) {
    value -= 1;
    code = alphabet[value % alphabet.length] + code;
    value = Math.floor(value / alphabet.length);
  }

  return "FunZona-" + code;
}

function createFreeKassaPaymentUrl(orderId: number, amountValue: number, userLogin: string) {
  const paymentOrderId = encodePaymentOrderId(orderId);
  const merchantId = process.env.FREEKASSA_MERCHANT_ID;
  const secret = process.env.FREEKASSA_SECRET_1;
  const currency = process.env.FREEKASSA_CURRENCY || "RUB";
  const paymentMethod = process.env.FREEKASSA_PAYMENT_METHOD || "42";
  const defaultEmail = process.env.FREEKASSA_DEFAULT_EMAIL || "";

  if (!merchantId || !secret) return null;

  const amount = amountValue.toFixed(2);
  const signature = md5(
    merchantId + ":" + amount + ":" + secret + ":" + currency + ":" + paymentOrderId
  );
  const url = new URL("https://pay.fk.money/");

  url.searchParams.set("m", merchantId);
  url.searchParams.set("oa", amount);
  url.searchParams.set("o", paymentOrderId);
  url.searchParams.set("us_order_id", String(orderId));
  url.searchParams.set("s", signature);
  url.searchParams.set("currency", currency);
  url.searchParams.set("i", paymentMethod);
  url.searchParams.set("lang", "ru");

  if (defaultEmail) {
    url.searchParams.set("em", defaultEmail);
    url.searchParams.set("email", defaultEmail);
  }

  url.searchParams.set("us_login", userLogin.replace(/[^a-zA-Z0-9_-]/g, "_"));

  return url.toString();
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
        telegram: body.telegram || "Чат на сайте",
        payment: body.payment || "Не указано",
        paymentAmount: formatRub(paymentAmount),
        paymentFee: formatRub(paymentFee),
        comment: orderComment,
        productName,
        productPrice,
        userLogin,
      },
    });

    const basePaymentAmount = items.length > 0 ? totalFromItems : priceToNumber(productPrice);
    const paymentFee =
      (body.payment || "СБП") === "СБП" ? calculateSbpClientFee(basePaymentAmount) : 0;
    const paymentAmount = basePaymentAmount + paymentFee;
    const paymentUrl = createFreeKassaPaymentUrl(order.id, paymentAmount, userLogin);

    const siteChatMessage =
      "🛒 Новый заказ #" +
      order.id +
      "\n\n" +
      "Покупатель: " +
      userLogin +
      "\n" +
      "Сумма заказа: " +
      productPrice +
      "\n" +
      "Комиссия СБП: " +
      formatRub(paymentFee) +
      "\n" +
      "К оплате: " +
      formatRub(paymentAmount) +
      "\n" +
      "Оплата: " +
      (body.payment || "Не указано") +
      "\n" +
      "Связь: " +
      (body.telegram || "Чат на сайте") +
      "\n\n" +
      (itemsText ? "Состав заказа:\n" + itemsText + "\n\n" : "") +
      "Комментарий клиента:\n" +
      (body.comment || "Нет");

    await prisma.chatMessage.create({
      data: {
        userLogin,
        sender: "user",
        text: siteChatMessage,
        readByAdmin: false,
        readByUser: true,
      },
    });

    return NextResponse.json({
      ...order,
      paymentUrl,
    });
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
