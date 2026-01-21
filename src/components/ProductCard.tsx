"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product, useCartStore } from "@/stores/useCartStore";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist";
import { addToCart as addToCartAPI } from "@/services/cart";
import { resetCartBootstrap } from "@/services/cart/bootstrap";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { useProductReviewSummary } from "@/services/reviews";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isCartPending, setIsCartPending] = useState(false);
  const { toast } = useToast();

  // Get product rating summary
  const { data: ratingSummary } = useProductReviewSummary(product.id);

  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const addWishlistId = useWishlistStore((s) => s.addWishlistId);
  const removeWishlistId = useWishlistStore((s) => s.removeWishlistId);
  const inWishlist = wishlistIds.includes(product.id);

  const cartProductIds = useCartStore((s) => s.cartProductIds);
  const addProductId = useCartStore((s) => s.addProductId);
  const setCartData = useCartStore((s) => s.setCartData);
  const totalItems = useCartStore((s) => s.totalItems);
  const inCart = useCartStore((s) => s.isInCart(product.id));
  const canAddRegularItems = useCartStore((s) => s.canAddRegularItems);
  const syncCartFromAPI = useCartStore((s) => s.syncCartFromAPI);

  // Rating display helper
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (isCartPending) return;

    // Always fetch the latest cart directly for conflict detection (not throttled)
    try {
      const { getCart } = await import('@/services/cart');
      const cartRes = await getCart(session.accessToken as string);
      const items = cartRes?.data?.items || [];

      console.log('ProductCard - Cart items for conflict check:', items);

      const hasBulk = items.some((i: any) => i.type === 'bulk' || i.cart_type === 'bulk');
      const hasRegular = items.some((i: any) => (!i.type && !i.cart_type) || i.type === 'regular' || i.cart_type === 'regular');

      console.log('ProductCard - Conflict check:', { hasBulk, hasRegular, itemCount: items.length });

      // If cart has bulk items already, block regular add + show toast
      if (hasBulk && !hasRegular && items.length > 0) {
        console.log('ProductCard - Blocking regular add due to bulk items in cart');
        toast({
          title: "Cart Conflict",
          description: "Cannot add regular items because your cart already has bulk items. Please clear your cart first.",
          className: "bg-red-600 text-white border-none",
        });
        return;
      }
    } catch (e: any) {
      console.error('ProductCard - Cart fetch failed:', e);
      // If cart fetch fails, fall back to store state (best effort)
      await syncCartFromAPI(session.accessToken);
      if (!canAddRegularItems()) {
        toast({
          title: "Cart Conflict",
          description: "Cannot add regular items. You already have bulk items in cart. Please clear your cart first.",
          className: "bg-red-600 text-white border-none",
        });
        return;
      }
    }

    setIsCartPending(true);

    // Optimistic UI update
    console.log('ProductCard - Adding to cart:', product.id);
    addProductId(product.id);
    
    // Update totalItems immediately for instant cart icon update
    const newTotalItems = totalItems + 1;
    console.log('ProductCard - Updating cart count from', totalItems, 'to', newTotalItems);
    setCartData([...cartProductIds, product.id], newTotalItems, 0); // amount will be updated later

    try {
      await addToCartAPI(product.id, 1, session.accessToken);
      toast({
        title: "Added to Cart",
        description: `${product.name} added to your cart.`,
        className: "bg-green-600 text-white border-none",
      });

      // Refresh cart data from server (will update proper totals + navbar badge)
      resetCartBootstrap();
      await syncCartFromAPI(session.accessToken);
    } catch (error: any) {
      // Rollback optimistic update
      useCartStore.getState().removeProductId(product.id);
      // Rollback totalItems
      setCartData(cartProductIds, totalItems, 0);
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setIsCartPending(false);
    }
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/cart');
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (isWishlistPending) return;

    const wasInWishlist = wishlistIds.includes(product.id);
    setIsWishlistPending(true);

    // Optimistic UI update
    if (wasInWishlist) {
      removeWishlistId(product.id);
    } else {
      addWishlistId(product.id);
    }

    try {
      if (wasInWishlist) {
        await removeFromWishlist(product.id, session.accessToken);
        toast({
          title: "Removed from Wishlist",
          description: "Product removed from your wishlist.",
          className: "bg-orange-600 text-white border-none",
        });
      } else {
        await addToWishlist(product.id, session.accessToken);
        toast({
          title: "Added to Wishlist",
          description: "Product saved for later.",
          className: "bg-primary text-white border-none",
        });
      }
    } catch (error: any) {
      // Roll back optimistic update
      if (wasInWishlist) {
        addWishlistId(product.id);
      } else {
        removeWishlistId(product.id);
      }

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
        description: "Failed to update wishlist. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setIsWishlistPending(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full group">
      <Card className="h-full bg-card border-border overflow-hidden rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted/20 p-4">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
              New Arrival
            </span>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
              Low Stock
            </span>
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
             <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full hover:bg-primary hover:text-white border border-transparent hover:border-primary"
              onClick={handleWishlist}
              disabled={isWishlistPending}
            >
              <Heart className={`h-4 w-4 transition-colors ${inWishlist ? 'fill-current text-red-500 hover:text-red-600' : 'hover:text-primary'}`} />
            </Button>
             <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full hover:bg-primary hover:text-white border border-transparent hover:border-primary"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col gap-2">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">{product.brand}</div>
          <h3 className="font-heading font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground">
            {product.name}
          </h3>
          
          {/* Rating Display */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {renderRatingStars(ratingSummary ? Math.round(ratingSummary.averageRating) : 0)}
            </div>
            <span className="text-xs text-muted-foreground">
              {ratingSummary ? `${ratingSummary.averageRating.toFixed(1)} (${ratingSummary.totalReviews})` : "0.0 (0)"}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-auto">SKU: {product.sku}</div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center gap-3 border-t border-border/50 mt-auto">
          <div className="text-xl font-bold font-heading text-primary shrink-0">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          {inCart ? (
            <Button
              onClick={handleGoToCart}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider rounded-none transition-all duration-300 group-hover:shadow-md"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Go to Cart
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              size="sm"
              disabled={isCartPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider rounded-none transition-all duration-300 group-hover:shadow-md disabled:opacity-50"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isCartPending ? "Adding..." : "Add to Cart"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
