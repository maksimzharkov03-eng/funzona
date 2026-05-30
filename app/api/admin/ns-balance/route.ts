import { NextResponse } from "next/server";
import { getStoredNsBalance } from "@/app/lib/ns-balance-snapshot";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const balance = await getStoredNsBalance();

  return NextResponse.json({
    balance,
    durationMs: 0,
  });
}
