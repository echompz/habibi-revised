'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StarIcon } from '@radix-ui/react-icons'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface GroupedOrderProps {
  order: {
    id: string;
    items: OrderItem[];
    seller: string;
    totalPrice: number;
    status: string;
    orderDate: string;
    shippingId: string;
    orderGroupId: string;
    address: string;
  };
}

export default function GroupedOrderCard({ order }: GroupedOrderProps) {
  const { items, seller, totalPrice, status, orderDate, shippingId, orderGroupId, address } = order;
  const [expanded, setExpanded] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitReview = async () => {
    if (!selectedItem) return;
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedItem.id,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully');
      setIsReviewOpen(false);
      setRating(0);
      setComment('');
      setSelectedItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewDialog = (item: OrderItem) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Order Date</div>
            <div className="font-medium">{orderDate}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-bold">{formatCurrency(totalPrice)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Status</div>
            <Badge className={`font-medium ${getStatusColor(status)}`}>
              {status}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Order Group ID</div>
            <div className="font-medium">{orderGroupId.substring(0, 17)}</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <div className="font-medium">Shipping Address:</div>
          <div>{address}</div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Order List</h3>
            <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-[#65a30d] hover:text-[#5f7a39]"
          >
            {expanded ? 'Hide details' : 'View details'}
          </button>
        </div>

        {expanded && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="h-16 w-16 relative flex-shrink-0">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.productName}</h4>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Special Instructions:</span> {item.specialInstructions}
                    </p>
                  )}
                  {status === 'delivered' && (
                    <Button
                      variant="outline"
                      className="self-start mt-2"
                      onClick={() => openReviewDialog(item)}
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Shipping ID: {shippingId}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Status</div>
            <div className={`text-sm ${
              status === 'delivered' ? 'text-green-600' :
              status === 'cancelled' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        </div>
      </CardFooter>

      {isReviewOpen && selectedItem && (
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={selectedItem.productImage}
                    alt={selectedItem.productName}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedItem.productName}</h4>
                  <div className="text-sm text-gray-500">
                    Quantity: {selectedItem.quantity}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-2">Rating</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIcon className={`w-6 h-6 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Comment</div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}