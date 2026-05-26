"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  formatRub,
  getGameCover,
  getGameGenre,
  type MarketplaceGame,
} from "@/app/lib/games";
import { storeGames } from "@/app/data/ps-store-games";

const gamesCacheKey = "funzona-games-last-list";
const selectedGameCacheKey = "funzona-selected-game";

function GameImage({
  src,
  title,
  className,
}: {
  src?: string | null;
  title: string;
  className: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#ffd40033,transparent_42%),linear-gradient(145deg,#171100,#050505)] p-8 text-center`}
      >
        <span className="text-7xl mb-5">🎮</span>
        <span className="text-yellow-400 text-3xl font-black leading-tight">
          {title}
        </span>
        <span className="text-gray-500 mt-4 font-bold">
          FunZona PlayStation
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function readJson<T>(key: string): T | null {
  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function findCachedGame(gameId: number) {
  const selected = readJson<MarketplaceGame>(selectedGameCacheKey);

  if (selected?.id === gameId) return selected;

  const cachedList = readJson<MarketplaceGame[]>(gamesCacheKey);

  return cachedList?.find((item) => item.id === gameId) || null;
}

function addGameToCart(game: MarketplaceGame) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart.push({
    id: `game-${game.id}`,
    name: game.title,
    category: "Игры",
    description: `${game.platform} • ${game.region}`,
    price: `${game.rubPrice} ₽`,
    image: getGameCover(game),
  });

  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function GamePage() {
  const params = useParams<{ id: string }>();
  const [game, setGame] = useState<MarketplaceGame | null>(null);
  const [toast, setToast] = useState("");
  const gameId = Number(params.id);

  useEffect(() => {
    const fallback =
      findCachedGame(gameId) ||
      storeGames.find((item) => item.id === gameId) ||
      null;

    setGame(fallback);

    async function loadGame() {
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`/api/games/${gameId}`, {
          cache: "force-cache",
          signal: controller.signal,
        });
        window.clearTimeout(timer);

        if (!res.ok) return;

        const data = await res.json();
        setGame(data);
      } catch {
        if (!fallback) {
          setGame(storeGames.find((item) => item.id === gameId) || null);
        }
      }
    }

    if (gameId) loadGame();
  }, [gameId]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const releaseDate = useMemo(() => {
    if (!game?.releaseDate) return "Дата не указана";
    return new Intl.DateTimeFormat("ru-RU").format(new Date(game.releaseDate));
  }, [game?.releaseDate]);

  const relatedGames = useMemo(
    () =>
      storeGames
        .filter((item) => item.id !== game?.id)
        .filter((item) => !game?.genre || item.genre === game.genre)
        .filter((item) => !game?.region || item.region === game.region)
        .slice(0, 3),
    [game?.genre, game?.id, game?.region]
  );

  if (!game) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-12">
        <div className="max-w-7xl mx-auto bg-white/5 border border-yellow-400/20 rounded-3xl p-10">
          Загружаем игру...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,#ffd40033,transparent_34%),radial-gradient(circle_at_top_right,#2563eb33,transparent_28%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <Link
          href="/games"
          className="inline-flex border border-yellow-400/20 bg-white/5 rounded-2xl px-5 py-3 font-black text-gray-200 hover:border-yellow-400 transition mb-8"
        >
          ← Назад в каталог
        </Link>

        <section className="grid lg:grid-cols-[430px_1fr] gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-yellow-400/20 bg-white/5 shadow-2xl">
            <GameImage
              src={getGameCover(game)}
              title={game.title}
              className="w-full aspect-[4/5] object-contain bg-black"
            />

            {game.discountPercent ? (
              <span className="absolute left-5 top-5 bg-red-500 text-white px-4 py-2 rounded-xl font-black">
                -{game.discountPercent}%
              </span>
            ) : null}
          </div>

          <div>
            <div className="inline-flex w-fit items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 font-black mb-6">
              {game.badge || "PLAYSTATION DIGITAL"}
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[0.95]">
              {game.title}
            </h1>

            <p className="text-gray-300 mt-6 max-w-3xl text-lg leading-8">
              {game.description ||
                "Цифровая версия игры для аккаунта PlayStation с оформлением через FunZona."}
            </p>

            <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-8">
              {[
                ["Платформа", game.platform],
                ["Регион", game.region],
                ["Жанр", getGameGenre(game)],
                ["Релиз", releaseDate],
                ["Издание", game.edition || "Digital Edition"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white/5 border border-yellow-400/20 rounded-2xl p-5"
                >
                  <p className="text-gray-500 text-sm font-bold">{label}</p>
                  <p className="font-black mt-2">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 border-y border-yellow-400/20 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-gray-500 font-bold">Цена FunZona</p>
                <div className="flex items-end gap-4 mt-2">
                  <span className="text-5xl font-black text-yellow-400">
                    {formatRub(game.rubPrice)}
                  </span>
                  {game.oldRubPrice ? (
                    <span className="text-gray-500 line-through pb-2">
                      {formatRub(game.oldRubPrice)}
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-500 mt-3">
                  PS Store: {game.originalPrice} {game.currency}
                </p>
              </div>

              <button
                onClick={() => {
                  addGameToCart(game);
                  setToast(`${game.title} добавлена в корзину`);
                }}
                className="bg-yellow-400 text-black px-8 py-5 rounded-2xl text-xl font-black hover:bg-yellow-300 hover:scale-[1.02] transition"
              >
                Добавить в корзину
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {["Заказ попадёт в личный кабинет", "Скидка сохранена в цене", "Поддержка FunZona"].map(
                (item) => (
                  <span
                    key={item}
                    className="border border-white/10 bg-white/5 rounded-full px-5 py-3 text-sm font-black text-gray-200"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {relatedGames.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-3xl md:text-4xl font-black mb-5">
              Похожие игры
            </h2>

            <div className="grid md:grid-cols-3 gap-5">
              {relatedGames.map((item) => (
                <Link
                  href={`/games/${item.id}`}
                  key={item.id}
                  className="grid grid-cols-[110px_1fr] min-h-36 bg-white/5 border border-yellow-400/20 rounded-3xl overflow-hidden hover:border-yellow-400 transition"
                >
                  <GameImage
                    src={getGameCover(item)}
                    title={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-5 min-w-0">
                    <h3 className="text-xl font-black line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      {item.platform} • {item.region}
                    </p>
                    <p className="text-yellow-400 font-black mt-3">
                      {formatRub(item.rubPrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {toast ? (
        <div className="fixed right-5 bottom-5 z-50 bg-black border border-yellow-400/40 rounded-2xl px-5 py-4 font-black shadow-2xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
