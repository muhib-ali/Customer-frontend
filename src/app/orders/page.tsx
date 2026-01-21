"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Eye, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getMyOrders, type OrderListItem } from "@/services/orders";
import { useCurrency } from "@/contexts/currency-context";

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [convertedOrderTotals, setConvertedOrderTotals] = useState<{ [key: string]: number }>({});
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (!token) {
      router.push("/login?callbackUrl=/orders");
      return;
    }

    setIsLoading(true);
    setIsError(false);

    getMyOrders(token, currentPage, limit)
      .then((res) => {
        setOrders(res?.data?.orders ?? []);
        setPagination(res?.data?.pagination ?? null);
      })
      .catch((e: any) => {
        setIsError(true);
        if (e?.message === 'AUTH_EXPIRED') {
          router.push("/login?callbackUrl=/orders");
          return;
        }
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          className: "bg-red-600 text-white border-none",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [session?.accessToken, currentPage, router, toast]);

  // Convert order totals when currency changes
  useEffect(() => {
    const convertOrderTotals = async () => {
      if (orders.length === 0) return;
      
      const targetCurrency = getCurrencyCode();
      if (targetCurrency === 'USD') {
        setConvertedOrderTotals({});
        return;
      }

      const conversions: { [key: string]: number } = {};
      
      try {
        for (const order of orders) {
          const converted = await convertAmount(Number(order.total_amount || 0), 'USD', targetCurrency);
          conversions[order.id] = converted;
        }
        setConvertedOrderTotals(conversions);
      } catch (error) {
        console.error('Order totals conversion failed:', error);
      }
    };

    convertOrderTotals();
  }, [orders, convertAmount, getCurrencyCode]);

  const getStatusBadge = (status: string) => {
    const styles = {
      accepted: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      delivered: "bg-blue-100 text-blue-800 border-blue-200",
      partially_accepted: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const displayText = status === 'partially_accepted' ? 'Partially Accepted' : status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {displayText}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            My <span className="text-primary">Orders</span>
          </h1>
          <p className="text-muted-foreground mb-8">View and manage your orders</p>

          {isLoading ? (
            <div className="bg-card border border-border p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Loading orders...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          ) : isError || orders.length === 0 ? (
            <div className="bg-card border border-border p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link
                href="/categories"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-heading uppercase mb-1">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.order_type === 'bulk' && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white">
                          BULK
                        </span>
                      )}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Order Total
                      </span>
                      <span className="text-lg font-bold">
                        {getCurrencySymbol()}{(convertedOrderTotals[order.id] || Number(order.total_amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {(order.status === 'accepted' || order.status === 'partially_accepted') && (
                      <Link
                        href={`/orders/${order.id}#reviews`}
                        className="flex-1 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                      >
                        Write Reviews
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col gap-4 items-center justify-between p-6 bg-card border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(pagination.prevPage || 1)}
                      disabled={!pagination.hasPrev}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                            pageNum === pagination.page
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-background hover:bg-accent"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(pagination.nextPage || pagination.totalPages)}
                      disabled={!pagination.hasNext}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
