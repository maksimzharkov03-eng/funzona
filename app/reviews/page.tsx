import ReviewsSection from "../ReviewsSection";

export const metadata = {
  title: "Отзывы клиентов FunZona",
  description: "Отзывы покупателей FunZona о подписках, играх, Apple ID, ChatGPT и цифровых товарах.",
};

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black px-6 pt-8">
      <div className="mx-auto mb-6 max-w-6xl">
        <a
          href="/"
          className="inline-flex rounded-xl border border-yellow-400/40 px-5 py-3 text-sm font-black text-yellow-400 transition hover:bg-yellow-400/10"
        >
          ← Назад
        </a>
      </div>
      <ReviewsSection />
    </main>
  );
}
