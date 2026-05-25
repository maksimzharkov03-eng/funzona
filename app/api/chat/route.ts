import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getPayload() {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    return (await verifyToken(token)) as any;
  } catch {
    return null;
  }
}

function cleanText(value: unknown) {
  return String(value || "").trim().slice(0, 2000);
}

function hideClientOrderNumber(message: any) {
  if (message.sender === "system") return null;

  const text = String(message.text || "");

  if (/^Оплата по заказу #\d+ получена\. Заказ передан в работу\.?$/.test(text)) {
    return {
      ...message,
      text: "Оплата получена. Заказ передан в работу.",
    };
  }

  if (/^🛒 Новый заказ #\d+/.test(text)) {
    return {
      ...message,
      text: text.replace(/^🛒 Новый заказ #\d+/, "🛒 Новый заказ отправлен"),
    };
  }

  return message;
}

export async function GET(req: Request) {
  const payload = await getPayload();

  if (!payload?.login) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const userLogin = searchParams.get("userLogin");
  const isAdmin = payload.role === "admin" || payload.login === "admin";

  if (isAdmin && mode === "conversations") {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const conversations = new Map<string, any>();

    for (const message of messages) {
      const current = conversations.get(message.userLogin);

      if (!current) {
        conversations.set(message.userLogin, {
          userLogin: message.userLogin,
          lastText: message.text,
          lastSender: message.sender,
          lastAt: message.createdAt,
          unread: message.sender !== "admin" && !message.readByAdmin ? 1 : 0,
        });
        continue;
      }

      if (message.sender !== "admin" && !message.readByAdmin) {
        current.unread += 1;
      }
    }

    return NextResponse.json(Array.from(conversations.values()));
  }

  const targetLogin = isAdmin && userLogin ? userLogin : payload.login;

  const messages = await prisma.chatMessage.findMany({
    where: { userLogin: targetLogin },
    orderBy: { createdAt: "asc" },
  });

  if (isAdmin) {
    await prisma.chatMessage.updateMany({
      where: {
        userLogin: targetLogin,
        sender: { not: "admin" },
        readByAdmin: false,
      },
      data: { readByAdmin: true },
    });
  } else {
    await prisma.chatMessage.updateMany({
      where: {
        userLogin: targetLogin,
        sender: "admin",
        readByUser: false,
      },
      data: { readByUser: true },
    });
  }

  if (!isAdmin) {
    return NextResponse.json(messages.map(hideClientOrderNumber).filter(Boolean));
  }

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const payload = await getPayload();

  if (!payload?.login) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();
  const text = cleanText(body.text);
  const isAdmin = payload.role === "admin" || payload.login === "admin";
  const userLogin = isAdmin ? cleanText(body.userLogin) : payload.login;

  if (!text) {
    return NextResponse.json({ error: "Введите сообщение" }, { status: 400 });
  }

  if (!userLogin) {
    return NextResponse.json({ error: "Не выбран клиент" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      userLogin,
      sender: isAdmin ? "admin" : "user",
      text,
      readByAdmin: isAdmin,
      readByUser: !isAdmin,
    },
  });

  return NextResponse.json(message);
}
