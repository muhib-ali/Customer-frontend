"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSubcategoriesByCategory, useCategoryById } from "@/services/categories";
import RingLoader from "@/components/ui/ring-loader";

export default function CategorySubcategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = typeof params?.categoryId === "string" ? params.categoryId : null;

  const { data: categoryData, isLoading: categoryLoading } = useCategoryById(categoryId);
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useSubcategoriesByCategory(categoryId);

  const categoryName = categoryData?.data?.name ?? "Category";
  const subcategories = subcategoriesData?.data?.subcategories ?? [];

  useEffect(() => {
    if (!categoryId || subcategoriesLoading) return;
    if (subcategories.length === 0) {
      router.replace(`/shops?category=${categoryId}`);
    }
  }, [categoryId, subcategories.length, subcategoriesLoading, router]);

  const isLoading = categoryLoading || subcategoriesLoading;
  const shouldShowSubcategories = !isLoading && subcategories.length > 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <RingLoader size="md" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!shouldShowSubcategories) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p>Redirecting to shop...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/categories" className="hover:text-primary">
              Categories
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{categoryName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading italic uppercase">
            {categoryName} <span className="text-primary">Subcategories</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Choose a subcategory to browse products in the shop.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/shops?category=${categoryId}&subcategory=${sub.id}`}
              className="group relative flex flex-col h-40 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-heading font-bold uppercase text-primary">
                  {sub.name}
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              {sub.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                  {sub.description}
                </p>
              )}
            </Link>
          ))}
        </section>
      </div>
    </Layout>
  );
}
