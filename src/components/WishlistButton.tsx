"use client";

import { useTransition, useState } from "react";
import { addToWishlistSilent } from "@/lib/actions/wishlist";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "lg";
}

export function WishlistButton({ productId, size = "sm" }: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [loginHint, setLoginHint] = useState(false);

  function handleClick() {
    if (isPending || saved) return;

    startTransition(async () => {
      const result = await addToWishlistSilent(productId);
      if (result.ok) {
        setSaved(true);
      } else {
        setLoginHint(true);
        setTimeout(() => setLoginHint(false), 2200);
      }
    });
  }

  const isAdded = saved;
  const isLogin = loginHint;

  const sizeClass = size === "lg" ? "btn-wish btn-lg" : "btn-wish-card";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${sizeClass}${isAdded ? " just-added" : ""}`}
      title={
        isAdded
          ? "Guardado en favoritos — ver en /favoritos"
          : isLogin
          ? "Inicia sesión para guardar"
          : "Agregar a favoritos"
      }
      style={{ position: "relative" }}
    >
      {isPending ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
          style={{ width: "0.85em", height: "0.85em", borderWidth: "2px" }}
        ></span>
      ) : isAdded ? (
        <i className="bi bi-heart-fill" style={{ color: "var(--danger)" }}></i>
      ) : isLogin ? (
        <i className="bi bi-person-x" style={{ color: "var(--warning)" }}></i>
      ) : (
        <i className="bi bi-heart"></i>
      )}
    </button>
  );
}
