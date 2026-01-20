"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { removeFromWishlist } from "@/services/wishlist";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { Button } from "@/components/ui/button";

interface WishlistProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    stock: number;
  };
}

export default function WishlistProductCard({ product }: WishlistProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const addToCart = useCartStore((state: any) => state.addItem);
  const removeWishlistId = useWishlistStore((s) => s.removeWishlistId);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      category: '',
      brand: '',
      sku: '',
      slug: product.slug,
      stock: product.stock,
      description: '',
      specs: {},
      fitment: [],
      discount: 0,
      rating: 0,
      isNew: false,
      isBestSeller: false,
      quantity: 1,
    });

    toast({
      title: "Added to Cart",
      description: "Product added to your cart.",
      className: "bg-primary text-white border-none",
    });
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    try {
      await removeFromWishlist(product.id, session.accessToken);
      removeWishlistId(product.id);
      toast({
        title: "Removed from Wishlist",
        description: "Product removed from your wishlist.",
        className: "bg-orange-600 text-white border-none",
      });
    } catch (error: any) {
      // Handle authentication errors
      if (error?.message === 'AUTH_EXPIRED') {
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          className: "bg-orange-600 text-white border-none",
        });
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="block h-full group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Remove from Wishlist Button - Always visible on wishlist page */}
          <button
            onClick={handleRemoveFromWishlist}
            disabled={false}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove from Wishlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="absolute bottom-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-primary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </div>
            
            <div className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
