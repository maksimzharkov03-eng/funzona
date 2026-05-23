"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatSubscriptionPrice,
  subscriptionCountries,
  subscriptionPlans,
  type SubscriptionCountry,
  type SubscriptionPlan,
} from "@/app/data/subscriptions";

const tierOrder = ["Essential", "Extra", "Deluxe", "EA Play"];

function addSubscriptionToCart(plan: SubscriptionPlan) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart.push({
    id: `subscription-${plan.id}`,
    name:
      plan.tier === "EA Play"
        ? `EA Play ${plan.duration}`
        : `PlayStation Plus ${plan.tier} ${plan.duration}`,
    category: "Подписки",
    description: `${plan.country} • ${plan.service}`,
    price: formatSubscriptionPrice(plan.price),
    image: "",
  });

  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function SubscriptionsPage() {
  const [country, setCountry] = useState<SubscriptionCountry>("Украина");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const groupedPlans = useMemo(() => {
    const plans = subscriptionPlans.filter((plan) => plan.country === country);

    return tierOrder
      .map((tier) => ({
        tier,
        plans: plans.filter((plan) => plan.tier === tier),
      }))
      .filter((group) => group.plans.length > 0);
  }, [country]);

  function handleAdd(plan: SubscriptionPlan) {
    addSubscriptionToCart(plan);
    setToast("Подписка добавлена в корзину");
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,#ffd40033,transparent_34%),radial-gradient(circle_at_top_right,#2563eb33,transparent_30%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <a
          href="/catalog"
          className="inline-flex w-fit border border-yellow-400/30 bg-white/5 px-4 sm:px-5 py-3 rounded-2xl font-black hover:border-yellow-400 hover:bg-yellow-400/10 transition mb-8"
        >
          ← Назад в каталог
        </a>

        <section className="mb-10">
          <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-base font-black mb-6">
            PLAYSTATION SUBSCRIPTIONS
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95]">
            Подписки <span className="text-yellow-400">PlayStation</span>
          </h1>

          <p className="text-gray-400 mt-5 max-w-2xl text-base sm:text-lg leading-7">
            Выбери регион, тариф и срок. Цена уже указана в рублях по прайсу
            FunZona.
          </p>
        </section>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-8">
          {subscriptionCountries.map((item) => (
            <button
              key={item}
              onClick={() => setCountry(item)}
              className={`px-5 sm:px-6 py-4 rounded-2xl transition border font-black ${
                country === item
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_25px_rgba(255,212,0,0.35)]"
                  : "bg-white/5 border-yellow-400/20 hover:border-yellow-400 hover:bg-yellow-400/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {groupedPlans.map((group) => (
            <section
              key={group.tier}
              className="bg-white/5 border border-yellow-400/20 rounded-3xl overflow-hidden"
            >
              <div className="bg-yellow-400 text-black px-5 py-4">
                <p className="text-sm font-black opacity-70">
                  {group.tier === "EA Play" ? "EA Play" : "PlayStation Plus"}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black">{group.tier}</h2>
              </div>

              <div className="p-5 space-y-4">
                {group.plans.map((plan) => (
                  <article
                    key={plan.id}
                    className="bg-black/60 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-gray-400 font-bold">
                          {plan.duration}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.country}
                        </p>
                      </div>

                      <p className="text-xl sm:text-2xl font-black text-yellow-400 whitespace-nowrap">
                        {formatSubscriptionPrice(plan.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAdd(plan)}
                      className="mt-4 w-full bg-yellow-400 text-black py-3 rounded-xl font-black hover:bg-yellow-300 transition"
                    >
                      В корзину
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {toast ? (
        <div className="fixed right-5 bottom-5 z-50 bg-black border border-yellow-400/40 rounded-2xl px-5 py-4 font-black shadow-2xl">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
