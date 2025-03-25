"use server"

import { prisma } from "@/lib/prisma" // Ensure this points to your Prisma client

export async function fetchLogs(searchQuery?: string) {
  const productLogs = await prisma.product.findMany({
    where: searchQuery
      ? { OR: [{ name: { contains: searchQuery } }, { id: { contains: searchQuery } }] }
      : {},
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  })

  const orderLogs = await prisma.order.findMany({
    where: searchQuery ? { OR: [{ id: { contains: searchQuery } }] } : {},
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, updatedAt: true },
  })

  return [
    ...productLogs.flatMap((log) => [
      { id: `product-${log.id}`, timestamp: log.createdAt, message: `Product Created: ${log.name}`, type: "product" },
      { id: `product-update-${log.id}`, timestamp: log.updatedAt, message: `Product Updated: ${log.name}`, type: "product-update" },
    ]),
    ...orderLogs.flatMap((log) => [
      { id: `order-${log.id}`, timestamp: log.createdAt, message: `Order Created: ${log.id}`, type: "order" },
      { id: `order-update-${log.id}`, timestamp: log.updatedAt, message: `Order Updated: ${log.id}`, type: "order-update" },
    ]),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
