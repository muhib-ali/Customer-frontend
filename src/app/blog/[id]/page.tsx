"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

// Static blog data
const blogPosts = {
  "1": {
    id: 1,
    title: "Maximizing Boost: A Guide to Turbo Sizing",
    date: "Oct 15, 2025",
    readTime: "8 min read",
    image: "/assets/generated_images/car_engine_bay_instagram_shot.png",
    content: `
      <h2>Understanding Turbocharger Basics</h2>
      <p>Choosing the right turbocharger for your engine displacement and power goals is crucial. Here is how to read compressor maps and select the perfect turbo for your build.</p>
      
      <h2>Engine Displacement Matters</h2>
      <p>The first step in turbo sizing is understanding your engine's displacement. A 2.0L four-cylinder will have very different requirements compared to a 5.0L V8. Generally, you want to match the turbo's flow capacity to your engine's ability to consume air.</p>
      
      <h2>Reading Compressor Maps</h2>
      <p>Compressor maps are essential tools that show the efficiency islands of a turbocharger. The horizontal axis represents airflow (CFM or lb/min), while the vertical axis shows pressure ratio. Your goal is to keep your operating range within the highest efficiency islands (typically 70-76% efficiency).</p>
      
      <h2>Power Goals and Turbo Selection</h2>
      <p>For street applications targeting 400-500 horsepower on a 2.0L engine, a turbo in the GT3076R range often works well. For higher power goals (600+ hp), you'll need to step up to larger turbos like the GTX3582R or similar.</p>
      
      <h2>Spool vs Peak Power Trade-off</h2>
      <p>Remember, larger turbos make more peak power but sacrifice low-end response. Smaller turbos spool quickly but run out of breath at high RPM. Choose based on your driving style and application.</p>
      
      <h2>Professional Tuning is Essential</h2>
      <p>Once you've selected and installed your turbo, professional tuning is non-negotiable. A proper tune ensures you're running safely within your engine's limits while maximizing performance.</p>
    `
  },
  "2": {
    id: 2,
    title: "Track Day Preparation Checklist",
    date: "Oct 10, 2025",
    readTime: "6 min read",
    image: "/assets/generated_images/racing_car_on_track_instagram_shot.png",
    content: `
      <h2>Pre-Track Day Inspection</h2>
      <p>Don't hit the circuit without checking these 10 critical items on your car. From brake fluid to tire pressures, proper preparation ensures both safety and performance.</p>
      
      <h2>1. Brake System Check</h2>
      <p>Inspect brake pads for at least 50% life remaining. Check brake fluid condition - it should be clear, not dark. Consider bleeding the system with high-temp fluid (DOT 4 or DOT 5.1) if you haven't done so recently.</p>
      
      <h2>2. Tire Condition and Pressure</h2>
      <p>Check tire tread depth and look for any cuts or bulges. Start with street pressures and adjust based on tire temperatures during the day. Most track tires perform best at 32-36 PSI hot.</p>
      
      <h2>3. Fluid Levels</h2>
      <p>Top off engine oil, coolant, and brake fluid. Consider running slightly more oil than usual to account for high-G cornering. Check for any leaks before heading out.</p>
      
      <h2>4. Wheel Bearing and Suspension</h2>
      <p>Jack up each corner and check for play in wheel bearings. Inspect suspension components for wear or damage. Tighten all lug nuts to proper torque specs.</p>
      
      <h2>5. Safety Equipment</h2>
      <p>Ensure your helmet is Snell-rated and within certification date. Bring a fire extinguisher, first aid kit, and basic tools. Check that your seatbelts are in good condition.</p>
      
      <h2>6. Remove Loose Items</h2>
      <p>Clear everything from the interior that could become a projectile. This includes floor mats, phone holders, and anything in door pockets or the trunk.</p>
      
      <h2>7. Check Battery and Electrical</h2>
      <p>Ensure battery terminals are tight and corrosion-free. Test all lights and signals. Consider securing the battery with additional hold-downs.</p>
      
      <h2>8. Cooling System</h2>
      <p>Inspect radiator hoses and clamps. Make sure your cooling system is in top shape - track days are hard on cooling systems, especially in summer.</p>
    `
  },
  "3": {
    id: 3,
    title: "The Benefits of Titanium Exhaust Systems",
    date: "Sep 28, 2025",
    readTime: "7 min read",
    image: "/assets/generated_images/mechanic_working_instagram_shot.png",
    content: `
      <h2>Why Titanium?</h2>
      <p>Why is titanium becoming the gold standard for performance exhausts? We breakdown the weight savings and sound characteristics that make titanium exhaust systems worth the investment.</p>
      
      <h2>Exceptional Weight Savings</h2>
      <p>Titanium is approximately 45% lighter than stainless steel while maintaining similar strength. On a full exhaust system, this can mean 20-40 pounds of weight reduction - significant for any performance application.</p>
      
      <h2>Corrosion Resistance</h2>
      <p>Titanium naturally forms a protective oxide layer that makes it highly resistant to corrosion. Unlike stainless steel, titanium won't rust even in harsh environments with road salt and moisture.</p>
      
      <h2>Heat Management</h2>
      <p>Titanium has lower thermal conductivity than steel, meaning it keeps exhaust gases hotter for longer. This improves exhaust gas velocity and scavenging, potentially adding a few horsepower.</p>
      
      <h2>The Signature Sound</h2>
      <p>Titanium exhausts produce a distinctive, higher-pitched tone compared to steel. The sound is often described as more exotic and race-inspired. The material's acoustic properties create unique harmonics that enthusiasts love.</p>
      
      <h2>Durability Under Extreme Conditions</h2>
      <p>Titanium maintains its strength at high temperatures better than steel. This makes it ideal for turbocharged applications where exhaust temperatures can exceed 1600°F.</p>
      
      <h2>Visual Appeal</h2>
      <p>The natural blue and gold heat discoloration that develops on titanium is highly sought after. Many manufacturers offer different tip finishes, from brushed to polished to burnt titanium.</p>
      
      <h2>Investment Considerations</h2>
      <p>Yes, titanium exhausts are expensive - often 2-3x the cost of stainless steel. However, for serious enthusiasts and racers, the weight savings, durability, and performance benefits justify the premium price.</p>
      
      <h2>Installation Tips</h2>
      <p>Titanium requires special care during installation. Use anti-seize on all fasteners and avoid over-tightening. Consider professional installation to protect your investment.</p>
    `
  }
};

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const post = blogPosts[postId as keyof typeof blogPosts];

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading uppercase mb-4">
            Post <span className="text-primary">Not Found</span>
          </h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-heading italic uppercase mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8 bg-muted/30">
            <img
              src={post.image}
              alt={post.title}
              onError={(e) => {
                e.currentTarget.src = "/assets/image_1765226772040.png";
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-heading prose-headings:uppercase prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-primary
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share/Navigation Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link href="/blog">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Posts
                </Button>
              </Link>
              
              <div className="text-sm text-muted-foreground">
                Share this article
              </div>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
}
