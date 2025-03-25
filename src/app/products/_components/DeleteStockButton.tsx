"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DeleteStockButtonProps {
  productId: string
}

export function DeleteStockButton({ productId }: DeleteStockButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/products?deleteStock=${productId}`)
  }

  return (
    <Button
      size="sm"
      className="w-full bg-[#f4d2d4] hover:bg-[#e8babc] text-black border border-[#e8babc]"
      onClick={handleClick}
    >
      Remove Stock
    </Button>
  )
}