"use client";

import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    for (let index = 0; index < quantity; index += 1) {
      cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    window.location.href = "/cart";
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-[56px_1fr_56px] gap-3">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="h-14 rounded-2xl border border-yellow-400/30 bg-white/5 text-yellow-400 text-2xl font-black hover:bg-yellow-400 hover:text-black transition"
          aria-label="Уменьшить количество"
        >
          -
        </button>
        <div className="h-14 rounded-2xl border border-yellow-400/20 bg-black/60 flex items-center justify-center text-2xl font-black">
          {quantity}
        </div>
        <button
          type="button"
          onClick={() => setQuantity((value) => value + 1)}
          className="h-14 rounded-2xl bg-yellow-400 text-black text-2xl font-black hover:bg-yellow-300 transition"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>

      <button
        onClick={addToCart}
        className="w-full mt-4 bg-yellow-400 text-black py-5 rounded-2xl text-xl font-black hover:bg-yellow-300 hover:scale-[1.02] transition"
      >
        Добавить в корзину
      </button>
    </div>
  );
}
