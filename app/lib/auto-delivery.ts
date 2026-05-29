import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";

type AutoDeliveryOrder = {
  id: number;
  productName: string;
  productPrice: string;
  comment: string | null;
  status: string;
  deliveryData: string | null;
  autoDeliveryProvider?: string | null;
  autoDeliveryCostUsd?: number | null;
  autoDeliveryRevenueRub?: number | null;
  autoDeliveryAt?: Date | string | null;
  userLogin: string | null;
  telegram: string;
  payment: string;
};

type OrderItem = {
  name: string;
  quantity: number;
};

type NsStockService = {
  service_id: number;
  service_name: string;
  price?: number | string;
  currency?: string;
  in_stock?: number;
  [key: string]: unknown;
};

type NsStockCategory = {
  category_name: string;
  category_id: number;
  services: NsStockService[];
};

type NsStockResponse = {
  categories: NsStockCategory[];
};

type NsResolvedService = NsStockService & {
  category_name?: string;
};

type AutoDeliveryResult = {
  attempted: boolean;
  delivered: boolean;
  order: AutoDeliveryOrder;
  message: string;
};

let nsToken = "";
let nsTokenExpiresAt = 0;
let stockCache: { expiresAt: number; data: NsStockResponse | null } = {
  expiresAt: 0,
  data: null,
};

function getNsConfig() {
  return {
    baseUrl: (process.env.NS_GIFTS_BASE_URL || "https://api.ns.gifts").trim(),
    userId: (process.env.NS_GIFTS_USER_ID || "").trim(),
    login: (process.env.NS_GIFTS_LOGIN || "").trim(),
    password: (process.env.NS_GIFTS_PASSWORD || "").trim(),
    apiSecret: (process.env.NS_GIFTS_API_SECRET || "").trim(),
  };
}

function hasNsConfig() {
  const config = getNsConfig();
  return Boolean(config.userId && config.login && config.password && config.apiSecret);
}

function sha256Hex(body: Buffer) {
  return crypto.createHash("sha256").update(body).digest("hex");
}

function compactJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8");
}

function signNsRequest(
  method: string,
  path: string,
  query: string,
  body: Buffer,
  timestamp: string,
  token: string | null
) {
  const { apiSecret } = getNsConfig();
  const parts = [method.toUpperCase(), path, query, timestamp];

  if (token !== null) {
    parts.push(token);
  }

  parts.push(sha256Hex(body));

  return crypto
    .createHmac("sha256", Buffer.from(apiSecret, "base64"))
    .update(parts.join("\n"))
    .digest("base64");
}

async function nsFetch<T>(
  method: string,
  path: string,
  options: { jsonBody?: unknown; token?: string | null } = {}
): Promise<T> {
  const config = getNsConfig();
  const body = options.jsonBody === undefined ? Buffer.alloc(0) : compactJson(options.jsonBody);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const token = options.token === undefined ? nsToken : options.token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": config.userId,
    "X-Timestamp": timestamp,
    "X-Signature": signNsRequest(method, path, "", body, timestamp, token || null),
  };

  const proxyKey = (process.env.NS_GIFTS_PROXY_KEY || "").trim();

  if (proxyKey) {
    headers["X-Funzona-Proxy-Key"] = proxyKey;
  }

  if (token) {
    headers["X-Token"] = token;
  }

  const response = await fetch(config.baseUrl + path, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      "NS API " + path + " вернул " + response.status + ": " + text.slice(0, 300)
    );
  }

  return data as T;
}

async function getNsToken() {
  if (nsToken && Date.now() < nsTokenExpiresAt - 5 * 60 * 1000) {
    return nsToken;
  }

  const config = getNsConfig();
  const response = await nsFetch<{ token: string; expires_in: number }>(
    "POST",
    "/api/v2/get_token",
    {
      token: null,
      jsonBody: {
        login: config.login,
        password: config.password,
      },
    }
  );

  nsToken = response.token;
  nsTokenExpiresAt = Date.now() + Number(response.expires_in || 7200) * 1000;

  return nsToken;
}

async function nsCall<T>(method: string, path: string, jsonBody?: unknown): Promise<T> {
  await getNsToken();

  try {
    return await nsFetch<T>(method, path, { jsonBody });
  } catch (error: any) {
    if (String(error?.message || "").includes("401")) {
      nsToken = "";
      await getNsToken();
      return await nsFetch<T>(method, path, { jsonBody });
    }

    throw error;
  }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();
}

function parseAmountCurrency(value: string) {
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*(tl|try|usd|\$|inr|uah|грн)/i);

  if (!match) return null;

  const currency = match[2].toLowerCase();

  return {
    amount: Number(match[1].replace(",", ".")),
    currency:
      currency === "$"
        ? "usd"
        : currency === "try"
          ? "tl"
          : currency === "грн"
            ? "uah"
            : currency,
  };
}

function numberFromNsValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  return (
    Number(
      String(value || "0")
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    ) || 0
  );
}

function rubFromPrice(price: string) {
  return Number(String(price || "0").replace(/\D/g, "")) || 0;
}

function firstCostValue(...values: unknown[]) {
  for (const value of values) {
    const parsed = numberFromNsValue(value);

    if (parsed > 0) return parsed;
  }

  return 0;
}

function serviceCostUsd(service: NsResolvedService, quantity: number) {
  const unitCost = firstCostValue(
    service.price_usd,
    service.usd_price,
    service.priceUSD,
    service.cost_usd,
    service.costUsd,
    service.purchase_price_usd,
    service.purchasePriceUsd,
    service.supplier_price_usd,
    service.supplierPriceUsd,
    service.wholesale_price_usd,
    service.wholesalePriceUsd,
    service.balance_price,
    service.balancePrice,
    service.price
  );

  return Math.round(unitCost * Math.max(1, quantity) * 100) / 100;
}

function responseCostUsd(response: Record<string, unknown>, quantity: number) {
  const totalCost = firstCostValue(
    response.cost_usd,
    response.costUsd,
    response.total_cost_usd,
    response.totalCostUsd,
    response.amount_usd,
    response.amountUsd,
    response.price_usd,
    response.priceUsd
  );

  if (totalCost > 0) return Math.round(totalCost * 100) / 100;

  const unitCost = firstCostValue(
    response.unit_cost_usd,
    response.unitCostUsd,
    response.purchase_price_usd,
    response.purchasePriceUsd,
    response.price
  );

  return Math.round(unitCost * Math.max(1, quantity) * 100) / 100;
}

function parseRegion(value: string) {
  const normalized = normalize(value);

  if (/(turkey|turkiye|турция|turkiye)/i.test(normalized)) return "turkey";
  if (/(usa|сша|america|united states)/i.test(normalized)) return "usa";
  if (/(india|индия)/i.test(normalized)) return "india";
  if (/(ukraine|украина)/i.test(normalized)) return "ukraine";

  return "";
}

function parseServiceMap() {
  const raw = process.env.NS_GIFTS_SERVICE_MAP || "";

  if (!raw.trim()) return new Map<string, number>();

  try {
    const json = JSON.parse(raw) as Record<string, number | string>;
    return new Map(
      Object.entries(json).map(([name, serviceId]) => [
        normalize(name),
        Number(serviceId),
      ])
    );
  } catch {
    return new Map(
      raw
        .split(",")
        .map((pair) => pair.split("="))
        .filter((pair) => pair.length === 2)
        .map(([name, serviceId]) => [normalize(name), Number(serviceId)])
    );
  }
}

function parseOrderItems(order: AutoDeliveryOrder): OrderItem[] {
  const comment = order.comment || "";
  const items: OrderItem[] = [];

  for (const line of comment.split("\n")) {
    const match = line.match(/^\s*\d+\.\s+(.+?)\s+—\s+.+?\s+×\s+(\d+)/);

    if (match) {
      items.push({
        name: match[1].trim(),
        quantity: Math.max(1, Number(match[2] || 1)),
      });
    }
  }

  if (items.length > 0) return items;

  return [
    {
      name: order.productName,
      quantity: 1,
    },
  ];
}

async function getStock() {
  if (stockCache.data && Date.now() < stockCache.expiresAt) {
    return stockCache.data;
  }

  const stock = await nsCall<NsStockResponse>("GET", "/api/v2/stock");
  stockCache = {
    data: stock,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  return stock;
}

async function resolveService(item: OrderItem): Promise<NsResolvedService | null> {
  const mapped = parseServiceMap();
  const normalizedItemName = normalize(item.name);
  const mappedServiceId =
    mapped.get(normalizedItemName) ||
    Array.from(mapped.entries()).find(
      ([name]) => normalizedItemName.includes(name) || name.includes(normalizedItemName)
    )?.[1];

  const stock = await getStock();
  const services = stock.categories.flatMap((category) =>
    category.services.map((service) => ({
      ...service,
      category_name: category.category_name,
    }))
  );

  if (mappedServiceId) {
    return services.find((service) => service.service_id === mappedServiceId) || null;
  }

  const itemAmount = parseAmountCurrency(item.name);
  const itemRegion = parseRegion(item.name);
  const isAppleCode = /apple|itunes|app store|эпл/i.test(item.name);

  if (!isAppleCode || !itemAmount) return null;

  return (
    services.find((service) => {
      const serviceName = service.service_name || "";
      const serviceAmount = parseAmountCurrency(serviceName);
      const serviceRegion = parseRegion(serviceName + " " + (service.category_name || ""));

      if (!/apple|itunes|app store/i.test(serviceName + " " + service.category_name)) {
        return false;
      }

      if (!serviceAmount || serviceAmount.amount !== itemAmount.amount) return false;
      if (serviceAmount.currency !== itemAmount.currency) return false;
      if (itemRegion && serviceRegion && itemRegion !== serviceRegion) return false;
      if (Number(service.in_stock || 0) < item.quantity) return false;

      return true;
    }) || null
  );
}

async function pollOrderInfo(customId: string) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const info = await nsCall<{
      status: number;
      status_message?: string;
      pins?: string[];
    }>("GET", "/api/v2/order_info/" + encodeURIComponent(customId));

    if (info.status === 2 || info.status === 7 || info.status === 5) {
      return info;
    }
  }

  return null;
}

async function purchaseItem(orderId: number, item: OrderItem, index: number) {
  const service = await resolveService(item);

  if (!service) return null;

  if (Number(service.in_stock || 0) < item.quantity) {
    throw new Error("Нет остатка у поставщика для " + item.name);
  }

  const customId = crypto.randomUUID();

  await nsCall("POST", "/api/v2/create_order", {
    service_id: service.service_id,
    custom_id: customId,
    fields: [{ key: "quantity", value: item.quantity }],
  });

  const paid = await nsCall<{
    status: string;
    pins?: string[];
    note?: string | null;
    [key: string]: unknown;
  }>("POST", "/api/v2/pay_order", {
    custom_id: customId,
  });

  let pins = paid.pins || [];
  let info:
    | {
        status: number;
        status_message?: string;
        pins?: string[];
        [key: string]: unknown;
      }
    | null = null;

  if (paid.status === "in_progress") {
    info = await pollOrderInfo(customId);
    pins = info?.pins || pins;

    if (info && info.status !== 2) {
      throw new Error("Поставщик не завершил заказ " + item.name + ": " + info.status_message);
    }
  }

  if (paid.status === "insufficient") {
    throw new Error("Недостаточно баланса NS Gifts для " + item.name);
  }

  if (paid.status === "refunded") {
    throw new Error("Поставщик вернул заказ " + item.name);
  }

  if (pins.length === 0) {
    throw new Error("Поставщик не вернул код для " + item.name);
  }

  return {
    item,
    service,
    customId,
    costUsd:
      responseCostUsd(paid, item.quantity) ||
      responseCostUsd(info || {}, item.quantity) ||
      serviceCostUsd(service, item.quantity),
    pins,
  };
}

function buildDeliveryData(
  purchases: Array<{
    item: OrderItem;
    service: NsResolvedService;
    pins: string[];
  }>
) {
  return purchases
    .map((purchase) => {
      const pins = purchase.pins
        .map((pin, index) => String(index + 1) + ". " + pin)
        .join("\n");

      return (
        purchase.item.name +
        " × " +
        purchase.item.quantity +
        "\n" +
        "Поставщик: " +
        purchase.service.service_name +
        "\n" +
        "Коды:\n" +
        pins
      );
    })
    .join("\n\n");
}


function extractNsBalanceAmount(data: unknown): number | null {
  const directKeys = new Set([
    "balance",
    "usd_balance",
    "available_balance",
    "available",
    "amount",
    "sum",
    "wallet",
  ]);

  function toNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.replace(",", ".").replace(/[^0-9.-]/g, "");
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  function walk(value: unknown, keyName = ""): number | null {
    const asNumber = directKeys.has(keyName.toLowerCase()) ? toNumber(value) : null;
    if (asNumber !== null) {
      return asNumber;
    }

    if (!value || typeof value !== "object") {
      return null;
    }

    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      const nestedNumber = lowerKey.includes("balance") || lowerKey.includes("wallet") ? toNumber(nested) : null;
      if (nestedNumber !== null) {
        return nestedNumber;
      }

      const found = walk(nested, key);
      if (found !== null) {
        return found;
      }
    }

    return null;
  }

  return walk(data);
}

export async function getNsGiftsBalance() {
  const paths = ["/api/v2/check_balance", "/api/v2/balance", "/api/v2/get_balance", "/api/v2/user/balance", "/api/v2/profile"];

  for (const endpoint of paths) {
    try {
      const data = await nsCall<Record<string, unknown>>("GET", endpoint);
      const amount = extractNsBalanceAmount(data);

      return {
        available: true,
        endpoint,
        amount,
        raw: data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("404")) {
        return {
          available: false,
          endpoint,
          amount: null,
          message,
        };
      }
    }
  }

  return {
    available: false,
    amount: null,
    message: "NS Gifts не вернул баланс через известные endpoints.",
  };
}

export async function attemptAutoDeliveryForOrder(
  order: AutoDeliveryOrder
): Promise<AutoDeliveryResult> {
  if (!hasNsConfig()) {
    return {
      attempted: false,
      delivered: false,
      order,
      message: "NS Gifts не настроен в переменных окружения.",
    };
  }

  if (order.deliveryData || order.status === "Выдан") {
    return {
      attempted: false,
      delivered: true,
      order,
      message: "Заказ уже выдан.",
    };
  }

  const items = parseOrderItems(order);
  const purchases = [];
  const skippedItems: OrderItem[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const purchase = await purchaseItem(order.id, items[index], index + 1);

    if (purchase) {
      purchases.push(purchase);
    } else {
      skippedItems.push(items[index]);
    }
  }

  if (purchases.length === 0) {
    return {
      attempted: false,
      delivered: false,
      order,
      message: "В заказе нет товаров, которые можно выдать через NS Gifts.",
    };
  }

  const deliveryData = buildDeliveryData(purchases);
  const fullDelivery = skippedItems.length === 0;
  const autoDeliveryCostUsd =
    Math.round(
      purchases.reduce((sum, purchase) => sum + Number(purchase.costUsd || 0), 0) * 100
    ) / 100;
  const autoDeliveryRevenueRub = rubFromPrice(order.productPrice);
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: fullDelivery ? "Выдан" : "В работе",
      deliveryData,
      autoDeliveryProvider: "NS Gifts",
      autoDeliveryCostUsd,
      autoDeliveryRevenueRub,
      autoDeliveryAt: new Date(),
    },
  });

  if (updatedOrder.userLogin) {
    await prisma.chatMessage.create({
      data: {
        userLogin: updatedOrder.userLogin,
        sender: "admin",
        text:
          (fullDelivery
            ? "Заказ выдан автоматически.\n\n"
            : "Часть заказа выдана автоматически, остальное передано в работу.\n\n") +
          deliveryData,
        readByAdmin: true,
        readByUser: false,
      },
    });
  }

  return {
    attempted: true,
    delivered: fullDelivery,
    order: updatedOrder,
    message: fullDelivery
      ? "коды выданы автоматически"
      : "коды выданы, но в заказе есть товары для ручной выдачи",
  };
}
