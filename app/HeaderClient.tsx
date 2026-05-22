"use client";

import { useEffect, useState } from "react";

export default function HeaderClient() {
  const [login, setLogin] = useState<string | null>(null);

  useEffect(() => {
    setLogin(localStorage.getItem("userLogin"));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-400/10 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-3xl font-black text-yellow-400">
          FUNZONA
        </a>

        <nav className="hidden md:flex gap-8 font-semibold text-gray-300">
          <a href="/catalog" className="hover:text-yellow-400 transition">Каталог</a>
          <a href="/cart" className="hover:text-yellow-400 transition">Корзина</a>
          <a href="/checkout" className="hover:text-yellow-400 transition">Оформление</a>
          <a href="/support" className="hover:text-yellow-400 transition">Поддержка</a>
        </nav>

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
    </header>
  );
}