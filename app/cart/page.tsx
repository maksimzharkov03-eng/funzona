import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-10">
          Корзина
        </h1>

        <CartClient />
      </div>
    </main>
  );
}