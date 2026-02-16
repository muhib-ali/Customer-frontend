"use client";

import { useState, useEffect, useMemo, useRef, type CSSProperties, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useProducts, useBrands, useCategories, type ProductFilters, type Brand, type Category } from "@/services/products";
import { useSubcategoriesByCategory, type SubcategoryItem } from "@/services/categories";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import RingLoader from "@/components/ui/ring-loader";

function ShopsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || 'all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 5000
  ]);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('stock') === 'in');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC'
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Debounced filters state
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilters>({
    page: currentPage,
    limit: 6,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    stock: inStockOnly ? 'in' : 'all',
    search: searchQuery || undefined,
    sortBy: sortBy as 'price' | 'created_at' | 'title' | 'stock_quantity',
    sortOrder,
  });

  const [isUpdatingFilters, setIsUpdatingFilters] = useState(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Debounce effect - wait 3 seconds after user stops changing filters
  useEffect(() => {
    setIsUpdatingFilters(true);
    const timer = setTimeout(() => {
      setDebouncedFilters({
        page: currentPage,
        limit: 6,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        stock: inStockOnly ? 'in' : 'all',
        search: searchQuery || undefined,
        sortBy: sortBy as 'price' | 'created_at' | 'title' | 'stock_quantity',
        sortOrder,
      });
      setIsUpdatingFilters(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      setIsUpdatingFilters(false);
    };
  }, [currentPage, selectedCategory, selectedSubcategory, selectedBrands, priceRange, inStockOnly, searchQuery, sortBy, sortOrder]);

  const { data: productsData, isLoading: productsLoading, isError: productsError } = useProducts(debouncedFilters);
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: subcategoriesData } = useSubcategoriesByCategory(
    selectedCategory && selectedCategory !== 'all' ? selectedCategory : null
  );
  const subcategories: SubcategoryItem[] = subcategoriesData?.data?.subcategories ?? [];

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination;
  const brands = useMemo((): Brand[] => {
    const d = brandsData?.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && Array.isArray((d as any).brands)) return (d as any).brands;
    return [];
  }, [brandsData]);
  const categories = useMemo((): Category[] => {
    const d = categoriesData?.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && Array.isArray((d as any).categories)) return (d as any).categories;
    return [];
  }, [categoriesData]);

  // Pre-select brands from URL (?brand=Name1 or ?brand=Name1,Name2) once brands are loaded
  const brandParamSynced = useRef(false);
  useEffect(() => {
    if (brands.length === 0 || brandParamSynced.current) return;
    const brandParam = searchParams.get('brand');
    if (!brandParam) return;
    const parts = brandParam.split(',').map((n) => n.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const ids = parts.flatMap((part) => {
      const byName = brands.find((b: Brand) => b.name.toLowerCase() === part.toLowerCase());
      if (byName) return [byName.id];
      const byId = brands.find((b: Brand) => b.id === part);
      if (byId) return [byId.id];
      return [];
    });
    if (ids.length > 0) {
      setSelectedBrands(ids);
      brandParamSynced.current = true;
    }
  }, [brands, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedSubcategory !== 'all') params.set('subcategory', selectedSubcategory);
    if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','));
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString());
    if (inStockOnly) params.set('stock', 'in');
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'created_at') params.set('sortBy', sortBy);
    if (sortOrder !== 'DESC') params.set('sortOrder', sortOrder);

    const queryString = params.toString();
    router.replace(`/shops${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [currentPage, selectedCategory, selectedSubcategory, selectedBrands, priceRange, inStockOnly, searchQuery, sortBy, sortOrder, router]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order as 'ASC' | 'DESC');
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all');
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            All <span className="text-primary">Products</span>
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-primary">All Products</span>
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
            <div className="relative flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full border-border bg-background hover:bg-muted"
                onClick={() => {
                  categoriesScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous categories</span>
              </Button>
              <div
                ref={categoriesScrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-thin"
              >
                <TabsList className="inline-flex w-max min-w-full justify-start gap-0 rounded-lg border border-border bg-muted/50 p-1">
                  <TabsTrigger value="all" className="px-6 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    All Categories
                  </TabsTrigger>
                  {categoriesLoading ? (
                    <span className="inline-flex items-center justify-center px-6 py-2 text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : (
                    categories.map((cat: Category) => (
                      <TabsTrigger key={cat.id} value={cat.id} className="px-6 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        {cat.name}
                      </TabsTrigger>
                    ))
                  )}
                </TabsList>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full border-border bg-background hover:bg-muted"
                onClick={() => {
                  categoriesScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
                }}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next categories</span>
              </Button>
            </div>
          </Tabs>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-card border border-border p-4 space-y-6">
              <h3 className="font-bold font-heading uppercase tracking-wider border-b border-border pb-2">
                Filters
              </h3>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Search</h4>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Category</h4>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full bg-background border-border rounded-none">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      categories.map((cat: Category) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Subcategory</h4>
                <Select
                  value={selectedSubcategory}
                  onValueChange={handleSubcategoryChange}
                  disabled={!selectedCategory || selectedCategory === 'all'}
                >
                  <SelectTrigger className="w-full bg-background border-border rounded-none">
                    <SelectValue placeholder={selectedCategory && selectedCategory !== 'all' ? 'All Subcategories' : 'Select category first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map((sub: SubcategoryItem) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Price Range</h4>
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    setCurrentPage(1);
                  }}
                  className="my-4"
                />
                <div className="flex items-center justify-between text-sm font-mono">
                  <span>kr {priceRange[0]}</span>
                  <span>kr {priceRange[1]}+</span>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Brands</h4>
                {brandsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading brands...</p>
                ) : brands.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {brands.map((brand: Brand) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`brand-${brand.id}`} 
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={() => toggleBrand(brand.id)}
                          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label 
                          htmlFor={`brand-${brand.id}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No brands available</p>
                )}
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">Availability</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="in-stock" 
                    checked={inStockOnly}
                    onCheckedChange={(checked) => {
                      setInStockOnly(checked as boolean);
                      setCurrentPage(1);
                    }}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor="in-stock" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6 bg-secondary/50 p-2 border border-border">
              <span className="text-sm text-muted-foreground ml-2">
                {isUpdatingFilters ? (
                  <span className="text-orange-500">Updating filters...</span>
                ) : productsLoading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing <span className="font-bold">{products.length}</span> of{' '}
                    <span className="font-bold">{pagination?.total || 0}</span> results
                  </>
                )}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-background border-border rounded-none h-8">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-DESC">Newest First</SelectItem>
                    <SelectItem value="created_at-ASC">Oldest First</SelectItem>
                    <SelectItem value="price-ASC">Price: Low to High</SelectItem>
                    <SelectItem value="price-DESC">Price: High to Low</SelectItem>
                    <SelectItem value="title-ASC">Name: A to Z</SelectItem>
                    <SelectItem value="title-DESC">Name: Z to A</SelectItem>
                    <SelectItem value="stock_quantity-DESC">Stock: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {productsLoading || isUpdatingFilters ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <div className="mx-auto mb-4">
                    <RingLoader size="md" />
                    
                  </div>
                  {/* <p className="text-muted-foreground ">Loading products...</p> */}
                </div>
              </div>
            ) : productsError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border">
                <h3 className="text-xl font-bold mb-2 text-destructive">Error loading products</h3>
                <p className="text-muted-foreground">Please try again later.</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={{
                      id: product.id,
                      name: product.title,
                      price: parseFloat(product.price),
                      image: product.product_img_url || '',
                      category: product.category?.name || '',
                      brand: product.brand?.name || '',
                      rating: 0,
                      stock: product.stock_quantity,
                      isNew: false,
                      isBestSeller: false,
                      discount: parseFloat(product.discount || '0'),
                      sku: product.sku || '',
                      slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      description: product.description || '',
                      specs: {},
                      fitment: []
                    }} />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
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
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border">
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ShopsPageLoading() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            All <span className="text-primary">Products</span>
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-primary">All Products</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4">
              <RingLoader size="md" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<ShopsPageLoading />}>
      <ShopsPageContent />
    </Suspense>
  );
}
