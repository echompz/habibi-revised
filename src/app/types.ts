export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imagePath: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imagePath: string;
  specialInstructions?: string;
}

export interface ProductGridProps {
  sortCriteria: string;
  filters: { categories: string[], priceRange: number[] };
  addToCart: (item: CartItem) => void; 
}