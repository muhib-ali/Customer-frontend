"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { getOrderById, type OrderDetail } from "@/services/orders";
import { useCreateReview, useMyReviews } from "@/services/reviews";
import { useCurrency } from "@/contexts/currency-context";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [convertedPrices, setConvertedPrices] = useState<{ [key: string]: number }>({});
  const [convertedTotals, setConvertedTotals] = useState<{ subtotal: number; discount: number; total: number } | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({ isOpen: false, productId: "", productName: "" });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const token = session?.accessToken as string | undefined;
  const createReviewMutation = useCreateReview(token || '');
  const { data: myReviews = [] } = useMyReviews(token);

  useEffect(() => {
    if (!token) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`);
      return;
    }

    setIsLoading(true);
    getOrderById(orderId, token)
      .then((res) => {
        setOrder(res?.data ?? null);
      })
      .catch((e: any) => {
        if (e?.message === 'AUTH_EXPIRED') {
          router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`);
          return;
        }
        toast({
          title: "Error",
          description: "Failed to load order details.",
          className: "bg-red-600 text-white border-none",
        });
        setOrder(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId, router, session?.accessToken, toast]);

  // Convert order prices when currency changes
  useEffect(() => {
    const convertOrderPrices = async () => {
      if (!order) return;
      
      const targetCurrency = getCurrencyCode();
      if (targetCurrency === 'USD') {
        setConvertedPrices({});
        setConvertedTotals(null);
        return;
      }

      const conversions: { [key: string]: number } = {};
      
      try {
        // Convert individual item prices
        for (const item of order.order_items || []) {
          const unitPrice = Number(item.unit_price || 0);
          const converted = await convertAmount(unitPrice, 'USD', targetCurrency);
          conversions[item.id] = converted;
        }
        
        // Calculate totals for conversion
        const subtotalFromItems = (order.order_items || []).reduce((sum, item) => {
          return sum + (Number(item.total_price || 0) || 0);
        }, 0);

        const subtotalAmount = Number((order as any).subtotal_amount ?? 0) || 0;
        const totalAmount = Number((order as any).total_amount ?? 0) || 0;
        const discountAmount = Number((order as any).discount_amount ?? 0) || 0;

        const displaySubtotal = subtotalAmount > 0 ? subtotalAmount : subtotalFromItems;
        const displayDiscount = discountAmount > 0 ? discountAmount : Math.max(0, displaySubtotal - totalAmount);
        
        // Convert totals
        const convertedSubtotal = await convertAmount(displaySubtotal, 'USD', targetCurrency);
        const convertedDiscount = await convertAmount(displayDiscount, 'USD', targetCurrency);
        const convertedTotal = await convertAmount(totalAmount, 'USD', targetCurrency);
        
        setConvertedPrices(conversions);
        setConvertedTotals({
          subtotal: convertedSubtotal,
          discount: convertedDiscount,
          total: convertedTotal
        });
      } catch (error) {
        console.error('Order price conversion failed:', error);
      }
    };

    convertOrderPrices();
  }, [order, convertAmount, getCurrencyCode]);

  if (isLoading) {
    return null;
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/orders" className="text-primary hover:underline">
              ← Back to Orders
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const subtotalFromItems = (order.order_items || []).reduce((sum, item) => {
    return sum + (Number(item.total_price || 0) || 0);
  }, 0);

  const subtotalAmount = Number((order as any).subtotal_amount ?? 0) || 0;
  const totalAmount = Number((order as any).total_amount ?? 0) || 0;
  const discountAmount = Number((order as any).discount_amount ?? 0) || 0;

  const displaySubtotal = subtotalAmount > 0 ? subtotalAmount : subtotalFromItems;
  const displayDiscount = discountAmount > 0 ? discountAmount : Math.max(0, displaySubtotal - totalAmount);

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

  const openReviewModal = (productId: string, productName: string) => {
    // Check if user has already reviewed this product
    const hasReviewed = (Array.isArray(myReviews) ? myReviews : []).some((review: any) => review.productId === productId);
    if (hasReviewed) {
      toast({
        title: "Already Reviewed",
        description: "You have already reviewed this product.",
        className: "bg-orange-600 text-white border-none",
      });
      return;
    }
    
    setReviewModal({ isOpen: true, productId, productName });
    setReviewForm({ rating: 5, comment: "" });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, productId: "", productName: "" });
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`);
      return;
    }

    try {
      const created = await createReviewMutation.mutateAsync({
        productId: reviewModal.productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      toast({
        title: "Review Submitted",
        description: created?.status
          ? `Your review is ${created.status} and will be visible after approval.`
          : "Your review has been submitted.",
        className: "bg-green-600 text-white border-none",
      });

      closeReviewModal();
    } catch (e: any) {
      if (e?.message === 'AUTH_EXPIRED') {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`);
        return;
      }

      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Link href="/orders" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
                Order <span className="text-primary">#{order.order_number}</span>
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {(order as any).order_type === 'bulk' && (
                <div className="mt-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white">
                    BULK ORDER
                  </span>
                </div>
              )}
            </div>
            {getStatusBadge(order.status)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Customer Info */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-bold font-heading uppercase mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {order.first_name} {order.last_name}</p>
                <p><span className="text-muted-foreground">Email:</span> {order.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-bold font-heading uppercase mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm">
                <p>{order.address}</p>
                <p>{order.city}, {order.state} {order.zip_code}</p>
                <p>{order.country}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-bold font-heading uppercase mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{getCurrencySymbol()}{(convertedTotals?.subtotal || displaySubtotal || 0).toFixed(2)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="text-green-600">-{getCurrencySymbol()}{(convertedTotals?.discount || displayDiscount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{getCurrencySymbol()}{(convertedTotals?.total || totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border p-6" id="reviews">
            <h3 className="font-bold font-heading uppercase mb-6 text-xl">Order Items</h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold mb-1">{item.product_name}</h4>
                      {(order as any).order_type === 'bulk' && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          (item as any).item_status === 'accepted'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : (item as any).item_status === 'rejected'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {String((item as any).item_status || 'pending')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold mt-1">{getCurrencySymbol()}{(convertedPrices[item.id] || Number(item.unit_price || 0)).toFixed(2)}</p>

                    {(order as any).order_type === 'bulk' && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Requested</div>
                          <div className="font-semibold">
                            {getCurrencySymbol()}{(convertedPrices[item.id] || Number((item as any).requested_price_per_unit ?? 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Offered</div>
                          <div className="font-semibold">
                            {getCurrencySymbol()}{(convertedPrices[item.id] || Number((item as any).offered_price_per_unit ?? 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Min Qty</div>
                          <div className="font-semibold">
                            {Number((item as any).bulk_min_quantity ?? 0) || '-'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {((order.status === 'accepted') || (order.status === 'partially_accepted' && (item as any).item_status === 'accepted')) && !(Array.isArray(myReviews) ? myReviews : []).some((review: any) => review.productId === item.product_id) && (
                    <button
                      onClick={() => openReviewModal(item.product_id, item.product_name)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Write Review
                    </button>
                  )}
                  {((order.status === 'accepted') || (order.status === 'partially_accepted' && (item as any).item_status === 'accepted')) && (Array.isArray(myReviews) ? myReviews : []).some((review: any) => review.productId === item.product_id) && (
                    <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Reviewed
                    </div>
                  )}
                  {order.status === 'partially_accepted' && (item as any).item_status !== 'accepted' && (
                    <div className="text-sm text-muted-foreground italic">
                      Review not available for this item
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold font-heading uppercase mb-4">
              Write <span className="text-primary">Review</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{reviewModal.productName}</p>

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full border border-border rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share your experience with this product (minimum 10 characters)..."
                  required
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reviewForm.comment.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  disabled={createReviewMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={createReviewMutation.isPending || reviewForm.comment.length < 10}
                >
                  {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Your review will be visible after admin approval
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
