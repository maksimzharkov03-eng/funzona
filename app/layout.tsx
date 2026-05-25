import "./globals.css";
import HeaderClient from "./HeaderClient";
export const metadata = {
  title: "FunZona",
  description: "Premium Digital Store",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
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
       <HeaderClient />

        {children}
<footer className="border-t border-yellow-400/10 bg-black px-4 sm:px-6 py-10 sm:py-14">
  <div className="max-w-7xl mx-auto grid md:grid-cols-6 gap-10">
    <div className="md:col-span-2">
      <h2 className="text-3xl sm:text-4xl font-black text-yellow-400">FUNZONA</h2>
      <p className="text-gray-400 mt-5 leading-7">
        Premium Digital Store: PlayStation, ChatGPT, Apple ID и цифровые товары.
      </p>
    </div>

    <div>
      <h3 className="font-black text-xl mb-5">Категории</h3>
      <div className="space-y-3 text-gray-400">
        <p>PlayStation Plus</p>
        <p>ChatGPT</p>
        <p>Apple ID</p>
        <p>Игровые товары</p>
      </div>
    </div>

    <div>
      <h3 className="font-black text-xl mb-5">Оплата</h3>
      <div className="space-y-3 text-gray-400">
        <p>FreeKassa</p>
        <p>Оплата картой</p>
      </div>
    </div>

    <div>
      <h3 className="font-black text-xl mb-5">Поддержка</h3>
      <div className="space-y-3 text-gray-400">
        <p>Работаем 8:00–23:00 МСК</p>
        <p>Гарантия на товары</p>
        <p>Помощь с активацией</p>
      </div>
    </div>

    <div>
      <h3 className="font-black text-xl mb-5">Информация</h3>
      <div className="space-y-3 text-gray-400">
        <a href="/privacy" className="block hover:text-yellow-400 transition">
          Политика конфиденциальности
        </a>
        <a href="/terms" className="block hover:text-yellow-400 transition">
          Пользовательское соглашение
        </a>
        <a href="/faq" className="block hover:text-yellow-400 transition">
          FAQ
        </a>
      </div>
    </div>

    <div className="md:col-span-2">
      <h3 className="font-black text-xl mb-5">Контакты поддержки</h3>
      <div className="space-y-3 text-gray-400">
        <p>✈️ Telegram: @FunZona_manager</p>
        <p>✉️ Email: Funzonapspsn@gmail.com</p>
        <p>💬 Онлайн-чат: на сайте</p>
      </div>
    </div>
  </div>

  <div className="max-w-7xl mx-auto mt-12 pt-7 border-t border-white/10 text-gray-500 text-sm">
    © 2026 FunZona. Все права защищены.
  </div>
</footer>
      </body>
    </html>
  );
}
