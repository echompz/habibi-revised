"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardTitleHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  pricePaidInPeso: number;
  address: string;
  orderGroupId: string | null;
  shippingStatus: string;
  shippingId: string | null;
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

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  
  // New state for confirmation modal
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    orderId: string | null;
    newStatus: string | null;
    message: string;
  }>({
    open: false,
    orderId: null,
    newStatus: null,
    message: ''
  });

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (confirmationModal.open && (e.target as HTMLElement).classList.contains("modal-overlay")) {
        setConfirmationModal({
          open: false,
          orderId: null,
          newStatus: null,
          message: ''
        });
      }
    }

    if (confirmationModal.open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [confirmationModal.open]);

  // Prevent page scrolling when modal is open
  useEffect(() => {
    if (confirmationModal.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    }
  }, [confirmationModal.open]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Not Started", value: orders.filter(order => order.shippingStatus === "not-shipped").length },
    { title: "Total Packing", value: orders.filter(order => order.shippingStatus === "packing").length },
    { title: "Total Shipped", value: orders.filter(order => order.shippingStatus === "shipped").length},
    { title: "Total Delivered", value: orders.filter(order => order.shippingStatus === "delivered").length, color: "text-[#65a30d]" },
  ];

  const handleFilterChange = (status: string) => {
    setFilter(status);
  };

  const openConfirmationModal = (orderId: string, newStatus: string) => {
    // Only show confirmation for 'delivered' or 'cancelled' statuses
    if (newStatus === 'delivered' || newStatus === 'cancelled') {
      setConfirmationModal({
        open: true,
        orderId,
        newStatus,
        message: newStatus === 'delivered' 
          ? "Are you sure you want to mark this order as delivered?" 
          : "Are you sure you want to cancel this order?"
      });
    } else {
      handleStatusChange(orderId, newStatus);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      );

      // Close confirmation modal
      setConfirmationModal({
        open: false,
        orderId: null,
        newStatus: null,
        message: ''
      });

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Failed to update order status");
    }
  };

  // Group orders by orderGroupId
  const groupOrders = (orders: Order[]) => {
    return orders.reduce((acc, order) => {
      if (filter !== "all" && order.shippingStatus !== filter) {
        return acc;
      }

      const groupId = order.orderGroupId || order.id;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(order);
      return acc;
    }, {} as { [key: string]: Order[] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not-shipped": return "bg-white-100";
      case "packing": return "bg-blue-50";
      case "shipped": return "bg-yellow-50";
      case "delivered": return "bg-green-50";
      case "cancelled": return "bg-red-50";
      default: return "bg-white";
    }
  };

  // Modal component to be rendered in portal
  const Modal = () => (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full relative z-[100000]">
        <h2 className="text-lg font-semibold mb-2">
          {confirmationModal.newStatus === 'delivered' 
            ? "Mark Order as Delivered" 
            : "Cancel Order"}
        </h2>
        <p className="text-gray-500 mb-4">
          {confirmationModal.message}
        </p>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setConfirmationModal({
              open: false,
              orderId: null,
              newStatus: null,
              message: ''
            })}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (confirmationModal.orderId && confirmationModal.newStatus) {
                handleStatusChange(confirmationModal.orderId, confirmationModal.newStatus);
              }
            }}
          >
            {confirmationModal.newStatus === 'delivered' ? 'Mark Delivered' : 'Cancel Order'}
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const groupedOrders = groupOrders(orders);

  return (
    <div className="p-6 space-y-6">
      {/* Modal Portal */}
      {mounted && confirmationModal.open && createPortal(<Modal />, document.body)}

      {/* Rest of the component remains the same as before */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardHeader>{stat.title}</CardHeader>
            <CardTitle>
              <div className={`text-5xl font-bold ${stat.color || 'text-gray-900'}`}>
                {stat.value}
              </div>
            </CardTitle>
          </Card>
        ))}
      </div>

      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
      </CardTitleHeader>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          className={filter === "all" ? "bg-[#6a7457]" : "bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]"}
          onClick={() => handleFilterChange("all")}
        >
          Show All
        </Button>
        <Button
          variant={filter === "not-shipped" ? "default" : "outline"}
          className={filter === "not-shipped" ? "bg-[#6a7457]" : "bg-white"}
          onClick={() => handleFilterChange("not-shipped")}
        >
          Not Started
        </Button>
        <Button
          variant={filter === "packing" ? "default" : "outline"}
          className={filter === "packing" ? "bg-[#6a7457]" : "bg-white"}
          onClick={() => handleFilterChange("packing")}
        >
          Packing
        </Button>
        <Button
          variant={filter === "shipped" ? "default" : "outline"}
          className={filter === "shipped" ? "bg-[#6a7457]" : "bg-white"}
          onClick={() => handleFilterChange("shipped")}
        >
          Shipped
        </Button>
        <Button
          variant={filter === "delivered" ? "default" : "outline"}
          className={filter === "delivered" ? "bg-[#6a7457]" : "bg-white"}
          onClick={() => handleFilterChange("delivered")}
        >
          Delivered
        </Button>
        <Button
          variant={filter === "cancelled" ? "default" : "secondary"}
          className={filter === "cancelled" ? "bg-[#6a7457]" : "bg-[#f4d2d4] hover:bg-[#e8babc] text-black border border-[#e8babc]"}
          onClick={() => handleFilterChange("cancelled")}
        >
          Cancelled
        </Button>
      </div>

      {/* Grouped Order Cards */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedOrders).map(([groupId, groupOrders]) => (
          <Card key={groupId} className="overflow-hidden">
            <CardHeader className="bg-[#6a7457] text-white rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {groupOrders.length > 1 ? 'Group Order' : 'Single Order'}
                  </h3>
                  <p className="text-sm font-mono">
                    {groupId.slice(0, 8)}
                    <span className="opacity-75">{groupId.slice(8)}</span>
                  </p>
                </div>
                <div className="text-sm">
                  {format(new Date(groupOrders[0].createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {groupOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`p-4 ${getStatusColor(order.shippingStatus)} ${
                    index !== groupOrders.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-medium">{order.product.name}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {order.quantity} × ₱{order.product.price.toFixed(2)}
                      </div>
                      <div className="font-semibold text-[#6a7457]">
                        Total: ₱{order.pricePaidInPeso.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{order.user.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-600">{order.user.email}</div>
                      <div className="text-sm text-gray-600 mt-1">{order.address}</div>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                      {(order.shippingStatus === 'delivered' || order.shippingStatus === 'cancelled') ? (
                        <div className="text-sm font-semibold text-gray-600">
                          {order.shippingStatus === 'delivered' ? 'Delivered' : 'Cancelled'}
                        </div>
                      ) : (
                        <select
                          value={order.shippingStatus}
                          onChange={(e) => openConfirmationModal(order.id, e.target.value)}
                          className="border p-2 rounded bg-white"
                        >
                          <option value="not-shipped">Not Started</option>
                          <option value="packing">Packing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                      <div className="text-xs font-mono opacity-50">
                        {order.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}