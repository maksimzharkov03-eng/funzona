"use client";

import { useEffect, useState } from "react";
import AdminProducts from "./AdminProducts";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("Все");

  const statuses = [
    "Ожидает оплаты",
    "Оплачен",
    "В работе",
    "Выдан",
    "Отменен",
  ];

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: number, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    loadOrders();
  }

  function getStatusClass(status: string) {
    if (status === "Ожидает оплаты")
      return "bg-yellow-400 text-black";

    if (status === "Оплачен")
      return "bg-blue-500 text-white";

    if (status === "В работе")
      return "bg-purple-500 text-white";

    if (status === "Выдан")
      return "bg-green-500 text-white";

    if (status === "Отменен")
      return "bg-red-500 text-white";

    return "bg-gray-500 text-white";
  }

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) =>
      order.status === "Оплачен" ||
      order.status === "В работе" ||
      order.status === "Выдан"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Ожидает оплаты"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Выдан"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Отменен"
  ).length;

  const totalRevenue = orders
    .filter(
      (order) =>
        order.status === "Оплачен" ||
        order.status === "В работе" ||
        order.status === "Выдан"
    )
    .reduce((sum, order) => {
      return (
        sum +
        Number(String(order.productPrice || "0").replace(/\D/g, ""))
      );
    }, 0);

  const filteredOrders =
    filter === "Все"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-8">
          Админка FunZona
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-10">
          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6">
            <p className="text-gray-400">Всего заказов</p>
            <h3 className="text-4xl font-black text-yellow-400 mt-3">
              {totalOrders}
            </h3>
          </div>

          <div className="bg-white/5 border border-blue-400/20 rounded-3xl p-6">
            <p className="text-gray-400">Оплачено</p>
            <h3 className="text-4xl font-black text-blue-400 mt-3">
              {paidOrders}
            </h3>
          </div>

          <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6">
            <p className="text-gray-400">Ожидают</p>
            <h3 className="text-4xl font-black text-yellow-400 mt-3">
              {pendingOrders}
            </h3>
          </div>

          <div className="bg-white/5 border border-green-400/20 rounded-3xl p-6">
            <p className="text-gray-400">Выдано</p>
            <h3 className="text-4xl font-black text-green-400 mt-3">
              {completedOrders}
            </h3>
          </div>

          <div className="bg-white/5 border border-red-400/20 rounded-3xl p-6">
            <p className="text-gray-400">Отменено</p>
            <h3 className="text-4xl font-black text-red-400 mt-3">
              {cancelledOrders}
            </h3>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black rounded-3xl p-8 mb-10">
          <p className="font-bold text-black/60">
            Оборот по оплаченным заказам
          </p>

          <h2 className="text-5xl font-black mt-3">
            {totalRevenue} ₽
          </h2>
        </div>

        <h2 className="text-3xl font-black mb-5">
          Заказы
        </h2>

        <div className="flex flex-wrap gap-3 mb-8">
          {["Все", ...statuses].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-3 rounded-xl font-black border transition ${
                filter === status
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 text-gray-300 border-yellow-400/20 hover:border-yellow-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-400">
            Заказов пока нет
          </p>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6"
              >
                <div className="flex justify-between gap-6 flex-col lg:flex-row">
                  <div>
                    <p className="text-yellow-400 font-black text-xl">
                      Заказ #{order.id}
                    </p>

                    <p className="text-gray-400 mt-3">
                      Дата:{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <p className="text-gray-400">
                      Telegram: {order.telegram}
                    </p>

                    <p className="text-gray-400">
                      Оплата: {order.payment}
                    </p>

                    <p className="text-gray-400">
                      Комментарий: {order.comment || "—"}
                    </p>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="text-white font-bold text-lg">
                        {order.productName || "Товар не указан"}
                      </p>

                      <p className="text-yellow-400 font-black mt-1">
                        {order.productPrice || "0 ₽"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[260px]">
                    <p className="text-gray-400 mb-4">
                      Статус заказа
                    </p>

                    <details className="group">
                      <summary
                        className={`list-none cursor-pointer rounded-2xl px-5 py-4 font-black flex items-center justify-between transition ${getStatusClass(
                          order.status
                        )}`}
                      >
                        <span>{order.status}</span>

                        <span className="group-open:rotate-180 transition">
                          ▼
                        </span>
                      </summary>

                      <div className="mt-3 space-y-2">
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              updateStatus(order.id, status);

                              const details = e.currentTarget.closest(
                                "details"
                              ) as HTMLDetailsElement;

                              if (details) {
                                details.open = false;
                              }
                            }}
                            className={`w-full rounded-xl py-3 font-black transition ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminProducts />
      </div>
    </main>
  );
}