import { prisma } from "@/app/lib/prisma";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminUser();

  if (!admin) {
    return forbiddenJson();
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(reviews, {
    headers: { "Cache-Control": "no-store" },
  });
}
