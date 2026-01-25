"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { getAllBlogs, BlogItem } from "@/services/blogs";

export default function Blog() {
  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogs();
        if (response.success) {
          setPosts(response.data.blogs);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          Latest <span className="text-primary">News</span>
        </h1>

        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">Loading blogs...</div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <div className="text-destructive">Error: {error}</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">No blogs found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post.id} className="group bg-card border border-border hover:border-primary transition-colors flex flex-col h-full">
                <div className="aspect-video overflow-hidden">
                  <Image 
                    src={post.blog_img || "/assets/image_1765226772040.png"} 
                    alt={post.heading} 
                    width={400}
                    height={225}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/image_1765226772040.png";
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
                    {new Date(post.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <h3 className="text-xl font-bold font-heading uppercase group-hover:text-primary transition-colors mb-3">
                    {post.heading}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">
                    {post.paragraph.substring(0, 150)}...
                  </p>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="link" className="p-0 h-auto hover:text-primary justify-start uppercase font-bold tracking-wider">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
