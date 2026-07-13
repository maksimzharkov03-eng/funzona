"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-1 text-yellow-400" aria-label={`Оценка ${value} из 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < value ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/reviews", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(() => {});

    fetch("/api/reviews/eligibility", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        setCanReview(Boolean(data.canReview));
        setEligibilityReason(String(data.reason || ""));
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const average = useMemo(() => {
    if (reviews.length === 0) return 5;
    return Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, rating }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось отправить отзыв");
      }

      setName("");
      setText("");
      setRating(5);
      setFormOpen(false);
      setCanReview(false);
      setEligibilityReason("Ваш отзыв отправлен на проверку.");
      setMessage(data?.message || "Отзыв отправлен на проверку.");
    } catch (error: any) {
      setMessage(error?.message || "Не удалось отправить отзыв");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="reviews" className="border-t border-yellow-400/10 bg-black px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-400">
              Отзывы
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Что говорят клиенты FunZona
            </h2>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4">
            <p className="text-sm font-bold text-slate-300">Средняя оценка</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-black text-yellow-400">{average}</span>
              <Stars value={Math.round(average)} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-yellow-400/15 bg-white/[0.04] p-5 sm:col-span-2">
                <h3 className="font-black text-white">Пока отзывов нет</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                  Здесь появятся отзывы клиентов после проверки администратором.
                </p>
              </div>
            ) : (
              reviews.slice(0, 6).map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-yellow-400/15 bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-white">{review.name}</h3>
                    <Stars value={review.rating} />
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
                    {review.text}
                  </p>
                </article>
              ))
            )}
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-white/[0.05] p-5">
            <h3 className="text-2xl font-black text-white">Оставить отзыв</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-400">
              Отзыв можно оставить один раз после выдачи товара. Перед публикацией он попадет на проверку.
            </p>

            {!canReview ? (
              <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                <p className="text-sm font-black leading-6 text-yellow-400">
                  {eligibilityReason || "Кнопка отзыва появится после выдачи товара."}
                </p>
              </div>
            ) : !formOpen ? (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-5 flex min-h-[54px] w-full items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-base font-black text-black transition hover:bg-yellow-300"
              >
                Оставить отзыв
              </button>
            ) : (
              <form onSubmit={submitReview} className="mt-5">
                <label className="block text-sm font-black uppercase text-slate-300">
                  Имя
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Как вас подписать"
                    className="mt-2 w-full rounded-xl border border-yellow-400/20 bg-black px-4 py-3 text-base font-bold text-white outline-none transition focus:border-yellow-400"
                  />
                </label>

                <label className="mt-4 block text-sm font-black uppercase text-slate-300">
                  Оценка
                  <select
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-yellow-400/20 bg-black px-4 py-3 text-base font-bold text-white outline-none transition focus:border-yellow-400"
                  >
                    <option value={5}>5 звезд</option>
                    <option value={4}>4 звезды</option>
                    <option value={3}>3 звезды</option>
                    <option value={2}>2 звезды</option>
                    <option value={1}>1 звезда</option>
                  </select>
                </label>

                <label className="mt-4 block text-sm font-black uppercase text-slate-300">
                  Отзыв
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Напишите пару слов о покупке"
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-yellow-400/20 bg-black px-4 py-3 text-base font-bold text-white outline-none transition focus:border-yellow-400"
                  />
                </label>

                {message ? <p className="mt-3 text-sm font-bold text-yellow-400">{message}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 flex min-h-[54px] w-full items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-base font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Отправляем..." : "Отправить на проверку"}
                </button>
              </form>
            )}

            {!formOpen && message ? (
              <p className="mt-3 text-sm font-bold text-yellow-400">{message}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
