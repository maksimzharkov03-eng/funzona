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
    "Выполнен",
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
    if (status === "Ожидает оплаты") return "bg-yellow-400 text-black";
    if (status === "Оплачен") return "bg-blue-500 text-white";
    if (status === "В работе") return "bg-purple-500 text-white";
    if (status === "Выполнен") return "bg-green-500 text-white";
    if (status === "Отменен") return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  }

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

        <h2 className="text-3xl font-black mb-5">Заказы</h2>

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
          <p className="text-gray-400">Заказов пока нет</p>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6"
              >
                <div className="flex justify-between gap-6">
                  <div>
                    <p className="text-yellow-400 font-black">
                      Заказ #{order.id}
                    </p>

                    <p className="text-gray-400 mt-2">
                      Дата: {new Date(order.createdAt).toLocaleString()}
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
                      {order.product ? (
                        <p className="text-gray-300">
                          {order.product.name} — {order.product.price}
                        </p>
                      ) : (
                        <p className="text-gray-500">Товар не найден</p>
                      )}
                    </div>
                  </div>

                  <div className="min-w-[260px]">
                    <p className="text-gray-400 mb-4">Статус:</p>

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
                            className={`w-full rounded-xl py-3 font-black ${getStatusClass(
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