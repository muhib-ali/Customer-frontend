"use client";

import { useParams, useRouter } from "next/navigation";
import { products } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const product = products.find(p => p.slug === slug);
  
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/categories')}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      className: "bg-green-600 text-white border-none",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-muted/20 border border-border p-8 flex items-center justify-center relative overflow-hidden group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  New Arrival
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[product.image, product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="aspect-square bg-muted/20 border border-border p-2 cursor-pointer hover:border-primary transition-colors">
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain opacity-70 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="mb-2">
               <span className="text-primary font-bold uppercase tracking-widest text-sm">{product.brand}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading italic uppercase mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold font-heading text-primary">
                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {product.stock > 0 ? (
                <div className="px-3 py-1 bg-green-900/30 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-900">
                  In Stock ({product.stock})
                </div>
              ) : (
                <div className="px-3 py-1 bg-red-900/30 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-900">
                  Out of Stock
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="flex-1 h-14 rounded-none bg-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider text-lg transition-all"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 rounded-none border-border hover:border-primary hover:text-primary transition-colors"
                onClick={() => addToWishlist(product)}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current text-primary' : ''}`} />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-border/50 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span>Fast Worldwide Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border p-0 h-auto rounded-none gap-8">
            <TabsTrigger 
              value="specs" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent px-0 py-4 font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="fitment" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent px-0 py-4 font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              Fitment
            </TabsTrigger>
             <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent px-0 py-4 font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="specs" className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border p-8 max-w-2xl">
              <h3 className="text-xl font-bold font-heading uppercase mb-6">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 py-3 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground font-medium">{key}</span>
                    <span className="font-mono text-right">{value}</span>
                  </div>
                ))}
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">SKU</span>
                  <span className="font-mono text-right">{product.sku}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fitment" className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-card border border-border p-8 max-w-2xl">
              <h3 className="text-xl font-bold font-heading uppercase mb-6">Vehicle Compatibility</h3>
              <ul className="space-y-2">
                {product.fitment.map((car, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    {car}
                  </li>
                ))}
              </ul>
             </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-card border border-border p-8 max-w-2xl text-center py-16">
               <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
               <Button variant="outline" className="mt-4 rounded-none">Write a Review</Button>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
