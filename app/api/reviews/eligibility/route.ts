import { prisma } from "@/app/lib/prisma";
import { getServerUser } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getServerUser();

  if (!currentUser) {
    return NextResponse.json({
      canReview: false,
      reason: "Войди в аккаунт. Кнопка отзыва появится после выдачи товара.",
    });
  }

  const existingReview = await prisma.review.findUnique({
    where: { userLogin: currentUser.login },
    select: { status: true, isPublished: true },
  });

  if (existingReview) {
    return NextResponse.json({
      canReview: false,
      reason:
        existingReview.status === "Опубликован"
          ? "Ваш отзыв уже опубликован."
          : "Ваш отзыв уже отправлен на проверку.",
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
