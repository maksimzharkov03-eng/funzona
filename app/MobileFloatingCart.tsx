"use client";

import { useEffect, useState } from "react";

export default function MobileFloatingCart() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function loadCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const total = Array.isArray(cart)
          ? cart.reduce(
              (sum: number, item: any) =>
                sum + Math.max(1, Number(item.quantity || 1)),
              0
            )
          : 0;

        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    }

    loadCartCount();
    const timer = window.setInterval(loadCartCount, 1000);
    window.addEventListener("storage", loadCartCount);
    window.addEventListener("focus", loadCartCount);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener("focus", loadCartCount);
    };
  }, []);

  const cartLabel = cartCount > 99 ? "99+" : String(cartCount);

  return (
    <a
      href="/cart"
      aria-label="Открыть корзину"
      className="md:hidden"
      style={{
        position: "fixed",
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        zIndex: 9999,
        display: "flex",
        height: 56,
        width: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        border: "1px solid rgba(253, 224, 71, 0.45)",
        background: "#facc15",
        color: "#000",
        fontSize: 24,
        fontWeight: 900,
        boxShadow: "0 18px 45px rgba(250, 204, 21, 0.28)",
      }}
    >
      🛒
      {cartCount > 0 ? (
        <span
          style={{
            position: "absolute",
            right: -8,
            top: -8,
            display: "flex",
            minWidth: 24,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#ef4444",
            padding: "0 6px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "0 10px 24px rgba(239, 68, 68, 0.35)",
          }}
        >
          {cartLabel}
        </span>
      ) : null}
    </a>
  );
}
