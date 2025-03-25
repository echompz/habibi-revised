export interface Order {
    id: string
    productName: string
    productImage: string
    price: number
    quantity: number
    totalPrice: number
    seller: string
    ratings: number
    averageRating: number
    status: 'completed' | 'cancelled' | 'processing'
  }

  