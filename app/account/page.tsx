"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: number;
  telegram: string;
  payment: string;
  comment?: string | null;
  status: string;
  productName?: string | null;
  productPrice?: string | null;
  deliveryData?: string | null;
  createdAt: string;
};

function statusClass(status: string) {
  if (status === "Ожидает оплаты") return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";
  if (status === "Оплачен") return "border-blue-400/30 bg-blue-400/10 text-blue-300";
  if (status === "В работе") return "border-violet-400/30 bg-violet-400/10 text-violet-300";
  if (status === "Выдан") return "border-green-400/30 bg-green-400/10 text-green-300";
  if (status === "Отменен") return "border-red-400/30 bg-red-400/10 text-red-300";
  return "border-white/10 bg-white/5 text-gray-300";
}

function priceToNumber(price?: string | null) {
  return Number(String(price || "0").replace(/\D/g, "")) || 0;
}

export default function AccountPage() {
  const [login, setLogin] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const userLogin = localStorage.getItem("userLogin");

    if (!userLogin) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/orders?login=" + encodeURIComponent(userLogin));
    const data = await res.json();

    setOrders(data);
    setLoading(false);
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    localStorage.removeItem("userLogin");
    localStorage.removeItem("userRole");

    window.location.href = "/login";
  }

  useEffect(() => {
    const userLogin = localStorage.getItem("userLogin");

    if (!userLogin) {
      window.location.href = "/login";
      return;
    }

    setLogin(userLogin);
    loadOrders();
  }, []);

  const initials = useMemo(() => {
    return (login || "F").slice(0, 1).toUpperCase();
  }, [login]);

  const stats = useMemo(() => {
    const active = orders.filter((order) =>
      ["Ожидает оплаты", "Оплачен", "В работе"].includes(order.status)
    ).length;
    const completed = orders.filter((order) => order.status === "Выдан").length;
    const total = orders.reduce(
      (sum, order) => sum + priceToNumber(order.productPrice),
      0
    );

    return { active, completed, total };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#332600_0,transparent_34%),#050505] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm font-black">
            <a href="/" className="text-yellow-400 transition hover:text-yellow-300">
              Главная
            </a>
            <span className="text-gray-600">/</span>
            <span className="text-white">Личный кабинет</span>
          </div>

          <p className="text-sm font-bold text-gray-300">
            Привет, <span className="text-yellow-400">{login || "клиент"}</span>
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-yellow-400/15 bg-white/[0.06] p-5 shadow-2xl shadow-yellow-400/5 sm:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-3xl font-black text-black shadow-lg shadow-yellow-400/25">
                {initials}
              </div>

              <div>
                <h1 className="text-3xl font-black sm:text-4xl">{login}</h1>
                <p className="mt-2 text-sm font-bold text-gray-400">
                  Аккаунт FunZona
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 font-black text-red-300 transition hover:border-red-400 sm:w-auto"
            >
              Выйти
            </button>
          </div>
        </section>

        <div className="mb-9 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/15 bg-black/60 p-5">
            <p className="text-sm font-black uppercase text-gray-500">Всего заказов</p>
            <h2 className="mt-3 text-4xl font-black text-yellow-400">{orders.length}</h2>
          </div>

          <div className="rounded-3xl border border-yellow-400/15 bg-black/60 p-5">
            <p className="text-sm font-black uppercase text-gray-500">Активные</p>
            <h2 className="mt-3 text-4xl font-black text-yellow-400">{stats.active}</h2>
          </div>

          <div className="rounded-3xl border border-yellow-400/15 bg-black/60 p-5">
            <p className="text-sm font-black uppercase text-gray-500">Покупок на сумму</p>
            <h2 className="mt-3 text-4xl font-black text-yellow-400">
              {new Intl.NumberFormat("ru-RU").format(stats.total)} ₽
            </h2>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">
              История заказов
            </p>
            <h2 className="mt-2 text-3xl font-black">Мои покупки</h2>
          </div>

          <a
            href="/support"
            className="w-fit rounded-2xl border border-yellow-400/20 px-5 py-3 font-black text-yellow-400 transition hover:border-yellow-400"
          >
            Написать в поддержку
          </a>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-yellow-400/20 bg-white/[0.04] p-12 text-center text-gray-400">
            Загружаем заказы...
          </div>
        ) : orders.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-yellow-400/20 bg-white/[0.04] px-5 py-14 text-center sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400/10 text-3xl font-black text-yellow-400">
              FZ
            </div>

            <h3 className="mt-6 text-2xl font-black text-yellow-400">
              Заказов пока нет
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              После оформления покупки она появится здесь вместе со статусом, суммой и деталями заказа.
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
              {[
                ["1", "Выбери товар в каталоге"],
                ["2", "Оплати удобным способом"],
                ["3", "Получи статус здесь"],
              ].map(([step, text]) => (
                <div key={step} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 font-black text-yellow-400">
                    {step}
                  </div>
                  <p className="mt-3 text-sm font-bold text-gray-500">{text}</p>
                </div>
              ))}
            </div>

            <a
              href="/catalog"
              className="mt-9 inline-flex rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300"
            >
              В магазин
            </a>
          </section>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl border border-yellow-400/15 bg-white/[0.05] p-5 transition hover:border-yellow-400/40"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-black text-yellow-400">
                        Заказ #{order.id}
                      </p>
                      <span className={"rounded-full border px-3 py-1 text-xs font-black " + statusClass(order.status)}>
                        {order.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black">
                      {order.productName || "Товар не найден"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-5 grid gap-3 text-sm text-gray-400 sm:grid-cols-2">
                      <p>Связь: {order.telegram || "Чат на сайте"}</p>
                      <p>Оплата: {order.payment}</p>
                    </div>

                    {order.deliveryData ? (
                      <div className="mt-5 rounded-3xl border border-green-400/25 bg-green-400/10 p-5">
                        <p className="text-sm font-black uppercase text-green-300">
                          Данные выдачи
                        </p>
                        <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white">
                          {order.deliveryData}
                        </pre>
                      </div>
                    ) : order.status === "Выдан" ? (
                      <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm font-bold text-yellow-200">
                        Заказ выдан. Если данные не отображаются, напиши в поддержку на сайте.
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-yellow-400 px-5 py-4 text-black lg:min-w-[180px] lg:text-right">
                    <p className="text-sm font-bold text-black/60">Сумма</p>
                    <p className="mt-1 text-3xl font-black">
                      {order.productPrice || "Цена не указана"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
