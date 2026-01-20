"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { bootstrapWishlistOnce } from "@/services/wishlist/bootstrap";
import { useWishlistStore } from "@/stores/useWishlistStore";

export default function WishlistBootstrapper() {
  const { data: session } = useSession();
  const setWishlistIds = useWishlistStore((s) => s.setWishlistIds);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  useEffect(() => {
    const token = session?.accessToken as string | undefined;

    if (!token) {
      clearWishlist();
      return;
    }

    let cancelled = false;

    bootstrapWishlistOnce(token)
      .then((items) => {
        if (cancelled) return;
        const ids = items.map((i) => i.product?.id || i.product_id).filter(Boolean) as string[];
        setWishlistIds(ids);
      })
      .catch(() => {
        // If bootstrap fails, keep existing persisted state; user actions will still work.
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, setWishlistIds, clearWishlist]);

  return null;
}
