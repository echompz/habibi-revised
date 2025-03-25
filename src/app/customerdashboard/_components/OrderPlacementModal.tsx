// OrderPlacementModal.tsx
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface OrderPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (formData: { address: string }) => void;
  cartTotal: number;
  cartItems: { 
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }[];
  userId: string;
}

export default function OrderPlacementModal({
  isOpen,
  onClose,
  onPlaceOrder,
  cartTotal,
  cartItems,
  userId
}: OrderPlacementModalProps) {
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!customerAddress.trim()) {
        throw new Error('Please provide a delivery address');
      }

      onPlaceOrder({ address: customerAddress });
      onClose();
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto py-8 z-50">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Order</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-lg">Your total is <span className="font-bold">₱{cartTotal.toFixed(2)}</span></p>
          
          <div className="space-y-2">
            <label htmlFor="customerAddress" className="block">Delivery Address:</label>
            <textarea
              id="customerAddress"
              className="bg-muted/50 w-full p-2 rounded"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required
              placeholder="Please enter your complete delivery address"
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white"
            disabled={isSubmitting || !customerAddress}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}