"use client";

import { useEffect, useMemo, useState } from "react";

type AutoLog = {
  id: number;
  orderId: number | null;
  provider: string;
  status: string;
  message: string;
  costUsd: number | null;
  createdAt: string;
};

type Dashboard = {
  balance: {
    available: boolean;
    amount: number | null;
    endpoint?: string;
    message?: string;
  };
  lowBalanceLimitUsd: number;
  logs: AutoLog[];
  stats: {
    deliveredCount: number;
    totalCostUsd: number;
    totalRevenueRub: number;
  };
};

function formatUsd(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "$0,00";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatRub(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0 ₽";
  }

  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

function statusLabel(status: string) {
  if (status === "success") return "Успех";
  if (status === "partial") return "Частично";
  if (status === "error") return "Ошибка";
  if (status === "skipped") return "Пропущено";
  if (status === "balance-warning") return "Баланс";
  return status;
}

export default function AdminAutoDeliveryPanel() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auto-delivery", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось загрузить автовыдачу.");
      }

      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить автовыдачу.");
    } finally {
      setLoading(false);
    }
  }

  async function retry(orderId: number) {
    setRetryingOrderId(orderId);
    setError("");

    try {
      const res = await fetch("/api/admin/auto-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось повторить автовыдачу.");
      }

      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось повторить автовыдачу.");
    } finally {
      setRetryingOrderId(null);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const retryableLogs = useMemo(() => {
    return (dashboard?.logs || []).filter((log) => log.orderId && log.status !== "success").slice(0, 6);
  }, [dashboard?.logs]);

  const balanceIsLow =
    typeof dashboard?.balance?.amount === "number" &&
    dashboard.balance.amount <= (dashboard.lowBalanceLimitUsd || 50);

  return (
    <section className="mb-8 rounded-[22px] border border-yellow-500/25 bg-zinc-950/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-white">NS Gifts</h3>
          <p className="text-sm text-slate-400">Баланс, расходы и последние попытки автовыдачи.</p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="rounded-xl border border-yellow-500/30 px-4 py-2 text-sm font-black text-yellow-300 hover:bg-yellow-500/10"
        >
          Обновить
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {error}
        </div>
      ) : null}

      {balanceIsLow ? (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-black text-red-100">
          Баланс NS Gifts ниже {formatUsd(dashboard?.lowBalanceLimitUsd || 50)}. Telegram-уведомление отправляется автоматически.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <p className="text-sm text-slate-400">Потрачено в NS Gifts</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{formatUsd(dashboard?.stats?.totalCostUsd)}</p>
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-sm text-slate-400">Актуальный баланс NS Gifts</p>
            <p className={`mt-2 text-3xl font-black ${balanceIsLow ? "text-red-400" : "text-yellow-300"}`}>
              {loading ? "..." : dashboard?.balance?.available ? formatUsd(dashboard.balance.amount) : "Не найден"}
            </p>
            {!loading && dashboard?.balance?.message ? (
              <p className="mt-2 text-xs text-slate-500">{dashboard.balance.message}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4">
          <p className="text-sm text-slate-400">Получено по автовыдаче</p>
          <p className="mt-2 text-3xl font-black text-green-400">{formatRub(dashboard?.stats?.totalRevenueRub)}</p>
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-sm text-slate-400">Успешных выдач</p>
            <p className="mt-2 text-3xl font-black text-white">{dashboard?.stats?.deliveredCount || 0}</p>
          </div>
        </div>
      </div>

      {retryableLogs.length ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="mb-3 font-black text-yellow-200">Можно повторить</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {retryableLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/40 p-3">
                <div className="min-w-0">
                  <p className="font-black text-white">Заказ #{log.orderId}</p>
                  <p className="truncate text-xs text-slate-400">{log.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => log.orderId && retry(log.orderId)}
                  disabled={retryingOrderId === log.orderId}
                  className="shrink-0 rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black disabled:opacity-60"
                >
                  {retryingOrderId === log.orderId ? "..." : "Повторить"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <h4 className="mb-3 font-black text-white">Последние логи</h4>
        <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-black/30 p-4 text-slate-400">Загружаем...</div>
          ) : dashboard?.logs?.length ? (
            dashboard.logs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-800 bg-black/30 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                      {statusLabel(log.status)}
                    </span>
                    {log.orderId ? <span className="text-sm font-bold text-slate-300">Заказ #{log.orderId}</span> : null}
                    {log.costUsd ? <span className="text-sm font-bold text-blue-300">{formatUsd(log.costUsd)}</span> : null}
                  </div>
                  <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <p className="text-sm text-slate-300">{log.message}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-800 bg-black/30 p-4 text-slate-400">Логов пока нет.</div>
          )}
        </div>
      </div>
    </section>
  );
}
