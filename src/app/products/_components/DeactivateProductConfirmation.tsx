"use client"

import { deactivateProduct } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useActionState } from "react"

interface DeactivateProductConfirmationProps {
  product: {
    id: string
    name: string
  }
}

export function DeactivateProductConfirmation({ product }: DeactivateProductConfirmationProps) {
  const router = useRouter()
  const initialState = {
    success: false,
    errors: undefined,
  }

  const [state, formAction] = useActionState(deactivateProduct, initialState)

  async function handleSubmit(formData: FormData) {
    // Add the product ID to the form data
    formData.append("productId", product.id)

    // Let the form action handle the submission
    await formAction(formData)
  }

  // Check if the action was successful and redirect
  if (state.success) {
    toast.success("Product deactivated", {
      description: "The product has been deactivated successfully",
    })
    router.refresh() // Refresh the current page to update the product list
    router.push("/products") // Redirect back to products page
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Deactivate Product</h2>
          <Button variant="ghost" size="icon" onClick={() => router.push("/products")} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p>
            Are you sure you want to deactivate <strong>{product.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This product will no longer be available for purchase. You can reactivate it later from the deactivated
            products page.
          </p>

          {state?.errors?.general && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">{state.errors.general}</div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push("/products")}>
              Cancel
            </Button>
            <form action={formAction}>
              <input type="hidden" name="productId" value={product.id} />
              <Button type="submit" variant="destructive">
                Deactivate
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

