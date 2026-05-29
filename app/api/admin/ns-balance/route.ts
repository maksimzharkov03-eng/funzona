import { NextResponse } from "next/server";
import { getNsGiftsBalance } from "@/app/lib/auto-delivery";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const startedAt = Date.now();
  const balance = await getNsGiftsBalance();

  return NextResponse.json({
    balance,
    durationMs: Date.now() - startedAt,
  });
}
