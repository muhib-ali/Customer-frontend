"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product, useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();
  
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
      className: "bg-green-600 text-white border-none",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      toast({
        title: "Added to Wishlist",
        description: "Product saved for later.",
        className: "bg-primary text-white border-none",
      });
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
