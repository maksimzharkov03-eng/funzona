import { prisma } from "@/app/lib/prisma";
import { rateLimit } from "@/app/lib/request-security";
import {
  forbiddenJson,
  getServerUser,
  isAdmin as isAdminUser,
  unauthorizedJson,
} from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanText(value: unknown, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function cleanLogin(value: unknown) {
  return cleanText(value, 180);
}

function clientSafeMessage(message: any) {
  const text = String(message?.text || "")
    .replace(/Новый заказ\s*#\d+/gi, "Новый заказ")
    .replace(/Заказ\s*#\d+/gi, "Заказ");

  return {
    ...message,
    text,
  };
}

export async function GET(req: Request) {
  const limited = rateLimit(req, "chat-read", 80, 300000);
  if (limited) return limited;

  const currentUser = await getServerUser();

  if (!currentUser) {
    return unauthorizedJson();
  }

  const isAdmin = isAdminUser(currentUser);
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const requestedChatLogin =
    searchParams.get("login") || searchParams.get("userLogin") || "";

  if (mode === "conversations") {
    if (!isAdmin) {
      return forbiddenJson();
    }

    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 700,
    });

    const conversations = new Map<string, any>();

    for (const message of messages) {
      const userLogin = cleanLogin(message.userLogin);
      if (!userLogin) continue;

      const current = conversations.get(userLogin);

      if (!current) {
        conversations.set(userLogin, {
          userLogin,
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

    return NextResponse.json(Array.from(conversations.values()), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const targetLogin = isAdmin ? cleanLogin(requestedChatLogin) : currentUser.login;

  if (isAdmin && !targetLogin) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!isAdmin && requestedChatLogin && requestedChatLogin !== currentUser.login) {
    return forbiddenJson();
  }

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

    return NextResponse.json(messages, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  await prisma.chatMessage.updateMany({
    where: {
      userLogin: targetLogin,
      sender: "admin",
      readByUser: false,
    },
    data: { readByUser: true },
  });

  return NextResponse.json(messages.map(clientSafeMessage), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const limited = rateLimit(req, "chat-send", 40, 300000);
  if (limited) return limited;

  const currentUser = await getServerUser();

  if (!currentUser) {
    return unauthorizedJson();
  }

  const isAdmin = isAdminUser(currentUser);
  const body = await req.json();
  const text = cleanText(body.text);

  if (!text) {
    return NextResponse.json(
      { error: "Сообщение не может быть пустым" },
      { status: 400 },
    );
  }

  const targetLogin = isAdmin
    ? cleanLogin(
        body.userLogin ||
          body.login ||
          body.targetLogin ||
          body.clientLogin ||
          body.conversationLogin,
      )
    : currentUser.login;

  if (isAdmin && (!targetLogin || targetLogin.toLowerCase() === "admin")) {
    return NextResponse.json(
      { error: "Выбери клиента слева перед отправкой ответа." },
      { status: 400 },
    );
  }

  const message = await prisma.chatMessage.create({
    data: {
      userLogin: targetLogin,
      sender: isAdmin ? "admin" : "user",
      text,
      readByAdmin: isAdmin,
      readByUser: !isAdmin,
    },
  });

  return NextResponse.json(message);
}
