import ReviewsSection from "../ReviewsSection";

export const metadata = {
  title: "Отзывы клиентов FunZona",
  description: "Отзывы покупателей FunZona о подписках, играх, Apple ID, ChatGPT и цифровых товарах.",
};

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black pt-8">
      <ReviewsSection />
    </main>
  );
}
