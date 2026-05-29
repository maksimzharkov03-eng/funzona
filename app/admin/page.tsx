"use client";

import { useEffect, useState } from "react";
import AdminChat from "./AdminChat";
import AdminGames from "./AdminGames";
import AdminProducts from "./AdminProducts";
import AdminNsBalanceMini from "./AdminNsBalanceMini";
import AdminNsBalanceStrip from "./AdminNsBalanceStrip";

type AdminTab = "orders" | "delivery" | "chat" | "products" | "games";

const tabs: { id: AdminTab; label: string; hint: string }[] = [
  { id: "orders", label: "Заказы", hint: "Статусы и оплата" },
  { id: "delivery", label: "Автовыдача", hint: "NS Gifts" },
  { id: "chat", label: "Чат", hint: "Клиенты" },
  { id: "products", label: "Товары и подписки", hint: "Каталог" },
  { id: "games", label: "Игры", hint: "PS Store" },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("Все");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<number, string>>({});
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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
    setDeliveryDrafts((current) => {
      const next = { ...current };

      for (const order of data) {
        if (next[order.id] === undefined) {
          next[order.id] = order.deliveryData || "";
        }
      }

      return next;
    });
  }

  async function loadUnreadMessages() {
    try {
      const res = await fetch("/api/chat?mode=conversations", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const conversations = await res.json();
      const total = Array.isArray(conversations)
        ? conversations.reduce(
            (sum: number, item: any) => sum + Number(item.unread || 0),
            0
          )
        : 0;

      setUnreadMessages(total);
    } catch {
      setUnreadMessages(0);
    }
  }

  useEffect(() => {
    async function checkAdminAccess() {
      const res = await fetch("/api/admin/me", { cache: "no-store" });

      if (!res.ok) {
        window.location.href = "/login";
        return;
      }

      setCheckingAdmin(false);
    }

    checkAdminAccess();
    loadOrders();
    loadUnreadMessages();

    const timer = window.setInterval(loadUnreadMessages, 5000);

    return () => window.clearInterval(timer);
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

  function updateDeliveryDraft(orderId: number, value: string) {
    setDeliveryDrafts((current) => ({
      ...current,
      [orderId]: value,
    }));
  }

  async function saveDelivery(orderId: number) {
    const deliveryData = deliveryDrafts[orderId] || "";

    if (!deliveryData.trim()) {
      alert("Заполни данные выдачи");
      return;
    }

    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Выдан",
        deliveryData,
      }),
    });

    loadOrders();
  }

  function getStatusClass(status: string) {
    if (status === "Ожидает оплаты") return "bg-yellow-400 text-black";
    if (status === "Оплачен") return "bg-blue-500 text-white";
    if (status === "В работе") return "bg-purple-500 text-white";
    if (status === "Выдан") return "bg-green-500 text-white";
    if (status === "Отменен") return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  }

  function priceToNumber(price: string) {
    return Number(String(price || "0").replace(/\D/g, "")) || 0;
  }

  function formatRub(value: number) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
  }

  function formatUsd(value: number) {
    return (
      "$" +
      new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0)
    );
  }

  function isAutoDeliveryOrder(order: any) {
    return Boolean(
      order.autoDeliveryAt ||
        order.autoDeliveryProvider ||
        Number(order.autoDeliveryCostUsd || 0) > 0 ||
        String(order.deliveryData || "").includes("Поставщик:")
    );
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
      return sum + priceToNumber(order.productPrice);
    }, 0);

  const autoDeliveryOrders = orders.filter(isAutoDeliveryOrder);
  const autoDeliveryCostUsd = autoDeliveryOrders.reduce(
    (sum, order) => sum + Number(order.autoDeliveryCostUsd || 0),
    0
  );
  const autoDeliveryRevenueRub = autoDeliveryOrders.reduce(
    (sum, order) =>
      sum + Number(order.autoDeliveryRevenueRub || priceToNumber(order.productPrice)),
    0
  );

  const filteredOrders =
    filter === "Все"
      ? orders
      : orders.filter((order) => order.status === filter);

  const unreadLabel = unreadMessages > 99 ? "99+" : String(unreadMessages);

  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 font-black text-yellow-400">
          Проверяем доступ...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase text-yellow-400">
              FunZona Control
            </p>
            <h1 className="text-4xl font-black text-yellow-400 sm:text-5xl">
              Админ-панель
            </h1>
          </div>

          <a
            href="/catalog"
            className="w-fit rounded-2xl border border-yellow-400/30 px-5 py-3 font-black transition hover:border-yellow-400"
          >
            Открыть сайт
          </a>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-yellow-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Всего</p>
            <h3 className="mt-2 text-3xl font-black text-yellow-400">{totalOrders}</h3>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Оплачено</p>
            <h3 className="mt-2 text-3xl font-black text-blue-400">{paidOrders}</h3>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Ожидают</p>
            <h3 className="mt-2 text-3xl font-black text-yellow-400">{pendingOrders}</h3>
          </div>
          <div className="rounded-2xl border border-green-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Выдано</p>
            <h3 className="mt-2 text-3xl font-black text-green-400">{completedOrders}</h3>
          </div>
          <div className="col-span-2 rounded-2xl bg-yellow-400 p-4 text-black lg:col-span-1">
            <p className="text-sm font-bold text-black/60">Оборот</p>
            <h3 className="mt-2 text-3xl font-black">{totalRevenue} ₽</h3>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-gray-400">Автовыдача</p>
            <h3 className="mt-2 text-3xl font-black text-emerald-400">
              {autoDeliveryOrders.length}
            </h3>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Получено в кассу</p>
            <h3 className="mt-2 text-3xl font-black text-yellow-400">
              {formatRub(autoDeliveryRevenueRub)}
            </h3>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Потрачено в NS Gifts</p>
            <h3 className="mt-2 text-3xl font-black text-blue-400">
              {formatUsd(autoDeliveryCostUsd)}
            </h3>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                "rounded-2xl border p-4 text-left transition " +
                (activeTab === tab.id
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-yellow-400/20 bg-white/5 hover:border-yellow-400")
              }
            >
              <span className="flex items-center gap-2 text-xl font-black">
                {tab.label}
                {tab.id === "chat" && unreadMessages > 0 ? (
                  <span
                    className={
                      "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-black " +
                      (activeTab === tab.id
                        ? "bg-black text-yellow-400"
                        : "bg-red-500 text-white")
                    }
                  >
                    {unreadLabel}
                  </span>
                ) : null}
              </span>
              <span className={activeTab === tab.id ? "mt-1 block text-sm text-black/60" : "mt-1 block text-sm text-gray-400"}>
                {tab.hint}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "orders" ? (
                  <AdminNsBalanceStrip />
<section className="rounded-3xl border border-yellow-400/20 bg-white/5 p-4 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-yellow-400">Заказы</p>
                <h2 className="text-3xl font-black">Управление заказами</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Все", ...statuses].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={
                      "rounded-xl border px-4 py-3 text-sm font-black transition " +
                      (filter === status
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-yellow-400/20 bg-black text-gray-300 hover:border-yellow-400")
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black p-8 text-center text-gray-400">
                Заказов пока нет
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-black p-5"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div>
                        <p className="text-xl font-black text-yellow-400">
                          Заказ #{order.id}
                        </p>
                        <p className="mt-3 text-gray-400">
                          Дата: {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-gray-400">Связь: {order.telegram || "Чат на сайте"}</p>
                        <p className="text-gray-400">Оплата: {order.payment}</p>
                        <p className="text-gray-400">
                          Комментарий: {order.comment || "—"}
                        </p>

                        <div className="mt-5 rounded-2xl border border-yellow-400/15 bg-white/[0.03] p-4">
                          <label className="text-sm font-black uppercase text-yellow-400">
                            Данные выдачи
                          </label>
                          <textarea
                            value={deliveryDrafts[order.id] || ""}
                            onChange={(event) =>
                              updateDeliveryDraft(order.id, event.target.value)
                            }
                            placeholder="Например: код, логин/пароль, инструкция или ссылка"
                            className="mt-3 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-yellow-400"
                          />
                          <button
                            type="button"
                            onClick={() => saveDelivery(order.id)}
                            className="mt-3 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                          >
                            Сохранить и выдать на сайте
                          </button>
                        </div>

                        <div className="mt-5 border-t border-white/10 pt-5">
                          <p className="text-lg font-bold text-white">
                            {order.productName || "Товар не указан"}
                          </p>
                          <p className="mt-1 font-black text-yellow-400">
                            {order.productPrice || "0 ₽"}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-[260px]">
                        <p className="mb-3 text-gray-400">Статус заказа</p>
                        <details className="group">
                          <summary
                            className={`flex cursor-pointer list-none items-center justify-between rounded-2xl px-5 py-4 font-black transition ${getStatusClass(
                              order.status
                            )}`}
                          >
                            <span>{order.status}</span>
                            <span className="transition group-open:rotate-180">▼</span>
                          </summary>

                          <div className="mt-3 space-y-2">
                            {statuses.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={(event) => {
                                  updateStatus(order.id, status);

                                  const details = event.currentTarget.closest(
                                    "details"
                                  ) as HTMLDetailsElement;

                                  if (details) details.open = false;
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
          </section>
        ) : null}

        {activeTab === "delivery" ? (
          <section className="rounded-3xl border border-yellow-400/20 bg-white/5 p-4 sm:p-6">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm font-black uppercase text-yellow-400">
                NS Gifts
              </p>
              <h2 className="text-3xl font-black">Автовыдача кодов</h2>
              <p className="max-w-2xl text-gray-400">
                Здесь видны только заказы, которые были выданы автоматически через
                поставщика. Себестоимость не показывается клиенту.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-yellow-400 p-5 text-black">
                <p className="text-sm font-black text-black/60">Получено</p>
                <h3 className="mt-2 text-3xl font-black">
                  {formatRub(autoDeliveryRevenueRub)}
                </h3>
              </div>
              <div className="rounded-2xl border border-blue-400/20 bg-black p-5">
                <p className="text-sm text-gray-400">Потрачено NS</p>
                <h3 className="mt-2 text-3xl font-black text-blue-400">
                  {formatUsd(autoDeliveryCostUsd)}
                </h3>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-black p-5">
                <p className="text-sm text-gray-400">Заказов</p>
                <h3 className="mt-2 text-3xl font-black text-emerald-400">
                  {autoDeliveryOrders.length}
                </h3>
              </div>
            </div>

            {autoDeliveryOrders.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black p-8 text-center text-gray-400">
                Автовыдач пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {autoDeliveryOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-black p-4 lg:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <div>
                      <p className="text-lg font-black text-yellow-400">
                        Заказ #{order.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {order.productName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.autoDeliveryAt
                          ? new Date(order.autoDeliveryAt).toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Касса</p>
                      <p className="text-xl font-black text-yellow-400">
                        {formatRub(
                          Number(
                            order.autoDeliveryRevenueRub ||
                              priceToNumber(order.productPrice)
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">NS Gifts</p>
                      <p className="text-xl font-black text-blue-400">
                        {formatUsd(Number(order.autoDeliveryCostUsd || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Статус</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-black ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "chat" ? <AdminChat /> : null}
        {activeTab === "products" ? <AdminProducts /> : null}
        {activeTab === "games" ? <AdminGames /> : null}
      </div>
    </main>
  );
}
