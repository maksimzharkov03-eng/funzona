"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  formatSubscriptionPrice,
  subscriptionCountries,
  subscriptionPlans,
  type SubscriptionCountry,
  type SubscriptionPlan,
} from "@/app/data/subscriptions";

type Product = {
  id: number | string;
  name: string;
  category: string;
  description: string;
  price: string;
  image?: string | null;
};

type SubscriptionCartItem = {
  plan: SubscriptionPlan;
  quantity: number;
};

type CatalogCartItem = {
  product: Product;
  quantity: number;
};

const categories = [{ name: "Подписки", icon: "▣", hint: "PS Plus" },
  { name: "ChatGPT", icon: "⌘", hint: "AI" },
  { name: "Apple ID", icon: "●", hint: "Коды" },
];

const quickCards = [
  {
    title: "Подписки",
    subtitle: "PS+, Chat GPT, Xbox",
    href: "/catalog?category=ChatGPT",
    icon: "⌘",
  },
  {
    title: "Подарочные коды",
    subtitle: "Cods PSN, Apple ID",
    href: "/catalog?category=Apple%20ID",
    icon: "●",
  },
  {
    title: "Прямое пополнение",
    subtitle: "Steam и мобильные игры",
    href: "/games",
    icon: "◆",
  },
];

const appleRegions = [
  { key: "Turkey", label: "Турция", badge: "TR", color: "bg-red-500" },
  { key: "USA", label: "США", badge: "US", color: "bg-blue-500" },
  { key: "India", label: "Индия", badge: "IN", color: "bg-green-500" },
];

const subscriptionTierOrder = ["Essential", "Extra", "Deluxe", "EA Play"];

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function priceToNumber(price: string) {
  return Number(String(price).replace(/\D/g, "")) || 0;
}

function getAppleRegion(product: Product) {
  if (product.name.includes("Turkey")) return "Turkey";
  if (product.name.includes("USA")) return "USA";
  if (product.name.includes("India")) return "India";
  return "Turkey";
}

function getAppleNominal(product: Product) {
  return product.name
    .replace("Apple ID Turkey ", "")
    .replace("Apple ID USA ", "")
    .replace("Apple ID India ", "");
}

function planToProduct(plan: SubscriptionPlan): Product {
  return {
    id: "subscription-" + plan.id,
    name:
      plan.tier === "EA Play"
        ? "EA Play " + plan.duration
        : "PlayStation Plus " + plan.tier + " " + plan.duration,
    category: "Подписки",
    description: plan.country + " • " + plan.service,
    price: formatSubscriptionPrice(plan.price),
    image: "",
  };
}

function ProductImage({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  if (!src) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(circle_at_top,#ffd40044,transparent_48%),linear-gradient(145deg,#171100,#050505)]">
        <span className="text-4xl text-yellow-400 font-black">FZ</span>
      </div>
    );
  }

  const isGeneratedCover = src.startsWith("/product-covers/");

  return (
    <img
      src={src}
      alt={name}
      className={[
        "h-full w-full transition duration-500",
        isGeneratedCover
          ? "object-contain p-2 group-hover:scale-[1.02]"
          : "object-cover group-hover:scale-105",
      ].join(" ")}
    />
  );
}

function AppleGiftCard({ product }: { product: Product }) {
  const region = appleRegions.find((item) => item.key === getAppleRegion(product)) || appleRegions[0];
  const nominal = getAppleNominal(product);

  return (
    <div className="relative aspect-[1.05] overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#3a3a3d,#1b1b20)] border border-white/10 p-4 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff22,transparent_34%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black tracking-[0.18em] text-slate-700">
            GIFT CARD
          </span>
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-black text-white leading-none">
              {nominal.replace(" ", "")}
            </p>
            <span className={region.color + " mt-2 inline-flex rounded-sm px-2 py-1 text-[10px] font-black text-white"}>
              {region.badge}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-white text-black flex items-center justify-center text-4xl font-black">
            A
          </div>
        </div>

        <div>
          <p className="text-sm font-black text-white">iTunes Store</p>
          <div className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-[11px] font-black tracking-[0.24em] text-white/85">
            ЭЛЕКТРОННЫЙ КЛЮЧ
          </div>
        </div>
      </div>
    </div>
  );
}

type QuantityControlsProps = {
  product: Product;
  quantity: number;
  setQuantity: (productId: string, value: number) => void;
  addToCart: (product: Product) => void;
};

function QuantityControls({
  product,
  quantity,
  setQuantity,
  addToCart,
}: QuantityControlsProps) {
  const productId = String(product.id);

  return (
    <div className="mt-4 space-y-2">
      <div className="grid grid-cols-[36px_1fr_36px] items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setQuantity(productId, Math.max(1, quantity - 1));
          }}
          className="h-9 rounded-xl border border-yellow-400/25 bg-white/5 text-yellow-400 font-black hover:bg-yellow-400 hover:text-black transition"
          aria-label="Уменьшить количество"
        >
          -
        </button>
        <div className="h-9 rounded-xl border border-yellow-400/15 bg-black/60 flex items-center justify-center font-black">
          {quantity}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setQuantity(productId, quantity + 1);
          }}
          className="h-9 rounded-xl bg-yellow-400 text-black font-black hover:bg-yellow-300 transition"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          addToCart(product);
        }}
        className="w-full h-10 rounded-xl bg-yellow-400 text-black text-sm font-black hover:bg-yellow-300 transition"
      >
        В корзину
      </button>
    </div>
  );
}

function groupCartProducts(cart: Product[]): CatalogCartItem[] {
  const grouped = new Map<string, CatalogCartItem>();

  cart.forEach((product) => {
    if (!product || product.id === undefined || product.id === null) return;

    const id = String(product.id);
    const existing = grouped.get(id);

    if (existing) {
      grouped.set(id, { ...existing, quantity: existing.quantity + 1 });
      return;
    }

    grouped.set(id, { product, quantity: 1 });
  });

  return Array.from(grouped.values());
}

function SubscriptionCheckoutPanel({
  items,
  removeItem,
  clearItems,
  checkout,
}: {
  items: SubscriptionCartItem[];
  updateItem: (plan: SubscriptionPlan, quantity: number) => void;
  removeItem: (plan: SubscriptionPlan) => void;
  clearItems: () => void;
  checkout: () => void;
}) {
  const total = items.reduce(
    (sum, item) => sum + item.plan.price * item.quantity,
    0
  );

  return (
    <aside className="lg:sticky lg:top-28 h-fit rounded-3xl border border-yellow-400/25 bg-[#151208] p-5 sm:p-6 shadow-2xl shadow-yellow-950/30">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase">Оформление</h2>
        <button
          type="button"
          onClick={clearItems}
          className="text-xs font-black text-gray-500 hover:text-yellow-400 transition"
        >
          Очистить
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <section>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
            <span className="rounded bg-yellow-400 px-2 py-1 text-black">1</span>
            Подписки
          </div>

          <div className="mt-3 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                Выбери тариф, срок и нажми “В корзину”.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.plan.id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-white/10 bg-black/45 p-3"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-black text-sm">
                      {item.plan.tier === "EA Play"
                        ? "EA Play"
                        : "PS Plus " + item.plan.tier}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.plan.country} • {item.plan.duration}
                    </p>
                    <p className="mt-2 text-base font-black text-yellow-400">
                      {formatSubscriptionPrice(item.plan.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.plan)}
                    className="h-9 w-9 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition"
                    aria-label="Удалить"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
          Проверь регион аккаунта PlayStation перед оплатой.
        </div>

        <section>
          <div className="flex items-center justify-between rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
            <span className="font-black uppercase text-gray-300">Итого</span>
            <span className="text-2xl font-black">{formatRub(total)}</span>
          </div>
          <button
            type="button"
            onClick={checkout}
            disabled={items.length === 0}
            className="mt-3 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Оформить {formatRub(total)}
          </button>
        </section>
      </div>
    </aside>
  );
}

function CatalogCheckoutPanel({
  items,
  section,
  hint,
  warning,
  clearItems,
  checkout,
}: {
  items: CatalogCartItem[];
  section: string;
  hint: string;
  warning: string;
  clearItems: () => void;
  checkout: () => void;
}) {
  const total = items.reduce(
    (sum, item) => sum + priceToNumber(item.product.price) * item.quantity,
    0
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="lg:sticky lg:top-28 h-fit rounded-3xl border border-yellow-400/25 bg-[#151208] p-5 sm:p-6 shadow-2xl shadow-yellow-950/30">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase">Оформление</h2>
        <button
          type="button"
          onClick={clearItems}
          className="text-xs font-black text-gray-500 hover:text-yellow-400 transition"
        >
          Очистить
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <section>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
            <span className="rounded bg-yellow-400 px-2 py-1 text-black">1</span>
            {section}
          </div>

          <div className="mt-3 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                {hint}
              </div>
            ) : (
              items.slice(0, 4).map((item) => (
                <div
                  key={String(item.product.id)}
                  className="grid grid-cols-[48px_1fr_auto] gap-3 rounded-2xl border border-white/10 bg-black/45 p-3"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-yellow-400/15 bg-black/70">
                    <ProductImage src={item.product.image} name={item.product.name} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black">{item.product.name}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.product.price} {item.quantity > 1 ? "× " + item.quantity : ""}
                    </p>
                  </div>
                  <p className="text-sm font-black text-yellow-400 whitespace-nowrap">
                    {formatRub(priceToNumber(item.product.price) * item.quantity)}
                  </p>
                </div>
              ))
            )}

            {items.length > 4 ? (
              <p className="text-xs font-bold text-gray-500">
                Еще товаров: {count - items.slice(0, 4).reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            ) : null}
          </div>
        </section>

        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
          {warning}
        </div>

        <section>
          <div className="flex items-center justify-between rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
            <span className="font-black uppercase text-gray-300">Итого</span>
            <span className="text-2xl font-black">{formatRub(total)}</span>
          </div>
          <button
            type="button"
            onClick={checkout}
            disabled={items.length === 0}
            className="mt-3 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Оформить {formatRub(total)}
          </button>
        </section>
      </div>
    </aside>
  );
}

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("Подписки");
  const [subscriptionSubcategory, setSubscriptionSubcategory] = useState<"all" | "gpt" | "ps" | "xbox">("all");
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");
  const [appleRegion, setAppleRegion] = useState("Turkey");
  const [subscriptionCountry, setSubscriptionCountry] =
    useState<SubscriptionCountry>("Украина");
  const [subscriptionCart, setSubscriptionCart] = useState<SubscriptionCartItem[]>([]);
  const [catalogCart, setCatalogCart] = useState<CatalogCartItem[]>([]);

  function readStoredCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(parsed) ? (parsed as Product[]) : [];
    } catch {
      return [];
    }
  }

  function syncCatalogCart() {
    setCatalogCart(groupCartProducts(readStoredCart()));
  }

  useEffect(() => {
    syncCatalogCart();

    function onStorage(event: StorageEvent) {
      if (event.key === "cart") syncCatalogCart();
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const categoryNames = categories.map((item) => item.name);

    if (categoryFromUrl && categoryNames.includes(categoryFromUrl)) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  
  const subscriptionMatchesSubcategory = (product: Product) => {
    if (category !== "Подписки" || subscriptionSubcategory === "all") return true;

    const text = [product.name, product.category, product.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (subscriptionSubcategory === "gpt") {
      return text.includes("chatgpt") || text.includes("chat gpt") || text.includes("gpt");
    }

    if (subscriptionSubcategory === "ps") {
      return text.includes("playstation") || text.includes("ps plus") || text.includes("ps+") || text.includes("essential") || text.includes("extra") || text.includes("deluxe") || text.includes("ea play");
    }

    if (subscriptionSubcategory === "xbox") {
      return text.includes("xbox") || text.includes("game pass");
    }

    return true;
  };

const filteredProducts = useMemo(() => {
    if (category === "Все") return products;
    return products.filter((product) => product.category === category);
  }, [category, products]);

  const appleProducts = useMemo(
    () =>
      products
        .filter((product) => product.category === "Apple ID")
        .filter((product) => getAppleRegion(product) === appleRegion),
    [appleRegion, products]
  );

  const groupedSubscriptionPlans = useMemo(() => {
    const plans = subscriptionPlans.filter(
      (plan) => plan.country === subscriptionCountry
    );

    return subscriptionTierOrder
      .map((tier) => ({
        tier,
        plans: plans.filter((plan) => plan.tier === tier),
      }))
      .filter((group) => group.plans.length > 0);
  }, [subscriptionCountry]);

  const subscriptionCount = groupedSubscriptionPlans.reduce(
    (sum, group) => sum + group.plans.length,
    0
  );

  const currentCatalogCart = useMemo(() => {
    if (category === "Все") return catalogCart;
    return catalogCart.filter((item) => item.product.category === category);
  }, [catalogCart, category]);

  const appleCatalogCart = useMemo(
    () => catalogCart.filter((item) => item.product.category === "Apple ID"),
    [catalogCart]
  );

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function setProductQuantity(productId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, value),
    }));
  }

  function addProductToCart(product: Product) {
    const productId = String(product.id);
    const quantity = quantities[productId] || 1;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    for (let index = 0; index < quantity; index += 1) {
      cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCatalogCart(groupCartProducts(cart));
    setToast(product.name + " x" + quantity + " добавлено в корзину");
  }

  function addAppleProduct(product: Product) {
    addProductToCart(product);
  }

  function addSubscriptionPlan(plan: SubscriptionPlan) {
    const product = planToProduct(plan);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const alreadyInCart = Array.isArray(cart)
      ? cart.some((item: any) => String(item.id) === String(product.id))
      : false;

    if (!alreadyInCart) {
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    setCatalogCart(groupCartProducts(cart));

    setSubscriptionCart((items) => {
      const existing = items.find((item) => item.plan.id === plan.id);

      if (existing) {
        return items;
      }

      return [...items, { plan, quantity: 1 }];
    });

    setToast(
      (plan.tier === "EA Play" ? "EA Play" : "PS Plus " + plan.tier) +
        (alreadyInCart ? " уже есть в корзине" : " добавлено в корзину")
    );
  }

  function updateSubscriptionItem(plan: SubscriptionPlan, quantity: number) {
    setSubscriptionCart((items) =>
      items.map((item) =>
        item.plan.id === plan.id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  function removeSubscriptionItem(plan: SubscriptionPlan) {
    setSubscriptionCart((items) =>
      items.filter((item) => item.plan.id !== plan.id)
    );

    const productId = "subscription-" + plan.id;
    const nextCart = readStoredCart().filter(
      (product) => String(product.id) !== productId
    );

    localStorage.setItem("cart", JSON.stringify(nextCart));
    setCatalogCart(groupCartProducts(nextCart));
  }

  function clearAllCatalogCart() {
    localStorage.setItem("cart", "[]");
    setCatalogCart([]);
    setSubscriptionCart([]);
  }

  function clearCatalogCategory(categoryName: string) {
    const nextCart = readStoredCart().filter(
      (product) => product.category !== categoryName
    );

    localStorage.setItem("cart", JSON.stringify(nextCart));
    setCatalogCart(groupCartProducts(nextCart));

    if (categoryName === "Подписки") {
      setSubscriptionCart([]);
    }
  }

  function checkoutCatalogItems() {
    window.location.href = "/cart";
  }

  function checkoutSubscriptionItems() {
    window.location.href = "/cart";
  }

  function selectCategory(item: string) {
    if (item === "Игры") {
      window.location.href = "/games";
      return;
    }

    setCategory(item);
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-7 sm:py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#ffd4001f,transparent_32%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <section className="mb-7 sm:mb-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 border border-yellow-400/25 bg-yellow-400/10 text-yellow-400 rounded-full px-4 py-2 text-xs sm:text-sm font-black mb-4">
                FUNZONA MARKET
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none">
                Каталог <span className="text-yellow-400">товаров</span>
              </h1>

              <p className="text-gray-400 mt-4 max-w-2xl text-sm sm:text-base leading-7">
                Подписки, пополнения, Apple ID, ChatGPT и игры.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-400/20 bg-white/5 px-4 py-3 w-fit">
              <p className="text-xs text-gray-500 font-black uppercase">В наличии</p>
              <p className="text-2xl font-black text-yellow-400">
                {category === "Подписки"
                  ? subscriptionCount
                  : category === "Apple ID"
                    ? appleProducts.length
                    : filteredProducts.length}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-7">
          {quickCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group min-h-28 rounded-3xl border border-yellow-400/15 bg-[linear-gradient(135deg,#151100,#050505)] p-4 sm:p-5 hover:border-yellow-400 transition overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center text-2xl font-black group-hover:scale-105 transition">
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black truncate">
                    {card.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className="mb-7 sm:mb-9">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((item) => {
              const active = category === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => selectCategory(item.name)}
                  className={[
                    "min-h-20 rounded-3xl border p-3 text-left transition",
                    active
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_24px_rgba(255,212,0,0.32)]"
                      : "bg-white/5 border-yellow-400/15 hover:border-yellow-400 hover:bg-yellow-400/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-2xl text-lg font-black",
                      active ? "bg-black text-yellow-400" : "bg-yellow-400 text-black",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="block mt-3 font-black text-sm sm:text-base leading-tight">
                    {item.name}
                  </span>
                  <span
                    className={[
                      "block mt-1 text-xs font-bold",
                      active ? "text-black/60" : "text-gray-500",
                    ].join(" ")}
                  >
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {category === "Подписки" ? (
          <section>
            <div className="mb-5 rounded-3xl border border-yellow-400/20 bg-[linear-gradient(135deg,#221c05,#070707)] p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                    PlayStation Subscriptions
                  </div>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                    PlayStation Plus и EA Play
                  </h2>
                  <p className="mt-3 text-gray-400 font-bold">
                    Выбери регион, тариф и срок. Цена уже указана в рублях.
                  </p>
                </div>
                <div className="hidden sm:flex h-24 w-24 rounded-[2rem] bg-yellow-400 text-black items-center justify-center text-3xl font-black">
                  PS
                </div>
              </div>
            </div>

            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {subscriptionCountries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => setSubscriptionCountry(country)}
                  className={[
                    "min-w-36 rounded-2xl border px-5 py-3 font-black transition",
                    subscriptionCountry === country
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-yellow-400/20 bg-white/5 text-gray-300 hover:border-yellow-400",
                  ].join(" ")}
                >
                  {country}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-6">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {groupedSubscriptionPlans.map((group) => (
                  <section
                    key={group.tier}
                    className="rounded-3xl border border-yellow-400/20 bg-white/5 overflow-hidden"
                  >
                    <div className="bg-yellow-400 px-5 py-4 text-black">
                      <p className="text-xs font-black uppercase opacity-70">
                        {group.tier === "EA Play" ? "EA Play" : "PlayStation Plus"}
                      </p>
                      <h3 className="text-2xl font-black">{group.tier}</h3>
                    </div>

                    <div className="p-4 space-y-3">
                      {group.plans.map((plan) => {
                        const product = planToProduct(plan);

                        return (
                          <article
                            key={plan.id}
                            className="rounded-2xl border border-white/10 bg-black/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-gray-200">
                                  {plan.duration}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {plan.country}
                                </p>
                              </div>
                              <p className="text-xl font-black text-yellow-400 whitespace-nowrap">
                                {formatSubscriptionPrice(plan.price)}
                              </p>
                            </div>

                            <a
                              href={"/product/subscription-" + plan.id}
                              className="mt-4 block rounded-xl border border-yellow-400/20 px-4 py-3 text-center text-sm font-black text-yellow-400 transition hover:border-yellow-400"
                            >
                              Подробнее
                            </a>

                            <button
                              type="button"
                              onClick={() => addSubscriptionPlan(plan)}
                              className="mt-2 h-11 w-full rounded-xl bg-yellow-400 text-sm font-black text-black transition hover:bg-yellow-300"
                            >
                              В корзину
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

                      {category === "Подписки" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ["all", "Все подписки"],
              ["gpt", "GPT"],
              ["ps", "PS+"],
              ["xbox", "Xbox"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSubscriptionSubcategory(value as "all" | "gpt" | "ps" | "xbox")}
                className={
                  "rounded-xl border px-5 py-3 text-sm font-black transition " +
                  (subscriptionSubcategory === value
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-yellow-400/30 bg-black text-white hover:bg-yellow-400/10")
                }
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

<SubscriptionCheckoutPanel
                items={subscriptionCart}
                updateItem={updateSubscriptionItem}
                removeItem={removeSubscriptionItem}
                clearItems={() => clearCatalogCategory("Подписки")}
                checkout={checkoutSubscriptionItems}
              />
            </div>
          </section>
        ) : category === "Apple ID" ? (
          <section>
            <div className="mb-5 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#27272c,#14131a)] p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-gray-300">
                    Apple
                  </div>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                    iTunes & App Store
                  </h2>
                  <p className="mt-3 text-gray-400 font-bold">
                    Пополнение кошелька App Store по регионам.
                  </p>
                </div>
                <div className="hidden sm:flex h-24 w-24 rounded-[2rem] bg-white/10 text-white items-center justify-center text-5xl font-black">
                  A
                </div>
              </div>
            </div>

            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {appleRegions.map((region) => (
                <button
                  key={region.key}
                  type="button"
                  onClick={() => setAppleRegion(region.key)}
                  className={[
                    "min-w-36 rounded-2xl border px-5 py-3 font-black transition",
                    appleRegion === region.key
                      ? "border-violet-500 bg-violet-600/30 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-violet-400",
                  ].join(" ")}
                >
                  <span className={region.color + " mr-2 inline-flex rounded px-2 py-1 text-xs text-white"}>
                    {region.badge}
                  </span>
                  {region.label}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-6">
              <div>
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div
                        key={item}
                        className="h-80 rounded-3xl bg-white/5 border border-white/10 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {appleProducts.map((product) => (
                      <article key={String(product.id)} className="min-w-0">
                        <AppleGiftCard product={product} />
                        <div className="mt-3 px-1">
                          <div className="flex items-end justify-between gap-2">
                            <p className="text-xl sm:text-2xl font-black">
                              {product.price}
                            </p>
                            <span className="text-xs font-black text-emerald-400">
                              в наличии
                            </span>
                          </div>
                          <QuantityControls
                            product={product}
                            quantity={quantities[String(product.id)] || 1}
                            setQuantity={setProductQuantity}
                            addToCart={addAppleProduct}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <CatalogCheckoutPanel
                items={appleCatalogCart}
                section="Apple ID"
                hint="Выбери номинал Apple ID и нажми “В корзину”."
                warning="Перед оплатой убедись, что указан правильный регион Apple ID."
                clearItems={() => clearCatalogCategory("Apple ID")}
                checkout={checkoutCatalogItems}
              />
            </div>          </section>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div
                key={item}
                className="h-72 rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">
              Товаров пока нет
            </h2>

            <p className="text-gray-400 mt-3">
              Выбери другую категорию или вернись позже.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_350px] gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <a
                  href={"/product/" + product.id}
                  key={String(product.id)}
                  className="group relative bg-gradient-to-b from-yellow-400/10 via-white/5 to-black border border-yellow-400/10 rounded-3xl p-3 hover:border-yellow-400 hover:-translate-y-1 transition duration-300 overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-black/70 border border-yellow-400/10 flex items-center justify-center">
                      <ProductImage src={product.image} name={product.name} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-yellow-400 text-[11px] sm:text-xs font-black truncate">
                        {product.category}
                      </p>

                      <span className="text-[10px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full px-2 py-1 font-black shrink-0">
                        Гарантия
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-black mt-2 group-hover:text-yellow-400 transition line-clamp-2 min-h-10">
                      {product.name}
                    </h2>

                    <p className="text-gray-500 mt-2 text-xs sm:text-sm line-clamp-2 min-h-9">
                      {product.description}
                    </p>

                    <div className="mt-4">
                      <p className="text-lg sm:text-xl font-black text-yellow-400 whitespace-nowrap">
                        {product.price}
                      </p>
                      <QuantityControls
                        product={product}
                        quantity={quantities[String(product.id)] || 1}
                        setQuantity={setProductQuantity}
                        addToCart={addProductToCart}
                      />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <CatalogCheckoutPanel
              items={currentCatalogCart}
              section={category === "Все" ? "Товары" : category}
              hint={
                category === "Все"
                  ? "Выбери товар и нажми “В корзину”."
                  : "Выбери позицию в разделе и нажми “В корзину”."
              }
              warning="Проверь выбранный товар и регион перед оплатой."
              clearItems={() =>
                category === "Все"
                  ? clearAllCatalogCart()
                  : clearCatalogCategory(category)
              }
              checkout={checkoutCatalogItems}
            />
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed right-4 bottom-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-yellow-400/30 bg-black px-5 py-4 text-sm sm:text-base font-black shadow-2xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
