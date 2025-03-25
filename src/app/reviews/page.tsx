"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardTitleHeader } from "@/components/ui/card";
import { StarFilledIcon } from "@radix-ui/react-icons";

interface Review {
  id: string;
  rating: number;
  comment: string;
  orderId: string;
  createdAt: Date;
  order: {
    product: {
      name: string;
      imagePath: string;
      price: number;
    };
    quantity: number;
    user: {
      name: string;
    };
  };
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "read" | "deleted">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    // Add more filter logic if needed
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">

      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Reviews</h1>
      </CardTitleHeader>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No reviews found</div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex gap-6">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <Image
                    src={review.order.product.imagePath}
                    alt={review.order.product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">{review.order.product.name}</h2>
                      <div className="flex gap-8 mb-4">
                        <div>
                          <div className="text-gray-600 text-sm">Price</div>
                          <div className="font-semibold">₱{review.order.product.price}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Quantity</div>
                          <div className="font-semibold">{review.order.quantity}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Order ID: {review.orderId} | Customer: {review.order.user.name}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-gray-600 text-sm">Item Rating</div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarFilledIcon
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating ? "text-yellow-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-4 text-right">
                        <div className="text-gray-600 text-sm mb-1">Comments:</div>
                        <p className="text-gray-800">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}