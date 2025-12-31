import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products, categories, brands } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Instagram, Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import Layout from "@/components/Layout";
import Image from "next/image";

export default function Home() {
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 2);

  return (
    <Layout>
      <div className="flex flex-col gap-16 pb-16 bg-background">
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
            {categories.slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-lg transition-all group">
                 <div className="w-24 h-24 bg-muted/20 rounded-md overflow-hidden flex-shrink-0">
                   <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                 </div>
                 <div className="flex flex-col justify-between items-start flex-grow">
                   <div>
                     <h3 className="font-bold font-heading uppercase text-lg leading-tight mb-1">{cat.name}</h3>
                     <span className="text-xs text-muted-foreground">50+ Products</span>
                   </div>
                   <Link href={`/category/${cat.slug}`}>
                     <Button size="sm" className="h-8 text-xs font-bold uppercase rounded-sm bg-primary text-white hover:bg-primary/90">
                       Shop Now
                     </Button>
                   </Link>
                 </div>
              </div>
            ))}
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
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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

        {/* Dual Banners */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[300px] rounded-lg overflow-hidden group">
              <img src="/assets/generated_images/mercedes_benz_car_dark_banner.png" alt="Car and Truck" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-8">
                <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Car and Truck</h4>
                <h2 className="text-white text-3xl font-bold font-heading italic uppercase mb-4 max-w-[200px]">Mercedes Benz</h2>
                <p className="text-gray-300 text-sm mb-6 max-w-[250px]">Premium aftermarket parts for European luxury performance.</p>
                <Link href="/categories">
                  <Button className="w-fit bg-primary text-white hover:bg-white hover:text-black rounded-sm font-bold uppercase tracking-wider">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] rounded-lg overflow-hidden group">
              <img src="/assets/generated_images/custom_forged_wheel_banner.png" alt="Platform Custom Forged" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-8">
                <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Platform 50%</h4>
                <h2 className="text-white text-3xl font-bold font-heading italic uppercase mb-4 max-w-[200px]">Custom Forged</h2>
                <p className="text-gray-300 text-sm mb-6 max-w-[250px]">Lightweight racing wheels designed for the track.</p>
                <Link href="/categories">
                  <Button className="w-fit bg-primary text-white hover:bg-white hover:text-black rounded-sm font-bold uppercase tracking-wider">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Built For Speed */}
        <section className="relative h-[400px] bg-fixed bg-cover bg-center my-8" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center items-center text-center gap-6">
            <h2 className="text-4xl md:text-6xl font-bold font-heading italic uppercase text-white leading-none">
              Built For <span className="text-primary">Speed</span>
            </h2>
            <p className="text-gray-300 max-w-2xl text-lg">
              We supply the highest quality performance parts for serious enthusiasts and professional racing teams.
            </p>
            <Link href="/categories">
              <Button size="lg" className="rounded-none bg-primary text-white hover:bg-white hover:text-black border-2 border-primary hover:border-white text-lg px-8 py-6 font-bold uppercase tracking-wider transition-all">
                Upgrade Your Build
              </Button>
            </Link>
          </div>
        </section>

        {/* Promo Banner (Anytime & Anywhere) */}
        <section className="container mx-auto px-4">
          <div className="relative rounded-xl overflow-hidden bg-background border border-border shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex flex-col justify-center relative z-10 bg-white/5 backdrop-blur-sm lg:bg-transparent">
                 <h4 className="text-primary font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-8 h-[2px] bg-primary"></span> 100% Genuine Parts
                 </h4>
                 <h2 className="text-4xl md:text-5xl font-bold font-heading italic uppercase text-foreground mb-6 leading-tight">
                   Anytime & <br/>Anywhere <span className="text-primary">You Are.</span>
                 </h2>
                 <p className="text-muted-foreground text-lg mb-8 max-w-md">
                   Global shipping network ensuring you get your parts when you need them. Track your build from our warehouse to your garage.
                 </p>
                 <Link href="/order-tracking">
                   <Button size="lg" className="w-fit bg-foreground text-background hover:bg-primary hover:text-white rounded-sm font-bold uppercase tracking-wider">
                     Track Your Order
                   </Button>
                 </Link>
              </div>
              <div className="relative min-h-[400px]">
                 <div className="absolute inset-0 bg-primary skew-x-12 translate-x-20 z-0 hidden lg:block"></div>
                 <img src="/assets/generated_images/automotive_parts_composition.png" alt="Performance Parts" className="absolute inset-0 w-full h-full object-cover object-center z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Extra Section (3 Dark Banners) */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="relative h-[250px] rounded-lg overflow-hidden group">
                <img src="/assets/generated_images/dark_workshop_parts_banner.png" alt="Workshop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 flex items-end p-6">
                   <div>
                     <h3 className="text-white font-bold font-heading text-xl uppercase mb-1">Expert Tuning</h3>
                     <Link href="/blog">
                       <span className="text-primary text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer transition-colors flex items-center">
                         Read More <ArrowRight className="ml-1 w-3 h-3" />
                       </span>
                     </Link>
                   </div>
                </div>
             </div>
             <div className="relative h-[250px] rounded-lg overflow-hidden group">
                <img src="/assets/generated_images/engine_assembly_banner.png" alt="Engine Build" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 flex items-end p-6">
                   <div>
                     <h3 className="text-white font-bold font-heading text-xl uppercase mb-1">Engine Builds</h3>
                     <Link href="/blog">
                       <span className="text-primary text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer transition-colors flex items-center">
                         View Guide <ArrowRight className="ml-1 w-3 h-3" />
                       </span>
                     </Link>
                   </div>
                </div>
             </div>
             <div className="relative h-[250px] rounded-lg overflow-hidden group">
                <img src="/assets/generated_images/dyno_testing_banner.png" alt="Dyno Testing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 flex items-end p-6">
                   <div>
                     <h3 className="text-white font-bold font-heading text-xl uppercase mb-1">Dyno Testing</h3>
                     <Link href="/blog">
                       <span className="text-primary text-xs font-bold uppercase tracking-wider hover:text-white cursor-pointer transition-colors flex items-center">
                         Learn More <ArrowRight className="ml-1 w-3 h-3" />
                       </span>
                     </Link>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 bg-muted/30 border-y border-border">
           <div className="flex flex-col items-center mb-6">
              <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Shop By Brands</h4>
           </div>
           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {brands.map(brand => (
                <div key={brand.id} className="text-xl font-bold font-heading text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {brand.name.toUpperCase()}
                </div>
              ))}
           </div>
        </section>

        {/* Blog/News */}
         <section className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-10">
            <h2 className="text-3xl font-bold font-heading italic uppercase text-foreground relative inline-block">
              From Our <span className="text-primary">Blogs</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></div>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               {title: "Turbo Sizing Guide", image: "/assets/generated_images/car_engine_bay_instagram_shot.png", date: "Oct 15"},
               {title: "Track Day Prep", image: "/assets/generated_images/racing_car_on_track_instagram_shot.png", date: "Oct 12"},
               {title: "Titanium Exhausts", image: "/assets/generated_images/mechanic_working_instagram_shot.png", date: "Oct 08"}
             ].map((post, i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="aspect-video overflow-hidden rounded-lg mb-4 relative">
                   <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-sm">{post.date}</div>
                 </div>
                 <h3 className="text-lg font-bold font-heading uppercase text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                 <Link href="/blog">
                   <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1 mt-2">Read Article <ArrowRight className="w-3 h-3"/></span>
                 </Link>
               </div>
             ))}
          </div>
         </section>

      </div>
    </Layout>
  );
}
