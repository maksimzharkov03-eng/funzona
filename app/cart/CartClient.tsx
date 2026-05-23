"use client";

import { useEffect, useState } from "react";

export default function CartClient() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  function removeItem(index: number) {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function clearCart() {
    localStorage.removeItem("cart");
    setCart([]);
  }

  const total = cart.reduce((sum, item) => {
    return sum + Number(String(item.price).replace(/\D/g, ""));
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 sm:p-10 text-center">
        <div className="text-6xl mb-5">🛒</div>

        <h2 className="text-3xl font-black text-yellow-400">
          Корзина пустая
        </h2>

        <p className="text-gray-400 mt-3">
          Добавь товары из каталога, чтобы оформить заказ.
        </p>

        <a
          href="/catalog"
          className="inline-block mt-8 bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black hover:bg-yellow-300 transition"
        >
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-5">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="bg-white/5 border border-yellow-400/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 hover:border-yellow-400 transition"
          >
            <div className="w-full sm:w-28 h-40 sm:h-28 rounded-2xl overflow-hidden bg-yellow-400/10 flex items-center justify-center shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🎮</span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-yellow-400 font-black text-sm">
                {item.category}
              </p>

              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {item.name}
              </h2>

              <p className="text-gray-400 mt-2 line-clamp-2">
                {item.description}
              </p>

              <button
                onClick={() => removeItem(index)}
                className="mt-4 text-red-400 font-black hover:text-red-300 transition"
              >
                Удалить
              </button>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl sm:text-3xl font-black text-yellow-400">
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-400 text-black rounded-3xl p-5 sm:p-6 h-fit lg:sticky lg:top-28">
        <h2 className="text-3xl font-black">
          Ваш заказ
        </h2>

        <div className="mt-6 space-y-3 text-black/70 font-bold">
          <div className="flex justify-between">
            <span>Товаров:</span>
            <span>{cart.length}</span>
          </div>

          <div className="flex justify-between">
            <span>Сумма:</span>
            <span>{total} ₽</span>
          </div>
        </div>

        <div className="border-t border-black/20 mt-6 pt-6 flex justify-between items-center">
          <span className="text-xl font-black">Итого:</span>
          <span className="text-3xl sm:text-4xl font-black">{total} ₽</span>
        </div>

        <a
          href="/checkout"
          className="block text-center mt-6 bg-black text-yellow-400 py-4 rounded-2xl text-xl font-black hover:opacity-90 transition"
        >
          Оформить заказ
        </a>

        <button
          onClick={clearCart}
          className="mt-4 w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition"
        >
          Очистить корзину
        </button>
      </div>
    </div>
  );
}
