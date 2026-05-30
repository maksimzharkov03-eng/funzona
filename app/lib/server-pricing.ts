import { prisma } from "@/app/lib/prisma";
import * as productData from "@/app/data/products";
import * as subscriptionData from "@/app/data/subscriptions";
import * as psStoreData from "@/app/data/ps-store-games";

type BrowserCartItem = {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  description?: unknown;
  quantity?: unknown;
};

export type TrustedOrderItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: number;
  totalPrice: string;
};

type TrustedCatalogItem = {
  ids: string[];
  name: string;
  category: string;
  description: string;
  priceRub: number;
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase("ru-RU");
}

function cleanText(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function parseRub(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  return Number(String(value ?? "").replace(/\D/g, "")) || 0;
}

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

function arraysFrom(moduleData: Record<string, unknown>) {
  return Object.values(moduleData).filter(Array.isArray) as unknown[][];
}

function collectStaticProducts(): TrustedCatalogItem[] {
  const result: TrustedCatalogItem[] = [];

  for (const array of arraysFrom(productData)) {
    for (const raw of array) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw as Record<string, unknown>;
      const id = cleanText(item.id);
      const name = cleanText(item.name);
      const priceRub = parseRub(item.price);
      if (!id || !name || priceRub <= 0) continue;

      result.push({
        ids: [id, "product-" + id],
        name,
        category: cleanText(item.category) || "Каталог",
        description: cleanText(item.description),
        priceRub,
      });
    }
  }

  return result;
}

function collectSubscriptions(): TrustedCatalogItem[] {
  const result: TrustedCatalogItem[] = [];

  for (const array of arraysFrom(subscriptionData)) {
    for (const raw of array) {
      if (!raw || typeof raw !== "object") continue;
      const plan = raw as Record<string, unknown>;
      const id = cleanText(plan.id);
      const priceRub = parseRub(plan.price);
      if (!id || priceRub <= 0) continue;

      const country = cleanText(plan.country);
      const service = cleanText(plan.service) || "PlayStation Plus";
      const tier = cleanText(plan.tier);
      const duration = cleanText(plan.duration);
      const name = [service, tier !== service ? tier : "", duration, country]
        .filter(Boolean)
        .join(" ");

      result.push({
        ids: [id, "subscription-" + id],
        name,
        category: "Подписки",
        description: [service, tier, duration, country].filter(Boolean).join(" • "),
        priceRub,
      });
    }
  }

  return result;
}

function collectStaticGames(): TrustedCatalogItem[] {
  const result: TrustedCatalogItem[] = [];

  for (const array of arraysFrom(psStoreData)) {
    for (const raw of array) {
      if (!raw || typeof raw !== "object") continue;
      const game = raw as Record<string, unknown>;
      const id = cleanText(game.id);
      const name = cleanText(game.title || game.name);
      const priceRub = parseRub(game.rubPrice || game.price);
      if (!id || !name || priceRub <= 0) continue;

      result.push({
        ids: [id, "game-" + id],
        name,
        category: "Игры",
        description: [cleanText(game.platform), cleanText(game.region), cleanText(game.edition)]
          .filter(Boolean)
          .join(" • "),
        priceRub,
      });
    }
  }

  return result;
}

async function collectDatabaseItems(): Promise<TrustedCatalogItem[]> {
  const [products, games] = await Promise.all([
    prisma.product.findMany(),
    prisma.game.findMany(),
  ]);

  return [
    ...products
      .map((product) => ({
        ids: [String(product.id), "product-" + product.id],
        name: product.name,
        category: product.category,
        description: product.description,
        priceRub: parseRub(product.price),
      }))
      .filter((product) => product.priceRub > 0),
    ...games
      .map((game) => ({
        ids: [String(game.id), "game-" + game.id],
        name: game.title,
        category: "Игры",
        description: [game.platform, game.region, game.edition].filter(Boolean).join(" • "),
        priceRub: Math.max(0, Math.round(game.rubPrice)),
      }))
      .filter((game) => game.priceRub > 0),
  ];
}

function findTrustedItem(catalog: TrustedCatalogItem[], browserItem: BrowserCartItem) {
  const requestedId = cleanText(browserItem.id);
  if (requestedId) {
    const byId = catalog.find((item) => item.ids.some((id) => id === requestedId));
    if (byId) return byId;
  }

  const requestedName = normalize(browserItem.name);
  if (!requestedName) return null;

  const sameName = catalog.filter((item) => normalize(item.name) === requestedName);
  if (sameName.length === 1) return sameName[0];

  const requestedCategory = normalize(browserItem.category);
  if (requestedCategory) {
    const sameCategory = sameName.find((item) => normalize(item.category) === requestedCategory);
    if (sameCategory) return sameCategory;
  }

  return sameName[0] || null;
}

export async function resolveTrustedOrderItems(input: unknown): Promise<TrustedOrderItem[]> {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("Корзина пуста.");
  }

  if (input.length > 30) {
    throw new Error("Слишком много позиций в одном заказе.");
  }

  const catalog = [
    ...collectStaticProducts(),
    ...collectSubscriptions(),
    ...collectStaticGames(),
    ...(await collectDatabaseItems()),
  ];

  return input.map((raw) => {
    const browserItem = (raw || {}) as BrowserCartItem;
    const trusted = findTrustedItem(catalog, browserItem);
    const quantity = Math.max(1, Math.min(50, Math.floor(Number(browserItem.quantity) || 1)));

    if (!trusted) {
      throw new Error("Один из товаров больше недоступен. Обновите корзину и попробуйте еще раз.");
    }

    return {
      id: trusted.ids[0],
      name: trusted.name,
      category: trusted.category,
      description: trusted.description,
      price: formatRub(trusted.priceRub),
      quantity,
      totalPrice: formatRub(trusted.priceRub * quantity),
    };
  });
}
