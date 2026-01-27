"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useBrands } from "@/services/brands";
import RingLoader from "@/components/ui/ring-loader";

export default function Brands() {
  const { data, isLoading, isError, error } = useBrands();
  const brands = Array.isArray(data) ? data : [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
          Performance <span className="text-primary">Brands</span>
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We only stock the most trusted names in the automotive performance industry.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4">
              <RingLoader size="md" />
            </div>
            <p className="text-muted-foreground">Loading brands...</p>
          </div>
        ) : isError ? (
          <div className="text-red-500">{(error as any)?.message || "Failed to load brands"}</div>
        ) : null}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/shops?brand=${brand.name}`}>
                <Card className="h-full bg-card border-border hover:border-primary transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center gap-4">
                    <div className="w-full flex-grow flex items-center justify-center">
                      <div className="text-3xl font-bold font-heading uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand.name}
                      </div>
                    </div>
                    <div className="flex items-center text-primary font-bold uppercase text-sm tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      View Products <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
