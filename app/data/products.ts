export type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
};

const chatGptProducts: CatalogProduct[] = [
  {
    id: 910001,
    name: "ChatGPT Plus",
    category: "ChatGPT",
    description: "Подписка ChatGPT Plus для аккаунта. Быстрая выдача после оформления заказа.",
    price: "2 100 ₽",
    image: "/product-covers/chatgpt-plus.svg",
  },
  {
    id: 910002,
    name: "ChatGPT GO",
    category: "ChatGPT",
    description: "Тариф ChatGPT GO для повседневного использования и быстрых задач.",
    price: "1 600 ₽",
    image: "/product-covers/chatgpt-go.svg",
  },
  {
    id: 910003,
    name: "ChatGPT x5",
    category: "ChatGPT",
    description: "Пакет ChatGPT x5 для расширенного использования. Цена по прайсу FunZona.",
    price: "12 000 ₽",
    image: "/product-covers/chatgpt-x5.svg",
  },
  {
    id: 910004,
    name: "ChatGPT x20",
    category: "ChatGPT",
    description: "Пакет ChatGPT x20 для максимального объема. Цена по прайсу FunZona.",
    price: "20 000 ₽",
    image: "/product-covers/chatgpt-x20.svg",
  },
];

const appleIndia = [
  ["100 INR", "150 ₽"],
  ["200 INR", "300 ₽"],
  ["250 INR", "350 ₽"],
  ["500 INR", "700 ₽"],
  ["1000 INR", "1 400 ₽"],
  ["1500 INR", "2 100 ₽"],
] as const;

const appleTurkey = [
  ["10 TL", "50 ₽"],
  ["25 TL", "100 ₽"],
  ["50 TL", "200 ₽"],
  ["100 TL", "300 ₽"],
  ["150 TL", "450 ₽"],
  ["200 TL", "600 ₽"],
  ["250 TL", "750 ₽"],
  ["300 TL", "900 ₽"],
  ["400 TL", "1 200 ₽"],
  ["500 TL", "1 350 ₽"],
  ["1000 TL", "2 700 ₽"],
  ["1250 TL", "3 400 ₽"],
  ["1500 TL", "4 050 ₽"],
  ["1750 TL", "4 750 ₽"],
  ["2000 TL", "5 400 ₽"],
] as const;

const appleUsa = [
  ["2$", "270 ₽"],
  ["3$", "350 ₽"],
  ["5$", "600 ₽"],
  ["10$", "1 100 ₽"],
  ["15$", "1 600 ₽"],
  ["20$", "2 100 ₽"],
] as const;

function appleProduct(
  id: number,
  region: "India" | "Turkey" | "USA",
  nominal: string,
  price: string
): CatalogProduct {
  const labels = {
    India: "Индия",
    Turkey: "Турция",
    USA: "США",
  };

  return {
    id,
    name: "Apple ID " + region + " " + nominal,
    category: "Apple ID",
    description:
      "Пополнение Apple ID региона " +
      labels[region] +
      " на " +
      nominal +
      ". Цена уже указана в рублях по прайсу FunZona.",
    price,
    image: "/product-covers/apple-id-" + region.toLowerCase() + ".svg",
  };
}

const appleIdProducts: CatalogProduct[] = [
  ...appleIndia.map(([nominal, price], index) =>
    appleProduct(920001 + index, "India", nominal, price)
  ),
  ...appleTurkey.map(([nominal, price], index) =>
    appleProduct(920101 + index, "Turkey", nominal, price)
  ),
  ...appleUsa.map(([nominal, price], index) =>
    appleProduct(920201 + index, "USA", nominal, price)
  ),
];

export const staticCatalogProducts: CatalogProduct[] = [
  ...chatGptProducts,
  ...appleIdProducts,
];