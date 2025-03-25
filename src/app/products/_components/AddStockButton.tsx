"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AddStockButtonProps {
  productId: string
}

export function AddStockButton({ productId }: AddStockButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/products?addStock=${productId}`)
  }

  return (
    <Button
      size="sm"
      className="w-full bg-[#fffed1] hover:bg-[#f5ebb6] text-black border border-[#f5ebb6]"
      onClick={handleClick}
    >
      Add Stock
    </Button>
  )
}