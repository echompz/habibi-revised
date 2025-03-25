'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import RatingStars from './RatingStars'

interface OrderCardProps {
  order: {
    id: string
    productName: string
    productImage: string
    seller: string
    price: number
    quantity: number
    totalPrice: number
    status: string
    ratings: number
    averageRating: number
    orderDate: string
    shippingId: string
    orderGroupId: string
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'packing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-shipped':
        return 'Order Received'
      case 'packing':
        return 'Seller is packing your order'
      case 'shipped':
        return 'Order is on the way'
      case 'delivered':
        return 'Order delivered'
      case 'cancelled':
        return 'Order cancelled'
      default:
        return status
    }
  }

  return (
    <Card className="overflow-hidden shadow-xl rounded-lg border border-gray-200">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left side with product image */}
          <div className="p-2 flex flex-col items-center md:w-1/3">
            <Image 
              src={order.productImage} 
              alt={order.productName}
              width={280}
              height={280}
              className="rounded-md object-cover border border-gray-200"
            />
            <div className="text-sm text-gray-600 mt-2">
              Seller: <span className="font-semibold">{order.seller}</span>
            </div>
          </div>
          
          {/* Middle section with product details */}
          <div className="p-4 flex flex-col justify-between md:w-1/3 space-y-4 bg-white">
            <div className="p-4 shadow-lg rounded-md border border-gray-200">
              <div className="text-2xl font-semibold">{order.productName}</div>
              <div className="text-sm text-gray-500 mt-2">Order Date: {format(new Date(order.orderDate), 'MMM d, yyyy')}</div>
              <div className="text-sm font-mono text-gray-500 mt-1">
                Order ID: {order.id.slice(0, 8)}
              </div>
              <div className="text-sm font-mono text-gray-500 mt-1">
                Shipping ID: {order.shippingId ? order.shippingId.slice(0, 8) : '-'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 shadow-lg rounded-md text-center border border-gray-200">
                <div className="text-gray-500 text-sm">Price</div>
                <div className="text-3xl font-bold text-lime-600">₱{order.price.toFixed(2)}</div>
              </div>
              <div className="p-4 shadow-lg rounded-md text-center border border-gray-200">
                <div className="text-gray-500 text-sm">Quantity</div>
                <div className="text-3xl font-bold">{order.quantity}</div>
              </div>
            </div>

            {order.ratings > 0 && (
              <div className="p-4 shadow-lg rounded-md text-center border border-gray-200 flex flex-col items-center">
                <span className="text-sm text-gray-600 mb-1 block">{order.ratings} Ratings</span>
                <RatingStars rating={order.averageRating} />
              </div>
            )}
          </div>
          
          {/* Right side with order status and actions */}
          <div className="p-4 flex flex-col md:w-1/3 bg-white">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-md ${getStatusColor(order.status)}`}>
                <div className="text-sm font-semibold">
                  {getStatusText(order.status)}
                </div>
              </div>
            </div>
            
            <div className="bg-lime-100 p-4 rounded-md mb-4 shadow-lg border border-gray-200">
              <div className="text-lg font-semibold">Order Total: ₱{order.totalPrice.toFixed(2)}</div>
            </div>
            
            {order.status === 'delivered' && (
              <>
                <Button variant="outline" className="w-full mb-3">Buy Again</Button>
                <div>
                  <div className="text-sm mb-1">Rate Now</div>
                  <RatingStars rating={0} editable />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}