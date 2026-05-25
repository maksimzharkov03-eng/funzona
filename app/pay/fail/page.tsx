"use client";

import { useEffect } from "react";

export default function PayFailPage() {
  useEffect(() => {
    window.location.href = "/cart";
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-white/5 p-8 text-center">
        <h1 className="text-4xl font-black text-red-300">Оплата не завершена</h1>
        <p className="mt-4 text-gray-400">Возвращаем в корзину...</p>
      </div>
    </main>
  );
}
