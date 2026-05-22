export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative min-h-screen px-6 py-6 bg-[radial-gradient(circle_at_top,#ffd40055,transparent_35%),linear-gradient(180deg,#1a1600,#000)]">
        
        <header className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-3xl font-black text-yellow-400 leading-6">
            FUN<br />ZONA
          </div>

          <nav className="hidden md:flex gap-10 font-semibold">
            <a>PlayStation</a>
            <a>ChatGPT</a>
            <a>Apple ID</a>
            <a>Игры</a>
            <a>Поддержка</a>
          </nav>

          <button className="font-bold">🛒 Корзина</button>
        </header>

        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffd40033,transparent_55%)] blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto text-center pt-28">
          <h1 className="text-7xl md:text-9xl font-black text-yellow-400 drop-shadow-[0_0_35px_rgba(255,212,0,0.5)]">
            FUNZONA
          </h1>

          <h2 className="mt-6 text-3xl font-black">
            PREMIUM DIGITAL STORE
          </h2>

          <p className="mt-6 text-xl text-gray-200 max-w-3xl mx-auto">
            Подписки PlayStation Plus, ChatGPT, Apple ID, пополнение баланса и цифровые товары
          </p>

          <div className="mt-10 flex justify-center gap-5">
            <button className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-black hover:bg-yellow-300 transition">
              Купить подписку
            </button>

            <a href="/catalog" className="border border-yellow-400 px-8 py-4 rounded-xl font-black hover:bg-yellow-400/10 transition">
  Каталог
</a>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 mt-24">
          {[
            ["🛡️", "Гарантия", "100% гарантия на все товары"],
            ["⚡", "Быстрая выдача", "Получите товар после оплаты"],
            ["🎧", "Поддержка", "Всегда на связи"],
            ["🏆", "Лучшие цены", "Выгодные предложения"]
          ].map((item) => (
            <div key={item[1]} className="bg-white/5 border border-yellow-400/20 rounded-2xl p-6 text-center backdrop-blur">
              <div className="text-4xl mb-4">{item[0]}</div>
              <h3 className="font-black text-lg">{item[1]}</h3>
              <p className="text-gray-400 mt-2">{item[2]}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto mt-20 pb-20">
          <h2 className="text-center text-4xl font-black mb-10">
            Популярные <span className="text-yellow-400">категории</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              ["PlayStation Plus", "Подписки PS Plus", "bg-blue-600"],
              ["ChatGPT", "ChatGPT Plus / Pro", "bg-green-600"],
              ["Apple ID", "Пополнение Apple ID", "bg-gray-200 text-black"],
              ["Игровые товары", "Аккаунты и пополнения", "bg-purple-600"]
            ].map((cat) => (
              <div key={cat[0]} className={`rounded-2xl overflow-hidden border border-white/10 ${cat[2]}`}>
                <div className="h-36 flex items-center justify-center text-3xl font-black">
                  {cat[0]}
                </div>
                <div className="bg-black/70 p-5">
                  <p className="font-bold">{cat[1]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  )
}