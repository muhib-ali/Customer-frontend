"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useProductDetails, Product, useAddToWishlist, useWishlist, useRemoveFromWishlist } from "@/services/products";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const slug = params.slug as string;
  
  const {
    data: productResponse,
    isLoading,
    isError,
  } = useProductDetails(slug);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlistStore, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();
  const [selectedMedia, setSelectedMedia] = useState<string>("");
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  // Convert API product to store format
  const convertToStoreProduct = (apiProduct: Product) => ({
    id: apiProduct.id,
    sku: apiProduct.sku,
    name: apiProduct.title,
    slug: apiProduct.id,
    price: apiProduct.price,
    image: apiProduct.product_img_url,
    images: [
      apiProduct.product_img_url,
      apiProduct.product_video_url,
    ],
    category: apiProduct.category_id,
    brand: apiProduct.brand_id,
    stock: apiProduct.stock_quantity,
    description: apiProduct.description,
    specs: {
      'Price': `$${apiProduct.price}`,
      'SKU': apiProduct.sku,
      'Stock': apiProduct.stock_quantity.toString(),
      'Weight': `${apiProduct.weight}kg`,
      'Dimensions': `${apiProduct.length} x ${apiProduct.width} x ${apiProduct.height}cm`,
      'Discount': `${apiProduct.discount}%`,
      'Currency': apiProduct.currency,
    },
    fitment: [],
    isNew: true,
    isBestSeller: false,
  });

  // Set initial selected media
  useEffect(() => {
    if (productResponse?.data) {
      const apiProduct = productResponse.data;
      const mediaArray = [apiProduct.product_img_url, apiProduct.product_video_url].filter(Boolean);
      if (mediaArray.length > 0) {
        setSelectedMedia(mediaArray[0]);
      }
    }
  }, [productResponse?.data]);

  const handleMediaClick = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-lg"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded"></div>
              <div className="h-12 bg-muted animate-pulse rounded"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-14 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !productResponse?.data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
          <Button onClick={() => router.push('/categories')}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  const product = convertToStoreProduct(productResponse.data);

  // Check if product is in wishlist (local store for guests, API data for authenticated users)
  const inWishlist = session?.accessToken 
    ? wishlistData?.data?.some(item => item.product_id === product.id)
    : isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      className: "bg-green-600 text-white border-none",
    });
  };

  const handleWishlist = async () => {
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
            description: addToWishlistMutation.data.message || "Product has been added to your wishlist.",
            className: "bg-green-600 text-white border-none",
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-muted/20 border border-border p-8 flex items-center justify-center relative overflow-hidden group">
              {selectedMedia?.endsWith('.mp4') ? (
                <video 
                  src={selectedMedia} 
                  autoPlay 
                  muted 
                  loop 
                  controls
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <img 
                  src={selectedMedia || product.image} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  New Arrival
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((media, i) => (
                <div 
                  key={i} 
                  className={`aspect-square bg-muted/20 border p-2 cursor-pointer transition-colors ${
                    selectedMedia === media 
                      ? 'border-primary' 
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => handleMediaClick(media)}
                >
                  {media.endsWith('.mp4') ? (
                    <video 
                      src={media} 
                      muted 
                      className="w-full h-full object-contain opacity-70 hover:opacity-100"
                    />
                  ) : (
                    <img src={media} alt="Thumbnail" className="w-full h-full object-contain opacity-70 hover:opacity-100" />
                  )}
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
                onClick={handleWishlist}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current text-primary' : ''}`} />
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
