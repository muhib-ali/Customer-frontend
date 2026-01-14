"use client";

import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Instagram, Truck, ShieldCheck, RefreshCw, Headphones, LogOut, Monitor, Package, Shirt, Home as HomeIcon, Smartphone, Laptop, Watch, Camera, Gamepad2, Headphones as HeadphonesIcon, Cpu, Zap, Settings, Wrench, Hammer, Car, Baby, Book, Music, Dumbbell, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Category, useFeaturedCategories } from "@/services/categories";
import { Product, useNewArrivals } from "@/services/products";

function HomeContent() {
  const { user, logout } = useAuth();
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 2);

  const {
    data: featuredCategoriesResponse,
    isLoading: loading,
    isError,
  } = useFeaturedCategories();

  // Convert API product to ProductCard format
  const convertApiProductToCard = (apiProduct: Product) => ({
    id: apiProduct.id,
    sku: apiProduct.sku,
    name: apiProduct.title,
    slug: apiProduct.id, // Use product ID as slug for navigation
    price: apiProduct.price,
    image: apiProduct.product_img_url,
    category: apiProduct.category_id,
    brand: apiProduct.brand_id,
    stock: apiProduct.stock_quantity,
    description: apiProduct.description,
    specs: {},
    fitment: [],
    isNew: true,
    isBestSeller: false,
  });

  const {
    data: newArrivalsResponse,
    isLoading: newArrivalsLoading,
    isError: newArrivalsError,
  } = useNewArrivals();

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
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              New <span className="text-primary">Arrival</span> Products
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivalsLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="w-full h-48 bg-muted animate-pulse rounded-md mb-4"></div>
                  <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-20 mb-4"></div>
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                </div>
              ))
            ) : newArrivalsError ? (
              // Error state
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="w-full h-48 bg-muted/20 rounded-md mb-4 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-20 mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))
            ) : (
              (newArrivalsResponse?.data ?? []).slice(0, 4).map((product: Product) => (
                <ProductCard key={product.sku} product={convertApiProductToCard(product)} />
              ))
            )}
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              Best Of <span className="text-primary">The Day</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bestSellers.map((product) => (
               <div key={product.id} className="flex flex-col sm:flex-row bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="sm:w-1/2 bg-muted/20 p-6 flex items-center justify-center relative">
                     <img src={product.image} alt={product.name} className="max-w-full max-h-[200px] object-contain" />
                     <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 uppercase rounded-sm">Hot</span>
                  </div>
                  <div className="sm:w-1/2 p-6 flex flex-col justify-center">
                     <div className="flex items-center mb-2">
                       {[1,2,3,4,5].map(star => (
                         <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                       ))}
                     </div>
                     <h3 className="text-xl font-bold font-heading uppercase leading-tight mb-2 line-clamp-2">{product.name}</h3>
                     <div className="text-2xl font-bold text-primary mb-4">${product.price.toLocaleString()}</div>
                     <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{product.description}</p>
                     <Link href={`/product/${product.slug}`}>
                       <Button className="w-full rounded-sm font-bold uppercase tracking-wider">Add to Cart</Button>
                     </Link>
                  </div>
               </div>
            ))}
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
