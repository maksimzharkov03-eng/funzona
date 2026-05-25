"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const categories = [
  { name: "Все", icon: "✦", hint: "Витрина" },
  { name: "Подписки", icon: "▣", hint: "PS Plus" },
  { name: "PlayStation", icon: "◈", hint: "PSN" },
  { name: "ChatGPT", icon: "⌘", hint: "AI" },
  { name: "Apple ID", icon: "●", hint: "Коды" },
  { name: "Игры", icon: "◆", hint: "PS4/PS5" },
];

const quickCards = [
  {
    title: "ChatGPT",
    subtitle: "Plus, GO, x5, x20",
    href: "/catalog?category=ChatGPT",
    icon: "⌘",
  },
  {
    title: "Apple ID",
    subtitle: "India, Turkey, USA",
    href: "/catalog?category=Apple%20ID",
    icon: "●",
  },
  {
    title: "PlayStation",
    subtitle: "Подписки и цифровые товары",
    href: "/catalog?category=PlayStation",
    icon: "◈",
  },
];

function ProductImage({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  if (!src) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(circle_at_top,#ffd40044,transparent_48%),linear-gradient(145deg,#171100,#050505)]">
        <span className="text-4xl text-yellow-400 font-black">FZ</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("Все");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const categoryNames = categories.map((item) => item.name);

    if (categoryFromUrl && categoryNames.includes(categoryFromUrl)) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (category === "Все") return products;
    return products.filter((product) => product.category === category);
  }, [category, products]);

  function selectCategory(item: string) {
    if (item === "Подписки") {
      window.location.href = "/subscriptions";
      return;
    }

    if (item === "Игры") {
      window.location.href = "/games";
      return;
    }

    setCategory(item);
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-7 sm:py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd4001f,transparent_32%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <section className="mb-7 sm:mb-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 border border-yellow-400/25 bg-yellow-400/10 text-yellow-400 rounded-full px-4 py-2 text-xs sm:text-sm font-black mb-4">
                FUNZONA MARKET
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none">
                Каталог <span className="text-yellow-400">товаров</span>
              </h1>

              <p className="text-gray-400 mt-4 max-w-2xl text-sm sm:text-base leading-7">
                Подписки, пополнения, Apple ID, ChatGPT и игры.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-white/5 px-4 py-3 w-fit">
              <p className="text-xs text-gray-500 font-black uppercase">В наличии</p>
              <p className="text-2xl font-black text-yellow-400">
                {filteredProducts.length}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-7">
          {quickCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group min-h-28 rounded-3xl border border-yellow-400/15 bg-[linear-gradient(135deg,#151100,#050505)] p-4 sm:p-5 hover:border-yellow-400 transition overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center text-2xl font-black group-hover:scale-105 transition">
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black truncate">
                    {card.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className="mb-7 sm:mb-9">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((item) => {
              const active = category === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => selectCategory(item.name)}
                  className={[
                    "min-h-20 rounded-3xl border p-3 text-left transition",
                    active
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_24px_rgba(255,212,0,0.32)]"
                      : "bg-white/5 border-yellow-400/15 hover:border-yellow-400 hover:bg-yellow-400/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-2xl text-lg font-black",
                      active ? "bg-black text-yellow-400" : "bg-yellow-400 text-black",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="block mt-3 font-black text-sm sm:text-base leading-tight">
                    {item.name}
                  </span>
                  <span
                    className={[
                      "block mt-1 text-xs font-bold",
                      active ? "text-black/60" : "text-gray-500",
                    ].join(" ")}
                  >
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div
                key={item}
                className="h-72 rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
              Товаров пока нет
            </h2>

            <p className="text-gray-400 mt-3">
              Выбери другую категорию или вернись позже.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <a
                href={"/product/" + product.id}
                key={product.id}
                className="group relative bg-gradient-to-b from-yellow-400/10 via-white/5 to-black border border-yellow-400/10 rounded-3xl p-3 hover:border-yellow-400 hover:-translate-y-1 transition duration-300 overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="h-28 sm:h-32 rounded-2xl overflow-hidden mb-3 bg-yellow-400/10 flex items-center justify-center">
                    <ProductImage src={product.image} name={product.name} />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-yellow-400 text-[11px] sm:text-xs font-black truncate">
                      {product.category}
                    </p>

                    <span className="text-[10px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full px-2 py-1 font-black shrink-0">
                      Гарантия
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-black mt-2 group-hover:text-yellow-400 transition line-clamp-2 min-h-10">
                    {product.name}
                  </h2>

                  <p className="text-gray-500 mt-2 text-xs sm:text-sm line-clamp-2 min-h-9">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-4">
                    <p className="text-lg sm:text-xl font-black text-yellow-400 whitespace-nowrap">
                      {product.price}
                    </p>

                    <span className="h-9 w-9 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black group-hover:bg-yellow-300 transition shrink-0">
                      →
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
