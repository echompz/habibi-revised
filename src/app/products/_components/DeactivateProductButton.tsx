"use client"

import { Button } from "@/components/ui/button"
import { Power } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeactivateProductButtonProps {
  productId: string
}

export function DeactivateProductButton({ productId }: DeactivateProductButtonProps) {
  const router = useRouter()

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => router.push(`/products?modal=deactivate-product&productId=${productId}`)}
    >
      <Power className="w-4 h-4" />
    </Button>
  )
}

