"use client";

import { useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginUser() {
    if (!login || !password) {
      alert("Заполните все поля");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }

      localStorage.setItem("userLogin", data.login);

      window.location.href = "/account";
    } catch {
      alert("Ошибка сервера");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-5xl font-black text-yellow-400 mb-3">
          Вход
        </h1>

        <p className="text-gray-400 mb-8">
          Войдите в аккаунт FunZona
        </p>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400 transition"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400 transition"
          />

          <button
            type="button"
            onClick={loginUser}
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Нет аккаунта?
          </p>

          <a
            href="/register"
            className="inline-block mt-3 text-yellow-400 font-black hover:opacity-80 transition"
          >
            Зарегистрироваться
          </a>
        </div>
      </div>
    </main>
  );
}