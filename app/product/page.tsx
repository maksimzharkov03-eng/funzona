export default function ProductPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <a href="/catalog" className="text-yellow-400 font-bold">← В каталог</a>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-3xl h-96 flex items-center justify-center">
            <h1 className="text-5xl font-black text-yellow-400">PS PLUS</h1>
          </div>

          <div>
            <p className="text-yellow-400 font-bold">PlayStation</p>
            <h1 className="text-5xl font-black mt-3">PS Plus Extra</h1>

            <p className="text-gray-400 mt-5">
              Подписка PlayStation Plus Extra для PS4 / PS5. Быстрое оформление,
              гарантия и поддержка.
            </p>

            <div className="mt-8 space-y-4">
              <select className="w-full bg-white/10 border border-white/10 rounded-xl p-4">
                <option>PS4</option>
                <option>PS5</option>
              </select>

              <select className="w-full bg-white/10 border border-white/10 rounded-xl p-4">
                <option>1 месяц</option>
                <option>3 месяца</option>
                <option>12 месяцев</option>
              </select>

              <select className="w-full bg-white/10 border border-white/10 rounded-xl p-4">
                <option>Турция</option>
                <option>Украина</option>
              </select>
            </div>

            <p className="text-4xl font-black mt-8">от 1300₽</p>

            <a
  href="/cart"
  className="block text-center mt-6 w-full bg-yellow-400 text-black py-4 rounded-xl font-black"
>
  Добавить в корзину
</a>
          </div>
        </div>
      </div>
    </main>
  );
}