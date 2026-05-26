"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  formatRub,
  getGameCover,
  type MarketplaceGame,
} from "@/app/lib/games";
import { storeGames } from "@/app/data/ps-store-games";

type SortMode = "popular" | "discount" | "price-asc" | "price-desc";
type GenreFilter =
  | "Все"
  | "Гонки"
  | "Стрелялки"
  | "Бои"
  | "Спорт"
  | "Приключения"
  | "RPG"
  | "Хоррор"
  | "Симуляторы"
  | "Семейные";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "popular", label: "Популярные" },
  { value: "discount", label: "Скидки" },
  { value: "price-asc", label: "Дешевле" },
  { value: "price-desc", label: "Дороже" },
];

const gamesPageSize = 48;

const genreOptions: GenreFilter[] = [
  "Все",
  "Гонки",
  "Стрелялки",
  "Бои",
  "Спорт",
  "Приключения",
  "RPG",
  "Хоррор",
  "Симуляторы",
  "Семейные",
];

const genreAliases: Record<Exclude<GenreFilter, "Все">, string[]> = {
  Гонки: ["racing", "race", "driving", "гонки"],
  Стрелялки: [
    "shooter",
    "fps",
    "shooting",
    "gun",
    "war",
    "battle",
    "battlefield",
    "call of duty",
    "cod",
    "sniper",
    "hell let loose",
    "stalker",
    "s.t.a.l.k.e.r",
    "стрелял",
    "шутер",
    "войн",
  ],
  Бои: ["fighting", "fight", "combat", "ufc", "tekken", "mortal", "бои", "файтинг"],
  Спорт: ["sports", "sport", "football", "basketball", "ufc", "спорт"],
  Приключения: ["adventure", "action", "story", "приключ", "экшен"],
  RPG: ["rpg", "role", "diablo", "gothic"],
  Хоррор: ["horror", "survival", "ужас", "хоррор"],
  Симуляторы: ["simulation", "simulator", "sim", "симулятор"],
  Семейные: ["family", "kids", "lego", "minecraft", "семейн"],
};

function normalizeGameTitle(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/\b(standard|ultimate|deluxe|premium|edition|издание|стандартное|ультимейт|делюкс)\b/g, "")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeGames(games: MarketplaceGame[]) {
  const map = new Map<string, MarketplaceGame>();

  for (const game of games) {
    const key = [normalizeGameTitle(game.title), game.platform, game.region].join("|");
    const existing = map.get(key);

    if (!existing) {
      map.set(key, game);
      continue;
    }

    const existingScore =
      Number(existing.isFeatured || 0) * 100000 +
      Number(existing.discountPercent || 0) * 100 +
      Number(Boolean(existing.image));
    const nextScore =
      Number(game.isFeatured || 0) * 100000 +
      Number(game.discountPercent || 0) * 100 +
      Number(Boolean(game.image));

    if (nextScore > existingScore) {
      map.set(key, game);
    }
  }

  return Array.from(map.values());
}

function matchesGenre(game: MarketplaceGame, genre: GenreFilter) {
  if (genre === "Все") return true;

  const haystack = [
    game.genre,
    game.title,
    game.edition,
    game.description,
    game.publisher,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return genreAliases[genre].some((alias) => haystack.includes(alias));
}

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
        className={`${className} flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#ffd40033,transparent_42%),linear-gradient(145deg,#171100,#050505)] p-5 text-center`}
      >
        <span className="text-5xl mb-4">🎮</span>
        <span className="text-yellow-400 font-black leading-tight line-clamp-3">
          {title}
        </span>
        <span className="text-gray-500 text-sm mt-3 font-bold">
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

function getGameBadge(game: MarketplaceGame) {
  const badge = String(game.badge || "").trim();

  if (badge && badge !== game.region && badge !== game.platform) {
    return badge;
  }

  if (Number(game.discountPercent || 0) > 0) {
    return "Скидка";
  }

  return "";
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

export default function GamesPage() {
  const [games, setGames] = useState<MarketplaceGame[]>(storeGames);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("Все");
  const [region, setRegion] = useState("Все");
  const [genre, setGenre] = useState<GenreFilter>("Все");
  const [sort, setSort] = useState<SortMode>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(gamesPageSize);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/api/games", { cache: "force-cache" });
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setGames(data);
        }
      } catch {
        setGames(storeGames);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const featuredGame = useMemo(
    () => games.find((game) => game.isFeatured) || games[0],
    [games]
  );

  const discountedGames = useMemo(
    () => games.filter((game) => Number(game.discountPercent) > 0).slice(0, 3),
    [games]
  );

  useEffect(() => {
    setVisibleCount(gamesPageSize);
  }, [deferredSearch, platform, region, genre, sort]);

  const filteredGames = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return dedupeGames(games)
      .filter((game) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            game.title,
            game.region,
            game.platform,
            game.genre,
            game.publisher,
            game.edition,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch)
            );

        const matchesPlatform =
          platform === "Все" ||
          game.platform === platform ||
          (platform === "PS4" && game.platform.includes("PS4")) ||
          (platform === "PS5" && game.platform.includes("PS5"));
        const matchesRegion = region === "Все" || game.region === region;
        const matchesGenreFilter = matchesGenre(game, genre);

        return matchesSearch && matchesPlatform && matchesRegion && matchesGenreFilter;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.rubPrice - b.rubPrice;
        if (sort === "price-desc") return b.rubPrice - a.rubPrice;
        if (sort === "discount") {
          return Number(b.discountPercent || 0) - Number(a.discountPercent || 0);
        }

        return Number(b.isFeatured || false) - Number(a.isFeatured || false);
      });
  }, [games, platform, region, genre, deferredSearch, sort]);

  const visibleGames = useMemo(
    () => filteredGames.slice(0, visibleCount),
    [filteredGames, visibleCount]
  );

  function handleAddToCart(game: MarketplaceGame) {
    addGameToCart(game);
    setToast(`${game.title} добавлена в корзину`);
  }

  const selectedSort =
    sortOptions.find((option) => option.value === sort) || sortOptions[0];

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,#ffd40033,transparent_34%),radial-gradient(circle_at_top_right,#2563eb33,transparent_28%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <section className="grid lg:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-stretch mb-10 sm:mb-14">
          <div className="flex flex-col justify-center py-4 sm:py-8">
            <div className="inline-flex w-fit items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-base font-black mb-5 sm:mb-6">
              🎮 PREMIUM PLAYSTATION MARKET
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-black leading-[0.95]">
              Игры PS4 и PS5
            </h1>

            <p className="text-gray-300 mt-5 sm:mt-6 max-w-3xl text-base sm:text-lg md:text-xl leading-7 sm:leading-8">
              Витрина FunZona с региональными ценами, скидками, подборками и
              корзиной для оформления заказа.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {["Скидки недели", "PS Store стиль", "Заказы в кабинете"].map(
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

          {featuredGame ? (
            <Link
              href={`/games/${featuredGame.id}`}
              className="group relative min-h-[340px] sm:min-h-[460px] rounded-3xl overflow-hidden border border-yellow-400/20 bg-white/5 shadow-2xl"
            >
              <GameImage
                src={getGameCover(featuredGame)}
                title={featuredGame.title}
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute left-4 sm:left-6 right-4 sm:right-6 bottom-4 sm:bottom-6">
                {featuredGame.discountPercent ? (
                  <span className="inline-flex bg-red-500 text-white px-3 py-2 rounded-xl font-black mb-4">
                    -{featuredGame.discountPercent}%
                  </span>
                ) : null}

                <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                  {featuredGame.title}
                </h2>

                <div className="flex items-end gap-3 mt-4">
                  <span className="text-2xl sm:text-3xl font-black text-yellow-400">
                    {formatRub(featuredGame.rubPrice)}
                  </span>
                  {featuredGame.oldRubPrice ? (
                    <span className="text-gray-400 line-through pb-1">
                      {formatRub(featuredGame.oldRubPrice)}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : null}
        </section>

        {discountedGames.length > 0 ? (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-3xl md:text-4xl font-black">
                  Скидки недели
                </h2>
                <p className="text-gray-400 mt-2">
                  Лучшие предложения каталога сейчас.
                </p>
              </div>

              <button
                onClick={() => setSort("discount")}
                className="w-fit bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black hover:bg-yellow-300 transition"
              >
                Показать выгодные
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
              {discountedGames.map((game) => (
                <Link
                  href={`/games/${game.id}`}
                  key={game.id}
                  className="grid grid-cols-[92px_1fr] sm:grid-cols-[110px_1fr] min-h-32 sm:min-h-36 bg-white/5 border border-yellow-400/20 rounded-3xl overflow-hidden hover:border-yellow-400 transition"
                >
                  <GameImage
                    src={getGameCover(game)}
                    title={game.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-4 sm:p-5 min-w-0">
                    <span className="inline-flex bg-red-500 text-white px-3 py-1 rounded-xl text-sm font-black">
                      -{game.discountPercent}%
                    </span>
                    <h3 className="text-lg sm:text-xl font-black mt-3 line-clamp-2">
                      {game.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      {game.platform} • {game.region} • {formatRub(game.rubPrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">
                Каталог PlayStation
              </h2>
              <p className="text-gray-400 mt-2">
                Найдено предложений: {filteredGames.length}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(240px,1fr)_auto_auto_auto_auto] gap-3 w-full xl:w-auto">
              <input
                placeholder="Поиск игры или жанра"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-yellow-400/20 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
              />

              <div className="grid grid-cols-3 w-full xl:min-w-[240px] bg-white/5 border border-yellow-400/20 rounded-2xl p-1 gap-1">
                {["Все", "PS4", "PS5"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPlatform(item)}
                    className={`rounded-xl px-3 sm:px-4 py-3 text-sm font-black transition whitespace-nowrap ${
                      platform === item
                        ? "bg-yellow-400 text-black"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    {item === "Все" ? "Все" : item}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 w-full xl:min-w-[320px] bg-white/5 border border-yellow-400/20 rounded-2xl p-1 gap-1">
                {["Все", "Турция", "Украина"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setRegion(item)}
                    className={`rounded-xl px-2 sm:px-4 py-3 text-xs sm:text-sm font-black transition whitespace-nowrap ${
                      region === item
                        ? "bg-yellow-400 text-black"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    {item === "Все" ? "Регионы" : item}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGenreOpen((open) => !open)}
                  className="w-full xl:min-w-[170px] bg-white/5 border border-yellow-400/20 rounded-2xl px-5 py-4 outline-none hover:border-yellow-400 transition flex items-center justify-between gap-4 font-black"
                  aria-expanded={genreOpen}
                >
                  <span>{genre}</span>
                  <span
                    className={`text-yellow-400 transition ${
                      genreOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {genreOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-full min-w-[210px] overflow-hidden rounded-2xl border border-yellow-400/30 bg-[#080808] shadow-2xl shadow-yellow-400/10 p-2">
                    {genreOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setGenre(item);
                          setGenreOpen(false);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left font-black transition ${
                          genre === item
                            ? "bg-yellow-400 text-black"
                            : "text-gray-200 hover:bg-white/10 hover:text-yellow-400"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((open) => !open)}
                  className="w-full xl:min-w-[170px] bg-white/5 border border-yellow-400/20 rounded-2xl px-5 py-4 outline-none hover:border-yellow-400 transition flex items-center justify-between gap-4 font-black"
                  aria-expanded={sortOpen}
                >
                  <span>{selectedSort.label}</span>
                  <span
                    className={`text-yellow-400 transition ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {sortOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-full min-w-[190px] overflow-hidden rounded-2xl border border-yellow-400/30 bg-[#080808] shadow-2xl shadow-yellow-400/10 p-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left font-black transition ${
                          sort === option.value
                            ? "bg-yellow-400 text-black"
                            : "text-gray-200 hover:bg-white/10 hover:text-yellow-400"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[520px] rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse"
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {visibleGames.map((game) => (
                <article
                  key={game.id}
                  className="group bg-gradient-to-b from-yellow-400/10 via-white/5 to-black border border-yellow-400/10 rounded-3xl overflow-hidden hover:border-yellow-400 hover:-translate-y-2 transition duration-300"
                >
                  <Link
                    href={`/games/${game.id}`}
                    className="relative block h-72 sm:h-80 overflow-hidden bg-yellow-400/10"
                  >
                    <GameImage
                      src={getGameCover(game)}
                      title={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                        {game.platform}
                      </span>
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-black">
                        {game.region}
                      </span>
                      {getGameBadge(game) ? (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black">
                          {getGameBadge(game)}
                        </span>
                      ) : null}
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link href={`/games/${game.id}`}>
                      <h2 className="text-xl sm:text-2xl font-black line-clamp-2 group-hover:text-yellow-400 transition sm:min-h-[64px]">
                        {game.title}
                      </h2>
                    </Link>

                    <p className="text-gray-500 mt-3 text-sm">
                      PS Store: {game.originalPrice} {game.currency}
                    </p>
                    <p className="text-gray-400 mt-1 text-sm">
                      {game.genre || "PlayStation"} •{" "}
                      {game.edition || "Digital Edition"}
                    </p>

                    <div className="mt-5">
                      <p className="text-gray-500 text-sm">Цена FunZona</p>
                      <div className="flex items-end gap-3">
                        <p className="text-2xl sm:text-3xl font-black text-yellow-400">
                          {formatRub(game.rubPrice)}
                        </p>
                        {game.oldRubPrice ? (
                          <p className="text-gray-500 line-through pb-1">
                            {formatRub(game.oldRubPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-3 mt-6">
                      <button
                        onClick={() => handleAddToCart(game)}
                        className="bg-yellow-400 text-black py-4 rounded-2xl font-black hover:bg-yellow-300 hover:scale-[1.02] transition"
                      >
                        В корзину
                      </button>
                      <Link
                        href={`/games/${game.id}`}
                        className="border border-yellow-400/30 px-4 py-4 rounded-2xl font-black hover:border-yellow-400 transition"
                        aria-label={`Открыть ${game.title}`}
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </article>
                ))}
              </div>

              {visibleCount < filteredGames.length ? (
                <div className="flex justify-center mt-9">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + gamesPageSize)}
                    className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black hover:bg-yellow-300 transition"
                  >
                    Показать еще {Math.min(gamesPageSize, filteredGames.length - visibleCount)}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed right-5 bottom-5 z-50 bg-black border border-yellow-400/40 rounded-2xl px-5 py-4 font-black shadow-2xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
