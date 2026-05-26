export type MarketplaceGame = {
  id: number;
  title: string;
  image: string;
  platform: string;
  region: string;
  originalPrice: number;
  currency: string;
  rubPrice: number;
  oldRubPrice?: number | null;
  discountPercent?: number | null;
  genre?: string | null;
  publisher?: string | null;
  releaseDate?: string | Date | null;
  edition?: string | null;
  badge?: string | null;
  description?: string | null;
  isFeatured?: boolean | null;
  createdAt?: string | Date;
};

export const demoGames: MarketplaceGame[] = [
  {
    id: 1,
    title: "Marvel's Spider-Man 2",
    image: "/game-covers/spider-man-2.svg",
    platform: "PS5",
    region: "Турция",
    originalPrice: 2799,
    currency: "TRY",
    rubPrice: 5490,
    oldRubPrice: 6990,
    discountPercent: 21,
    genre: "Action",
    publisher: "PlayStation Studios",
    releaseDate: "2023-10-20",
    edition: "Standard Edition",
    badge: "Хит PS5",
    description:
      "Динамичный эксклюзив PlayStation с открытым городом, двумя героями и кинематографичной подачей.",
    isFeatured: true,
  },
  {
    id: 2,
    title: "God of War Ragnarok",
    image: "/game-covers/god-of-war-ragnarok.svg",
    platform: "PS4/PS5",
    region: "Турция",
    originalPrice: 1999,
    currency: "TRY",
    rubPrice: 3890,
    oldRubPrice: 4990,
    discountPercent: 22,
    genre: "Adventure",
    publisher: "PlayStation Studios",
    releaseDate: "2022-11-09",
    edition: "Cross-Gen",
    badge: "Скидка",
    description:
      "Большое сюжетное приключение с прокачкой, сильной постановкой и поддержкой PS4/PS5.",
    isFeatured: true,
  },
  {
    id: 3,
    title: "EA Sports FC 25",
    image: "/game-covers/fc-25.svg",
    platform: "PS5",
    region: "Польша",
    originalPrice: 349,
    currency: "PLN",
    rubPrice: 6290,
    genre: "Sports",
    publisher: "Electronic Arts",
    releaseDate: "2024-09-27",
    edition: "Standard Edition",
    badge: "Популярно",
    description:
      "Свежий футбольный сезон, онлайн-режимы и быстрый старт для аккаунта PlayStation.",
    isFeatured: false,
  },
  {
    id: 4,
    title: "The Last of Us Part II Remastered",
    image: "/game-covers/the-last-of-us-part-2.svg",
    platform: "PS5",
    region: "Турция",
    originalPrice: 1499,
    currency: "TRY",
    rubPrice: 2990,
    oldRubPrice: 3790,
    discountPercent: 21,
    genre: "Story",
    publisher: "PlayStation Studios",
    releaseDate: "2024-01-19",
    edition: "Remastered",
    badge: "Premium",
    description:
      "Обновленная версия с улучшенной графикой, DualSense-фишками и дополнительными режимами.",
    isFeatured: true,
  },
];

export function getGameCover(game: Pick<MarketplaceGame, "title" | "image">) {
  if (game.image?.startsWith("https://image.api.playstation.com/")) {
    return `/api/ps-store-image?url=${encodeURIComponent(game.image)}`;
  }

  return game.image || "";
}

export function formatRub(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

const genreTranslations: Record<string, string> = {
  action: "Экшен",
  adventure: "Приключения",
  racing: "Гонки",
  race: "Гонки",
  shooter: "Стрелялки",
  shooting: "Стрелялки",
  fps: "Стрелялки",
  sports: "Спорт",
  sport: "Спорт",
  fighting: "Бои",
  fight: "Бои",
  combat: "Бои",
  rpg: "RPG",
  horror: "Хоррор",
  survival: "Хоррор",
  simulation: "Симуляторы",
  simulator: "Симуляторы",
  family: "Семейные",
  story: "Сюжетные",
};

const genreRules: Array<{ label: string; words: string[] }> = [
  {
    label: "Гонки",
    words: [
      "forza",
      "gran turismo",
      "need for speed",
      "racing",
      "race",
      "rally",
      "wrc",
      "f1 ",
      "moto",
      "motogp",
      "carx",
      "dirt",
      "drift",
    ],
  },
  {
    label: "Стрелялки",
    words: [
      "call of duty",
      "battlefield",
      "hell let loose",
      "sniper",
      "doom",
      "far cry",
      "metro",
      "borderlands",
      "rainbow six",
      "tom clancy",
      "stalker",
      "s.t.a.l.k.e.r",
      "shooter",
      "fps",
      "shooting",
      "gun",
      "war",
    ],
  },
  {
    label: "Бои",
    words: [
      "ufc",
      "mortal kombat",
      "mk1",
      "tekken",
      "street fighter",
      "dragon ball",
      "wwe",
      "boxing",
      "fight",
      "fighting",
      "combat",
    ],
  },
  {
    label: "Спорт",
    words: [
      "ea sports fc",
      "fifa",
      "nba",
      "nhl",
      "mlb",
      "madden",
      "pga",
      "tennis",
      "football",
      "basketball",
      "sports",
      "sport",
    ],
  },
  {
    label: "RPG",
    words: [
      "diablo",
      "gothic",
      "baldur",
      "elden ring",
      "final fantasy",
      "dragon age",
      "persona",
      "monster hunter",
      "rpg",
      "role",
    ],
  },
  {
    label: "Хоррор",
    words: [
      "resident evil",
      "silent hill",
      "dying light",
      "dead space",
      "outlast",
      "horror",
      "survival",
      "ужас",
    ],
  },
  {
    label: "Симуляторы",
    words: [
      "simulator",
      "simulation",
      "flight simulator",
      "bus",
      "truck",
      "farming",
      "train",
      "sims",
    ],
  },
  {
    label: "Семейные",
    words: ["lego", "minecraft", "sonic", "paw patrol", "family", "kids"],
  },
  {
    label: "Приключения",
    words: [
      "assassin",
      "spider-man",
      "god of war",
      "the last of us",
      "astro bot",
      "tomb raider",
      "uncharted",
      "star wars",
      "adventure",
      "story",
      "action",
    ],
  },
];

export function getGameGenre(
  game: Pick<
    MarketplaceGame,
    "title" | "genre" | "publisher" | "description" | "edition"
  >
) {
  const rawGenre = String(game.genre || "").trim();
  const normalizedGenre = rawGenre.toLowerCase();

  if (
    rawGenre &&
    !["playstation store", "full_game", "игра", "digital edition"].includes(
      normalizedGenre
    )
  ) {
    return genreTranslations[normalizedGenre] || rawGenre;
  }

  const haystack = [
    game.title,
    game.genre,
    game.publisher,
    game.description,
    game.edition,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    genreRules.find((rule) =>
      rule.words.some((word) => haystack.includes(word))
    )?.label || "Экшен"
  );
}

export const tryPriceTable = [
  { tryAmount: 250, rubAmount: 525 },
  { tryAmount: 500, rubAmount: 1100 },
  { tryAmount: 750, rubAmount: 1650 },
  { tryAmount: 1000, rubAmount: 2200 },
  { tryAmount: 1500, rubAmount: 3300 },
  { tryAmount: 2000, rubAmount: 4350 },
  { tryAmount: 2500, rubAmount: 5380 },
  { tryAmount: 3000, rubAmount: 6500 },
  { tryAmount: 4000, rubAmount: 8900 },
  { tryAmount: 5000, rubAmount: 10800 },
];

export const uahRateTable = [
  { min: 100, max: 299, rate: 4 },
  { min: 300, max: 499, rate: 3 },
  { min: 500, max: 999, rate: 2.6 },
  { min: 1000, max: 1999, rate: 2.3 },
  { min: 2000, max: 3999, rate: 2.25 },
  { min: 4000, max: Infinity, rate: 2.2 },
];

export function roundTryPrice(price: number) {
  if (price <= 0) return 0;
  return Math.ceil(price / 250) * 250;
}

export function roundUahPrice(price: number) {
  if (price <= 0) return 0;
  return Math.ceil(price);
}

export function roundRubPrice(price: number, step = 50) {
  if (price <= 0) return 0;
  return Math.ceil(price / step) * step;
}

export function getRubPriceByTryPrice(price: number) {
  const roundedTry = roundTryPrice(price);
  const exact = tryPriceTable.find((tier) => tier.tryAmount === roundedTry);

  if (exact) return exact.rubAmount;

  const lower = [...tryPriceTable]
    .reverse()
    .find((tier) => tier.tryAmount < roundedTry);
  const upper = tryPriceTable.find((tier) => tier.tryAmount > roundedTry);

  if (lower && upper) {
    const progress =
      (roundedTry - lower.tryAmount) / (upper.tryAmount - lower.tryAmount);
    return Math.ceil(
      lower.rubAmount + (upper.rubAmount - lower.rubAmount) * progress
    );
  }

  const last = tryPriceTable[tryPriceTable.length - 1];
  return Math.ceil(roundedTry * (last.rubAmount / last.tryAmount));
}

export function getRubPriceByUahPrice(price: number) {
  if (price <= 0) return 0;

  const roundedUah = roundUahPrice(price);
  const tier =
    uahRateTable.find((item) => roundedUah >= item.min && roundedUah <= item.max) ||
    uahRateTable[0];

  return roundRubPrice(roundedUah * tier.rate);
}

export function calculateRubPrice(
  price: number,
  rate?: number,
  currency = "TRY"
) {
  if (currency === "TRY") return getRubPriceByTryPrice(price);
  if (currency === "UAH") return getRubPriceByUahPrice(price);
  if (rate && rate > 0) return Math.ceil(price * rate);
  return Math.ceil(price);
}
