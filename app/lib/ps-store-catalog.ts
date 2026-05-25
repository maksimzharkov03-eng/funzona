import { unstable_cache } from "next/cache";
import {
  calculateRubPrice,
  roundTryPrice,
  roundUahPrice,
  type MarketplaceGame,
} from "@/app/lib/games";

type StoreCurrency = "TRY" | "UAH";

type StoreRegion = {
  locale: string;
  country: string;
  currency: StoreCurrency;
};

type ParsedProduct = {
  id: string;
  name: string;
  image: string;
  platform: string;
  classification: string;
  localizedClassification: string;
  price: number;
  basePrice: number | null;
};

type StorePage = {
  html: string;
  products: ParsedProduct[];
};

const regions: StoreRegion[] = [
  { locale: "en-tr", country: "Турция", currency: "TRY" },
  { locale: "ru-ua", country: "Украина", currency: "UAH" },
];

const maxBrowsePagesPerRegion = Number(process.env.PS_STORE_MAX_PAGES || 420);
const maxGamesPerRegion = Number(process.env.PS_STORE_MAX_GAMES_PER_REGION || 12000);
const browseBatchSize = Number(process.env.PS_STORE_FETCH_BATCH_SIZE || 16);
const cacheSeconds = 60 * 60 * 24;

const blockedGameTitles = [
  "stalker 2",
  "s.t.a.l.k.e.r. 2",
  "s.t.a.l.k.e.r. 2: heart of chornobyl",
  "s.t.a.l.k.e.r. 2 heart of chornobyl",
  "сталкер 2",
];

const skipWords = [
  "add-on",
  "avatar",
  "demo",
  "trial",
  "theme",
  "soundtrack",
  "virtual currency",
  "currency",
  "points",
  "coins",
  "token",
  "season pass",
  "дополнение",
  "демо",
  "пробная",
  "аватар",
  "тема",
  "саундтрек",
  "виртуальная валюта",
  "валюта",
  "монет",
  "очков",
  "жетон",
];

function decodeJsonString(value: string) {
  try {
    return JSON.parse("\"" + value + "\"") as string;
  } catch {
    return value.replace(/\\"/g, "\"").replace(/\\u([\dA-Fa-f]{4})/g, (_match, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );
  }
}

function pickString(body: string, field: string) {
  const match = body.match(new RegExp("\"" + field + "\":\"((?:\\\\.|[^\"\\\\])*)\"", "i"));
  return match ? decodeJsonString(match[1]) : "";
}

function pickImage(body: string) {
  const media = Array.from(
    body.matchAll(/\{\"__typename\":\"Media\"[\s\S]*?\}/g)
  )
    .map((match) => {
      const block = match[0];
      return {
        type: pickString(block, "type").toUpperCase(),
        url: pickString(block, "url"),
        role: pickString(block, "role").toUpperCase(),
      };
    })
    .filter(
      (item) =>
        item.type === "IMAGE" &&
        item.url.startsWith("https://image.api.playstation.com/")
    );

  const rolePriority = [
    "GAMEHUB_COVER_ART",
    "PORTRAIT_BANNER",
    "MASTER",
    "FOUR_BY_THREE_BANNER",
    "EDITION_KEY_ART",
    "SIXTEEN_BY_NINE_BANNER",
  ];

  for (const role of rolePriority) {
    const image = media.find((item) => item.role === role);
    if (image) return image.url;
  }

  const first = media.find(
    (item) =>
      !item.role.includes("BACKGROUND") &&
      !item.role.includes("LOGO") &&
      !item.role.includes("HERO")
  );

  return first?.url || media[0]?.url || "";
}

function parseStorePrice(value: string) {
  const freePattern = /free|бесплатно/i;
  if (!value || freePattern.test(value)) return null;

  const compact = value.replace(/\s/g, "").replace(/[^\d.,]/g, "");
  if (!compact) return null;

  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  const normalized =
    lastComma > lastDot
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(/,/g, "");
  const price = Number(normalized);

  return Number.isFinite(price) && price > 0 ? price : null;
}

function makeNumericId(region: StoreRegion, productId: string) {
  const base = region.country === "Турция" ? 100000000 : 1100000000;
  let hash = 0;

  for (let index = 0; index < productId.length; index += 1) {
    hash = (hash * 31 + productId.charCodeAt(index)) % 900000000;
  }

  return base + hash;
}

function normalizePlatform(body: string) {
  const platforms = new Set<string>();

  for (const arrayMatch of body.matchAll(/"platforms":\[((?:"[^"]+",?)+)\]/gi)) {
    for (const platformMatch of arrayMatch[1].matchAll(/"([^"]+)"/g)) {
      platforms.add(decodeJsonString(platformMatch[1]).toUpperCase());
    }
  }

  for (const match of body.matchAll(/"platform":"([^"]+)"/gi)) {
    platforms.add(decodeJsonString(match[1]).toUpperCase());
  }

  const upperBody = body.toUpperCase();
  const hasPS4 =
    Array.from(platforms).some((platform) => platform.includes("PS4")) ||
    /-CUSA[A-Z0-9_]/.test(upperBody);
  const hasPS5 =
    Array.from(platforms).some((platform) => platform.includes("PS5")) ||
    /-PPSA[A-Z0-9_]/.test(upperBody);

  if (hasPS4 && hasPS5) return "PS4/PS5";
  if (hasPS4) return "PS4";
  if (hasPS5) return "PS5";
  return "PS4/PS5";
}

function shouldSkipProduct(product: ParsedProduct) {
  if (!product.image || !product.platform || product.price <= 0) return true;

  const normalizedTitle = product.name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, " ")
    .trim();

  if (
    blockedGameTitles.some((title) => {
      const normalizedBlockedTitle = title
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, " ")
        .trim();

      return normalizedTitle.includes(normalizedBlockedTitle);
    })
  ) {
    return true;
  }

  const text = [
    product.name,
    product.classification,
    product.localizedClassification,
  ]
    .join(" ")
    .toLowerCase();
  const classification = text.toUpperCase();

  if (
    /ADD[_-]ON|VIRTUAL[_-]CURRENCY|CHARACTER|COSTUME|AVATAR|THEME|SOUNDTRACK|CONSUMABLE/.test(
      classification
    )
  ) {
    return true;
  }

  return skipWords.some((word) => {
    const normalizedWord = word.toLowerCase();
    return (
      text.includes(normalizedWord) ||
      text.includes(normalizedWord.replace(/-/g, "_"))
    );
  });
}

function parseProducts(html: string) {
  const products: ParsedProduct[] = [];
  const productRegex =
    /"Product:([^"\\]+?):([^"\\]+?)":\{([\s\S]*?)(?=,"Product:|,"ROOT_QUERY|<\/script>)/g;
  const conceptRegex =
    /"Concept:([^"\\]+?):([^"\\]+?)":\{([\s\S]*?)(?=,"Concept:|,"Product:|,"ROOT_QUERY|<\/script>)/g;

  for (const match of html.matchAll(productRegex)) {
    const body = match[3];
    const discountedPrice = pickString(body, "discountedPrice");
    const basePrice = pickString(body, "basePrice");
    const price = parseStorePrice(discountedPrice || basePrice);

    if (!price) continue;

    products.push({
      id: match[1] + ":" + match[2],
      name: pickString(body, "name"),
      image: pickImage(body),
      platform: normalizePlatform(body),
      classification: pickString(body, "storeDisplayClassification"),
      localizedClassification: pickString(body, "localizedStoreDisplayClassification"),
      price,
      basePrice: parseStorePrice(basePrice),
    });
  }

  for (const match of html.matchAll(conceptRegex)) {
    const body = match[3];
    const discountedPrice = pickString(body, "discountedPrice");
    const basePrice = pickString(body, "basePrice");
    const price = parseStorePrice(discountedPrice || basePrice);

    if (!price) continue;

    products.push({
      id: match[1] + ":" + match[2],
      name: pickString(body, "name"),
      image: pickImage(body),
      platform: normalizePlatform(body),
      classification: "FULL_GAME",
      localizedClassification: "Игра",
      price,
      basePrice: parseStorePrice(basePrice),
    });
  }

  const unique = new Map<string, ParsedProduct>();

  for (const product of products.filter((item) => item.name)) {
    if (!unique.has(product.id)) unique.set(product.id, product);
  }

  return Array.from(unique.values());
}

function parseBrowseTotalPages(html: string) {
  const pages = new Set<number>();

  for (const match of html.matchAll(/\/pages\/browse\/(\d+)/g)) {
    pages.add(Number(match[1]));
  }

  for (const match of html.matchAll(/"(?:totalPages|totalPageCount|pageCount)":(\d+)/g)) {
    pages.add(Number(match[1]));
  }

  for (const match of html.matchAll(
    /"pageInfo":\{"__typename":"PageInfo","totalCount":(\d+),"offset":\d+,"size":(\d+)/g
  )) {
    const totalCount = Number(match[1]);
    const pageSize = Number(match[2]);

    if (Number.isFinite(totalCount) && Number.isFinite(pageSize) && pageSize > 0) {
      pages.add(Math.ceil(totalCount / pageSize));
    }
  }

  const detected = Math.max(
    1,
    ...Array.from(pages).filter((page) => Number.isFinite(page) && page > 0)
  );

  return Math.min(detected > 1 ? detected : maxBrowsePagesPerRegion, maxBrowsePagesPerRegion);
}

function toMarketplaceGame(
  product: ParsedProduct,
  region: StoreRegion,
  index: number
): MarketplaceGame {
  const hasDiscount = product.basePrice !== null && product.basePrice > product.price;
  const oldRubPrice = hasDiscount
    ? calculateRubPrice(product.basePrice || product.price, undefined, region.currency)
    : null;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round(100 - (product.price / (product.basePrice || product.price)) * 100))
    : null;

  return {
    id: makeNumericId(region, product.id),
    title: product.name,
    image: product.image,
    platform: product.platform,
    region: region.country,
    originalPrice:
      region.currency === "TRY"
        ? roundTryPrice(product.price)
        : region.currency === "UAH"
          ? roundUahPrice(product.price)
          : Math.ceil(product.price),
    currency: region.currency,
    rubPrice: calculateRubPrice(product.price, undefined, region.currency),
    oldRubPrice,
    discountPercent,
    genre: "PlayStation Store",
    publisher: "PlayStation",
    edition: product.classification || product.localizedClassification || "Digital Edition",
    badge: hasDiscount ? "Скидка" : region.country,
    description:
      "Актуальная позиция из PlayStation Store " +
      region.country +
      ". Цена пересчитана по прайсу FunZona.",
    isFeatured: index < 24 || Boolean(hasDiscount),
  };
}

function getBrowseUrl(region: StoreRegion, page: number) {
  return (
    "https://store.playstation.com/" +
    region.locale +
    "/pages/browse/" +
    (page > 1 ? String(page) : "")
  );
}

async function fetchBrowsePage(region: StoreRegion, page: number): Promise<StorePage> {
  try {
    const response = await fetch(getBrowseUrl(region, page), {
      headers: {
        "accept-language": region.locale,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
      },
      next: { revalidate: cacheSeconds },
    });

    if (!response.ok) return { html: "", products: [] };

    const html = await response.text();
    return { html, products: parseProducts(html) };
  } catch {
    return { html: "", products: [] };
  }
}

async function runInBatches<T, R>(
  items: T[],
  size: number,
  mapper: (item: T) => Promise<R>
) {
  const results: R[] = [];
  const batchSize = Math.max(1, size);

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    results.push(...(await Promise.all(batch.map(mapper))));
  }

  return results;
}

async function fetchRegionCatalog(region: StoreRegion) {
  const firstPage = await fetchBrowsePage(region, 1);
  const totalPages = parseBrowseTotalPages(firstPage.html);
  const pageNumbers = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_item, index) => index + 2
  );
  const otherPages = await runInBatches(pageNumbers, browseBatchSize, (page) =>
    fetchBrowsePage(region, page)
  );
  const games = new Map<string, MarketplaceGame>();

  for (const product of [firstPage, ...otherPages].flatMap((page) => page.products)) {
    if (shouldSkipProduct(product)) continue;

    const key = region.country + ":" + product.id;
    if (!games.has(key)) {
      games.set(key, toMarketplaceGame(product, region, games.size));
    }
  }

  return Array.from(games.values()).slice(0, maxGamesPerRegion);
}

async function loadPlayStationStoreCatalog() {
  try {
    const catalogs = await Promise.all(regions.map((region) => fetchRegionCatalog(region)));
    return catalogs.flat();
  } catch (error) {
    console.log("PS STORE CATALOG ERROR:", error);
    return [];
  }
}

export const getPlayStationStoreCatalog = unstable_cache(
  loadPlayStationStoreCatalog,
  ["ps-store-full-browse-catalog-v3"],
  { revalidate: cacheSeconds }
);
