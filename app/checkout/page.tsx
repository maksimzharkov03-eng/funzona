"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [telegram, setTelegram] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState("Crypto");

  async function createOrder() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    for (const item of cart) {
      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.id,
          telegram,
          payment,
          comment,
        }),
      });
    }

    localStorage.removeItem("cart");

    alert("Заказ оформлен!");
    window.location.href = "/account";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-10">
          Оформление заказа
        </h1>

        <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-8 space-y-6">
          <div>
            <p className="mb-3 text-gray-400">Telegram для связи</p>

            <input
              type="text"
              placeholder="@telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4"
            />
          </div>

          <div>
            <p className="mb-3 text-gray-400">Способ оплаты</p>

            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4"
            >
              <option>Crypto</option>
              <option>FreeKassa</option>
            </select>
          </div>

          <div>
            <p className="mb-3 text-gray-400">Комментарий к заказу</p>

            <textarea
              placeholder="Например: нужен турецкий регион"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 h-32"
            />
          </div>

          <button
            onClick={createOrder}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl text-xl font-black"
          >
            Подтвердить заказ
          </button>
        </div>
      </div>
    </main>
  );
}