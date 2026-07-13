import { prisma } from "@/app/lib/prisma";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminUser();

  if (!admin) {
    return forbiddenJson();
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status === "Опубликован" ? "Опубликован" : "Отклонен";

  const review = await prisma.review.update({
    where: { id: Number(id) },
    data: {
      status,
      isPublished: status === "Опубликован",
    },
  });

  return NextResponse.json(review);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminUser();

  if (!admin) {
    return forbiddenJson();
  }

  const { id } = await params;

  await prisma.review.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
