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
      
            <section className="relative overflow-hidden border-b border-yellow-400/10 bg-[radial-gradient(circle_at_top,rgba(255,204,0,0.28),transparent_48%),linear-gradient(180deg,#171400_0%,#050500_100%)] px-6 py-16 text-center sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-7 inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-400">
            ⚡ Premium Digital Store
          </div>

          <h1 className="text-6xl font-black leading-none text-yellow-400 sm:text-7xl md:text-8xl lg:text-9xl">
            FUNZONA
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base font-bold leading-7 text-slate-200 sm:text-lg">
            Подписки, пополнения и цифровые товары в одном месте.
          </p>

          <div className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/catalog"
              className="flex min-h-[56px] items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-center text-base font-black leading-tight text-black transition hover:bg-yellow-300"
            >
              Перейти в каталог
            </a>
            <a
              href="#popular"
              className="flex min-h-[56px] items-center justify-center rounded-xl border border-yellow-400/50 px-6 py-3 text-center text-base font-black leading-tight text-white transition hover:bg-yellow-400/10"
            >
              Популярные товары
            </a>
            <a
              href="/support"
              className="flex min-h-[56px] items-center justify-center rounded-xl border border-yellow-400/50 px-6 py-3 text-center text-base font-black leading-tight text-white transition hover:bg-yellow-400/10"
            >
              Поддержка
            </a>
            <a
              href="/reviews"
              className="flex min-h-[56px] items-center justify-center rounded-xl border border-yellow-400/50 px-6 py-3 text-center text-base font-black leading-tight text-white transition hover:bg-yellow-400/10"
            >
              Отзывы
            </a>
          </div></div>
      </section>

<section id="popular" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-400">
            Быстрый выбор
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Выбери, что нужно оформить
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <a
            href="/catalog?category=Подписки"
            className="group flex min-h-[260px] flex-col justify-between rounded-[22px] border border-yellow-400/25 bg-zinc-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-yellow-400/70 hover:bg-yellow-400 hover:text-black"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl text-black group-hover:bg-black group-hover:text-yellow-400">
                🎮
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-black">
                PlayStation Plus
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300 group-hover:text-black/75">
                Essential / Extra / Deluxe / EA Play
              </p>
            </div>
            <span className="mt-8 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black group-hover:bg-black group-hover:text-yellow-400">
              Выбрать подписку
            </span>
          </a>

          <a
            href="/games"
            className="group flex min-h-[260px] flex-col justify-between rounded-[22px] border border-yellow-400/25 bg-zinc-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-yellow-400/70 hover:bg-yellow-400 hover:text-black"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl text-black group-hover:bg-black group-hover:text-yellow-400">
                🕹️
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-black">
                Игры PS4 / PS5
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300 group-hover:text-black/75">
                Покупка игр, скидки, региональные цены
              </p>
            </div>
            <span className="mt-8 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black group-hover:bg-black group-hover:text-yellow-400">
              Смотреть игры
            </span>
          </a>

          <a
            href="/catalog?category=ChatGPT"
            className="group flex min-h-[260px] flex-col justify-between rounded-[22px] border border-yellow-400/25 bg-zinc-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-yellow-400/70 hover:bg-yellow-400 hover:text-black"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl text-black group-hover:bg-black group-hover:text-yellow-400">
                ✦
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-black">
                ChatGPT
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300 group-hover:text-black/75">
                Plus / Pro / другие подписки
              </p>
            </div>
            <span className="mt-8 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black group-hover:bg-black group-hover:text-yellow-400">
              Посмотреть варианты
            </span>
          </a>

          <a
            href="/catalog?category=Apple%20ID"
            className="group flex min-h-[260px] flex-col justify-between rounded-[22px] border border-yellow-400/25 bg-zinc-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-yellow-400/70 hover:bg-yellow-400 hover:text-black"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl text-black group-hover:bg-black group-hover:text-yellow-400">
                💳
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-black">
                Apple ID / PSN
              </h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300 group-hover:text-black/75">
                Пополнение, карты, цифровые коды
              </p>
            </div>
            <span className="mt-8 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black group-hover:bg-black group-hover:text-yellow-400">
              Выбрать пополнение
            </span>
          </a>
        </div>
      </section>
</main>
  );
}
