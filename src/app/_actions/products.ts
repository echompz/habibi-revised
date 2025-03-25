"use server"
import db from "@/data/db"
import { z } from "zod"
import fs from "fs/promises"
import { revalidatePath } from "next/cache"

const fileSchema = z.instanceof(File, { message: "Required" })
const addSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(1),
  stock: z.coerce.number().min(1),
  image: fileSchema.refine((file) => file.size > 0 && file.type.startsWith("image/"), "Required"),
})

type AddProductResponse = {
  success: boolean
  errors?: {
    id?: string[]
    name?: string[]
    price?: string[]
    stock?: string[]
    category?: string[]
    description?: string[]
    image?: string[]
  }
}

export async function addProduct(prevState: unknown, formData: FormData): Promise<AddProductResponse> {
  try {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: result.error.formErrors.fieldErrors,
      }
    }

    const data = result.data
    // IMAGE PATHING
    await fs.mkdir("public/products", { recursive: true })
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))
    // Create product and add to database
    await db.product.create({
      data: {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description,
        price: data.price,
        imagePath,
        stock: data.stock,
        isAvailableForPurchase: true,
      },
    })
    // Revalidate the products page
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error adding product:", error)
    return {
      success: false,
      errors: {
        name: ["Failed to create product. Please try again."],
      },
    }
  }
}

// Add the deactivateProduct server action
const deactivateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
})

type DeactivateProductResponse = {
  success: boolean
  errors?: { general?: string[] }
}

export async function deactivateProduct(prevState: unknown, formData: FormData): Promise<DeactivateProductResponse> {
  try {
    const result = deactivateProductSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: {
          general: ["Invalid product information."],
        },
      }
    }

    const { productId } = result.data

    // Update product in database to mark as deactivated
    await db.product.update({
      where: { id: productId },
      data: { isAvailableForPurchase: false },
    })

    // Revalidate both the active and deactivated products pages
    revalidatePath("/products")
    revalidatePath("/products/deactivated")

    return { success: true }
  } catch (error) {
    console.error("Error deactivating product:", error)
    return {
      success: false,
      errors: {
        general: ["Failed to deactivate product. Please try again."],
      },
    }
  }
}

// Add the reactivateProduct server action
const reactivateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
})

type ReactivateProductResponse = {
  success: boolean
  errors?: { general?: string[] }
}

export async function reactivateProduct(prevState: unknown, formData: FormData): Promise<ReactivateProductResponse> {
  try {
    const result = reactivateProductSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: {
          general: ["Invalid product information."],
        },
      }
    }

    const { productId } = result.data

    // Update product in database to mark as active
    await db.product.update({
      where: { id: productId },
      data: { isAvailableForPurchase: true },
    })

    // Revalidate both the active and deactivated products pages
    revalidatePath("/products")
    revalidatePath("/products/deactivated")

    return { success: true }
  } catch (error) {
    console.error("Error reactivating product:", error)
    return {
      success: false,
      errors: {
        general: ["Failed to reactivate product. Please try again."],
      },
    }
  }
}

// Add the editProduct server action
const editProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(1),
  stock: z.coerce.number().min(0),
  image: z.instanceof(File).optional(),
})

type EditProductResponse = {
  success: boolean
  errors?: {
    id?: string[]
    name?: string[]
    price?: string[]
    stock?: string[]
    category?: string[]
    description?: string[]
    image?: string[]
  }
}

export async function editProduct(prevState: unknown, formData: FormData): Promise<EditProductResponse> {
  try {
    const result = editProductSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: result.error.formErrors.fieldErrors,
      }
    }

    const data = result.data

    // Prepare update data
    const updateData: any = {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      stock: data.stock,
    }

    // Handle image update if a new image was provided
    if (data.image && data.image.size > 0) {
      await fs.mkdir("public/products", { recursive: true })
      const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
      await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))
      updateData.imagePath = imagePath
    }

    // Update product in database
    await db.product.update({
      where: { id: data.id },
      data: updateData,
    })

    // Revalidate the products page
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error editing product:", error)
    return {
      success: false,
      errors: {
        name: ["Failed to update product. Please try again."],
      },
    }
  }
}

// Add the updateStock server action
const updateStockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  stock: z.coerce.number().min(0, "Stock quantity must be 0 or greater"),
})

type UpdateStockResponse = {
  success: boolean
  errors?: { stock?: string[] }
}

export async function updateStock(prevState: unknown, formData: FormData): Promise<UpdateStockResponse> {
  try {
    const result = updateStockSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: result.error.formErrors.fieldErrors,
      }
    }

    const { productId, stock } = result.data

    // Update product stock in database
    await db.product.update({
      where: { id: productId },
      data: { stock },
    })

    // Revalidate the products page
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error updating stock:", error)
    return {
      success: false,
      errors: {
        stock: ["Failed to update stock. Please try again."],
      },
    }
  }
}

// Add the deleteStock server action
const deleteStockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  stock: z.coerce.number().min(1, "Stock quantity must be 1 or greater"),
})

type DeleteStockResponse = {
  success: boolean
  errors?: { stock?: string[] }
}

export async function deleteStock(prevState: unknown, formData: FormData): Promise<DeleteStockResponse> {
  try {
    const result = deleteStockSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: result.error.formErrors.fieldErrors,
      }
    }

    const { productId, stock } = result.data

    // Fetch current stock
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return {
        success: false,
        errors: {
          stock: ["Product not found."],
        },
      }
    }

    const newStock = product.stock - stock
    if (newStock < 0) {
      return {
        success: false,
        errors: {
          stock: ["Insufficient stock. Cannot reduce below 0."],
        },
      }
    }

    // Update product stock in database
    await db.product.update({
      where: { id: productId },
      data: { stock: newStock },
    })

    // Revalidate the products page
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error deleting stock:", error)
    return {
      success: false,
      errors: {
        stock: ["Failed to delete stock. Please try again."],
      },
    }
  }
}

// Add the addStock server action
const addStockSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  stock: z.coerce.number().min(1, "Stock quantity must be 1 or greater"),
})

type AddStockResponse = {
  success: boolean
  errors?: { stock?: string[] }
}

export async function addStock(prevState: unknown, formData: FormData): Promise<AddStockResponse> {
  try {
    const result = addStockSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return {
        success: false,
        errors: result.error.formErrors.fieldErrors,
      }
    }

    const { productId, stock } = result.data

    // Fetch current stock
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return {
        success: false,
        errors: {
          stock: ["Product not found."],
        },
      }
    }

    const newStock = product.stock + stock

    // Update product stock in database
    await db.product.update({
      where: { id: productId },
      data: { stock: newStock },
    })

    // Revalidate the products page
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error adding stock:", error)
    return {
      success: false,
      errors: {
        stock: ["Failed to add stock. Please try again."],
      },
    }
  }
}

