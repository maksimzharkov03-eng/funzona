"use client";

import { useEffect, useState } from "react";

const categories = ["Подписки", "ChatGPT", "Apple ID", "Игры"];

function resizeImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Не удалось прочитать картинку"));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Не удалось обработать картинку"));
      image.onload = () => {
        const maxSize = 900;
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Браузер не смог подготовить картинку"));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Подписки");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Не удалось загрузить товары");
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Не удалось подключиться к API товаров");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetForm() {
    setName("");
    setCategory("Подписки");
    setPrice("");
    setDescription("");
    setImage("");
  }

  async function addProduct() {
    if (!name.trim() || !price.trim()) {
      setMessage("Заполни название и цену");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          price: price.trim(),
          description: description.trim(),
          image,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.error || "Товар не добавился. Проверь поля и базу данных.");
        return;
      }

      resetForm();
      setMessage("Товар добавлен в каталог.");
      await loadProducts();
    } catch {
      setMessage("Товар не добавился: нет ответа от сервера.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: number) {
    setMessage("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.error || "Не удалось удалить товар");
        return;
      }

      setMessage("Товар удален.");
      loadProducts();
    } catch {
      setMessage("Не удалось подключиться к API удаления");
    }
  }

  async function handleImage(file?: File) {
    if (!file) return;

    setMessage("");

    try {
      const resized = await resizeImage(file);
      setImage(resized);
      setMessage("Картинка подготовлена.");
    } catch (error: any) {
      setMessage(error?.message || "Не удалось подготовить картинку");
    }
  }

  return (
    <section>
      <h2 className="text-3xl font-black mb-5">Товары и подписки</h2>

      <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 mb-8 grid md:grid-cols-2 gap-4">
        <input
          placeholder="Название товара"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <input
          placeholder="Цена, например 2100 ₽"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <input
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImage(e.target.files?.[0])}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <input
          placeholder="Или ссылка на картинку"
          value={image.startsWith("data:") ? "Картинка загружена файлом" : image}
          onChange={(e) => setImage(e.target.value)}
          disabled={image.startsWith("data:")}
          className="bg-black border border-white/10 rounded-xl px-4 py-3 disabled:opacity-60"
        />

        {image.startsWith("data:") ? (
          <button
            type="button"
            onClick={() => setImage("")}
            className="md:col-span-2 border border-yellow-400/30 text-yellow-400 py-3 rounded-xl font-black"
          >
            Убрать загруженную картинку
          </button>
        ) : null}

        <button
          onClick={addProduct}
          disabled={saving}
          className="md:col-span-2 bg-yellow-400 text-black py-4 rounded-xl font-black disabled:opacity-50"
        >
          {saving ? "Добавляем..." : "Добавить товар / подписку"}
        </button>

        {message ? (
          <div className="md:col-span-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 font-bold text-yellow-100">
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white/5 border border-yellow-400/20 rounded-3xl p-5"
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-2xl mb-4"
              />
            )}

            <p className="text-yellow-400 font-bold">{product.category}</p>
            <h3 className="text-2xl font-black mt-2">{product.name}</h3>
            <p className="text-gray-400 mt-2">{product.description}</p>

            <p className="text-3xl font-black text-yellow-400 mt-4">
              {product.price}
            </p>

            <button
              onClick={() => deleteProduct(product.id)}
              className="mt-5 w-full bg-red-500 text-white py-3 rounded-xl font-black"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
