"use client";

import { useState, useEffect } from "react";
import OrdersHeader from "./_components/OrdersHeader";
import OrdersTable from "./_components/OrdersTable";
import OrderStatusBadge from "./_components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import CartSidebar from "./_components/CartSidebar";
import { CartItem } from "@/app/types";
import { toast } from "sonner";

interface Filters {
  categories: string[];
  priceRange: number[];
}

export default function HomePage() {
  const [sortCriteria, setSortCriteria] = useState("price-asc");
  const [filters, setFilters] = useState<Filters>({ categories: [], priceRange: [0, 500] });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleSortChange = (criteria: string) => {
    setSortCriteria(criteria);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingCartItemIndex = prevCart.findIndex((cartItem) => cartItem.productId === item.productId);
      if (existingCartItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingCartItemIndex].quantity += item.quantity;
        return updatedCart;
      }
      return [...prevCart, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = newQuantity;
      return updatedCart;
    });
  };

  const placeOrder = () => {
    setCart([]);
    setIsCartOpen(false);
    toast.success("Order placed successfully!", {
      description: "Thank you for your purchase."
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <OrdersHeader />
      <div className="flex flex-col gap-6">
        <OrderStatusBadge onSortChange={handleSortChange} onFilterChange={handleFilterChange} />
        <OrdersTable sortCriteria={sortCriteria} filters={filters} addToCart={addToCart} />
      </div>
      <div className="absolute top-80 right-20">

      </div>
      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
          onPlaceOrder={placeOrder}
          isCheckingOut={false}
        />
      )}
    </main>
  );
}
