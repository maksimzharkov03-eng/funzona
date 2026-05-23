"use client";

import { useEffect, useState } from "react";

export default function HeaderClient() {
  const [login, setLogin] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLogin(localStorage.getItem("userLogin"));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-400/10 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
        <a href="/" className="text-3xl font-black text-yellow-400">
          FUNZONA
        </a>

        <nav className="hidden md:flex gap-8 font-semibold text-gray-300">
          <a href="/catalog" className="hover:text-yellow-400 transition">Каталог</a>
          <a href="/games" className="hover:text-yellow-400 transition">Игры</a>
          <a href="/subscriptions" className="hover:text-yellow-400 transition">Подписки</a>
          <a href="/cart" className="hover:text-yellow-400 transition">Корзина</a>
          <a href="/checkout" className="hover:text-yellow-400 transition">Оформление</a>
          <a href="/support" className="hover:text-yellow-400 transition">Поддержка</a>
        </nav>

        <div className="hidden md:block">
        {login ? (
          <a href="/account" className="hover:text-yellow-400 transition font-black">
            Кабинет
          </a>
        ) : (
          <a
            href="/login"
            className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-black hover:opacity-90 transition"
          >
            Войти
          </a>
        )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden border border-yellow-400/30 bg-white/5 px-4 py-2 rounded-xl font-black text-yellow-400"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "Закрыть" : "Меню"}
        </button>
        </div>

        {menuOpen ? (
          <nav className="md:hidden mt-4 grid grid-cols-2 gap-3 font-black text-sm">
            {[
              ["Каталог", "/catalog"],
              ["Игры", "/games"],
              ["Подписки", "/subscriptions"],
              ["Корзина", "/cart"],
              ["Оформление", "/checkout"],
              ["Поддержка", "/support"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-2xl border border-yellow-400/20 bg-white/5 px-4 py-3 text-center hover:border-yellow-400"
              >
                {label}
              </a>
            ))}

            <a
              href={login ? "/account" : "/login"}
              className="col-span-2 rounded-2xl bg-yellow-400 px-4 py-3 text-center text-black"
            >
              {login ? "Кабинет" : "Войти"}
            </a>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
