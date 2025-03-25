"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/app/types";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import OrderPlacementModal from "@/app/customerdashboard/_components/OrderPlacementModal";

interface CartSidebarProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onPlaceOrder: (userId: string, address: string) => void;
  isCheckingOut: boolean;
}

export default function CartSidebar({ cart, onClose, onRemove, onUpdateQuantity, onPlaceOrder, isCheckingOut }: CartSidebarProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
  }, []);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (userId) {
      setShowOrderModal(true);
    } else {
      // Handle case where userId is not available
      console.error("User not authenticated");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg">Your cart is empty</p>
            <Button
              onClick={onClose}
              className="mt-4 bg-[#606c38] hover:bg-[#505a2f]"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-grow">
              {cart.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex py-4 border-b">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                    <Image
                      src={item.imagePath || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">₱{item.price.toFixed(2)}</p>
                    
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mb-2">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total:</span>
                <span>₱{getCartTotal().toFixed(2)}</span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={isCheckingOut}
                className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white py-3 rounded-lg font-medium"
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
      {showOrderModal && userId && (
        <OrderPlacementModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onPlaceOrder={(formData) => {
            if (userId) {
              onPlaceOrder(userId, formData.address);
            }
          }}
          cartTotal={getCartTotal()}
          cartItems={cart}
          userId={userId}
        />
      )}
    </div>
  );
}