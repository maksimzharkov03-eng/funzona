"use client";

import { useEffect, useState } from "react";

export default function CatalogPage() {
  const categories = ["Все", "PlayStation", "ChatGPT", "Apple ID", "Игровые товары"];

  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("Все");

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    }

    loadProducts();
  }, []);

  const filteredProducts =
    category === "Все"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Каталог FunZona
        </h1>

        <p className="text-gray-400 mb-10">
          Подписки, пополнения и цифровые товары
        </p>

        <div className="flex gap-4 mb-10 flex-wrap">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-5 py-2 rounded-xl transition border ${
                category === item
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 border-yellow-400/20 hover:border-yellow-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-gradient-to-b from-yellow-400/10 to-black border border-yellow-400/10 rounded-3xl p-6 hover:border-yellow-400 hover:-translate-y-2 transition duration-300 overflow-hidden"
            >
              {product.image && (
                <div className="h-44 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
              )}

              <p className="text-yellow-400 text-sm font-bold">
                {product.category}
              </p>

              <h2 className="text-2xl font-black mt-3 group-hover:text-yellow-400 transition">
                {product.name}
              </h2>

              <p className="text-gray-400 mt-3">
                {product.description}
              </p>

              <p className="text-3xl font-black mt-6">
                {product.price}
              </p>

              <a
                href={`/product/${product.id}`}
                className="block text-center mt-6 w-full bg-yellow-400 text-black py-3 rounded-xl font-black hover:bg-yellow-300 transition"
              >
                Купить
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}