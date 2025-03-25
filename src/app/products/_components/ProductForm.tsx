"use client"
import { addProduct } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"

export function ProductForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(addProduct, {
    success: false,
    errors: undefined,
  })
  const [price, setPrice] = useState<string>("")
  const [stock, setStock] = useState<string>("")

  async function handleSubmit(formData: FormData) {
    const result = await formAction(formData)
    if (result?.success) {
      toast.success("Product added successfully", {
        description: "The product has been added to your inventory",
      })
      router.push("/products")
    }
  }

  return (
    <>
      {/* Full screen overlay with maximum z-index */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/50" 
        style={{ zIndex: 0 }} 
      />
      
      {/* Modal content */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 w-full h-full flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg mx-4 pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Product</h2>
            <Button variant="ghost" size="icon" onClick={() => router.push("/products")} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form action={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="id">Product ID</Label>
              <Input type="text" id="id" name="id" placeholder="Product ID" className="bg-muted/50" required />
              {state?.errors?.name && <div className="text-destructive text-sm">{state.errors.id}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input type="text" id="name" name="name" placeholder="Product Name" className="bg-muted/50" required />
              {state?.errors?.name && <div className="text-destructive text-sm">{state.errors.name}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input type="text" id="category" name="category" placeholder="Category" className="bg-muted/50" required />
              {state?.errors?.name && <div className="text-destructive text-sm">{state.errors.category}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                name="price"
                placeholder="Price"
                className="bg-muted/50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {state?.errors?.price && <div className="text-destructive text-sm">{state.errors.price}</div>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Description" className="bg-muted/50" required />
              {state?.errors?.description && <div className="text-destructive text-sm">{state.errors.description}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                type="number"
                id="stock"
                name="stock"
                placeholder="Stock Qty"
                className="bg-muted/50"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              {state?.errors?.stock && <div className="text-destructive text-sm">{state.errors.stock}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input type="file" id="image" name="image" accept="image/*" className="bg-muted/50" required />
              {state?.errors?.image && <div className="text-destructive text-sm">{state.errors.image}</div>}
            </div>

            <Button type="submit" className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white mt-6">
              Add Product
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}