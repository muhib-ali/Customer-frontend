"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect, useRef, useLayoutEffect, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/useCartStore";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist";
import { bootstrapWishlistOnce, resetWishlistBootstrap } from "@/services/wishlist/bootstrap";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useProductById } from "@/services/products";
import { useProductReviews, useProductReviewSummary, useMyReviews, type Review, myReviewsQueryKey } from "@/services/reviews";
import { Star } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const id = params.slug as string;
  const { data, isLoading, isError, error } = useProductById(id);
  const product = data?.data;
  const descriptionText = product?.description ?? "";
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useProductReviews(product?.id);
  const { data: summary, isLoading: summaryLoading } = useProductReviewSummary(product?.id);
  const { data: myReviews = [], isLoading: myReviewsLoading, error: myReviewsError } = useMyReviews(session?.accessToken);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  
  // Check if user has already reviewed this product
  const hasUserReviewed = product?.id && (Array.isArray(myReviews) ? myReviews : []).some((review: any) => review.productId === product.id);
  
  const { canAddRegularItems, setCartType, syncCartFromAPI, addProductId, setCartData } = useCartStore();
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
        console.error('Product price conversion failed:', error);
        setConvertedPrice(null);
      }
    };

    convertProductPrice();
  }, [product?.price, convertAmount, getCurrencyCode]);

  useLayoutEffect(() => {
    setIsDescriptionExpanded(false);
    const el = descriptionRef.current;
    if (!el) {
      setShouldShowReadMore(false);
      return;
    }

    const measureOverflow = () => {
      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight) || 0;
      if (!lineHeight) {
        setShouldShowReadMore(el.scrollHeight > el.clientHeight + 1);
        return;
      }

      const totalLines = Math.round(el.scrollHeight / lineHeight);
      setShouldShowReadMore(totalLines > 2);
    };

    const frame = requestAnimationFrame(measureOverflow);
    const observer = new ResizeObserver(() => requestAnimationFrame(measureOverflow));
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [descriptionText]);

  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const setWishlistIds = useWishlistStore((s) => s.setWishlistIds);
  const addWishlistId = useWishlistStore((s) => s.addWishlistId);
  const removeWishlistId = useWishlistStore((s) => s.removeWishlistId);
  const inWishlist = product?.id ? wishlistIds.includes(product.id) : false;

  const renderStars = (rating: number, size = 4) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-${size} h-${size} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingBar = (count: number, total: number, stars: number) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm w-8">{stars}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm w-8 text-right">{count}</span>
      </div>
    );
  };

  const descriptionBaseStyle: CSSProperties = {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  const descriptionClampStyle: CSSProperties = {
    ...descriptionBaseStyle,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const descriptionStyle = isDescriptionExpanded ? descriptionBaseStyle : descriptionClampStyle;

  const handleDescriptionToggle = () => {
    setIsDescriptionExpanded((prev) => !prev);
  };

  const mediaUrls = useMemo(() => {
    const urls: Array<{url: string, type: 'image' | 'video'}> = [];

    const normalize = (u: string) => u.trim();
    const seen = new Set<string>();

    // Always show featured image first (default)
    if (product?.product_img_url) {
      const u = normalize(product.product_img_url);
      if (!seen.has(u)) {
        urls.push({ url: u, type: 'image' });
        seen.add(u);
      }
    }

    // Add video if exists
    if (product?.product_video_url) {
      const u = normalize(product.product_video_url);
      if (!seen.has(u)) {
        urls.push({ url: u, type: 'video' });
        seen.add(u);
      }
    }

    // Add gallery images (excluding featured duplicates)
    if (product?.images?.length) {
      for (const img of product.images) {
        if (img?.url) {
          const u = normalize(img.url);
          if (!seen.has(u)) {
            urls.push({ url: u, type: 'image' });
            seen.add(u);
          }
        }
      }
    }

    return urls;
  }, [product]);

  const imageUrls = mediaUrls.filter(m => m.type === 'image').map(m => m.url);
  const mainMedia = activeImage || mediaUrls[0]?.url || "";
  const mainMediaType = mediaUrls.find(m => m.url === mainMedia)?.type || 'image';

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

  const handleAddToCart = async () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // Always fetch the latest cart directly for conflict detection (not throttled)
    try {
      const { getCart } = await import('@/services/cart');
      const cartRes = await getCart(session.accessToken as string);
      const items = cartRes?.data?.items || [];

      console.log('Product page - Cart items for conflict check:', items);

      const hasBulk = items.some((i: any) => i.type === 'bulk' || i.cart_type === 'bulk');
      const hasRegular = items.some((i: any) => (!i.type && !i.cart_type) || i.type === 'regular' || i.cart_type === 'regular');

      console.log('Product page - Conflict check:', { hasBulk, hasRegular, itemCount: items.length });

      // If cart has bulk items already, block regular add + show toast
      if (hasBulk && !hasRegular && items.length > 0) {
        console.log('Product page - Blocking regular add due to bulk items in cart');
        toast({
          title: "Cart Conflict",
          description: "Cannot add regular items because your cart already has bulk items. Please clear your cart first.",
          variant: "destructive",
        });
        return;
      }
    } catch (e: any) {
      console.error('Product page - Cart fetch failed:', e);
      // If cart fetch fails, fall back to store state (best effort)
      await syncCartFromAPI(session.accessToken);
      if (!canAddRegularItems()) {
        toast({
          title: "Cart Conflict",
          description: "Cannot add regular items to bulk cart. Please clear your bulk cart first.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Import cart service
      const { addToCart: addToCartService } = await import('@/services/cart');
      
      // Optimistic update for instant UI (Go to cart)
      addProductId(product.id);
      // Also update navbar badge immediately
      const optimistic = useCartStore.getState();
      setCartData(optimistic.cartProductIds, optimistic.totalItems + 1, optimistic.totalAmount);

      // Add to cart via API
      await addToCartService(product.id, 1, session.accessToken);

      // Refresh cart from API after adding item
      await syncCartFromAPI(session.accessToken);

      // Set cart type to regular
      setCartType('regular');

      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart.`,
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to add to cart',
        variant: "destructive",
      });
    }
  };

  const handleWishlist = async () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (!product?.id) return;

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

      // Sync store with backend truth and invalidate the cached bootstrap response.
      resetWishlistBootstrap();
      const items = await bootstrapWishlistOnce(session.accessToken);
      const ids = items.map((i) => i.product?.id || i.product_id).filter(Boolean) as string[];
      setWishlistIds(ids);
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col gap-2">
            <div className="relative h-[360px] sm:h-[420px] lg:h-[460px] border border-border bg-muted/10 overflow-hidden group">
              {mainMediaType === 'video' ? (
                <video
                  src={mainMedia}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                  poster={imageUrls[0] || ''}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={mainMedia} 
                  alt={product.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {mediaUrls.map((media, i) => {
                const isActive = (activeImage || mediaUrls[0]?.url) === media.url;
                return (
                  <div
                    key={`${media.url}-${i}`}
                    className={`aspect-square border transition-colors overflow-hidden ${isActive ? 'border-primary' : 'border-border hover:border-primary'}`}
                    onClick={() => setActiveImage(media.url)}
                  >
                    {media.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imageUrls[0] || ''} 
                          alt="Video thumbnail" 
                          className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={media.url} 
                        alt="Thumbnail" 
                        className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} 
                      />
                    )}
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
                {getCurrencySymbol()}{(convertedPrice || Number(product.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {product.discount && Number(product.discount) > 0 && (
                <div className="px-3 py-1 bg-red-900/30 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-900">
                  {product.discount}% OFF
                </div>
              )}
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

            <div className="mb-8 w-full text-muted-foreground">
              <div className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                Description
              </div>
              <p
                ref={descriptionRef}
                className="text-base leading-relaxed whitespace-normal"
                style={descriptionStyle}
              >
                {descriptionText}
              </p>
              {shouldShowReadMore && (
                <button
                  type="button"
                  onClick={handleDescriptionToggle}
                  className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary"
                >
                  <span>{isDescriptionExpanded ? "See Less" : "See More"}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
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
                disabled={isWishlistPending}
              >
                <Heart className={`h-5 w-5 transition-colors ${inWishlist ? 'fill-current text-red-500 hover:text-red-600' : 'hover:text-primary'}`} />
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
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Stock</span>
                  <span className="font-mono text-right">{product.stock_quantity}</span>
                </div>
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Weight</span>
                  <span className="font-mono text-right">{product.weight} kg</span>
                </div>
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Dimensions</span>
                  <span className="font-mono text-right">{product.length} × {product.width} × {product.height} cm</span>
                </div>
                <div className="grid grid-cols-2 py-3 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Currency</span>
                  <span className="font-mono text-right">{product.currency}</span>
                </div>
                {product.variants && product.variants.length > 0 && (
                  <div className="grid grid-cols-2 py-3 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground font-medium">Variants</span>
                    <span className="font-mono text-right">{product.variants.map(v => v.value).join(', ')}</span>
                  </div>
                )}
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
            <div className="max-w-4xl">
              {/* Debug Info */}
              <div className="bg-yellow-100 text-yellow-800 p-4 mb-4 rounded">
                <p>Product ID: {product?.id}</p>
                <p>Loading: {reviewsLoading ? 'Yes' : 'No'}</p>
                <p>Reviews Count: {reviews?.length || 0}</p>
                <p>Error: {reviewsError ? (reviewsError as any)?.message : 'None'}</p>
                <p>My Reviews Count: {myReviews?.length || 0}</p>
                <p>My Reviews Loading: {myReviewsLoading ? 'Yes' : 'No'}</p>
                <p>My Reviews Error: {myReviewsError ? (myReviewsError as any)?.message : 'None'}</p>
                <p>Has User Reviewed: {hasUserReviewed ? 'Yes' : 'No'}</p>
                <p>User Logged In: {session?.accessToken ? 'Yes' : 'No'}</p>
                <p>Token: {session?.accessToken ? 'Present' : 'Missing'}</p>
                {myReviews && Array.isArray(myReviews) && myReviews.map((review: any, idx) => (
                  <p key={idx} className="text-xs">My Review {idx+1}: {review.productId} - {review.comment}</p>
                ))}
              </div>
              
              {/* Summary Section */}
              <div className="bg-card border border-border p-8 mb-8">
                <h3 className="text-xl font-bold font-heading uppercase mb-6">Customer Reviews</h3>
                {summaryLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
                ) : summary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Average Rating */}
                    <div className="text-center">
                      <div className="text-5xl font-bold font-heading text-primary">
                        {summary.averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center gap-1 my-2">
                        {renderStars(Math.round(summary.averageRating))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <div key={stars}>
                          {renderRatingBar(summary.ratingBreakdown[stars.toString()] || 0, summary.totalReviews, stars)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No reviews yet.</div>
                )}
              </div>

              {/* Reviews List */}
              <div className="bg-card border border-border p-8">
                <h4 className="text-lg font-bold font-heading uppercase mb-6">Reviews</h4>
                {reviewsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold">
                              {review.userId === session?.user?.id ? 'You' : review.customerName}
                            </div>
                            <div className="flex gap-1 my-1">
                              {renderStars(review.rating, 3)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {review.isVerifiedPurchase && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mb-2">
                            Verified Purchase
                          </div>
                        )}
                        <p className="text-sm text-foreground mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {hasUserReviewed ? (
                      <div>
                        <p className="mb-4">You have already reviewed this product.</p>
                        <p className="text-sm">Thank you for your feedback!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">No reviews yet. Be the first to review this product!</p>
                        {session?.accessToken && (
                          <Button 
                            variant="outline" 
                            className="mt-2 rounded-none"
                            onClick={() => router.push(`/orders`)}
                          >
                            Write a Review
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
