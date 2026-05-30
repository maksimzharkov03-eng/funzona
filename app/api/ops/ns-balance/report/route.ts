import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request) {
  const expected = process.env.NS_BALANCE_REPORT_SECRET;
  const authorization = req.headers.get("authorization");

  return Boolean(expected && authorization === `Bearer ${expected}`);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const balanceUsd = Number(body.balanceUsd);

  if (!Number.isFinite(balanceUsd) || balanceUsd < 0) {
    return NextResponse.json({ error: "Invalid balanceUsd" }, { status: 400 });
  }

  const snapshot = await prisma.nsBalanceSnapshot.upsert({
    where: { id: 1 },
    update: {
      balanceUsd,
      source: "vps",
      checkedAt: new Date(),
    },
    create: {
      id: 1,
      balanceUsd,
      source: "vps",
      checkedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    balanceUsd: snapshot.balanceUsd,
    checkedAt: snapshot.checkedAt,
  });
}
