"use client";

import { useEffect, useState } from "react";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function loadGames() {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(data);
  }

  useEffect(() => {
    loadGames();
  }, []);

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-4">
          Каталог игр
        </h1>

        <p className="text-gray-400 mb-8">
          Игры PlayStation с ценами в рублях по нашему курсу.
        </p>

        <input
          placeholder="Поиск игры..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-10 bg-white/5 border border-yellow-400/20 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white/5 border border-yellow-400/20 rounded-3xl overflow-hidden hover:border-yellow-400 hover:-translate-y-2 transition"
            >
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-5">
                <div className="flex gap-2 mb-3">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                    {game.platform}
                  </span>

                  <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs font-black">
                    {game.region}
                  </span>
                </div>

                <h2 className="text-2xl font-black">
                  {game.title}
                </h2>

                <p className="text-gray-500 mt-2">
                  Цена PS Store: {game.originalPrice} {game.currency}
                </p>

                <p className="text-3xl font-black text-yellow-400 mt-4">
                  {game.rubPrice} ₽
                </p>

                <button className="mt-5 w-full bg-yellow-400 text-black py-3 rounded-xl font-black">
                  Купить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}