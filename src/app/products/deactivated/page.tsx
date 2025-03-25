import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardTitleHeader } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import db from "@/data/db"
import { ReactivateProductButton } from "../_components/ReactivateProductButton"
import { ReactivateProductConfirmation } from "../_components/ReactivateProductConfirmation"
import { SearchForm } from "../_components/SearchForm"

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

export default async function DeactivatedProductsPage({ searchParams }: Props) {
  const showReactivateModal = searchParams?.modal === "reactivate-product"
  const reactivateProductId = searchParams?.productId as string | undefined
  const searchQuery = searchParams?.search as string | undefined

  // Only fetch deactivated products for this page
  let products = await db.product.findMany({
    where: {
      isAvailableForPurchase: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Filter products if search query exists
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query),
    )
  }

  const totalDeactivatedProducts = products.length

  const productToReactivate = reactivateProductId ? products.find((p) => p.id === reactivateProductId) : undefined

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader>Total Deactivated Products</CardHeader>
          <CardTitle>
            <div className="text-5xl font-bold text-gray-900">{totalDeactivatedProducts}</div>
          </CardTitle>
        </Card>
      </div>

      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Deactivated Products</h1>
      </CardTitleHeader>

      {/* Search Bar */}
      <SearchForm initialQuery={searchQuery || ""} deactivatedPage={true} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <Button asChild className="bg-[#edffd1] hover:bg-[#cce6a5] text-black border border-[#cce6a5]">
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Active Products
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No deactivated products found matching your search." : "No deactivated products found."}
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
                  <TableHead>Deactivated Date</TableHead>
                  <TableHead>Reactivate</TableHead>
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
                    <TableCell>{new Date(product.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ReactivateProductButton productId={product.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showReactivateModal && productToReactivate && <ReactivateProductConfirmation product={productToReactivate} />}
    </div>
  )
}

