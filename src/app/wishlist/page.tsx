"use client";

import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">Your wishlist is empty</p>
          <Link href="/categories">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          My <span className="text-primary">Wishlist</span>
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
