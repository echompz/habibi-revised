"use client"
import { editProduct } from "@/app/_actions/products"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imagePath: string
  category: string
  isAvailableForPurchase: boolean
}

interface EditProductFormProps {
  product: Product
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter()
  const initialState = { success: false, errors: undefined }
  const [state, formAction, isPending] = useActionState(editProduct, initialState)

  const [price, setPrice] = useState<string>(product.price.toString())
  const [stock, setStock] = useState<string>(product.stock.toString())
  const [name, setName] = useState<string>(product.name)
  const [category, setCategory] = useState<string>(product.category)
  const [description, setDescription] = useState<string>(product.description)
  const [imagePreview, setImagePreview] = useState<string>(product.imagePath)
  const [newImageSelected, setNewImageSelected] = useState<boolean>(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
      setNewImageSelected(true)
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!newImageSelected) {
      const emptyBlob = new Blob([], { type: "image/png" })
      const emptyFile = new File([emptyBlob], "no-change.png", { type: "image/png" })
      formData.set("image", emptyFile)
    }

    await formAction(formData)
    const result = state

    if (result?.success) {
      toast.success("Product updated successfully", {
        description: "The product has been updated in your inventory",
      })
      router.push("/products")
    }
  }

  return (
    <>
      {/* Fullscreen overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9999]" />

      {/* Centered Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Product</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/products")}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form action={handleSubmit} className="space-y-4">
            {/* Hidden ID field */}
            <input type="hidden" name="id" value={product.id} />

            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Product Name"
                className="bg-muted/50"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {state?.errors?.name && <div className="text-destructive text-sm">{state.errors.name}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                name="category"
                placeholder="Category"
                className="bg-muted/50"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              {state?.errors?.category && <div className="text-destructive text-sm">{state.errors.category}</div>}
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
              <Textarea
                id="description"
                name="description"
                placeholder="Description"
                className="bg-muted/50"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              <Label>Current Image</Label>
              <div className="border rounded-md p-2 bg-muted/30">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Product image"
                  width={100}
                  height={100}
                  className="rounded-md object-cover mx-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Change Image (Optional)</Label>
              <Input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className="bg-muted/50"
                onChange={handleImageChange}
              />
              {state?.errors?.image && <div className="text-destructive text-sm">{state.errors.image}</div>}
            </div>

            <Button type="submit" className="w-full bg-[#606c38] hover:bg-[#505a2f] text-white">
              Update Product
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
