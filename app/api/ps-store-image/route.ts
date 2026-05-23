import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Нет ссылки на картинку" }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Некорректная ссылка" }, { status: 400 });
  }

  if (parsedUrl.hostname !== "image.api.playstation.com") {
    return NextResponse.json({ error: "Источник не разрешён" }, { status: 403 });
  }

  const imageResponse = await fetch(parsedUrl.toString(), {
    headers: {
      "user-agent": "Mozilla/5.0 FunZona",
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!imageResponse.ok || !imageResponse.body) {
    return NextResponse.json({ error: "Картинка недоступна" }, { status: 502 });
  }

  return new NextResponse(imageResponse.body, {
    headers: {
      "content-type": imageResponse.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
