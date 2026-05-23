"use client";

import { useEffect, useState } from "react";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("Все");
  const [loading, setLoading] = useState(true);

  async function loadGames() {
    const res = await fetch("/api/games");
    const data = await res.json();

    setGames(data);
    setLoading(false);
  }

  useEffect(() => {
    loadGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const bySearch = game.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const byPlatform =
      platform === "Все" || game.platform === platform;

    return bySearch && byPlatform;
  });

  function addGameToCart(game: any) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    cart.push({
      id: `game-${game.id}`,
      name: game.title,
      category: "Игры",
      description: `${game.platform} • ${game.region}`,
      price: `${game.rubPrice} ₽`,
      image: game.image,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/cart";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd40022,transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-6">
            🎮 PLAYSTATION GAME MARKET
          </div>

          <h1 className="text-5xl md:text-7xl font-black">
            Каталог <span className="text-yellow-400">игр</span>
          </h1>

          <p className="text-gray-400 mt-5 max-w-2xl text-lg">
            Игры PlayStation с автоматическим пересчётом цены в рубли по нашему курсу.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-10">
          <input
            placeholder="Поиск игры..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:col-span-2 bg-white/5 border border-yellow-400/20 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
          />

          <div className="flex gap-3">
            {["Все", "PS4", "PS5"].map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`flex-1 rounded-2xl px-5 py-4 font-black border transition ${
                  platform === item
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-white/5 border-yellow-400/20 hover:border-yellow-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[460px] rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-black text-yellow-400">
              Игры не найдены
            </h2>

            <p className="text-gray-400 mt-3">
              Попробуй изменить поиск или фильтр платформы.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="group bg-gradient-to-b from-yellow-400/10 via-white/5 to-black border border-yellow-400/10 rounded-3xl overflow-hidden hover:border-yellow-400 hover:-translate-y-2 transition duration-300"
              >
                <div className="relative h-72 overflow-hidden bg-yellow-400/10">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      🎮
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                      {game.platform}
                    </span>

                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-black">
                      {game.region}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-2xl font-black line-clamp-2 group-hover:text-yellow-400 transition">
                    {game.title}
                  </h2>

                  <p className="text-gray-500 mt-3 text-sm">
                    PS Store: {game.originalPrice} {game.currency}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-gray-500 text-sm">
                        Цена FunZona
                      </p>

                      <p className="text-3xl font-black text-yellow-400">
                        {game.rubPrice} ₽
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => addGameToCart(game)}
                    className="mt-6 w-full bg-yellow-400 text-black py-4 rounded-2xl font-black hover:bg-yellow-300 hover:scale-[1.02] transition"
                  >
                    Купить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}