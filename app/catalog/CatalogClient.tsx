"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CatalogClient() {
  const categories = [
    "Все",
    "Подписки",
    "PlayStation",
    "ChatGPT",
    "Apple ID",
    "Игровые товары",
  ];

  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("Все");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");

    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();

      setProducts(data);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts =
    category === "Все"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd40022,transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-6">
            FUNZONA MARKETPLACE
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black">
            Каталог <span className="text-yellow-400">товаров</span>
          </h1>

          <p className="text-gray-400 mt-5 max-w-2xl text-base sm:text-lg leading-7">
            Подписки, пополнения, Apple ID, ChatGPT и игровые цифровые товары.
          </p>
        </div>

        <div className="flex gap-3 sm:gap-4 mb-8 sm:mb-10 flex-wrap">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Подписки") {
                  window.location.href = "/subscriptions";
                  return;
                }

                setCategory(item);
              }}
              className={`px-4 sm:px-6 py-3 rounded-2xl transition border text-sm sm:text-base font-black ${
                category === item
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_25px_rgba(255,212,0,0.35)]"
                  : "bg-white/5 border-yellow-400/20 hover:border-yellow-400 hover:bg-yellow-400/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[430px] rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
              Товаров пока нет
            </h2>

            <p className="text-gray-400 mt-3">
              Добавь товары через админку FunZona.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <a
                href={`/product/${product.id}`}
                key={product.id}
                className="group relative bg-gradient-to-b from-yellow-400/10 via-white/5 to-black border border-yellow-400/10 rounded-3xl p-4 sm:p-5 hover:border-yellow-400 hover:-translate-y-2 transition duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top,#ffd40033,transparent_45%)]" />

                <div className="relative z-10">
                  <div className="h-48 rounded-2xl overflow-hidden mb-5 bg-yellow-400/10 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="text-5xl">🎮</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-yellow-400 text-sm font-black">
                      {product.category}
                    </p>

                    <span className="text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full px-3 py-1 font-black">
                      Гарантия
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black mt-3 group-hover:text-yellow-400 transition line-clamp-2">
                    {product.name}
                  </h2>

                  <p className="text-gray-400 mt-3 line-clamp-2 min-h-[48px]">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-6">
                    <p className="text-2xl sm:text-3xl font-black text-yellow-400">
                      {product.price}
                    </p>

                    <span className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-black group-hover:bg-yellow-300 transition">
                      Купить
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
