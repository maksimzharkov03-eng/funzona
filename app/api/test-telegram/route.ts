import { NextResponse } from "next/server";

export async function GET() {
  const botToken = process.env.8883036111:AAHz1bsM7LCwirIpZ6KTLQPKE-NkcplHtPA;
  const chatId = process.env.7161244360;

  if (!botToken || !chatId) {
    return NextResponse.json({
      error: "Нет 8883036111:AAHz1bsM7LCwirIpZ6KTLQPKE-NkcplHtPA или 7161244360",
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