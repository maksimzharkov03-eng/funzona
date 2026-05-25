"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [login, setLogin] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  async function loadOrders() {
    const userLogin =
      localStorage.getItem("userLogin");

    if (!userLogin) {
      setOrders([]);
      return;
    }

    const res = await fetch(
      `/api/orders?login=${userLogin}`
    );

    const data = await res.json();

    setOrders(data);
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
    const userLogin =
      localStorage.getItem("userLogin");

    if (!userLogin) {
      window.location.href = "/login";
      return;
    }

    setLogin(userLogin);

    loadOrders();
  }, []);

  function getStatusColor(status: string) {
    if (status === "Ожидает оплаты")
      return "text-yellow-400";

    if (status === "Оплачен")
      return "text-blue-400";

    if (status === "В работе")
      return "text-purple-400";

    if (status === "Выдан")
      return "text-green-400";

    if (status === "Отменен")
      return "text-red-400";

    return "text-gray-400";
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-8">
          Личный кабинет
        </h1>

        <div className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6 mb-8">
          <h2 className="text-2xl font-black">
            Профиль
          </h2>

          <p className="text-gray-400 mt-3">
            Логин: {login}
          </p>

          <button
            onClick={logout}
            className="mt-5 bg-red-500 text-white px-6 py-3 rounded-xl font-black hover:bg-red-400 transition"
          >
            Выйти
          </button>
        </div>

        <h2 className="text-3xl font-black mb-5">
          Мои заказы
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-400">
            Заказов пока нет
          </p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6"
              >
                <div className="flex justify-between gap-6 flex-col md:flex-row">
                  <div>
                    <p className="text-yellow-400 font-black text-xl">
                      Заказ #{order.id}
                    </p>

                    <p className="text-gray-400 mt-2">
                      Дата:{" "}
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>

                    <p className="text-gray-400">
                      Telegram: {order.telegram}
                    </p>

                    <p className="text-gray-400">
                      Оплата: {order.payment}
                    </p>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="text-white font-bold text-lg">
                        {order.productName ||
                          "Товар не найден"}
                      </p>

                      <p className="text-yellow-400 font-black mt-1">
                        {order.productPrice ||
                          "Цена не указана"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      className={`font-black text-xl ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}