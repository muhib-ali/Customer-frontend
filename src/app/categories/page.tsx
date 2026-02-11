import Layout from "@/components/Layout";
import Link from "next/link";
import { ArrowRight, Package, Wrench, Gauge, Shield, Zap, Cpu } from "lucide-react";

const categories = [
  {
    name: "Turbochargers",
    slug: "turbochargers",
    description: "High-performance turbo systems for maximum boost and power delivery.",
    icon: <Zap className="h-8 w-8" />,
    featured: true,
    productCount: 124,
  },
  {
    name: "Cooling Systems",
    slug: "cooling",
    description: "Advanced radiators, intercoolers, and cooling solutions for engine reliability.",
    icon: <Shield className="h-8 w-8" />,
    featured: true,
    productCount: 89,
  },
  {
    name: "Brake Kits",
    slug: "brakes",
    description: "Premium brake components for superior stopping power and control.",
    icon: <Package className="h-8 w-8" />,
    featured: true,
    productCount: 67,
  },
  {
    name: "Engine Components",
    slug: "engine",
    description: "Performance engine parts including pistons, cams, and valvetrain upgrades.",
    icon: <Cpu className="h-8 w-8" />,
    featured: false,
    productCount: 156,
  },
  {
    name: "Exhaust Systems",
    slug: "exhaust",
    description: "High-flow exhaust systems for improved performance and sound.",
    icon: <Gauge className="h-8 w-8" />,
    featured: false,
    productCount: 93,
  },
  {
    name: "Suspension",
    slug: "suspension",
    description: "Performance suspension kits for better handling and cornering.",
    icon: <Wrench className="h-8 w-8" />,
    featured: false,
    productCount: 78,
  },
];

export default function CategoriesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading italic uppercase mb-6">
            All Categories
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive selection of high-performance automotive parts. 
            Each category is carefully curated to meet the demands of serious enthusiasts and professional builders.
          </p>
        </div>

        {/* Featured Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold font-heading uppercase mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.filter(cat => cat.featured).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {category.icon}
                    </div>
                    <span className="text-sm text-muted-foreground">{category.productCount} products</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading uppercase mb-3 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Shop Now</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-bold font-heading uppercase mb-8">All Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group flex items-center justify-between p-6 bg-card border border-border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-bold font-heading uppercase group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.productCount} products</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold font-heading uppercase mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            We're constantly expanding our inventory. Contact our team to help you source the perfect performance parts for your build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white hover:text-primary transition-colors"
            >
              Browse Brands
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
