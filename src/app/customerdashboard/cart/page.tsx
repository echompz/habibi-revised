"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CartItem } from "@/app/types";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    const removedItem = newCart[index];
    newCart.splice(index, 1);
    setCart(newCart);
    toast(`Removed ${removedItem.name} from cart`);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    const item = cart[index];
    const validQuantity = Math.max(1, newQuantity);
    const newCart = [...cart];
    newCart[index].quantity = validQuantity;
    setCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    setIsCheckingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrderPlaced(true);
      setCart([]);
      toast.success("Order placed successfully!", {
        description: "Thank you for your purchase."
      });
      setTimeout(() => {
        setIsCheckingOut(false);
        setOrderPlaced(false);
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order", {
        description: "Please try again later."
      });
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p className="text-lg">Your cart is empty</p>
        <Link href="/customerdashboard">
          <Button className="mt-4 bg-[#606c38] hover:bg-[#505a2f]">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {orderPlaced ? (
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-xl font-medium mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
          <Link href="/">
            <Button className="bg-[#606c38] hover:bg-[#505a2f]">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-6">
            {cart.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex border-b pb-4">
                <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                  <Image src={item.imagePath || "/placeholder.svg"} alt={item.name} width={80} height={80} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">₱{item.price.toFixed(2)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateCartItemQuantity(index, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100" disabled={item.quantity <= 1}>-</button>
                      <span className="px-2 py-1 text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartItemQuantity(index, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span>Total:</span>
              <span>₱{getCartTotal().toFixed(2)}</span>
            </div>
            <Button onClick={placeOrder} disabled={isCheckingOut} className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white py-3 rounded-lg font-medium">
              {isCheckingOut ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>Processing...
                </span>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
