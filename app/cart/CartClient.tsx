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

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price.replace(/\D/g, ""));
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-8">
        <p className="text-gray-400">Корзина пока пустая</p>

        <a
          href="/catalog"
          className="inline-block mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-black"
        >
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {cart.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 flex justify-between"
        >
          <div>
            <p className="text-yellow-400 font-bold">{item.category}</p>
            <h2 className="text-2xl font-black mt-2">{item.name}</h2>
            <p className="text-gray-400 mt-2">{item.description}</p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-yellow-400">{item.price}</p>

            <button
              onClick={() => removeItem(index)}
              className="mt-4 text-red-400"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}

      <div className="bg-yellow-400 text-black rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Итоговая сумма</h2>
          <p className="text-3xl font-black">{total} ₽</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("cart");
            setCart([]);
          }}
          className="mt-6 w-full bg-red-500 text-white py-4 rounded-2xl font-black"
        >
          Очистить корзину
        </button>
      </div>

     <a
  href="/checkout"
  className="block text-center bg-yellow-400 text-black py-4 rounded-2xl text-xl font-black"
>
  Оформить заказ
</a>
    </div>
  );
}