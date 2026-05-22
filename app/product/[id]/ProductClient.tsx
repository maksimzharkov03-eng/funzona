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
      <main className="min-h-screen bg-black text-white px-6 py-20">
        <div className="max-w-6xl mx-auto h-[500px] rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-20">
        <div className="max-w-4xl mx-auto bg-white/5 border border-yellow-400/20 rounded-3xl p-10 text-center">
          <h1 className="text-4xl font-black text-yellow-400">
            Товар не найден
          </h1>

          <a
            href="/catalog"
            className="inline-block mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black"
          >
            В каталог
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd40022,transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <a href="/catalog" className="text-yellow-400 font-black">
          ← Вернуться в каталог
        </a>

        <div className="grid lg:grid-cols-2 gap-10 mt-10">
          <div className="bg-gradient-to-b from-yellow-400/10 to-white/5 border border-yellow-400/20 rounded-[2rem] p-5">
            <div className="h-[520px] rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl">🎮</div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-yellow-400/20 rounded-[2rem] p-8">
            <div className="inline-flex bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full px-4 py-2 font-black mb-6">
              {product.category}
            </div>

            <h1 className="text-5xl md:text-6xl font-black">
              {product.name}
            </h1>

            <p className="text-gray-400 text-lg mt-6">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-black/60 border border-yellow-400/10 rounded-2xl p-5">
                <p className="text-gray-500">Гарантия</p>
                <p className="font-black text-yellow-400 mt-2">Есть</p>
              </div>

              <div className="bg-black/60 border border-yellow-400/10 rounded-2xl p-5">
                <p className="text-gray-500">Выдача</p>
                <p className="font-black text-yellow-400 mt-2">Быстрая</p>
              </div>
            </div>

            <div className="mt-10 bg-yellow-400 text-black rounded-3xl p-6">
              <p className="text-black/60 font-bold">Стоимость</p>
              <p className="text-5xl font-black mt-2">{product.price}</p>
            </div>

            <AddToCartButton product={product} />

            <p className="text-gray-500 mt-5 text-sm">
              После оформления заказа статус появится в личном кабинете.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}