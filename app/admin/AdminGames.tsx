"use client";

import { useMemo, useState } from "react";
import { calculateRubPrice, roundTryPrice } from "@/app/lib/games";

type FormState = {
  title: string;
  image: string;
  platform: string;
  region: string;
  originalPrice: string;
  currency: string;
  rate: string;
  rubPrice: string;
  oldRubPrice: string;
  discountPercent: string;
  genre: string;
  publisher: string;
  releaseDate: string;
  edition: string;
  badge: string;
  description: string;
  isFeatured: boolean;
};

const initialForm: FormState = {
  title: "",
  image: "",
  platform: "PS5",
  region: "Турция",
  originalPrice: "",
  currency: "TRY",
  rate: "4",
  rubPrice: "",
  oldRubPrice: "",
  discountPercent: "",
  genre: "",
  publisher: "",
  releaseDate: "",
  edition: "Standard Edition",
  badge: "",
  description: "",
  isFeatured: false,
};

export default function AdminGames() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const calculatedRubPrice = useMemo(() => {
    const price = Number(form.originalPrice || 0);
    const rate = Number(form.rate || 0);

    if (price <= 0) return 0;
    if (form.currency === "TRY") return calculateRubPrice(price);
    if (form.currency === "UAH") return calculateRubPrice(price, undefined, "UAH");
    if (rate <= 0) return 0;
    return calculateRubPrice(price, rate, form.currency);
  }, [form.currency, form.originalPrice, form.rate]);

  const roundedTryPrice = useMemo(() => {
    const price = Number(form.originalPrice || 0);
    return form.currency === "TRY" ? roundTryPrice(price) : price;
  }, [form.currency, form.originalPrice]);

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createGame() {
    if (!form.title || !form.image || !form.originalPrice) {
      setMessage("Заполни название, картинку и цену в валюте.");
      return;
    }

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        rubPrice: form.rubPrice || calculatedRubPrice,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("Игра добавлена в premium-каталог.");
      setForm(initialForm);
      return;
    }

    const data = await res.json().catch(() => null);
    setMessage(data?.error || "Ошибка добавления игры.");
  }

  return (
    <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-8 mt-14">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div>
          <p className="text-yellow-400 font-black mb-3">
            PREMIUM PLAYSTATION MARKET
          </p>
          <h2 className="text-4xl font-black text-yellow-400">
            Добавить игру
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Добавляй обложку, региональную цену, скидку и витринные данные.
            Для Турции цена округляется вверх до ближайших 250 TRY и считается
            по прайсу кодов, но её можно переопределить вручную.
          </p>
        </div>

        <a
          href="/games"
          className="w-fit border border-yellow-400/30 px-5 py-3 rounded-2xl font-black hover:border-yellow-400 transition"
        >
          Открыть витрину
        </a>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        <input
          placeholder="Название игры"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Ссылка на картинку"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <select
          value={form.platform}
          onChange={(e) => updateField("platform", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        >
          <option>PS5</option>
          <option>PS4</option>
          <option>PS4/PS5</option>
        </select>

        <select
          value={form.region}
          onChange={(e) => updateField("region", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        >
          <option>Турция</option>
          <option>Украина</option>
          <option>Польша</option>
          <option>США</option>
          <option>Украина</option>
          <option>Индия</option>
        </select>

        <input
          type="number"
          placeholder="Цена в валюте"
          value={form.originalPrice}
          onChange={(e) => updateField("originalPrice", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <div className="flex gap-3">
          <select
            value={form.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="w-36 bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
          >
            <option>TRY</option>
            <option>UAH</option>
            <option>PLN</option>
            <option>USD</option>
            <option>EUR</option>
            <option>UAH</option>
          </select>

          <input
            type="number"
            placeholder={["TRY", "UAH"].includes(form.currency) ? "Прайс региона" : "Курс"}
            value={form.rate}
            onChange={(e) => updateField("rate", e.target.value)}
            disabled={["TRY", "UAH"].includes(form.currency)}
            className="min-w-0 flex-1 bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
          />
        </div>

        <input
          type="number"
          placeholder={`Цена ₽${calculatedRubPrice ? `, авто ${calculatedRubPrice}` : ""}`}
          value={form.rubPrice}
          onChange={(e) => updateField("rubPrice", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          type="number"
          placeholder="Старая цена ₽"
          value={form.oldRubPrice}
          onChange={(e) => updateField("oldRubPrice", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          type="number"
          placeholder="Скидка %"
          value={form.discountPercent}
          onChange={(e) => updateField("discountPercent", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Жанр"
          value={form.genre}
          onChange={(e) => updateField("genre", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Издатель"
          value={form.publisher}
          onChange={(e) => updateField("publisher", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          type="date"
          value={form.releaseDate}
          onChange={(e) => updateField("releaseDate", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Издание"
          value={form.edition}
          onChange={(e) => updateField("edition", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Бейдж: Хит PS5"
          value={form.badge}
          onChange={(e) => updateField("badge", e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <label className="flex items-center gap-3 bg-black border border-white/10 rounded-2xl px-5 py-4 font-black">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => updateField("isFeatured", e.target.checked)}
            className="w-5 h-5 accent-yellow-400"
          />
          На главную витрину
        </label>
      </div>

      <textarea
        placeholder="Описание для страницы игры"
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
        className="mt-5 w-full h-32 bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
      />

      <div className="mt-8 bg-black border border-yellow-400/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-gray-400">
            Авторасчет цены
            {form.currency === "TRY" && roundedTryPrice > 0
              ? ` • расчет от ${roundedTryPrice} TRY`
              : ""}
            {form.currency === "UAH" && Number(form.originalPrice || 0) > 0
              ? " • курс Украина"
              : ""}
          </p>
          <h3 className="text-5xl font-black text-yellow-400 mt-3">
            {calculatedRubPrice ? `${calculatedRubPrice} ₽` : "Нет данных"}
          </h3>
        </div>

        <button
          onClick={createGame}
          disabled={saving}
          className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-xl hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {saving ? "Добавляем..." : "Добавить игру"}
        </button>
      </div>

      {message ? (
        <div className="mt-5 border border-yellow-400/20 bg-yellow-400/10 text-yellow-100 rounded-2xl p-5 font-bold">
          {message}
        </div>
      ) : null}
    </div>
  );
}
