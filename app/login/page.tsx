"use client";

import { useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  async function loginUser() {
    const res = await fetch("/api/login-api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    localStorage.setItem("userLogin", data.login);
    alert("Вход выполнен");
    window.location.href = "/account";
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-yellow-400/20 rounded-3xl p-8">
        <h1 className="text-4xl font-black text-yellow-400 mb-3">Вход</h1>

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
            onClick={loginUser}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black"
          >
            Войти
          </button>
        </div>
      </div>
    </main>
  );
}