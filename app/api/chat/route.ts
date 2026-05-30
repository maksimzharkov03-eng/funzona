import { getServerUser, forbiddenJson, isAdmin as isAdminUser, unauthorizedJson } from "@/app/lib/server-auth";
import { rateLimit } from "@/app/lib/request-security";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

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
  const currentUser = await getServerUser();

  if (!currentUser) {
    return unauthorizedJson();
  }
  const { searchParams } = new URL(req.url);
  const requestedChatLogin =
    searchParams.get("login") || searchParams.get("userLogin");
  const chatMode = searchParams.get("mode");

  if (chatMode === "conversations" && !isAdminUser(currentUser)) {
    return forbiddenJson();
  }

  if (requestedChatLogin && !isAdminUser(currentUser) && requestedChatLogin !== currentUser.login) {
    return forbiddenJson();
  }
  const mode = searchParams.get("mode");
  const userLogin = searchParams.get("userLogin");
  const isAdmin = isAdminUser(currentUser);

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

  const targetLogin = isAdmin && userLogin ? userLogin : currentUser.login;

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
  const limited = rateLimit(req, "chat-send", 40, 300000);
  if (limited) return limited;
  const currentUser = await getServerUser();

  if (!currentUser) {
    return unauthorizedJson();
  }
  const body = await req.json();

  if (body.sender === "admin" && !isAdminUser(currentUser)) {
    return forbiddenJson();
  }

  if (body.sender !== "admin") {
    body.sender = "user";
    body.userLogin = currentUser.login;
  }
  const text = cleanText(body.text);
  const isAdmin = isAdminUser(currentUser);
  const userLogin = isAdmin ? cleanText(body.userLogin) : currentUser.login;

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
