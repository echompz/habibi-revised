"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReactivateProductButtonProps {
  productId: string
}

export function ReactivateProductButton({ productId }: ReactivateProductButtonProps) {
  const router = useRouter()

  return (
    <Button
      size="sm"
      className="w-full bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]"
      onClick={() => router.push(`/products/deactivated?modal=reactivate-product&productId=${productId}`)}
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Reactivate
    </Button>
  )
}

