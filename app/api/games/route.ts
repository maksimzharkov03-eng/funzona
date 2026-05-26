import { prisma } from "@/app/lib/prisma";
import { calculateRubPrice, demoGames, roundTryPrice, roundUahPrice } from "@/app/lib/games";
import { storeGames } from "@/app/data/ps-store-games";
import { getPlayStationStoreCatalog } from "@/app/lib/ps-store-catalog";
import { NextResponse } from "next/server";

function normalizeGameTitle(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/\b(standard|ultimate|deluxe|premium|edition|издание|стандартное|ультимейт|делюкс)\b/g, "")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBadCatalogGame(game: { title?: string | null; image?: string | null; publisher?: string | null }) {
  const text = [game.title, game.publisher].filter(Boolean).join(" ").toLowerCase();
  const image = String(game.image || "").toLowerCase();

  return (
    text.includes("aca neogeo") ||
    text.includes("arcade archives") ||
    text.includes("johnny turbo") ||
    text.includes("hamster") ||
    image.includes("placeholder") ||
    image.includes("noimage") ||
    image.includes("missing")
  );
}

function dedupeCatalog<T extends { title: string; platform: string; region: string; image?: string | null; isFeatured?: boolean | null; discountPercent?: number | null }>(games: T[]) {
  const map = new Map<string, T>();

  for (const game of games) {
    if (isBadCatalogGame(game)) continue;

    const key = [normalizeGameTitle(game.title), game.platform, game.region].join("|");
    const existing = map.get(key);

    if (!existing) {
      map.set(key, game);
      continue;
    }

    const existingScore =
      Number(existing.isFeatured || 0) * 100000 +
      Number(existing.discountPercent || 0) * 100 +
      Number(Boolean(existing.image));
    const nextScore =
      Number(game.isFeatured || 0) * 100000 +
      Number(game.discountPercent || 0) * 100 +
      Number(Boolean(game.image));

    if (nextScore > existingScore) map.set(key, game);
  }

  return Array.from(map.values());
}

const apiCacheHeaders = {
  "Cache-Control": "public, max-age=900, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET() {
  try {
    const storeCatalog = await getPlayStationStoreCatalog();
    const baseCatalog = storeCatalog.length > 0 ? storeCatalog : storeGames;
    const games = await prisma.game.findMany({
      orderBy: [{ isFeatured: "desc" }, { id: "desc" }],
    });
    const existingTitles = new Set(
      baseCatalog.map((game) => `${game.region}:${game.title}`.trim().toLowerCase())
    );
    const customGames = games.filter(
      (game) =>
        !existingTitles.has(`${game.region}:${game.title}`.trim().toLowerCase()) &&
        game.title.trim() !== "EA SPORTS FC™ 26" &&
        Number(game.originalPrice) > 0 &&
        Number(game.rubPrice) > 0
    );

    return NextResponse.json(dedupeCatalog([...baseCatalog, ...customGames]), { headers: apiCacheHeaders });
  } catch (error) {
    console.log("GAME LOAD ERROR:", error);
    return NextResponse.json(storeGames.length > 0 ? storeGames : demoGames, { headers: apiCacheHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const originalPrice = Number(body.originalPrice || 0);
    const rate = Number(body.rate || body.exchangeRate || 1);
    const currency = body.currency || "TRY";
    const roundedOriginalPrice =
      currency === "TRY"
        ? roundTryPrice(originalPrice)
        : currency === "UAH"
          ? roundUahPrice(originalPrice)
          : originalPrice;
    const manualRubPrice = Number(body.rubPrice || 0);
    const rubPrice =
      manualRubPrice > 0
        ? Math.ceil(manualRubPrice)
        : calculateRubPrice(originalPrice, rate, currency);
    const oldRubPrice = Number(body.oldRubPrice || 0);
    const discountPercent = Number(body.discountPercent || 0);

    const game = await prisma.game.create({
      data: {
        title: body.title || "Без названия",
        image: body.image || "",
        platform: body.platform || "PS5",
        region: body.region || "Турция",
        originalPrice: roundedOriginalPrice,
        currency,
        rubPrice,
        oldRubPrice: oldRubPrice > 0 ? oldRubPrice : null,
        discountPercent: discountPercent > 0 ? discountPercent : null,
        genre: body.genre || null,
        publisher: body.publisher || null,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
        edition: body.edition || null,
        badge: body.badge || null,
        description: body.description || null,
        isFeatured: Boolean(body.isFeatured),
      },
    });

    return NextResponse.json(game);
  } catch (error: any) {
    console.log("GAME CREATE ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Ошибка создания игры" },
      { status: 500 }
    );
  }
}
