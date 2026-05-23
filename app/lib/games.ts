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

  const tier =
    uahRateTable.find((item) => price >= item.min && price <= item.max) ||
    uahRateTable[0];

  return Math.ceil(price * tier.rate);
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
