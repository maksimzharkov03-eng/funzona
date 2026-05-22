"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const res = await fetch("/api/register-api", {
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
      alert(data.error);
      return;
    }

    alert("Аккаунт создан");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-yellow-400/20 rounded-3xl p-8">
        <h1 className="text-4xl font-black text-yellow-400 mb-3">
          Регистрация
        </h1>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4"
          />

          <button
            type="button"
            onClick={register}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black"
          >
            Создать аккаунт
          </button>
        </div>
      </div>
    </main>
  );
}