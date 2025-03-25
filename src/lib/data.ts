import { Order } from './types'

export const orders: Order[] = [
  {
    id: '1',
    productName: 'Bracelet',
    productImage: '/products/0d4f42b4-f6ae-4830-9c91-e7c3768a7ef7-tassel earrings.jpg',
    price: 150,
    quantity: 1,
    totalPrice: 150,
    seller: 'Gab_Santiago_xDmewoewmoew',
    ratings: 25,
    averageRating: 4,
    status: 'processing'
  },
  {
    id: '2',
    productName: 'Rings',
    productImage: '/images/rings.jpg',
    price: 230,
    quantity: 2,
    totalPrice: 460,
    seller: 'Gab_Santiago_xDmewoewmoew',
    ratings: 105,
    averageRating: 5,
    status: 'processing'
  }
]