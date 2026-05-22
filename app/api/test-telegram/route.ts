import { NextResponse } from "next/server";

export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({
      error: "Нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID",
    });
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: "🔥 Тест FunZona: Telegram уведомления работают!",
    }),
  });

  const data = await res.json();

  return NextResponse.json(data);
}