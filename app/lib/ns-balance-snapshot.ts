import { prisma } from "@/app/lib/prisma";

export async function getStoredNsBalance() {
  const snapshot = await prisma.nsBalanceSnapshot.findUnique({
    where: { id: 1 },
  });

  if (!snapshot) {
    return {
      available: false,
      amount: null,
      message: "VPS еще не передал баланс на сайт.",
      checkedAt: null,
      source: "vps",
    };
  }

  return {
    available: true,
    amount: snapshot.balanceUsd,
    checkedAt: snapshot.checkedAt,
    source: snapshot.source,
    message: undefined,
  };
}
