"use client";

import { useEffect, useState } from "react";

type Review = {
  id: number;
  userLogin?: string | null;
  name: string;
  rating: number;
  text: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
};

function Stars({ value }: { value: number }) {
  return <span className="text-yellow-400">{"★".repeat(value)}{"☆".repeat(5 - value)}</span>;
}

export default function AdminReviewsModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews", { cache: "no-store" });
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews().catch(() => {
      setMessage("Не удалось загрузить отзывы.");
      setLoading(false);
    });
  }, []);

  async function updateReview(id: number, status: "Опубликован" | "Отклонен") {
    setMessage("");
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setMessage("Не удалось обновить отзыв.");
      return;
    }

    await loadReviews();
  }

  async function deleteReview(id: number) {
    setMessage("");
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setMessage("Не удалось удалить отзыв.");
      return;
    }

    await loadReviews();
  }

  const pending = reviews.filter((review) => review.status === "На проверке");
  const rest = reviews.filter((review) => review.status !== "На проверке");
  const orderedReviews = [...pending, ...rest];

  return (
    <section className="mt-8 rounded-3xl border border-yellow-400/20 bg-white/[0.04] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-yellow-400">Модерация</p>
          <h2 className="mt-2 text-3xl font-black text-white">Отзывы клиентов</h2>
        </div>
        <button
          type="button"
          onClick={loadReviews}
          className="rounded-xl border border-yellow-400/40 px-4 py-3 text-sm font-black text-white hover:bg-yellow-400/10"
        >
          Обновить
        </button>
      </div>

      {message ? <p className="mb-4 text-sm font-bold text-yellow-400">{message}</p> : null}

      {loading ? (
        <p className="text-sm font-bold text-slate-400">Загружаем отзывы...</p>
      ) : orderedReviews.length === 0 ? (
        <p className="text-sm font-bold text-slate-400">Отзывов пока нет.</p>
      ) : (
        <div className="grid gap-4">
          {orderedReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-yellow-400/15 bg-black p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black text-white">{review.name}</h3>
                    <Stars value={review.rating} />
                    <span className="rounded-full border border-yellow-400/30 px-3 py-1 text-xs font-black text-yellow-400">
                      {review.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Клиент: {review.userLogin || "не указан"} · {new Date(review.createdAt).toLocaleString("ru-RU")}
                  </p>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">{review.text}</p>
                </div>

                <div className="flex min-w-[240px] flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => updateReview(review.id, "Опубликован")}
                    className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300"
                  >
                    Опубликовать
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReview(review.id, "Отклонен")}
                    className="rounded-xl border border-red-400/40 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/10"
                  >
                    Отклонить
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(review.id)}
                    className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-black text-slate-300 hover:bg-white/5"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
