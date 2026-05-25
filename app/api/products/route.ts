import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { staticCatalogProducts } from "@/app/data/products";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });
  const existingProducts = new Set(
    products.map((product) =>
      `${product.category}:${product.name}`.trim().toLowerCase()
    )
  );
  const builtInProducts = staticCatalogProducts.filter(
    (product) =>
      !existingProducts.has(
        `${product.category}:${product.name}`.trim().toLowerCase()
      )
  );

  return NextResponse.json([...builtInProducts, ...products]);
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