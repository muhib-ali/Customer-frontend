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
import { useCurrency } from "@/contexts/currency-context";
import { useEffect, useState } from "react";

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
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const addToCart = useCartStore((state: any) => state.addItem);
  const removeWishlistId = useWishlistStore((s) => s.removeWishlistId);
  const { toast } = useToast();

  // Convert product price when currency changes
  useEffect(() => {
    const convertProductPrice = async () => {
      if (!product?.price) return;
      
      try {
        const targetCurrency = getCurrencyCode();
        if (targetCurrency !== 'NOK') {
          const converted = await convertAmount(Number(product.price), 'NOK', targetCurrency);
          setConvertedPrice(converted);
        } else {
          setConvertedPrice(null);
        }
      } catch (error) {
        console.error('Wishlist product price conversion failed:', error);
        setConvertedPrice(null);
      }
    };

    convertProductPrice();
  }, [product?.price, convertAmount, getCurrencyCode]);

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
      variant: "success",
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
        variant: "warning",
      });
    } catch (error: any) {
      // Handle authentication errors
      if (error?.message === 'AUTH_EXPIRED') {
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "warning",
        });
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="block h-full group">
      <div className="bg-card text-foreground rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Remove from Wishlist Button - Always visible on wishlist page */}
          <button
            onClick={handleRemoveFromWishlist}
            disabled={false}
            className="absolute top-2 right-2 p-2 bg-background/80 text-foreground rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove from Wishlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="absolute bottom-2 left-2 p-2 bg-background/80 text-foreground rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="font-bold text-primary">
              {getCurrencySymbol()}{(convertedPrice || Number(product.price)).toFixed(2)}
            </div>
            
            <div className={`text-xs ${product.stock > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
