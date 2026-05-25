"use client";

import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Подписки");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
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
    if (!name || !price) {
      alert("Заполни название и цену");
      return;
    }

    await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        category,
        price,
        description,
        image,
      }),
    });

    resetForm();
    loadProducts();
  }

 async function deleteProduct(id: number) {
  await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  loadProducts();
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
          placeholder="Цена, например 2100₽"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        >
          <option>Подписки</option>
          <option>ChatGPT</option>
          <option>Apple ID</option>
          <option>Игры</option>
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onloadend = () => {
              setImage(reader.result as string);
            };

            reader.readAsDataURL(file);
          }}
          className="bg-black border border-white/10 rounded-xl px-4 py-3"
        />

        <button
          onClick={addProduct}
          className="md:col-span-2 bg-yellow-400 text-black py-4 rounded-xl font-black"
        >
          Добавить товар / подписку
        </button>
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