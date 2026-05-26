"use client";

import { useEffect, useMemo, useState } from "react";

function priceToNumber(price: string) {
  return Number(String(price).replace(/\D/g, "")) || 0;
}

function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function compactCart(items: any[]) {
  const map = new Map<string, { item: any; quantity: number }>();

  for (const item of items) {
    const key = String(item.id) + ":" + item.name + ":" + item.price;
    const existing = map.get(key);

    if (existing) {
      existing.quantity += 1;
    } else {
      map.set(key, { item, quantity: 1 });
    }
  }

  return Array.from(map.values());
}

export default function CartClient() {
  const [cart, setCart] = useState<any[]>([]);
  const [telegram, setTelegram] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const groupedCart = useMemo(() => compactCart(cart), [cart]);

  const total = cart.reduce((sum, item) => {
    return sum + priceToNumber(item.price);
  }, 0);

  const sbpFee = Math.ceil(total * 0.025);
  const paymentTotal = total + sbpFee;

  function saveCart(updated: any[]) {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function clearCart() {
    localStorage.removeItem("cart");
    setCart([]);
  }

  function updateQuantity(target: any, quantity: number) {
    const key = String(target.id) + ":" + target.name + ":" + target.price;
    const otherItems = cart.filter(
      (item) => String(item.id) + ":" + item.name + ":" + item.price !== key
    );
    const nextQuantity = Math.max(1, quantity);
    const newItems = Array.from({ length: nextQuantity }, () => target);

    saveCart([...otherItems, ...newItems]);
  }

  function removeItem(target: any) {
    const key = String(target.id) + ":" + target.name + ":" + target.price;
    saveCart(
      cart.filter(
        (item) => String(item.id) + ":" + item.name + ":" + item.price !== key
      )
    );
  }

  async function createOrder() {
    const userLogin = localStorage.getItem("userLogin") || "";

    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    setLoading(true);

    const items = groupedCart.map(({ item, quantity }) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      quantity,
      totalPrice: formatRub(priceToNumber(item.price) * quantity),
    }));

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userLogin,
        telegram: telegram.trim() || "Чат на сайте",
        payment: "СБП",
        productName: "Заказ из " + cart.length + " товаров",
        productPrice: formatRub(total),
        items,
        comment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Ошибка создания заказа");
      if (res.status === 401) {
        window.location.href = "/login";
      }
      setLoading(false);
      return;
    }

    localStorage.removeItem("cart");
    window.location.href = data.paymentUrl || "/support?order=" + data.id;
  }

  if (cart.length === 0) {
    return (
      <div className="rounded-3xl border border-yellow-400/20 bg-white/5 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-400 text-4xl font-black text-black">
          F
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-yellow-400">
          Корзина пустая
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Добавь товары из каталога, чтобы оформить заказ.
        </p>

        <a
          href="/catalog"
          className="mt-8 inline-flex rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black hover:bg-yellow-300 transition"
        >
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black">Товары</h2>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-black text-gray-500 hover:text-red-400 transition"
          >
            Очистить
          </button>
        </div>

        {groupedCart.map(({ item, quantity }) => (
          <article
            key={String(item.id) + item.name + item.price}
            className="grid grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr_auto] gap-4 rounded-3xl border border-white/10 bg-[#171b22] p-4 sm:p-5 hover:border-yellow-400/40 transition"
          >
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-black/70 border border-yellow-400/10 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className={[
                    "h-full w-full",
                    String(item.image).startsWith("/product-covers/")
                      ? "object-contain p-2"
                      : "object-cover",
                  ].join(" ")}
                />
              ) : (
                <span className="text-xl font-black text-yellow-400">
                  {item.category === "Подписки" ? "PS" : "FZ"}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-yellow-400">
                {item.category}
              </p>
              <h3 className="mt-1 truncate text-xl sm:text-2xl font-black">
                {item.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm sm:text-base text-gray-400">
                {item.description}
              </p>

              <div className="mt-4 grid grid-cols-[38px_48px_38px_auto] items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item, quantity - 1)}
                  className="h-10 rounded-xl bg-white/5 font-black hover:bg-white/10 transition"
                >
                  -
                </button>
                <div className="h-10 rounded-xl bg-black/40 flex items-center justify-center font-black">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => updateQuantity(item, quantity + 1)}
                  className="h-10 rounded-xl bg-white/5 font-black hover:bg-white/10 transition"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="ml-2 justify-self-start text-sm font-black text-red-300 hover:text-red-400 transition"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 sm:text-right">
              <p className="text-sm font-bold text-gray-500">
                {item.price} за шт.
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-yellow-400">
                {formatRub(priceToNumber(item.price) * quantity)}
              </p>
            </div>
          </article>
        ))}
      </section>

      <aside className="lg:sticky lg:top-28 h-fit rounded-3xl border border-yellow-400/20 bg-[#171b22] p-5 sm:p-6">
        <h2 className="text-3xl font-black">Оформление</h2>

        <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-gray-300">Сумма заказа</span>
            <span className="text-3xl font-black text-yellow-400">
              {formatRub(total)}
            </span>
          </div>
          <div className="mt-4 space-y-2 border-t border-yellow-400/20 pt-4 text-sm font-bold">
            <div className="flex items-center justify-between text-gray-400">
              <span>Комиссия СБП 2,5%</span>
              <span>{formatRub(sbpFee)}</span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span>К оплате</span>
              <span className="text-xl font-black text-yellow-400">
                {formatRub(paymentTotal)}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-gray-500">
            Товаров: {cart.length} • Позиций: {groupedCart.length}
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-black uppercase text-gray-300">
              Telegram для связи, необязательно
            </label>
            <input
              type="text"
              placeholder="@telegram или оставь пустым"
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none focus:border-yellow-400"
            />
          </div>

          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
            Перед оплатой убедись, что VPN отключён, иначе платеж может не пройти.
          </div>

          <div>
            <p className="text-sm font-black uppercase text-gray-300">
              Способ оплаты
            </p>
            <div className="mt-3 rounded-2xl border border-emerald-500 bg-emerald-500/10 p-4">
              <p className="font-black">СБП</p>
              <p className="mt-1 text-xs font-bold text-gray-400">2,5% комиссия клиента</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-black uppercase text-gray-300">
              Комментарий к заказу
            </label>
            <textarea
              placeholder="Например: нужен турецкий регион"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-3 h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="button"
            onClick={createOrder}
            disabled={loading || cart.length === 0}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#ec4899)] px-5 py-5 text-xl font-black text-white shadow-2xl shadow-violet-900/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Оформляем..." : "Перейти к оплате " + formatRub(paymentTotal)}
          </button>

          <p className="text-center text-xs font-bold text-gray-500">
            После оплаты тебя вернет в чат, а заказ автоматически станет оплаченным.
          </p>
        </div>
      </aside>
    </div>
  );
}
