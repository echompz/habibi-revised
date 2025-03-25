"use client"

import { reactivateProduct } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useActionState } from "react"

interface ReactivateProductConfirmationProps {
  product: {
    id: string
    name: string
  }
}

export function ReactivateProductConfirmation({ product }: ReactivateProductConfirmationProps) {
  const router = useRouter()
  const initialState = {
    success: false,
    errors: undefined,
  }

  const [state, formAction] = useActionState(reactivateProduct, initialState)

  // Check if the action was successful and redirect
  if (state.success) {
    toast.success("Product reactivated", {
      description: "The product has been reactivated successfully",
    })
    router.refresh() // Refresh the current page
    router.push("/products") // Redirect to products page
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reactivate Product</h2>
          <Button variant="ghost" size="icon" onClick={() => router.push("/products/deactivated")} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p>
            Are you sure you want to reactivate <strong>{product.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">This product will be available for purchase again.</p>

          {state?.errors?.general && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">{state.errors.general}</div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push("/products/deactivated")}>
              Cancel
            </Button>
            <form action={formAction}>
              <input type="hidden" name="productId" value={product.id} />
              <Button type="submit" className="bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]">
                Reactivate
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

