"use client";

export default function AddToCartButton({ product }: { product: any }) {
  return (
    <button
      onClick={() => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "/cart";
      }}
      className="block text-center mt-6 w-full bg-yellow-400 text-black py-4 rounded-xl font-black"
    >
      Добавить в корзину
    </button>
  );
}