"use client";

import { useEffect, useState } from "react";
import AddToCartButton from "./AddToCartButton";

export default function ProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const res = await fetch("/api/products");
      const data = await res.json();

      const found = data.find((item: any) => String(item.id) === String(id));

      setProduct(found || null);
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        Загрузка товара...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        Товар не найден
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <a href="/catalog" className="text-yellow-400 font-bold">
          ← В каталог
        </a>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-3xl h-96 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <h1 className="text-5xl font-black text-yellow-400 text-center">
                {product.name}
              </h1>
            )}
          </div>

          <div>
            <p className="text-yellow-400 font-bold">{product.category}</p>

            <h1 className="text-5xl font-black mt-3">
              {product.name}
            </h1>

            <p className="text-gray-400 mt-5">
              {product.description}
            </p>

            <p className="text-4xl font-black mt-8">
              {product.price}
            </p>

            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}