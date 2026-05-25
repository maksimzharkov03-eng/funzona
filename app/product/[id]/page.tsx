import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { staticCatalogProducts } from "@/app/data/products";
import {
  formatSubscriptionPrice,
  subscriptionPlans,
  type SubscriptionPlan,
} from "@/app/data/subscriptions";
import AddToCartButton from "./AddToCartButton";

type SeoProduct = {
  id: number | string;
  name: string;
  category: string;
  description: string;
  price: string;
  image?: string | null;
  seoTitle?: string;
  seoDescription?: string;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://funzona.vercel.app";

function planToProduct(plan: SubscriptionPlan): SeoProduct {
  const name =
    plan.tier === "EA Play"
      ? "EA Play " + plan.country + " " + plan.duration
      : "PlayStation Plus " + plan.tier + " " + plan.country + " " + plan.duration;

  return {
    id: "subscription-" + plan.id,
    name,
    category: "Подписки",
    description:
      "Оформление " +
      plan.service +
      " " +
      plan.tier +
      " на " +
      plan.duration +
      " для региона " +
      plan.country +
      ". Цена уже указана в рублях по прайсу FunZona.",
    price: formatSubscriptionPrice(plan.price),
    image: "/icon.svg",
    seoTitle: name + " купить в FunZona",
    seoDescription:
      "Купить " +
      name +
      " с быстрой выдачей, поддержкой и гарантией FunZona. Цена: " +
      formatSubscriptionPrice(plan.price) +
      ".",
  };
}

function normalizeProduct(product: any): SeoProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description || "Цифровой товар FunZona с быстрой выдачей и поддержкой.",
    price: product.price,
    image: product.image,
  };
}

async function getProduct(id: string): Promise<SeoProduct | null> {
  if (id.startsWith("subscription-")) {
    const planId = id.replace("subscription-", "");
    const plan = subscriptionPlans.find((item) => item.id === planId);
    return plan ? planToProduct(plan) : null;
  }

  const builtIn = staticCatalogProducts.find(
    (product) => String(product.id) === String(id)
  );

  if (builtIn) return normalizeProduct(builtIn);

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  const product = await prisma.product.findUnique({
    where: { id: numericId },
  });

  return product ? normalizeProduct(product) : null;
}

function priceNumber(price: string) {
  return Number(String(price).replace(/\D/g, "")) || 0;
}

function absoluteImage(image?: string | null) {
  if (!image) return siteUrl + "/icon.svg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("data:")) return siteUrl + "/icon.svg";
  return siteUrl + image;
}

function productDetails(product: SeoProduct) {
  if (product.category === "ChatGPT") {
    return {
      eyebrow: "AI подписка",
      facts: [
        ["Тип", "Цифровая услуга"],
        ["Выдача", "После оформления"],
        ["Поддержка", "В чате FunZona"],
        ["Гарантия", "Есть"],
      ],
      faq: [
        ["Как происходит выдача?", "После оформления заказа менеджер FunZona свяжется с тобой и поможет получить услугу."],
        ["Нужен ли мой аккаунт?", "Если для товара нужен аккаунт, детали можно указать в комментарии к заказу."],
        ["Где смотреть статус?", "Статус заказа появится в личном кабинете FunZona."],
      ],
    };
  }

  if (product.category === "Apple ID") {
    return {
      eyebrow: "Apple ID код",
      facts: [
        ["Регион", product.name.includes("Turkey") ? "Турция" : product.name.includes("USA") ? "США" : product.name.includes("India") ? "Индия" : "По товару"],
        ["Формат", "Цифровой код"],
        ["Выдача", "После оплаты"],
        ["Поддержка", "Поможем активировать"],
      ],
      faq: [
        ["Для чего подходит код?", "Для пополнения Apple ID выбранного региона."],
        ["Код приходит онлайн?", "Да, после обработки заказа данные появятся через поддержку или в комментарии к заказу."],
        ["Что если возникнет вопрос?", "Можно написать в онлайн-чат поддержки прямо на сайте."],
      ],
    };
  }

  if (product.category === "Подписки") {
    return {
      eyebrow: "PlayStation подписка",
      facts: [
        ["Регион", product.description.includes("Украина") ? "Украина" : product.description.includes("Турция") ? "Турция" : "По тарифу"],
        ["Сервис", product.name.includes("EA Play") ? "EA Play" : "PS Plus"],
        ["Выдача", "После оплаты"],
        ["Гарантия", "Есть"],
      ],
      faq: [
        ["Как выбрать регион?", "Бери подписку под регион своего аккаунта PlayStation."],
        ["Когда активируется подписка?", "После оплаты заказ попадает в обработку, статус будет виден в личном кабинете."],
        ["Можно ли уточнить перед покупкой?", "Да, напиши в поддержку FunZona на сайте."],
      ],
    };
  }

  return {
    eyebrow: "Цифровой товар",
    facts: [
      ["Категория", product.category],
      ["Выдача", "После оплаты"],
      ["Поддержка", "Онлайн-чат"],
      ["Гарантия", "Есть"],
    ],
    faq: [
      ["Как получить товар?", "Оформи заказ, затем следи за статусом в личном кабинете."],
      ["Можно ли написать менеджеру?", "Да, в разделе поддержки есть личный чат."],
      ["Цена уже окончательная?", "Да, на странице указана цена FunZona в рублях."],
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Товар не найден | FunZona",
      description: "Товар FunZona не найден.",
    };
  }

  const title = product.seoTitle || product.name + " купить в FunZona";
  const description =
    product.seoDescription ||
    product.description + " Цена: " + product.price + ". Быстрая выдача и поддержка FunZona.";

  return {
    title,
    description,
    alternates: {
      canonical: "/product/" + product.id,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: siteUrl + "/product/" + product.id,
      images: [
        {
          url: absoluteImage(product.image),
          alt: product.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  return [
    ...staticCatalogProducts.map((product) => ({ id: String(product.id) })),
    ...subscriptionPlans.map((plan) => ({ id: "subscription-" + plan.id })),
  ];
}

function ProductImage({ product }: { product: SeoProduct }) {
  const image = product.image;

  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#ffd40044,transparent_46%),linear-gradient(145deg,#171100,#050505)]">
        <span className="text-6xl font-black text-yellow-400">FZ</span>
      </div>
    );
  }

  const generated = image.startsWith("/product-covers/") || image === "/icon.svg";

  return (
    <img
      src={image}
      alt={product.name}
      className={
        "h-full w-full " +
        (generated ? "object-contain p-6 sm:p-10" : "object-cover")
      }
    />
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const details = productDetails(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: absoluteImage(product.image),
    brand: {
      "@type": "Brand",
      name: "FunZona",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: priceNumber(product.price),
      availability: "https://schema.org/InStock",
      url: siteUrl + "/product/" + product.id,
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#332600_0,transparent_35%),#050505] px-4 py-8 text-white sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm font-black">
          <a href="/" className="text-yellow-400 transition hover:text-yellow-300">
            Главная
          </a>
          <span className="text-gray-600">/</span>
          <a href="/catalog" className="text-yellow-400 transition hover:text-yellow-300">
            Каталог
          </a>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300">{product.name}</span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-start">
          <div className="rounded-3xl border border-yellow-400/15 bg-white/[0.06] p-4 shadow-2xl shadow-yellow-400/5">
            <div className="aspect-[1.08] overflow-hidden rounded-[1.5rem] border border-yellow-400/10 bg-black">
              <ProductImage product={product} />
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/15 bg-white/[0.06] p-5 sm:p-8">
            <div className="mb-5 inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-5 py-2 text-sm font-black text-yellow-400">
              {details.eyebrow}
            </div>

            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              {product.name}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
              {product.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {details.facts.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-yellow-400/10 bg-black/60 p-5"
                >
                  <p className="text-sm font-bold text-gray-500">{label}</p>
                  <p className="mt-2 font-black text-yellow-400">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-yellow-400 p-6 text-black">
              <p className="font-bold text-black/60">Стоимость</p>
              <p className="mt-2 text-5xl font-black">{product.price}</p>
            </div>

            <AddToCartButton product={product} />

            <p className="mt-5 text-sm text-gray-500">
              После оформления заказа статус появится в личном кабинете. Если нужны детали, напиши в поддержку FunZona.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-yellow-400/15 bg-white/[0.05] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
              О товаре
            </p>
            <h2 className="mt-3 text-3xl font-black">Почему выбирают FunZona</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Быстрая обработка", "Заказ попадает в работу сразу после оформления."],
                ["Личный кабинет", "Статус заказа всегда можно посмотреть на сайте."],
                ["Поддержка", "Можно написать в чат и уточнить детали заказа."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/60 p-5">
                  <h3 className="font-black text-yellow-400">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-yellow-400/15 bg-black/70 p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-400">
              FAQ
            </p>
            <div className="mt-5 space-y-4">
              {details.faq.map(([question, answer]) => (
                <details
                  key={question}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <summary className="cursor-pointer list-none font-black">
                    {question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{answer}</p>
                </details>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
