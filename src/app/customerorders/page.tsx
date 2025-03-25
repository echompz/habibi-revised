'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import GroupedOrderCard from './_components/GroupedOrderCard'
import { CardTitleHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { jwtDecode } from "jwt-decode";

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  pricePaidInPeso: number;
  address: string;
  shippingStatus: string;
  shippingId: string | null;
  orderGroupId: string | null;
  specialInstructions?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
  };
  product: {
    name: string;
    imagePath: string;
    price: number;
  };
}

interface GroupedOrder {
  orderGroupId: string;
  shippingId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  address: string;
  items: {
    id: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }[];
}

export default function OrdersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Authentication error");
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value: 'all' | 'delivered' | 'cancelled') => {
    setFilter(value);
  };

  const groupOrders = (orders: Order[]): GroupedOrder[] => {
    const groupedOrdersMap = orders.reduce((acc: { [key: string]: GroupedOrder }, order) => {
      const orderGroupId = order.orderGroupId || order.id;
      
      if (!acc[orderGroupId]) {
        acc[orderGroupId] = {
          orderGroupId,
          shippingId: order.shippingId || '',
          status: order.shippingStatus,
          totalPrice: order.pricePaidInPeso,
          createdAt: order.createdAt,
          address: order.address,
          items: []
        };
      } else {
        acc[orderGroupId].totalPrice += order.pricePaidInPeso;
      }

      acc[orderGroupId].items.push({
        id: order.id,
        productName: order.product.name,
        productImage: order.product.imagePath,
        price: order.product.price,
        quantity: order.quantity,
        specialInstructions: order.specialInstructions || undefined
      });

      return acc;
    }, {});

    return Object.values(groupedOrdersMap);
  };

  const filteredOrders = groupOrders(
    orders.filter(order => {
      if (filter === 'all') return true;
      return order.shippingStatus === filter;
    })
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      </CardTitleHeader>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'secondary' : 'outline'}
            className={filter === 'all' ? 'bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]' : 'bg-white'}
            onClick={() => handleFilterChange('all')}
          >
            Show All
          </Button>
          <Button
            variant={filter === 'delivered' ? 'secondary' : 'outline'}
            className={filter === 'delivered' ? 'bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]' : 'bg-white'}
            onClick={() => handleFilterChange('delivered')}
          >
            Completed
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'secondary' : 'outline'}
            className={filter === 'cancelled' ? 'bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]' : 'bg-white'}
            onClick={() => handleFilterChange('cancelled')}
          >
            Cancelled
          </Button>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No orders found
          </div>
        ) : (
          filteredOrders.map(groupedOrder => (
            <GroupedOrderCard
              key={groupedOrder.orderGroupId}
              order={{
                id: groupedOrder.orderGroupId,
                items: groupedOrder.items,
                seller: "Habibi",
                totalPrice: groupedOrder.totalPrice,
                status: groupedOrder.status,
                orderDate: format(new Date(groupedOrder.createdAt), 'MMM d, yyyy'),
                shippingId: groupedOrder.shippingId,
                orderGroupId: groupedOrder.orderGroupId,
                address: groupedOrder.address
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}