"use client";

import { useState } from "react";
import { Star, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

// Static mock data - will be replaced with API calls
const mockReviews: Review[] = [
  {
    id: "rev-001",
    rating: 5,
    comment: "Excellent product! The quality is outstanding and it arrived quickly. Highly recommended for anyone looking for a reliable option.",
    customerName: "John Doe",
    isVerifiedPurchase: true,
    createdAt: "2024-01-15T10:30:00.000Z",
  },
  {
    id: "rev-002",
    rating: 4,
    comment: "Very good product overall. The build quality is solid and it works as expected. Only minor issue is the packaging could be better.",
    customerName: "Jane Smith",
    isVerifiedPurchase: true,
    createdAt: "2024-01-12T14:20:00.000Z",
  },
  {
    id: "rev-003",
    rating: 5,
    comment: "Amazing! Exceeded my expectations. Worth every penny. The customer service was also excellent.",
    customerName: "Mike Johnson",
    isVerifiedPurchase: true,
    createdAt: "2024-01-10T09:15:00.000Z",
  },
];

const mockSummary = {
  averageRating: 4.7,
  totalReviews: 150,
  ratingBreakdown: {
    "5": 100,
    "4": 30,
    "3": 15,
    "2": 3,
    "1": 2,
  },
};

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>(mockReviews);
  const [summary] = useState(mockSummary);

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count: number) => {
    return ((count / summary.totalReviews) * 100).toFixed(0);
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold font-heading italic uppercase mb-6">
        Customer <span className="text-primary">Reviews</span>
      </h2>

      {/* Rating Summary */}
      <div className="bg-card border border-border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold mb-2">{summary.averageRating}</div>
            {renderStars(Math.round(summary.averageRating), "lg")}
            <p className="text-muted-foreground mt-2">
              Based on {summary.totalReviews} reviews
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-semibold w-8">{rating} ★</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{
                      width: `${getRatingPercentage(
                        summary.ratingBreakdown[rating.toString() as keyof typeof summary.ratingBreakdown]
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {summary.ratingBreakdown[rating.toString() as keyof typeof summary.ratingBreakdown]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">
              Be the first to review this product
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{review.customerName}</h4>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button (for future pagination) */}
      {reviews.length > 0 && reviews.length < summary.totalReviews && (
        <div className="text-center mt-8">
          <button className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
