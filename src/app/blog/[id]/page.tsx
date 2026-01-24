"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getBlogById, BlogItem } from "@/services/blogs";

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const response = await getBlogById(postId);
        if (response.success) {
          setPost(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [postId]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-muted-foreground">Loading blog post...</div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading uppercase mb-4">
            Post <span className="text-primary">Not Found</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {error || "The blog post you're looking for doesn't exist."}
          </p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const excerpt =
    post.paragraph
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) || "";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <article>
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-start">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted/30 shadow-lg">
              <Image
                src={post.blog_img || "/assets/image_1765226772040.png"}
                alt={post.heading}
                width={1000}
                height={750}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/image_1765226772040.png";
                }}
              />
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <Clock className="h-4 w-4" />
                  5 min read
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading italic uppercase text-foreground leading-tight">
                  {post.heading}
                </h1>
              </div>
              <div
                className="prose prose-lg max-w-none text-muted-foreground
                  prose-headings:font-heading prose-headings:uppercase prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-primary
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-foreground
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.paragraph.replace(/\n/g, "<br />") }}
              />
              <div className="border-t border-border pt-6 flex justify-end">
                <Link href="/blog">
                  <Button size="sm" className="h-8 text-xs font-bold uppercase rounded-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    All Posts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
}
