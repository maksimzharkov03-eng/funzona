"use client";

import { useState } from "react";

export default function AdminGames() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [platform, setPlatform] = useState("PS5");
  const [region, setRegion] = useState("Турция");
  const [originalPrice, setOriginalPrice] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [rate, setRate] = useState("4");

  async function createGame() {
    if (!title || !image || !originalPrice) {
      alert("Заполни все поля");
      return;
    }

    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        image,
        platform,
        region,
        originalPrice,
        currency,
        rate,
      }),
    });

    if (res.ok) {
      alert("Игра добавлена");

      setTitle("");
      setImage("");
      setOriginalPrice("");
    } else {
      alert("Ошибка добавления");
    }
  }

  const rubPrice =
    Number(originalPrice || 0) *
    Number(rate || 0);

  return (
    <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-8 mt-14">
      <h2 className="text-4xl font-black text-yellow-400 mb-8">
        Добавить игру
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        <input
          placeholder="Название игры"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <input
          placeholder="Ссылка на картинку"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        >
          <option>PS5</option>
          <option>PS4</option>
        </select>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        >
          <option>Турция</option>
          <option>Украина</option>
          <option>США</option>
        </select>

        <input
          type="number"
          placeholder="Цена в валюте"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          className="bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
        />

        <div className="flex gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-40 bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
          >
            <option>TRY</option>
            <option>USD</option>
            <option>UAH</option>
          </select>

          <input
            type="number"
            placeholder="Курс"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="flex-1 bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="mt-8 bg-black border border-yellow-400/20 rounded-3xl p-6">
        <p className="text-gray-400">
          Цена в рублях
        </p>

        <h3 className="text-5xl font-black text-yellow-400 mt-3">
          {Math.ceil(rubPrice)} ₽
        </h3>
      </div>

      <button
        onClick={createGame}
        className="mt-8 bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-xl hover:bg-yellow-300 transition"
      >
        Добавить игру
      </button>
    </div>
  );
}