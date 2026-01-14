"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useProductBySlug } from "@/services/products";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const slug = params.slug as string;
  const { data, isLoading, isError, error } = useProductBySlug(slug);
  const product = data?.data;
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  const imageUrls = useMemo(() => {
    const urls: string[] = [];

    if (product?.images?.length) {
      for (const img of product.images) {
        if (img?.url) urls.push(img.url);
      }
    }

    if (urls.length === 0 && product?.product_img_url) {
      urls.push(product.product_img_url);
    }

    return urls;
  }, [product]);

  const mainImage = activeImage || imageUrls[0] || "";

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Loading product...</h1>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">Failed to load product</h1>
          <p className="text-muted-foreground mb-6">{(error as any)?.message || "Something went wrong"}</p>
          <Button onClick={() => router.push('/categories')}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/categories')}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // Existing cart store expects the mock Product shape.
    // Keeping current behavior for now until cart types are fully migrated.
    addToCart(product as any);
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
      className: "bg-green-600 text-white border-none",
    });
  };

  const handleWishlist = () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    addToWishlist(product as any);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-muted/20 border border-border p-8 flex items-center justify-center relative overflow-hidden group">
              <img 
                src={mainImage} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {imageUrls.map((img, i) => {
                const isActive = (activeImage || imageUrls[0]) === img;
                return (
                  <div
                    key={`${img}-${i}`}
                    className={`aspect-square bg-muted/20 border p-2 cursor-pointer transition-colors ${isActive ? 'border-primary' : 'border-border hover:border-primary'}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt="Thumbnail" className={`w-full h-full object-contain ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="mb-2">
               <span className="text-primary font-bold uppercase tracking-widest text-sm">{product.brand?.name || ""}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading italic uppercase mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold font-heading text-primary">
                ${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {product.stock_quantity > 0 ? (
                <div className="px-3 py-1 bg-green-900/30 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-900">
                  In Stock ({product.stock_quantity})
                </div>
              ) : (
                <div className="px-3 py-1 bg-red-900/30 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-900">
                  Out of Stock
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-8 text-muted-foreground">
              <p>{product.description || ""}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="flex-1 h-14 rounded-none bg-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider text-lg transition-all"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 rounded-none border-border hover:border-primary hover:text-primary transition-colors"
                onClick={handleWishlist}
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
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">SKU</span>
                  <span className="font-mono text-right">{product.sku}</span>
                </div>
                <div className="grid grid-cols-2 py-3 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground font-medium">Stock</span>
                  <span className="font-mono text-right">{product.stock_quantity}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fitment" className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-card border border-border p-8 max-w-2xl">
              <h3 className="text-xl font-bold font-heading uppercase mb-6">Vehicle Compatibility</h3>
              <p className="text-muted-foreground">Fitment information is not available for this product yet.</p>
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
