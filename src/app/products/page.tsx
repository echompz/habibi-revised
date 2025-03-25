import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardTitleHeader } from "@/components/ui/card"
import { Plus, Power, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import db from "@/data/db"
import { ProductForm } from "./_components/ProductForm"
import { Input } from "@/components/ui/input"
import { UpdateStockButton } from "./_components/UpdateStockButton"
import { DeleteStockButton } from "./_components/DeleteStockButton"
import { AddStockButton } from "./_components/AddStockButton"
import { UpdateStock } from "./_components/UpdateStock"
import { DeleteStock } from "./_components/DeleteStock"
import { AddStock } from "./_components/AddStock"
import { EditProductButton } from "./_components/EditProductButton"
import { EditProductForm } from "./_components/EditProductForm"
import { DeactivateProductButton } from "./_components/DeactivateProductButton"
import { DeactivateProductConfirmation } from "./_components/DeactivateProductConfirmation"
import { SearchForm } from "./_components/SearchForm"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imagePath: string
  category: string
  isAvailableForPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const showAddModal = searchParams?.modal === "add-product"
  const showEditProductModal = searchParams?.modal === "edit-product"
  const updateStockProductId = searchParams?.updateStock as string | undefined
  const deleteStockProductId = searchParams?.deleteStock as string | undefined
  const addStockProductId = searchParams?.addStock as string | undefined
  const editProductId = searchParams?.productId as string | undefined
  const deactivateProductId = searchParams?.productId as string | undefined
  const searchQuery = searchParams?.search as string | undefined

  // Only fetch active products for this page
  const products = await db.product.findMany({
    where: {
      isAvailableForPurchase: true,
      ...(searchQuery && {
        OR: [
          { name: { contains: searchQuery } },
          { id: { contains: searchQuery } },
          { category: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length

  const stats = [
    { title: "Total Products", value: totalProducts },
    { title: "Out of Stock", value: outOfStock, color: "text-red-500" },
  ]

  const productToUpdate = updateStockProductId ? products.find((p) => p.id === updateStockProductId) : undefined
  const productToDelete = deleteStockProductId ? products.find((p) => p.id === deleteStockProductId) : undefined
  const productToAdd = addStockProductId ? products.find((p) => p.id === addStockProductId) : undefined
  const productToEdit = editProductId ? products.find((p) => p.id === editProductId) : undefined
  const productToDeactivate = deactivateProductId ? products.find((p) => p.id === deactivateProductId) : undefined

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardHeader>{stat.title}</CardHeader>
            <CardTitle>
              <div className={`text-5xl font-bold ${stat.color || "text-gray-900"}`}>{stat.value}</div>
            </CardTitle>
          </Card>
        ))}
      </div>

      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
      </CardTitleHeader>

      {/* Search Bar */}
      <SearchForm initialQuery={searchQuery || ""} />

     {/* Header */}
     <div className="flex justify-between items-center">
        <Button asChild className="bg-[#f4d2d4] hover:bg-[#e8babc] text-black border border-[#e8babc]">
          <Link href="/products/deactivated">Deactivated Products</Link>
        </Button>
        <Button asChild className="bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]">
          <Link href="/products?modal=add-product" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent>
        {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No products found matching your search." : "No products available."}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Image</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Add Stock</TableHead>
                <TableHead>Remove Stock</TableHead>
                <TableHead>Update Stock</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Deactivate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.imagePath || "/placeholder.svg"}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                  <TableCell>₱{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>

                  <TableCell>
                    <AddStockButton productId={product.id} />
                  </TableCell>

                  <TableCell>
                    <DeleteStockButton productId={product.id} />
                  </TableCell>

                  <TableCell>
                    <UpdateStockButton productId={product.id} />
                  </TableCell>

                  <TableCell>
                    <EditProductButton productId={product.id} />
                  </TableCell>

                  <TableCell>
                    <DeactivateProductButton productId={product.id} />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
           )}
        </CardContent>
      </Card>

      {showAddModal && <ProductForm />}

      {productToUpdate && (
        <UpdateStock
          productId={productToUpdate.id}
          productName={productToUpdate.name}
          currentStock={productToUpdate.stock}
        />
      )}

      {productToDelete && (
        <DeleteStock
          productId={productToDelete.id}
          productName={productToDelete.name}
          currentStock={productToDelete.stock}
        />
      )}

      {productToAdd && (
        <AddStock productId={productToAdd.id} productName={productToAdd.name} currentStock={productToAdd.stock} />
      )}

      {showEditProductModal && productToEdit && <EditProductForm product={productToEdit} />}

      
      {searchParams?.modal === "deactivate-product" && productToDeactivate && (
        <DeactivateProductConfirmation product={productToDeactivate} />
      )}
      
    </div>
  )
}
