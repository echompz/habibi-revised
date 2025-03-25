"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Category {
  category: string;
}

interface TopFilterBarProps {
  onSortChange: (sortCriteria: string) => void;
  onFilterChange: (filters: { categories: string[], priceRange: number[] }) => void;
}

export default function TopFilterBar({ onSortChange, onFilterChange }: TopFilterBarProps) {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("price-asc");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, []);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedSort(value);
    onSortChange(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  useEffect(() => {
    onFilterChange({ categories: selectedCategories, priceRange });
  }, [selectedCategories, priceRange]);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-wrap items-center gap-3">
        {/* Categories Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Categories
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.category}
                    onCheckedChange={() => handleCategoryChange(category.category)}
                  />
                  <label htmlFor={category.category} className="text-sm">
                    {category.category}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Price
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div>
              <Slider
                defaultValue={priceRange}
                max={2000}
                step={10}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as number[])}
                aria-label="Price Range"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>₱0</span>
                <span>₱{priceRange[0]}</span>
                <span>₱2000</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm">Sort By:</label>
          <select
            id="sort"
            value={selectedSort}
            onChange={handleSortChange}
            className="h-9 border border-gray-300 rounded px-2 text-sm"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="category-asc">Category: A to Z</option>
            <option value="category-desc">Category: Z to A</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">

          <Button size="sm" className="h-9 bg-[#606c38] hover:bg-[#505a2f] text-white" onClick={() => {
            setSelectedCategories([]);
            setPriceRange([0, 500]);
            setSelectedSort("price-asc");
            onFilterChange({ categories: [], priceRange: [0, 500] });
            onSortChange("price-asc");
          }}>
            All Reset
          </Button>
        </div>
      </div>
    </div>
  );
}