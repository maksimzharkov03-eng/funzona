import { requireAdminUser } from "@/app/lib/server-auth";
import { redirect } from "next/navigation";
import AdminReviewsModeration from "./AdminReviewsModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const admin = await requireAdminUser();

  if (!admin) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-yellow-400">FunZona Control</p>
            <h1 className="mt-2 text-4xl font-black text-yellow-400">Отзывы</h1>
          </div>
          <a
            href="/admin"
            className="rounded-xl border border-yellow-400/40 px-5 py-3 text-sm font-black text-white hover:bg-yellow-400/10"
          >
            Назад в админку
          </a>
        </div>

        <AdminReviewsModeration />
      </div>
    </main>
  );
}
