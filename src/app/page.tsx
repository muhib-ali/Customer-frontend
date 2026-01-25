"use client";

import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Instagram, Truck, ShieldCheck, RefreshCw, Headphones, LogOut, Monitor, Package, Shirt, Home as HomeIcon, Smartphone, Laptop, Watch, Camera, Gamepad2, Headphones as HeadphonesIcon, Cpu, Zap, Settings, Wrench, Hammer, Car, Baby, Book, Music, Dumbbell, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Category, useFeaturedCategories } from "@/services/categories";
import { useNewArrivals } from "@/services/products/new-arrivals";
import { useBestProducts } from "@/services/best-products";
import { useCurrency } from "@/contexts/currency-context";
import { useState, useEffect } from "react";

function HomeContent() {
  const { user, logout } = useAuth();
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const [convertedBestPrices, setConvertedBestPrices] = useState<{ [key: string]: number }>({});

  const {
    data: featuredCategoriesResponse,
    isLoading: loading,
    isError,
  } = useFeaturedCategories();

  const {
    data: newArrivalsResponse,
    isLoading: newArrivalsLoading,
    isError: newArrivalsError,
  } = useNewArrivals();

  const {
    data: bestProductsResponse,
    isLoading: bestProductsLoading,
    isError: bestProductsError,
  } = useBestProducts();

  const newArrivals = newArrivalsResponse?.data?.slice(0, 4) || [];

  // Convert best products prices when currency changes
  useEffect(() => {
    const convertBestProductsPrices = async () => {
      if (!bestProductsResponse?.data) return;
      
      const targetCurrency = getCurrencyCode();
      if (targetCurrency === 'USD') {
        setConvertedBestPrices({});
        return;
      }

      const conversions: { [key: string]: number } = {};
      
      try {
        for (const product of bestProductsResponse.data.slice(0, 2)) {
          const converted = await convertAmount(Number(product.price), 'USD', targetCurrency);
          conversions[product.id] = converted;
        }
        setConvertedBestPrices(conversions);
      } catch (error) {
        console.error('Best products price conversion failed:', error);
      }
    };

    convertBestProductsPrices();
  }, [bestProductsResponse, convertAmount, getCurrencyCode]);

  // Dynamic icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    // Comprehensive icon mapping
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      // Electronics
      'electronics': Monitor,
      'phones': Smartphone,
      'smartphones': Smartphone,
      'laptops': Laptop,
      'computers': Monitor,
      'cameras': Camera,
      'watches': Watch,
      'gaming': Gamepad2,
      'headphones': HeadphonesIcon,
      'audio': HeadphonesIcon,
      'cpu': Cpu,
      'computer': Monitor,
      
      // Fashion & Clothing
      'fashion': Shirt,
      'clothing': Shirt,
      'shirts': Shirt,
      'apparel': Shirt,
      'wearables': Watch,
      'accessories': Package,
      'jewelry': Package,
      'bags': Package,
      
      // Home & Garden
      'home': HomeIcon,
      'furniture': HomeIcon,
      'garden': HomeIcon,
      'kitchen': HomeIcon,
      'decor': HomeIcon,
      'appliances': Zap,
      
      // Sports & Fitness
      'sports': Dumbbell,
      'fitness': Dumbbell,
      'gym': Dumbbell,
      'exercise': Dumbbell,
      'outdoor': Car,
      
      // Tools & Hardware
      'tools': Hammer,
      'hardware': Wrench,
      'diy': Hammer,
      'repair': Wrench,
      
      // Baby & Kids
      'baby': Baby,
      'kids': Baby,
      'toys': Gamepad2,
      
      // Books & Media
      'books': Book,
      'media': Book,
      'education': Book,
      'music': Music,
      'entertainment': Gamepad2,
      
      // Food & Beverage
      'food': Coffee,
      'coffee': Coffee,
      'beverage': Coffee,
      'drinks': Coffee,
      
      // General fallbacks
      'general': Package,
      'miscellaneous': Package,
      'other': Package,
      'default': Package,
    };
    
    // Try exact match first
    if (iconMap[name]) {
      const IconComponent = iconMap[name];
      return <IconComponent className="h-8 w-8 text-primary" />;
    }
    
    // Try partial match (contains)
    for (const [key, IconComponent] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return <IconComponent className="h-8 w-8 text-primary" />;
      }
    }
    
    // Fallback to Package icon
    return <Package className="h-8 w-8 text-primary" />;
  };

  return (
    <Layout>
      <div className="flex flex-col gap-16 pb-16 bg-background">
        {/* User Info Bar */}
        {user && (
          <div className="bg-primary text-primary-foreground p-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <div>
                <span className="font-semibold">Welcome, {user.fullname}!</span>
                <span className="ml-4 text-sm opacity-90">{user.email}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}

        <Hero />

        <section className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-card border border-border shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 border-r border-border/50 last:border-0 pr-4">
               <div className="bg-primary/10 p-3 rounded-full text-primary">
                 <Truck className="h-6 w-6" />
               </div>
               <div>
                 <h4 className="font-bold text-sm uppercase">Free Shipping</h4>
                 <p className="text-xs text-muted-foreground">On all orders over $299</p>
               </div>
            </div>
            <div className="flex items-center gap-4 border-r border-border/50 last:border-0 pr-4">
               <div className="bg-primary/10 p-3 rounded-full text-primary">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <div>
                 <h4 className="font-bold text-sm uppercase">Trusted 100%</h4>
                 <p className="text-xs text-muted-foreground">Genuine parts warranty</p>
               </div>
            </div>
            <div className="flex items-center gap-4 border-r border-border/50 last:border-0 pr-4">
               <div className="bg-primary/10 p-3 rounded-full text-primary">
                 <RefreshCw className="h-6 w-6" />
               </div>
               <div>
                 <h4 className="font-bold text-sm uppercase">30-Day Returns</h4>
                 <p className="text-xs text-muted-foreground">Hassle-free exchanges</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-primary/10 p-3 rounded-full text-primary">
                 <Headphones className="h-6 w-6" />
               </div>
               <div>
                 <h4 className="font-bold text-sm uppercase">Support 24/7</h4>
                 <p className="text-xs text-muted-foreground">Expert technical help</p>
               </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              Featured <span className="text-primary">Categories</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 p-4 bg-card border border-border rounded-lg">
                  <div className="w-24 h-24 bg-muted animate-pulse rounded-md"></div>
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                    </div>
                    <div className="h-8 bg-muted animate-pulse rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : isError ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 p-4 bg-card border border-border rounded-lg">
                  <div className="w-24 h-24 bg-muted/20 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex flex-col justify-between items-start flex-grow">
                    <div>
                      <h3 className="font-bold font-heading uppercase text-lg leading-tight mb-1">Category</h3>
                      <span className="text-xs text-muted-foreground">0 Products</span>
                    </div>
                    <Button size="sm" disabled className="h-8 text-xs font-bold uppercase rounded-sm bg-primary text-white hover:bg-primary/90">
                      Shop Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              (featuredCategoriesResponse?.data ?? []).map((cat: Category) => (
                <div key={cat.id} className="flex gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-300 group cursor-pointer">
                   <div className="w-24 h-24 bg-muted/20 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                     <div className="transition-transform duration-300 group-hover:scale-110">
                       {getCategoryIcon(cat.name)}
                     </div>
                   </div>
                   <div className="flex flex-col justify-between items-start flex-grow">
                     <div>
                       <h3 className="font-bold font-heading uppercase text-lg leading-tight mb-1 group-hover:text-primary transition-colors duration-300">{cat.name}</h3>
                       <span className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">{cat.productCount} Products</span>
                     </div>
                     <Link href={`/category/${cat.id}`}>
                       <Button size="sm" className="h-8 text-xs font-bold uppercase rounded-sm bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300">
                         Shop Now
                       </Button>
                     </Link>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Link href="/categories" className="group relative overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-[16/7]">
                <img
                  src="/assets/generated_images/car_engine_bay_instagram_shot.png"
                  alt="Mercedes Benz"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/image_1765226772040.png";
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                  <div className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Car Accessories</div>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading italic uppercase text-white leading-tight">
                    Mercedes
                    <br />
                    Benz
                  </h3>
                  <p className="text-sm text-white/80 mt-2 max-w-sm">
                    Premium aftermarket parts for European luxury performance.
                  </p>
                  <div className="mt-5">
                    <Button className="h-9 px-4 rounded-sm font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/categories" className="group relative overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-[16/7]">
                <img
                  src="/assets/generated_images/racing_car_on_track_instagram_shot.png"
                  alt="Custom Forged"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/image_1765226772040.png";
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/50 to-black/80" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center items-start lg:items-end text-left lg:text-right">
                  <div className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Racing Parts</div>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading italic uppercase text-white leading-tight">
                    Custom
                    <br />
                    Forged
                  </h3>
                  <p className="text-sm text-white/80 mt-2 max-w-sm">
                    Lightweight racing wheels designed for the track.
                  </p>
                  <div className="mt-5">
                    <Button className="h-9 px-4 rounded-sm font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              New <span className="text-primary">Arrival</span> Products
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          
          {newArrivalsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="w-full h-48 bg-muted animate-pulse rounded-md mb-4"></div>
                  <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-20 mb-4"></div>
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : newArrivalsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load new arrivals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.title,
                    slug: product.id, // Using id as slug since slug field doesn't exist in database
                    image: product.images?.[0]?.url || product.product_img_url || '',
                    price: Number(product.price),
                    stock: product.stock_quantity,
                    description: product.description || '',
                    category: product.category?.name || '',
                    brand: product.brand?.name || '',
                    isNew: true,
                    isBestSeller: false,
                    sku: product.sku,
                    specs: {},
                    fitment: []
                  }} 
                />
              ))}
            </div>
          )}
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              Best Of <span className="text-primary">The Day</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          
          {bestProductsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row bg-card border border-border rounded-lg overflow-hidden">
                  <div className="sm:w-1/2 bg-muted/20 p-6 flex items-center justify-center">
                    <div className="w-full h-48 bg-muted animate-pulse rounded-md"></div>
                  </div>
                  <div className="sm:w-1/2 p-6 flex flex-col justify-center">
                    <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-8 bg-muted animate-pulse rounded mb-4"></div>
                    <div className="h-4 bg-muted animate-pulse rounded mb-6"></div>
                    <div className="h-10 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bestProductsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load best products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(bestProductsResponse?.data?.slice(0, 2) || []).map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="sm:w-1/2 bg-muted/20 p-6 flex items-center justify-center relative">
                    <img 
                      src={product.images?.[0]?.url || product.product_img_url || ''} 
                      alt={product.title} 
                      className="max-w-full max-h-[200px] object-contain" 
                    />
                    {product.isHot && (
                      <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 uppercase rounded-sm">Hot</span>
                    )}
                  </div>
                  <div className="sm:w-1/2 p-6 flex flex-col justify-center">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < product.avgRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <h3 className="text-xl font-bold font-heading uppercase leading-tight mb-2 line-clamp-2">{product.title}</h3>
                    <div className="text-2xl font-bold text-primary mb-4">
                      {getCurrencySymbol()}{(convertedBestPrices[product.id] || Number(product.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{product.description}</p>
                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full rounded-sm font-bold uppercase tracking-wider">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="w-full">
          <div className="container mx-auto px-4">
            <Link href="/categories" className="group block overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative h-[180px] sm:h-[220px] md:h-[260px]">
                <img
                  src="/assets/generated_images/racing_car_on_track_instagram_shot.png"
                  alt="Built for Speed"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/image_1765226772040.png";
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/55" />

                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div className="w-full px-6 sm:px-10">
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading italic uppercase text-white leading-tight">
                        Built For <span className="text-primary">Speed</span>
                      </h3>
                      <p className="text-sm sm:text-base text-white/80 mt-2">
                        We supply the highest quality performance parts for serious enthusiasts and professional racing teams.
                      </p>
                      <div className="mt-6 flex justify-center">
                        <Button className="h-10 px-6 rounded-sm font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90">
                          Upgrade Your Build
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="w-full">
          <div className="container mx-auto px-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-10 flex flex-col justify-center bg-background">
                  <div className="text-primary text-xs font-bold uppercase tracking-wider mb-3">
                    100% Genuine Parts
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold font-heading italic uppercase text-foreground leading-tight">
                    Anytime &amp;
                    <br />
                    Anywhere <span className="text-primary">You Are.</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-md">
                    Global shipping network ensuring you get your parts when you need them. Track your build from our warehouse to your garage.
                  </p>
                  <div className="mt-6">
                    <Link href="/orders">
                      <Button className="h-10 px-6 rounded-sm font-bold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90">
                        Track Your Order
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[220px] lg:min-h-[340px] bg-muted/30">
                  <img
                    src="/assets/generated_images/car_engine_bay_instagram_shot.png"
                    alt="Performance parts"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/image_1765226772040.png";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/categories" className="group relative overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative aspect-[16/7]">
                  <img
                    src="/assets/generated_images/mechanic_working_instagram_shot.png"
                    alt="Expert Tuning"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/image_1765226772040.png";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="text-white font-bold font-heading uppercase tracking-wide">
                      Expert <span className="text-primary">Tuning</span>
                    </div>
                    <div className="text-primary text-xs font-bold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/categories" className="group relative overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative aspect-[16/7]">
                  <img
                    src="/assets/generated_images/car_engine_bay_instagram_shot.png"
                    alt="Engine Builds"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/image_1765226772040.png";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="text-white font-bold font-heading uppercase tracking-wide">
                      Engine <span className="text-primary">Builds</span>
                    </div>
                    <div className="text-primary text-xs font-bold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/categories" className="group relative overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative aspect-[16/7]">
                  <img
                    src="/assets/generated_images/racing_car_on_track_instagram_shot.png"
                    alt="Dyno Testing"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/image_1765226772040.png";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="text-white font-bold font-heading uppercase tracking-wide">
                      Dyno <span className="text-primary">Testing</span>
                    </div>
                    <div className="text-primary text-xs font-bold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                      Read More <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="container mx-auto px-4">
            <div className="bg-background border-y border-border py-6">
              <div className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Shop By Brands
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <span className="hover:text-foreground transition-colors">Garrett</span>
                <span className="hover:text-foreground transition-colors">BorgWarner</span>
                <span className="hover:text-foreground transition-colors">Precision Turbo</span>
                <span className="hover:text-foreground transition-colors">HKS</span>
                <span className="hover:text-foreground transition-colors">Greddy</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center mb-10">
              <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
                From Our <span className="text-primary">Blogs</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/blog/1" className="group block">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-[16/9]">
                    <img
                      src="/assets/generated_images/car_engine_bay_instagram_shot.png"
                      alt="Turbo Sizing Guide"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/image_1765226772040.png";
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                      Oct 15
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold font-heading uppercase">Turbo Sizing Guide</div>
                    <div className="mt-2 text-primary text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/blog/2" className="group block">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-[16/9]">
                    <img
                      src="/assets/generated_images/racing_car_on_track_instagram_shot.png"
                      alt="Track Day Prep"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/image_1765226772040.png";
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                      Oct 12
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold font-heading uppercase">Track Day Prep</div>
                    <div className="mt-2 text-primary text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/blog/3" className="group block">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-[16/9]">
                    <img
                      src="/assets/generated_images/mechanic_working_instagram_shot.png"
                      alt="Titanium Exhausts"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/image_1765226772040.png";
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                      Oct 08
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold font-heading uppercase">Titanium Exhausts</div>
                    <div className="mt-2 text-primary text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/blog">
                <Button variant="outline" className="rounded-sm font-bold uppercase tracking-wider">
                  View All Blogs
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <HomeContent />
  );
}
