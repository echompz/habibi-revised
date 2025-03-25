"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface UpdateStockButtonProps {
  productId: string
}

export function UpdateStockButton({ productId }: UpdateStockButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/products?updateStock=${productId}`)
  }

  return (
    <Button
      size="sm"
      className="w-full bg-[#e1f7c0] hover:bg-[#cce6a5] text-black border border-[#cce6a5]"
      onClick={handleClick}
    >
      Update Stock
    </Button>
  )
}

