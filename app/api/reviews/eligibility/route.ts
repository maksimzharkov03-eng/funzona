import { prisma } from "@/app/lib/prisma";
import { getServerUser } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getServerUser();

  if (!currentUser) {
    return NextResponse.json({
      canReview: false,
      reason: "Войди в аккаунт, чтобы оставить отзыв после выдачи товара.",
    });
  }

  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userLogin: currentUser.login,
      status: "Выдан",
    },
    select: { id: true },
  });

  if (!deliveredOrder) {
    return NextResponse.json({
      canReview: false,
      reason: "Кнопка отзыва появится после выдачи товара.",
    });
  }

  return NextResponse.json({
    canReview: true,
    reason: "",
  });
}
