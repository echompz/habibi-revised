import TopFilterBar from "@/components/top-filter-bar";

interface Filters {
  categories: string[];
  priceRange: number[];
}

interface OrderStatusBadgeProps {
  onSortChange: (criteria: string) => void;
  onFilterChange: (newFilters: Filters) => void;
}

export default function OrderStatusBadge({ onSortChange, onFilterChange }: OrderStatusBadgeProps) {
  return (
    <TopFilterBar onSortChange={onSortChange} onFilterChange={onFilterChange} />
  );
}