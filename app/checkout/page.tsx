"use client";

import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [telegram, setTelegram] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState("Crypto");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const total = cart.reduce((sum, item) => {
    return sum + Number(String(item.price).replace(/\D/g, ""));
  }, 0);

  async function createOrder() {
    if (!telegram) {
      alert("Укажи Telegram для связи");
      return;
    }

    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    setLoading(true);

    for (const item of cart) {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          telegram,
          payment,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Ошибка создания заказа");
        setLoading(false);
        return;
      }
    }

    localStorage.removeItem("cart");

    alert("Заказ оформлен!");
    window.location.href = "/account";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd40022,transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-yellow-400 mb-4">
          Оформление заказа
        </h1>

        <p className="text-gray-400 mb-10">
          Проверь данные, выбери способ оплаты и подтверди заказ.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-yellow-400/20 rounded-3xl p-8 space-y-7">
            <div>
              <p className="mb-3 text-gray-400 font-bold">
                Telegram для связи
              </p>

              <input
                type="text"
                placeholder="@telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400 transition"
              />
            </div>

            <div>
              <p className="mb-4 text-gray-400 font-bold">Способ оплаты</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {["Crypto", "FreeKassa"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayment(method)}
                    className={`rounded-2xl p-5 border font-black text-left transition ${
                      payment === method
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-black border-yellow-400/20 text-white hover:border-yellow-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {method === "Crypto" ? "₿" : "💳"}
                    </div>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-gray-400 font-bold">
                Комментарий к заказу
              </p>

              <textarea
                placeholder="Например: нужен турецкий регион"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 h-32 outline-none focus:border-yellow-400 transition"
              />
            </div>

            <button
              type="button"
              onClick={createOrder}
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl text-xl font-black hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading ? "Оформляем..." : "Подтвердить заказ"}
            </button>
          </div>

          <div className="bg-yellow-400 text-black rounded-3xl p-6 h-fit sticky top-28">
            <h2 className="text-3xl font-black mb-5">Ваш заказ</h2>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="border-b border-black/20 pb-4"
                >
                  <p className="font-black">{item.name}</p>
                  <p className="text-black/60">{item.price}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-black/20 flex justify-between items-center">
              <span className="text-xl font-black">Итого:</span>
              <span className="text-4xl font-black">{total} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}