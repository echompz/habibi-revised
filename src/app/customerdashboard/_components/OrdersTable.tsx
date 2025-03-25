import ProductGrid from "./product-grid";
import { CartItem } from "@/app/types";

interface Filters {
  categories: string[];
  priceRange: number[];
}

interface OrdersTableProps {
  sortCriteria: string;
  filters: Filters;
  addToCart: (item: CartItem) => void; 
}

export default function OrdersTable({ sortCriteria, filters, addToCart }: OrdersTableProps) {
  return <ProductGrid sortCriteria={sortCriteria} filters={filters} addToCart={addToCart} />;
}