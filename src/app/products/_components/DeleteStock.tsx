"use client"
import { deleteStock } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"

interface DeleteStockProps {
  productId: string
  productName: string
  currentStock: number
}

export function DeleteStock({ productId, productName, currentStock }: DeleteStockProps) {
  const router = useRouter()
  const [stock, setStock] = useState<string>(currentStock.toString())

  function closeModal() {
    router.push("/products")
  }

  async function handleSubmit(formData: FormData) {
    try {
      const result = await deleteStock(null, formData)
      if (result.success) {
        const removedStock = parseInt(formData.get("stock") as string)
        toast.success(`${removedStock} Products Removed!`, {
          description: `The stock for ${productName} has been updated`,
          duration: 5000
        })
        closeModal()
      } else {
        toast.error("Failed to remove stock", {
          description: result.errors?.stock?.[0] || "An error occurred while updating the stock",
          duration: 5000
        })
      }
    } catch (error) {
      toast.error("Failed to remove stock", {
        description: "An error occurred while updating the stock",
        duration: 5000
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto py-8 ">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Remove Stock</h2>
          <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.currentTarget));
        }} className="space-y-6">
          <input type="hidden" name="productId" value={productId} />

          <div className="space-y-2">
            <Label htmlFor="productName">Product</Label>
            <Input type="text" id="productName" value={productName} className="bg-muted/50" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentStock">Current Stock</Label>
            <Input type="text" id="currentStock" value={currentStock} className="bg-muted/50" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Amount to Remove</Label>
            <Input
              type="number"
              id="stock"
              name="stock"
              placeholder="Enter new stock quantity"
              className="bg-muted/50"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#606c38] hover:bg-[#505a2f] text-white">
              Remove Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}