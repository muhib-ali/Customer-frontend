"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { bootstrapCartOnce } from "@/services/cart/bootstrap";
import { useCartStore } from "@/stores/useCartStore";

export default function CartBootstrapper() {
  const { data: session, status } = useSession();
  const setCartData = useCartStore((s) => s.setCartData);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const token = session?.accessToken as string | undefined;

    // Important: during NextAuth 'loading', token can be temporarily undefined.
    // Clearing the cart here causes the navbar badge to flicker/disappear.
    if (!token) {
      if (status === 'unauthenticated') {
        clearCart();
      }
      return;
    }

    let cancelled = false;

    bootstrapCartOnce(token)
      .then((cartData) => {
        if (cancelled) return;
        console.log('CartBootstrapper - Cart data:', cartData);
        
        // Use the new setCartData that accepts full cart data
        setCartData(cartData);
      })
      .catch(() => {
        // If bootstrap fails, keep existing persisted state; user actions will still work.
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, status, setCartData, clearCart]);

  return null;
}
