"use client";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistCount() {
  const count = useWishlistStore((s) => s.wishlistIds.length);
  const showCount = count > 0;

  return (
    <Link 
      href="/wishlist" 
      className="relative p-2 text-muted-foreground hover:text-primary transition-colors group"
    >
      <Heart className="h-6 w-6" />
      {showCount && (
        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold flex items-center justify-center rounded-full text-white ring-2 ring-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
      <span className="sr-only">Wishlist ({count} items)</span>
    </Link>
  );
}
