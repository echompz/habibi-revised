"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditProductButtonProps {
  productId: string
}

export function EditProductButton({ productId }: EditProductButtonProps) {
  const router = useRouter()

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => router.push(`/products?modal=edit-product&productId=${productId}`)}
    >
      <Pencil className="w-4 h-4" />
    </Button>
  )
}

