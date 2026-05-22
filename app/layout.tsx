import "./globals.css";

export const metadata = {
  title: "FunZona",
  description: "Premium Digital Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-black text-white">

        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-yellow-400/10 bg-black/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            <a
              href="/"
              className="text-3xl font-black text-yellow-400"
            >
              FUNZONA
            </a>

            <nav className="hidden md:flex gap-8 font-semibold text-gray-300">
              <a href="/catalog" className="hover:text-yellow-400 transition">
                Каталог
              </a>

              <a href="/cart" className="hover:text-yellow-400 transition">
                Корзина
              </a>

              <a href="/checkout" className="hover:text-yellow-400 transition">
                Оформление
              </a>
            </nav>

            <a
              href="/cart"
              className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-black"
            >
              🛒 Корзина
            </a>
<a href="/support" className="hover:text-yellow-400 transition">
  Поддержка
</a>
<a href="/account" className="hover:text-yellow-400 transition">
  Кабинет
</a>
          </div>
        </header>

        {children}
<footer className="border-t border-yellow-400/10 bg-black px-6 py-12">
  <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
    
    <div>
      <h2 className="text-3xl font-black text-yellow-400">FUNZONA</h2>
      <p className="text-gray-400 mt-4">
        Premium Digital Store: PlayStation, ChatGPT, Apple ID и цифровые товары.
      </p>
    </div>

    <div>
      <h3 className="font-black mb-4">Категории</h3>
      <div className="space-y-2 text-gray-400">
        <p>PlayStation Plus</p>
        <p>ChatGPT</p>
        <p>Apple ID</p>
        <p>Игровые товары</p>
      </div>
    </div>

    <div>
      <h3 className="font-black mb-4">Оплата</h3>
      <div className="space-y-2 text-gray-400">
        <p>FreeKassa</p>
        <p>Криптовалюта</p>
        <p>USDT / TON / BTC</p>
      </div>
    </div>

    <div>
      <h3 className="font-black mb-4">Поддержка</h3>
      <div className="space-y-2 text-gray-400">
        <p>Работаем 8:00–23:00 МСК</p>
        <p>Гарантия на товары</p>
        <p>Помощь с активацией</p>
      </div>
    </div>

  </div>

  <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-gray-500 text-sm">
    © 2026 FunZona. Все права защищены.
  </div>
</footer>
      </body>
    </html>
  );
}