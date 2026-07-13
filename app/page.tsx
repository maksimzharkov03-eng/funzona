"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  const catalogItems = [
    ["🎮", "PlayStation Plus", "Essential • Extra • Deluxe", "/subscriptions"],
    ["🤖", "ChatGPT", "Plus • Pro • подписки", "/catalog?category=ChatGPT"],
    ["🍏", "Apple ID", "USA • Turkey • India", "/catalog?category=Apple%20ID"],
    ["💳", "Пополнения", "PSN • кошельки • карты", "/catalog?category=PlayStation"],
    ["🕹️", "Игры", "Аккаунты • шеринг • цифровые товары", "/games"],
    ["🎁", "Подарочные карты", "Apple ID • PSN • цифровые коды", "/catalog?category=Apple%20ID"],
    ["⚡", "Быстрая выдача", "После оплаты и проверки", "/checkout"],
    ["🛡️", "Гарантия", "Поддержка и сопровождение", "/support"],
    ["🎮", "PlayStation Plus", "Essential • Extra • Deluxe", "/subscriptions"],
    ["🤖", "ChatGPT", "Plus • Pro • подписки", "/catalog?category=ChatGPT"],
    ["🍏", "Apple ID", "USA • Turkey • India", "/catalog?category=Apple%20ID"],
    ["💳", "Пополнения", "PSN • кошельки • карты", "/catalog?category=PlayStation"],
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();

    setProducts(data.slice(0, 4));
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative min-h-screen px-4 sm:px-6 py-16 sm:py-24 bg-[radial-gradient(circle_at_top,#ffd40055,transparent_35%),linear-gradient(180deg,#1a1600,#000)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffd40022,transparent_55%)] blur-3xl animate-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-8">
            ⚡ PREMIUM DIGITAL STORE
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-9xl font-black text-yellow-400 drop-shadow-[0_0_45px_rgba(255,212,0,0.65)]">Цифровые товары для PlayStation, ChatGPT и Apple ID</h1>

          <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            PS Plus, игры, пополнение PSN, ChatGPT, Apple ID и другие цифровые услуги с быстрым оформлением.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
            <a
              href="/catalog"
              className="bg-yellow-400 text-black px-6 sm:px-9 py-4 rounded-2xl font-black hover:bg-yellow-300 hover:scale-105 transition"
            >
              Перейти в каталог
            </a>

            <a
              href="/support"
              className="border border-yellow-400 px-6 sm:px-9 py-4 rounded-2xl font-black hover:bg-yellow-400/10 hover:scale-105 transition"
            >Написать менеджеру</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-200">
            <span className="rounded-full border border-yellow-400/25 bg-black/35 px-4 py-2">
              Выполнение от 5 до 30 минут
            </span>
            <span className="rounded-full border border-yellow-400/25 bg-black/35 px-4 py-2">
              Поддержка после покупки
            </span>
            <span className="rounded-full border border-yellow-400/25 bg-black/35 px-4 py-2">
              Оплата картой / FreeKassa / крипта
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto mt-16 sm:mt-24">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-10 text-center">
            Популярные товары
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/5 border border-yellow-400/20 rounded-3xl overflow-hidden hover:border-yellow-400 hover:-translate-y-2 transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />

                <div className="p-6">
                  <p className="text-yellow-400 font-black">
                    {product.category}
                  </p>

                  <h3 className="text-2xl font-black mt-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 mt-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-6">
                    <p className="text-2xl font-black text-yellow-400">
                      {product.price}
                    </p>

                    <a
                      href={`/product/${product.id}`}
                      className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-black"
                    >
                      Купить
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto mt-16 sm:mt-24 overflow-hidden">
  <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h2 className="text-3xl sm:text-4xl font-black text-center sm:text-left">
      Каталог FunZona
    </h2>

    <a
      href="/catalog"
      className="w-fit bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black hover:bg-yellow-300 transition"
    >
      Весь каталог
    </a>
  </div>

  <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:overflow-visible sm:animate-[scroll_22s_linear_infinite]">
    {catalogItems.map((cat, index) => (
      <a
        href={cat[3]}
        key={index}
        className="min-w-[220px] sm:min-w-[260px] bg-white/5 border border-yellow-400/20 rounded-3xl p-5 sm:p-6 hover:border-yellow-400 hover:-translate-y-2 transition"
      >
        <div className="text-5xl mb-6">{cat[0]}</div>
        <h3 className="text-2xl font-black text-yellow-400">
          {cat[1]}
        </h3>
        <p className="text-gray-400 mt-3">{cat[2]}</p>
      </a>
    ))}
  </div>
</div>

<style>{`
  @keyframes scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
`}</style>
      </section>
    </main>
  );
}
