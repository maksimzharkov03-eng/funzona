import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка загрузки игр" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rubPrice = Math.ceil(
      Number(body.originalPrice || 0) *
      Number(body.rate || 1)
    );

    const game = await prisma.game.create({
      data: {
        title: body.title || "Без названия",
        image: body.image || "",
        platform: body.platform || "PS5",
        region: body.region || "Турция",
        originalPrice: Number(body.originalPrice || 0),
        currency: body.currency || "TRY",
        rubPrice,
      },
    });

    return NextResponse.json(game);
  } catch (error: any) {
    console.log("GAME CREATE ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Ошибка создания игры",
      },
      { status: 500 }
    );
  }
}