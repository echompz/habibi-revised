"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CartItem, Product, ProductGridProps } from "@/app/types";
import CartSidebar from "./CartSidebar";

export default function ProductGrid({ sortCriteria, filters }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const queryParams = new URLSearchParams({
          sort: sortCriteria,
          categories: filters.categories.join(',') || '',
          minPrice: filters.priceRange[0].toString(),
          maxPrice: filters.priceRange[1].toString(),
        }).toString();

        const response = await fetch(`/api/products?${queryParams}`);
        const data = await response.json();
        setProducts(data);
        const initialQuantities = data.reduce((acc: { [key: string]: number }, product: Product) => {
          acc[product.id] = product.stock > 0 ? 1 : 0;
          return acc;
        }, {});
        setQuantity(initialQuantities);
        const initialComments = data.reduce((acc: { [key: string]: string }, product: Product) => {
          acc[product.id] = '';
          return acc;
        }, {});
        setComments(initialComments);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortCriteria, filters]);

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

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const validQuantity = Math.min(Math.max(1, newQuantity), product.stock);
    setQuantity((prev) => ({ ...prev, [id]: validQuantity }));
  };

  const handleQuantityInputChange = (id: string, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newQuantity = value === '' ? 1 : parseInt(value);
    handleQuantityChange(id, newQuantity);
  };

  const handleCommentChange = (id: string, newComment: string) => {
    setComments((prev) => ({ ...prev, [id]: newComment }));
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    const itemQuantity = quantity[productId];
    const existingCartItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingCartItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingCartItemIndex].quantity + itemQuantity;
      if (newQuantity <= product.stock) {
        updatedCart[existingCartItemIndex].quantity = newQuantity;
        updatedCart[existingCartItemIndex].specialInstructions = comments[productId];
        setCart(updatedCart);
      } else {
        toast.error("Cannot add more items", {
          description: `Only ${product.stock} items available in stock.`
        });
        return;
      }
    } else {
      setCart([...cart, {
        productId,
        quantity: itemQuantity,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        specialInstructions: comments[productId] || undefined,
      }]);
    }
    
    toast.success("Added to cart", {
      description: `${itemQuantity} × ${product.name} added to your cart`
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    const removedItem = newCart[index];
    newCart.splice(index, 1);
    setCart(newCart);
    toast(`Removed ${removedItem.name} from cart`);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    const validQuantity = Math.min(Math.max(1, newQuantity), product.stock);
    const newCart = [...cart];
    newCart[index].quantity = validQuantity;
    setCart(newCart);
  };

  const placeOrder = async (userId: string, address: string) => {
    if (!address) {
      toast.error("Address is required");
      return;
    }
  
    setIsCartOpen(false);
    
    try {
      // Prepare cart items for the API
      const cartItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions || ""
      }));
  
      // Send a single request with all cart items
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          address,
          cartItems
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
      
      const result = await response.json();
  
      // Clear cart after successful order placement
      setCart([]);
      localStorage.removeItem('cart');
      
      toast.success("Order placed successfully!", {
        description: `Order #${result.orderGroupId || 'N/A'} has been created.`
      });
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error("Failed to place order", {
        description: error instanceof Error ? error.message : "Please try again later."
      });
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full">
            <div className="relative group">
              <div className="overflow-hidden">
                <Image src={product.imagePath || "/placeholder.svg"} alt={product.name} width={300} height={300} className={`w-full h-52 object-contain bg-gray-50 p-4 rounded-t-xl group-hover:scale-105 transition-transform duration-300 ${product.stock === 0 ? "opacity-60" : ""}`} />
              </div>
              {product.stock === 0 ? (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</div>
              ) : product.stock < 10 ? (
                <div className="absolute top-2 right-2 bg-[#606c38] text-white text-xs px-2 py-1 rounded-full">Only {product.stock} left</div>
              ) : null}
            </div>
            <div className="p-5 flex-grow">
              <div className="text-xs text-gray-500 mb-1">{product.category}</div>
              <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10">{product.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-black font-bold text-lg">₱{product.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-xs line-clamp-3 mb-4">{product.description}</p>
            </div>
            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
              {product.stock === 0 ? (
                <div className="py-3 mb-3 text-center bg-gray-100 rounded-lg text-sm text-gray-600">Item currently unavailable</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor={`quantity-${product.id}`} className="text-xs font-medium">Quantity:</label>
                    <div className="flex items-center">
                      <button onClick={() => handleQuantityChange(product.id, quantity[product.id] - 1)} disabled={quantity[product.id] <= 1} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50" aria-label="Decrease quantity">−</button>
                      <input id={`quantity-${product.id}`} type="text" inputMode="numeric" pattern="[0-9]*" min="1" max={product.stock} value={quantity[product.id]} onChange={(e) => handleQuantityInputChange(product.id, e.target.value)} className="w-12 h-8 text-center border-y border-gray-300 text-sm" />
                      <button onClick={() => handleQuantityChange(product.id, quantity[product.id] + 1)} disabled={quantity[product.id] >= product.stock} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50" aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white mb-3 py-5 rounded-lg font-medium" onClick={() => addToCart(product.id)}>Add to Cart</Button>
                  <div className="relative">
                    <input type="text" placeholder="Add special instructions" value={comments[product.id]} onChange={(e) => handleCommentChange(product.id, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#606c38] focus:border-[#606c38]" />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No products found matching your criteria
          </div>
        )}
      </div>
      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
          onPlaceOrder={(userId, address) => placeOrder(userId, address)}
          isCheckingOut={false}
        />
      )}
    </div>
  );
}