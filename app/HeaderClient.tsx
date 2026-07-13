"use client";

import { useEffect, useState } from "react";

export default function HeaderClient() {
  const [login, setLogin] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLogin(localStorage.getItem("userLogin"));

    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setRole(null);
          localStorage.removeItem("userRole");
          return;
        }

        setLogin(data.login || null);
        setRole(data.role || null);
        localStorage.setItem("userRole", data.role || "user");
      })
      .catch(() => {
        setRole(null);
      });
  }, []);

  const isAdmin = login === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setUnreadMessages(0);
      return;
    }

    async function loadUnreadMessages() {
      try {
        const res = await fetch("/api/chat?mode=conversations", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const conversations = await res.json();
        const total = Array.isArray(conversations)
          ? conversations.reduce(
              (sum: number, item: any) => sum + Number(item.unread || 0),
              0
            )
          : 0;

        setUnreadMessages(total);
      } catch {
        setUnreadMessages(0);
      }
    }

    loadUnreadMessages();
    const timer = window.setInterval(loadUnreadMessages, 5000);

    return () => window.clearInterval(timer);
  }, [isAdmin]);


  const unreadLabel = unreadMessages > 99 ? "99+" : String(unreadMessages);

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-400/10 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
        <a href="/" className="text-3xl font-black text-yellow-400">
          FUNZONA
        </a>

        <nav className="hidden md:flex gap-8 font-semibold text-gray-300">
          <a href="/catalog" className="hover:text-yellow-400 transition">Каталог</a>
          <a href="/cart" className="hover:text-yellow-400 transition">Корзина</a>
          <a href="/support" className="hover:text-yellow-400 transition">Поддержка</a>
          <a href="/#reviews" className="text-sm font-black text-slate-200 transition hover:text-yellow-400">
            Отзывы
          </a>
          <a href="/faq" className="hover:text-yellow-400 transition">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAdmin ? (
            <a
              href="/admin"
              className="relative rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 font-black text-yellow-400 transition hover:border-yellow-400"
            >
              Админ
              {unreadMessages > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white shadow-lg shadow-red-500/30">
                  {unreadLabel}
                </span>
              ) : null}
            </a>
          ) : null}

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
              ["Корзина", "/cart"],
              ["Поддержка", "/support"],
              ["FAQ", "/faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-2xl border border-yellow-400/20 bg-white/5 px-4 py-3 text-center hover:border-yellow-400"
              >
                {label}
              </a>
            ))}

            {isAdmin ? (
              <a
                href="/admin"
                className="relative rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-center text-yellow-400 hover:border-yellow-400"
              >
                Админ
                {unreadMessages > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
                    {unreadLabel}
                  </span>
                ) : null}
              </a>
            ) : null}

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
