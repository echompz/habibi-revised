"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardTitleHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface Order {
  id: string
  userId: string
  productId: string
  quantity: number
  pricePaidInPeso: number
  address: string
  shippingStatus: string
  shippingId: string | null
  createdAt: string
  updatedAt: string
  user: {
    name: string | null
    email: string
  }
  product: {
    name: string
    imagePath: string
    price: number
  }
}

export default function Shipping() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Only fetch orders that need shipping (not cancelled or delivered)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      // Filter out delivered and cancelled orders
      const activeOrders = data.filter((order: Order) => 
        order.shippingStatus !== 'delivered' && order.shippingStatus !== 'cancelled'
      )
      setOrders(activeOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  // Calculate shipping-specific stats
  const stats = [
    { title: "Not Started", value: orders.filter(order => order.shippingStatus === "not-shipped").length },
    { title: "Packing", value: orders.filter(order => order.shippingStatus === "packing").length },
    { title: "Shipped", value: orders.filter(order => order.shippingStatus === "shipped").length, color: "text-[#65a30d]" },
  ]

  const handleFilterChange = (status: string) => {
    setFilter(status)
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.shippingStatus === filter
  })

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
      })

      if (!response.ok) {
        throw new Error('Failed to update shipping status')
      }

      const updatedOrder = await response.json()
      
      // If order is marked as delivered, remove it from the list
      if (newStatus === 'delivered') {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId))
        toast.success("Order marked as delivered")
      } else {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? updatedOrder : order
          )
        )
        toast.success("Shipping status updated")
      }
    } catch (error) {
      console.error('Error updating shipping status:', error)
      toast.error("Failed to update shipping status")
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h1 className="text-2xl font-bold mb-4">Active Shipments</h1>
      </CardTitleHeader>

      {/* Filter Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "secondary"}
            className={filter === "all" ? "bg-[#606c38]" : "bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]"}
            onClick={() => handleFilterChange("all")}
          >
            Show All
          </Button>
          <Button
            variant={filter === "not-shipped" ? "default" : "outline"}
            className={filter === "not-shipped" ? "bg-[#606c38]" : "bg-white"}
            onClick={() => handleFilterChange("not-shipped")}
          >
            Not Started
          </Button>
          <Button
            variant={filter === "packing" ? "default" : "outline"}
            className={filter === "packing" ? "bg-[#606c38]" : "bg-white"}
            onClick={() => handleFilterChange("packing")}
          >
            Packing
          </Button>
          <Button
            variant={filter === "shipped" ? "default" : "outline"}
            className={filter === "shipped" ? "bg-[#606c38]" : "bg-white"}
            onClick={() => handleFilterChange("shipped")}
          >
            Shipped
          </Button>
        </div>
      </div>

      {/* Shipping Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Shipping ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No active shipments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono">
                      <div className="font-medium">{order.id.slice(0, 8)}</div>
                      <div className="text-xs text-gray-500">{order.id.slice(8)}</div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {order.shippingId ? (
                        <div>
                          <div className="font-medium">{order.shippingId.slice(0, 8)}</div>
                          <div className="text-xs text-gray-500">{order.shippingId.slice(8)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.product.name}</div>
                      <div className="text-sm text-gray-500">₱{order.product.price.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="max-w-xs truncate" title={order.address}>
                      {order.address}
                    </TableCell>
                    <TableCell>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-gray-500">{format(new Date(order.createdAt), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={order.shippingStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="not-shipped">Not Started</option>
                        <option value="packing">Packing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Add view details handler */}}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}