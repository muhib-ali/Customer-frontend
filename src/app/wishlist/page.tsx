"use client";

import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useWishlist, WishlistItem } from "@/services/products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Package } from "lucide-react";
import { useSession } from "next-auth/react";

// Convert API wishlist item to Product format for ProductCard
const convertWishlistItemToProduct = (item: WishlistItem) => ({
  id: item.product.id,
  sku: item.product.sku,
  name: item.product.title,
  slug: item.product.id,
  price: item.product.price,
  image: item.product.product_img_url,
  images: [item.product.product_img_url],
  category: "",
  brand: "",
  stock: item.product.stock_quantity,
  description: item.product.description,
  specs: {},
  fitment: [],
  isNew: false,
  isBestSeller: false,
});

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items: localItems } = useWishlistStore();
  const { data: wishlistData, isLoading, isError } = useWishlist();

  // Show local items if not authenticated, otherwise show API data
  const shouldShowLocal = !session?.accessToken;
  const wishlistItems = shouldShowLocal ? localItems : (wishlistData?.data || []);
  const displayItems = wishlistItems.map(item => 
    shouldShowLocal ? item : convertWishlistItemToProduct(item)
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-4">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">Failed to load your wishlist. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {shouldShowLocal ? "Your wishlist is empty" : "Your wishlist is empty"}
          </p>
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
          {displayItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
