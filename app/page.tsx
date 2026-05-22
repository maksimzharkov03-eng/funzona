export default function Home() {
  const benefits = [
    ["🛡️", "Гарантия", "Помогаем с активацией и сопровождаем заказ"],
    ["⚡", "Быстро", "Оформление цифровых товаров без лишних шагов"],
    ["💳", "Оплата", "FreeKassa и криптовалюта"],
    ["🎧", "Поддержка", "На связи каждый день с 8:00 до 23:00 МСК"],
  ];

  const categories = [
    ["🎮", "PlayStation Plus", "Essential • Extra • Deluxe • EA Play"],
    ["🤖", "ChatGPT", "Plus • Pro • цифровые подписки"],
    ["🍏", "Apple ID", "USA • Turkey • India"],
    ["🕹️", "Игровые товары", "Пополнения • аккаунты • цифровые услуги"],
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative px-6 py-24 bg-[radial-gradient(circle_at_top,#ffd40055,transparent_35%),linear-gradient(180deg,#1a1600,#000)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffd40022,transparent_55%)] blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-8">
            PREMIUM DIGITAL STORE
          </div>

          <h1 className="text-6xl md:text-9xl font-black text-yellow-400 drop-shadow-[0_0_40px_rgba(255,212,0,0.55)]">
            FUNZONA
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            PlayStation Plus, ChatGPT, Apple ID, пополнения и цифровые товары в одном магазине.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
            <a
              href="/catalog"
              className="bg-yellow-400 text-black px-9 py-4 rounded-2xl font-black hover:bg-yellow-300 transition"
            >
              Перейти в каталог
            </a>

            <a
              href="/support"
              className="border border-yellow-400 px-9 py-4 rounded-2xl font-black hover:bg-yellow-400/10 transition"
            >
              Поддержка
            </a>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 mt-24">
          {benefits.map((item) => (
            <div
              key={item[1]}
              className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 text-center backdrop-blur hover:border-yellow-400 transition"
            >
              <div className="text-4xl mb-4">{item[0]}</div>
              <h3 className="font-black text-xl">{item[1]}</h3>
              <p className="text-gray-400 mt-2">{item[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl font-black mb-4">
            Популярные <span className="text-yellow-400">категории</span>
          </h2>

          <p className="text-center text-gray-400 mb-12">
            Выбирай нужный раздел и оформляй заказ прямо на сайте.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <a
                href="/catalog"
                key={cat[1]}
                className="group bg-gradient-to-b from-yellow-400/10 to-white/5 border border-yellow-400/20 rounded-3xl p-6 hover:-translate-y-2 hover:border-yellow-400 transition"
              >
                <div className="text-5xl mb-6">{cat[0]}</div>
                <h3 className="text-2xl font-black group-hover:text-yellow-400 transition">
                  {cat[1]}
                </h3>
                <p className="text-gray-400 mt-3">{cat[2]}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-[linear-gradient(180deg,#000,#140f00)]">
        <div className="max-w-7xl mx-auto bg-yellow-400 text-black rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black">
              Готов оформить заказ?
            </h2>
            <p className="mt-4 text-black/70 text-lg">
              Переходи в каталог, выбирай товар и оформляй покупку за пару минут.
            </p>
          </div>

          <a
            href="/catalog"
            className="bg-black text-yellow-400 px-8 py-4 rounded-2xl font-black hover:opacity-90 transition"
          >
            Открыть каталог
          </a>
        </div>
      </section>
    </main>
  );
}