"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import WishlistProductCard from "@/components/WishlistProductCard";
import { bootstrapWishlistOnce, resetWishlistBootstrap } from "@/services/wishlist/bootstrap";
import type { WishlistItem } from "@/services/wishlist";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Heart, RotateCcw } from "lucide-react";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);

  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (!token) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // Always fetch fresh when this component mounts or when wishlistIds change (e.g., after add/remove elsewhere)
    resetWishlistBootstrap();
    bootstrapWishlistOnce(token)
      .then((items) => {
        if (cancelled) return;
        setWishlistItems(items);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, wishlistIds.length]); // re-fetch when wishlistIds change (add/remove elsewhere)

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">Please log in to view your wishlist</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your wishlist...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-red-500 mb-8">Failed to load wishlist. Please try again.</p>
          <Button onClick={() => {
            resetWishlistBootstrap();
            window.location.reload();
          }}>Retry</Button>
        </div>
      </Layout>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex flex-col items-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-4xl font-bold font-heading italic uppercase mb-4">
              My <span className="text-primary">Wishlist</span>
            </h1>
            <p className="text-muted-foreground mb-8">Your wishlist is empty</p>
            <Link href="/categories">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Convert wishlist items to product format for WishlistProductCard
  const products = wishlistItems.map((item: any) => ({
    id: item.product?.id || item.product_id,
    name: item.product?.title || '',
    price: Number(item.product?.price || 0),
    image: item.product?.product_img_url || '',
    slug: (item.product?.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    stock: item.product?.stock_quantity || 0,
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-heading italic uppercase">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              resetWishlistBootstrap();
              window.location.reload();
            }}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <WishlistProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
