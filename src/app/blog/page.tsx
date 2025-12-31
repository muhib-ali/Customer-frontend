"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "Maximizing Boost: A Guide to Turbo Sizing",
      excerpt: "Choosing the right turbocharger for your engine displacement and power goals is crucial. Here is how to read compressor maps...",
      image: "/assets/generated_images/car_engine_bay_instagram_shot.png",
      date: "Oct 15, 2025",
      slug: "turbo-sizing-guide"
    },
    {
      id: 2,
      title: "Track Day Preparation Checklist",
      excerpt: "Don't hit the circuit without checking these 10 critical items on your car. From brake fluid to tire pressures...",
      image: "/assets/generated_images/racing_car_on_track_instagram_shot.png",
      date: "Oct 10, 2025",
      slug: "track-day-checklist"
    },
    {
      id: 3,
      title: "The Benefits of Titanium Exhaust Systems",
      excerpt: "Why is titanium becoming the gold standard for performance exhausts? We breakdown the weight savings and sound characteristics...",
      image: "/assets/generated_images/mechanic_working_instagram_shot.png",
      date: "Sep 28, 2025",
      slug: "titanium-exhaust-benefits"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          Latest <span className="text-primary">News</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="group bg-card border border-border hover:border-primary transition-colors flex flex-col h-full">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  onError={(e) => {
                    e.currentTarget.src = "/assets/image_1765226772040.png";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">{post.date}</div>
                <h3 className="text-xl font-bold font-heading uppercase group-hover:text-primary transition-colors mb-3">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow">
                  {post.excerpt}
                </p>
                <Button variant="link" className="p-0 h-auto hover:text-primary justify-start uppercase font-bold tracking-wider">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
