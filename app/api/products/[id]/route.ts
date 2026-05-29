import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  {
  const admin = await requireAdminUser();

  if (!admin) {
    return forbiddenJson();
  }
 params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({ success: true });
}