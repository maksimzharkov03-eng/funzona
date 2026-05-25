import { prisma } from "@/app/lib/prisma";
import { demoGames } from "@/app/lib/games";
import { storeGames } from "@/app/data/ps-store-games";
import { getPlayStationStoreCatalog } from "@/app/lib/ps-store-catalog";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gameId = Number(id);

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (game) return NextResponse.json(game);
  } catch (error) {
    console.log("GAME DETAIL ERROR:", error);
  }

  const fallback = demoGames.find((game) => game.id === gameId);
  const storeCatalog = await getPlayStationStoreCatalog();
  const psStoreGame = [...storeCatalog, ...storeGames].find((game) => game.id === gameId);

  if (psStoreGame) {
    return NextResponse.json(psStoreGame);
  }

  if (!fallback) {
    return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  }

  return NextResponse.json(fallback);
}
