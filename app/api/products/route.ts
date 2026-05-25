import { prisma } from "@/app/lib/prisma";
import { staticCatalogProducts } from "@/app/data/products";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    return NextResponse.json([...builtInProducts, ...products], {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    console.log("PRODUCT LOAD ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка загрузки товаров" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const price = String(body.price || "").trim();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Название и цена обязательны" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: String(body.category || "ChatGPT").trim(),
        description: String(body.description || "").trim(),
        price,
        image: body.image ? String(body.image) : null,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.log("PRODUCT CREATE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка добавления товара" },
      { status: 500 }
    );
  }
}
