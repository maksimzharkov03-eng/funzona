import { prisma } from "@/app/lib/prisma";
import { getServerUser, unauthorizedJson } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanText(value: unknown, max = 500) {
  return String(value || "").replace(/<[^>]*>/g, "").trim().slice(0, max);
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    return NextResponse.json(reviews, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Не удалось загрузить отзывы" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getServerUser();

    if (!currentUser) {
      return unauthorizedJson("Чтобы оставить отзыв, войди в аккаунт после покупки.");
    }

    const completedOrder = await prisma.order.findFirst({
      where: {
        userLogin: currentUser.login,
        status: {
          in: ["Оплачен", "В работе", "Выдан"],
        },
      },
      select: { id: true },
    });

    if (!completedOrder) {
      return NextResponse.json(
        { error: "Отзыв можно оставить только после оплаченной сделки." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const name = cleanText(body.name, 40) || "Клиент FunZona";
    const text = cleanText(body.text, 600);
    const rating = Math.max(1, Math.min(5, Number(body.rating || 5)));

    if (text.length < 8) {
      return NextResponse.json(
        { error: "Напиши отзыв чуть подробнее" },
        { status: 400 },
      );
    }

    const review = await prisma.review.create({
      data: {
        name,
        text,
        rating,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Не удалось сохранить отзыв" },
      { status: 500 },
    );
  }
}
