import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

const PROMOTE_SECRET = "FZ_PROMOTE_ADMIN_2026_9KQ4P7";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";

  if (key !== PROMOTE_SECRET) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { login: "admin" },
    data: { role: "admin" },
    select: { login: true, role: true },
  });

  return NextResponse.json(
    { ok: true, user },
    { headers: { "Cache-Control": "no-store" } }
  );
}
