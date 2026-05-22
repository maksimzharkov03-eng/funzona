import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      category: body.category,
      description: body.description,
      price: body.price,
      image: body.image,
    },
  });

  return NextResponse.json(product);
}