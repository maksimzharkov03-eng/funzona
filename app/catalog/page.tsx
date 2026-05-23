import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogClient />
    </Suspense>
  );
}

function CatalogFallback() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="h-[430px] rounded-3xl bg-white/5 border border-yellow-400/10 animate-pulse" />
      </div>
    </main>
  );
}
