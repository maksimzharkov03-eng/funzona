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

export default function CheckoutPage() {
  const [telegram, setTelegram] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState("СБП");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const groupedCart = useMemo(() => compactCart(cart), [cart]);

  const total = cart.reduce((sum, item) => {
    return sum + priceToNumber(item.price);
  }, 0);

  function saveCart(updated: any[]) {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
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

    if (!telegram) {
      alert("Укажи Telegram для связи");
      return;
    }

    if (cart.length === 0) {
      alert("Корзина пустая");
      return;
    }

    setLoading(true);

    for (const item of cart) {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          userLogin,
          telegram,
          payment,
          comment:
            comment +
            (email ? "\nEmail для получения: " + email : ""),
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
    }

    localStorage.removeItem("cart");

    alert("Заказ оформлен!");
    window.location.href = "/account";
  }

  return (
    <main className="min-h-screen bg-[#090817] text-white px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,#ffd40022,transparent_34%),radial-gradient(circle_at_top_right,#7c3aed22,transparent_28%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-yellow-400 leading-none">
          Оформление заказа
        </h1>
        <p className="mt-4 text-gray-300">
          Проверь корзину, укажи контакты и выбери способ оплаты.
        </p>

        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
          <section className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-3xl font-black">Корзина</h2>
                {cart.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => saveCart([])}
                    className="text-sm font-black text-gray-500 hover:text-red-400 transition"
                  >
                    Очистить
                  </button>
                ) : null}
              </div>

              {groupedCart.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                  <h3 className="text-2xl font-black text-yellow-400">
                    Корзина пустая
                  </h3>
                  <a
                    href="/catalog"
                    className="mt-5 inline-flex rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black"
                  >
                    Перейти в каталог
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedCart.map(({ item, quantity }) => (
                    <article
                      key={String(item.id) + item.name + item.price}
                      className="grid grid-cols-[56px_1fr] sm:grid-cols-[64px_1fr_auto_auto] items-center gap-4 rounded-3xl border border-white/10 bg-[#171b22] p-4"
                    >
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white text-black flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className={[
                              "h-full w-full",
                              String(item.image).startsWith("/product-covers/")
                                ? "object-contain p-1"
                                : "object-cover",
                            ].join(" ")}
                          />
                        ) : (
                          <span className="text-xl font-black">
                            {item.category === "Подписки" ? "PS" : "FZ"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black">{item.name}</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          {item.price} за шт.
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 grid grid-cols-[36px_44px_36px] gap-2 justify-self-start sm:justify-self-center">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, quantity - 1)}
                          className="h-9 rounded-xl bg-white/5 font-black hover:bg-white/10 transition"
                        >
                          -
                        </button>
                        <div className="h-9 rounded-xl bg-black/35 flex items-center justify-center font-black">
                          {quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, quantity + 1)}
                          className="h-9 rounded-xl bg-white/5 font-black hover:bg-white/10 transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex items-center justify-between gap-4 sm:justify-self-end">
                        <p className="text-xl font-black text-yellow-400">
                          {formatRub(priceToNumber(item.price) * quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="h-9 w-9 rounded-xl text-red-300 hover:bg-red-500/20 transition"
                          aria-label="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#171b22] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="font-black text-xl">Итого</span>
                <span className="text-2xl sm:text-3xl font-black text-yellow-400">
                  {formatRub(total)}
                </span>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="text-sm font-black uppercase text-gray-300">
                    Telegram для связи
                  </label>
                  <input
                    type="text"
                    placeholder="@telegram"
                    value={telegram}
                    onChange={(event) => setTelegram(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-black uppercase text-gray-300">
                    Email для получения кодов
                  </label>
                  <input
                    type="email"
                    placeholder="mail@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none focus:border-yellow-400"
                  />
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    На эту почту придут коды пополнения, если товар требует email.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
                  Перед оплатой убедись, что VPN отключён, иначе платеж может не пройти.
                </div>

                <div>
                  <p className="text-sm font-black uppercase text-gray-300">
                    Способ оплаты
                  </p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    {[
                      { id: "СБП", title: "СБП", subtitle: "2,5% комиссия клиента" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayment(method.id)}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          payment === method.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/10 bg-white/5 hover:border-yellow-400/50",
                        ].join(" ")}
                      >
                        <p className="font-black">{method.title}</p>
                        <p className="mt-1 text-xs font-bold text-gray-400">
                          {method.subtitle}
                        </p>
                      </button>
                    ))}
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
                  className="rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#ec4899)] px-5 py-5 text-xl font-black text-white shadow-2xl shadow-violet-900/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Оформляем..." : "Оплатить " + formatRub(total)}
                </button>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28 h-fit rounded-3xl bg-yellow-400 p-5 sm:p-6 text-black">
            <h2 className="text-3xl font-black">Ваш заказ</h2>
            <div className="mt-5 space-y-4">
              {groupedCart.length === 0 ? (
                <p className="text-black/60 font-bold">Товары не выбраны</p>
              ) : (
                groupedCart.map(({ item, quantity }) => (
                  <div
                    key={String(item.id) + item.name}
                    className="border-b border-black/20 pb-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black">{item.name}</p>
                        <p className="text-sm text-black/60">
                          {item.price} × {quantity}
                        </p>
                      </div>
                      <p className="font-black whitespace-nowrap">
                        {formatRub(priceToNumber(item.price) * quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/20 pt-6">
              <span className="text-xl font-black">Итого</span>
              <span className="text-3xl font-black">{formatRub(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
