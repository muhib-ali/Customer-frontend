"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product, useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { useAddToWishlist, useWishlist, useRemoveFromWishlist } from "@/services/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlistStore, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();
  
  // Check if product is in wishlist (local store for guests, API data for authenticated users)
  const inWishlist = session?.accessToken 
    ? wishlistData?.data?.some(item => item.product_id === product.id)
    : isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
      className: "bg-green-600 text-white border-none",
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (inWishlist) {
      try {
        await removeFromWishlistMutation.mutateAsync(product.id);
        
        // Show success message based on response
        if (removeFromWishlistMutation.data?.status) {
          toast({
            title: "Removed from Wishlist",
            description: removeFromWishlistMutation.data.message || "Product removed from your wishlist.",
            className: "bg-orange-600 text-white border-none",
          });
          
          // Also remove from local store for immediate UI feedback
          removeFromWishlist(product.id);
        }
      } catch (error: any) {
        console.error('Wishlist remove error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          toast({
            title: "Product Not Found",
            description: "This product was not found in your wishlist.",
            className: "bg-yellow-600 text-white border-none",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to remove product from wishlist. Please try again.",
            className: "bg-red-600 text-white border-none",
          });
        }
      }
    } else {
      try {
        await addToWishlistMutation.mutateAsync(product.id);
        
        // Show success message based on response
        if (addToWishlistMutation.data?.status) {
          toast({
            title: "Added to Wishlist",
            description: addToWishlistMutation.data.message || "Product saved for later.",
            className: "bg-primary text-white border-none",
          });
          
          // Also add to local store for immediate UI feedback
          addToWishlistStore(product);
        }
      } catch (error: any) {
        console.error('Wishlist error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 400) {
          toast({
            title: "Already in Wishlist",
            description: "This product is already in your wishlist.",
            className: "bg-yellow-600 text-white border-none",
          });
        } else if (error.response?.status === 404) {
          toast({
            title: "Product Not Found",
            description: "This product could not be found.",
            className: "bg-red-600 text-white border-none",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to add product to wishlist. Please try again.",
            className: "bg-red-600 text-white border-none",
          });
        }
      }
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="block h-full group">
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
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current text-primary' : ''}`} />
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
          <div className="text-xs text-muted-foreground mt-auto">SKU: {product.sku}</div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto">
          <div className="text-xl font-bold font-heading text-primary">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <Button 
            size="sm" 
            className="rounded-md bg-foreground text-background hover:bg-primary hover:text-white transition-colors font-bold uppercase tracking-wider"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
