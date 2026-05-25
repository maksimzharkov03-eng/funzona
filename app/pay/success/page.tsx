"use client";

import { useEffect } from "react";

export default function PaySuccessPage() {
  useEffect(() => {
    window.location.href = "/support?paid=1";
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
        <h1 className="text-4xl font-black text-yellow-400">Оплата принята</h1>
        <p className="mt-4 text-gray-400">Открываем чат с поддержкой FunZona...</p>
      </div>
    </main>
  );
}
