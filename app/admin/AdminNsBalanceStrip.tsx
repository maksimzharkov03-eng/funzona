"use client";

import { useEffect, useState } from "react";

type NsBalance = {
  available: boolean;
  amount: number | null;
  message?: string;
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

export default function AdminNsBalanceStrip() {
  const [balance, setBalance] = useState<NsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadBalance() {
      try {
        const res = await fetch("/api/admin/auto-delivery", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (res.ok) {
          setBalance(data.balance || null);
        } else {
          setBalance({ available: false, amount: null, message: data.error || "Не удалось загрузить баланс" });
        }
      } catch (error) {
        if (active) {
          setBalance({
            available: false,
            amount: null,
            message: error instanceof Error ? error.message : "Не удалось загрузить баланс",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBalance();

    return () => {
      active = false;
    };
  }, []);

  const amount = balance?.amount;
  const isLow = typeof amount === "number" && amount <= 50;

  return (
    <div className="mb-4 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-yellow-500/25 bg-zinc-950 p-4 md:col-start-3">
        <p className="text-sm text-slate-400">Баланс NS Gifts</p>
        <p className={`mt-2 text-3xl font-black ${isLow ? "text-red-400" : "text-yellow-300"}`}>
          {loading ? "..." : balance?.available ? formatUsd(amount) : "Не найден"}
        </p>
        {!loading && balance?.message ? <p className="mt-2 text-xs text-slate-500">{balance.message}</p> : null}
        {isLow ? <p className="mt-2 text-xs font-bold text-red-300">Ниже 50$: бот предупредит в Telegram.</p> : null}
      </div>
    </div>
  );
}
