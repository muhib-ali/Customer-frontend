"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAllCategories } from "@/services/categories";
import { getCategoryIcon } from "@/lib/getCategoryIcon";

const PER_PAGE = 9;

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError } = useAllCategories();
  const categories = data?.data?.categories ?? [];

  const totalPages = Math.ceil(categories.length / PER_PAGE) || 1;
  const start = (currentPage - 1) * PER_PAGE;
  const categoriesForPage = categories.slice(start, start + PER_PAGE);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading italic uppercase mb-4">
            Browse All Categories
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore every product category we support. Click any tile to jump directly to the shop filtered
            by that category.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse h-48 rounded-xl bg-card border border-border"
              ></div>
            ))}

          {isError && (
            <div className="col-span-full rounded-xl bg-card border border-border p-6 text-center text-red-500">
              Failed to load categories. Please try again later.
            </div>
          )}

          {!isLoading && !isError && categories.length === 0 && (
            <div className="col-span-full rounded-xl bg-card border border-border p-6 text-center">
              No categories are available right now.
            </div>
          )}

          {!isLoading && !isError && categoriesForPage.map((category) => (
            <Link
              key={category.id}
              href={`/shops?category=${category.id}`}
              className="group relative flex flex-col h-48 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {getCategoryIcon(category.name)}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold uppercase leading-tight">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {category.description || "Description coming soon."}
                </p>
              </div>
              {category.productCount && (
                <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>{category.productCount.toLocaleString()} products</span>
                </div>
              )}
            </Link>
          ))}
        </section>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Still need personalized help? Use the chatbot or contact support via the footer links.
          </p>
        </div>
      </div>
    </Layout>
  );
}
