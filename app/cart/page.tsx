import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#090817] text-white px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,#ffd40022,transparent_34%),radial-gradient(circle_at_top_right,#7c3aed22,transparent_28%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-yellow-400 leading-none mb-4">
          Корзина
        </h1>

        <p className="text-gray-300 mb-8">
          Проверь товары, измени количество и оплати заказ прямо здесь.
        </p>

        <CartClient />
      </div>
    </main>
  );
}
