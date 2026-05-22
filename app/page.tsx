export default function Home() {
  const categories = [
    ["🎮", "PlayStation Plus", "Essential • Extra • Deluxe"],
    ["🤖", "ChatGPT", "Plus • Pro • подписки"],
    ["🍏", "Apple ID", "USA • Turkey • India"],
    ["💳", "Пополнения", "PSN • кошельки • карты"],
    ["🕹️", "Игры", "Аккаунты • шеринг • цифровые товары"],
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative min-h-screen px-6 py-24 bg-[radial-gradient(circle_at_top,#ffd40055,transparent_35%),linear-gradient(180deg,#1a1600,#000)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffd40022,transparent_55%)] blur-3xl animate-pulse" />

        <div className="absolute left-10 top-32 h-32 w-32 rounded-full bg-yellow-400/20 blur-3xl animate-bounce" />
        <div className="absolute right-16 top-64 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl animate-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-8">
            ⚡ PREMIUM DIGITAL STORE
          </div>

          <h1 className="text-6xl md:text-9xl font-black text-yellow-400 drop-shadow-[0_0_45px_rgba(255,212,0,0.65)]">
            FUNZONA
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Цифровые товары, подписки, пополнения и игровые сервисы в одном месте.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
            <a
              href="/catalog"
              className="bg-yellow-400 text-black px-9 py-4 rounded-2xl font-black hover:bg-yellow-300 hover:scale-105 transition"
            >
              Перейти в каталог
            </a>

            <a
              href="/support"
              className="border border-yellow-400 px-9 py-4 rounded-2xl font-black hover:bg-yellow-400/10 hover:scale-105 transition"
            >
              Поддержка
            </a>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto mt-24 overflow-hidden">
          <div className="flex gap-6 animate-[scroll_22s_linear_infinite]">
            {[...categories, ...categories].map((cat, index) => (
              <a
                href="/catalog"
                key={index}
                className="min-w-[260px] bg-white/5 border border-yellow-400/20 rounded-3xl p-6 hover:border-yellow-400 hover:-translate-y-2 transition"
              >
                <div className="text-5xl mb-6">{cat[0]}</div>
                <h3 className="text-2xl font-black text-yellow-400">
                  {cat[1]}
                </h3>
                <p className="text-gray-400 mt-3">{cat[2]}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}