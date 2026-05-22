import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      product: true,
      user: true,
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  const order = await prisma.order.create({
    data: {
      status: "Ожидает оплаты",
      telegram: body.telegram,
      payment: body.payment,
      comment: body.comment || "",
      productId: Number(body.productId),
    },
    include: {
      product: true,
    },
  });

  return NextResponse.json(order);
}