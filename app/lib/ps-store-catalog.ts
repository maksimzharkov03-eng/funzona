import {
  calculateRubPrice,
  roundTryPrice,
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

const regions: StoreRegion[] = [
  { locale: "en-tr", country: "Турция", currency: "TRY" },
  { locale: "ru-ua", country: "Украина", currency: "UAH" },
];

const categoryIds = [
  "d0446d4b-dc9a-4f1e-86ec-651f099c9b29",
  "30e3fe35-8f2d-4496-95bc-844f56952e3c",
];

const maxPagesPerCategory = 7;
const maxGamesPerRegion = 300;
const cacheSeconds = 60 * 60 * 6;

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
  const master = body.match(
    /"url":"(https:\/\/image\.api\.playstation\.com[^"]+?)"[\s\S]{0,300}?"type":"MASTER"/i
  );
  const first = body.match(/"url":"(https:\/\/image\.api\.playstation\.com[^"]+?)"/i);
  const image = master?.[1] || first?.[1] || "";
  return decodeJsonString(image);
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

  return Number.isFinite(price) ? price : null;
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

  const hasPS4 = Array.from(platforms).some((platform) => platform.includes("PS4"));
  const hasPS5 = Array.from(platforms).some((platform) => platform.includes("PS5"));

  if (hasPS4 && hasPS5) return "PS4/PS5";
  if (hasPS4) return "PS4";
  return "PS5";
}

function shouldSkipProduct(product: ParsedProduct) {
  if (!product.image || product.price <= 0) return true;

  const text = [
    product.name,
    product.classification,
    product.localizedClassification,
  ]
    .join(" ")
    .toLowerCase();

  return skipWords.some((word) => text.includes(word));
}

function parseProducts(html: string) {
  const products: ParsedProduct[] = [];
  const productRegex =
    /"Product:([^"\\]+?):([^"\\]+?)":\{([\s\S]*?)(?=,"Product:|,"ROOT_QUERY|<\/script>)/g;

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

  return products.filter((product) => product.name);
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
      region.currency === "TRY" ? roundTryPrice(product.price) : Math.ceil(product.price),
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

async function fetchCategoryPage(region: StoreRegion, categoryId: string, page: number) {
  const response = await fetch(
    "https://store.playstation.com/" +
      region.locale +
      "/category/" +
      categoryId +
      "/" +
      page,
    {
      headers: {
        "accept-language": region.locale,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
      },
      next: { revalidate: cacheSeconds },
    }
  );

  if (!response.ok) return [];

  return parseProducts(await response.text());
}

async function fetchRegionCatalog(region: StoreRegion) {
  const tasks = categoryIds.flatMap((categoryId) =>
    Array.from({ length: maxPagesPerCategory }, (_item, index) =>
      fetchCategoryPage(region, categoryId, index + 1)
    )
  );
  const pages = await Promise.all(tasks);
  const games = new Map<string, MarketplaceGame>();

  for (const product of pages.flat()) {
    if (shouldSkipProduct(product)) continue;

    const key = region.country + ":" + product.id;
    if (!games.has(key)) {
      games.set(key, toMarketplaceGame(product, region, games.size));
    }
  }

  return Array.from(games.values()).slice(0, maxGamesPerRegion);
}

export async function getPlayStationStoreCatalog() {
  try {
    const catalogs = await Promise.all(regions.map((region) => fetchRegionCatalog(region)));
    return catalogs.flat();
  } catch (error) {
    console.log("PS STORE CATALOG ERROR:", error);
    return [];
  }
}
