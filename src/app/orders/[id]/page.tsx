"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, Star } from "lucide-react";
import Layout from "@/components/Layout";

// Static mock data - will be replaced with API calls
const mockOrderDetails = {
  "ord-001": {
    id: "ord-001",
    orderNumber: "KSR-9928",
    date: "2024-01-15",
    status: "accepted",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
    },
    shipping: {
      address: "123 Main Street, Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    items: [
      { 
        id: "prod-001", 
        productId: "123e4567-e89b-12d3-a456-426614174000",
        name: "Premium Wireless Headphones", 
        quantity: 1, 
        price: 299.99,
        image: "/placeholder-product.jpg"
      },
      { 
        id: "prod-002", 
        productId: "123e4567-e89b-12d3-a456-426614174001",
        name: "Smart Watch Pro", 
        quantity: 1, 
        price: 599.99,
        image: "/placeholder-product.jpg"
      },
      { 
        id: "prod-003", 
        productId: "123e4567-e89b-12d3-a456-426614174002",
        name: "USB-C Cable 2m", 
        quantity: 2, 
        price: 200.01,
        image: "/placeholder-product.jpg"
      },
    ],
    subtotal: 1099.99,
    discount: 0,
    total: 1299.99,
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = mockOrderDetails[orderId as keyof typeof mockOrderDetails];

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({ isOpen: false, productId: "", productName: "" });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);

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

  const getStatusBadge = (status: string) => {
    const styles = {
      accepted: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      delivered: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const openReviewModal = (productId: string, productName: string) => {
    setReviewModal({ isOpen: true, productId, productName });
    setReviewForm({ rating: 5, comment: "" });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, productId: "", productName: "" });
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Replace with actual API call
    // const response = await fetch('/api/reviews', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     productId: reviewModal.productId,
    //     rating: reviewForm.rating,
    //     comment: reviewForm.comment,
    //   }),
    // });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert(`Review submitted for ${reviewModal.productName}!\n\nRating: ${reviewForm.rating} stars\nComment: ${reviewForm.comment}\n\nYour review is pending admin approval.`);
    
    setSubmitting(false);
    closeReviewModal();
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
                Order <span className="text-primary">#{order.orderNumber}</span>
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
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
                <p><span className="text-muted-foreground">Name:</span> {order.customer.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {order.customer.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {order.customer.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border p-6">
              <h3 className="font-bold font-heading uppercase mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm">
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}</p>
                <p>{order.shipping.country}</p>
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
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>${order.discount.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border p-6" id="reviews">
            <h3 className="font-bold font-heading uppercase mb-6 text-xl">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => openReviewModal(item.productId, item.name)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Write Review
                    </button>
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
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting || reviewForm.comment.length < 10}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
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
