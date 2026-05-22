"use client";

export default function AddToCartButton({
  product,
}: {
  product: any;
}) {
  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const exists = cart.find((item: any) => item.id === product.id);

    if (exists) {
      alert("Товар уже в корзине");
      return;
    }

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Товар добавлен в корзину");
  }

  return (
    <button
      onClick={addToCart}
      className="w-full mt-8 bg-yellow-400 text-black py-5 rounded-2xl text-xl font-black hover:bg-yellow-300 hover:scale-[1.02] transition"
    >
      Добавить в корзину
    </button>
  );
}