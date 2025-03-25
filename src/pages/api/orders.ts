import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, userId } = req.query;

      const orders = await prisma.order.findMany({
        where: {
          ...(status ? { shippingStatus: status as string } : {}),
          ...(userId ? { userId: userId as string } : {}),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
              imagePath: true,
              price: true,
            },
          },
        },
        orderBy: [
          { updatedAt: 'desc' },
          { createdAt: 'desc' }
        ],
      });

      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Handle cart items if they're sent as an array
      if (Array.isArray(req.body.cartItems)) {
        const { userId, address, cartItems } = req.body;
        
        if (!userId || !address || !cartItems || cartItems.length === 0) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate a single orderGroupId for all items in this order
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
        const commonOrderGroupId = `GRP-${timestamp}-${randomString}`;
        const shippingId = `SHIP-${timestamp}-${randomString}`;

        // Verify stock for all products before creating any orders
        const productStockChecks = await Promise.all(
          cartItems.map(async (item: { productId: string; quantity: number; price?: number; specialInstructions?: string }) => {
            const product = await prisma.product.findUnique({ 
              where: { id: item.productId } 
            });
            
            return {
              product,
              item,
              hasStock: product && product.stock >= item.quantity
            };
          })
        );
        
        // Check if any products have insufficient stock
        const insufficientStock = productStockChecks.filter(check => !check.hasStock);
        if (insufficientStock.length > 0) {
          return res.status(400).json({ 
            error: 'Insufficient stock', 
            products: insufficientStock.map(check => ({
              productId: check.item.productId,
              requestedQuantity: check.item.quantity,
              availableStock: check.product?.stock || 0
            }))
          });
        }
        
        // Create orders for each item in the cart with the same orderGroupId
        const createdOrders = await Promise.all(
          cartItems.map(async (item: { productId: string; quantity: number; price?: number; specialInstructions?: string }, index: number) => {
            // Use the item's price or get it from the product if not provided
            let pricePaidInPeso = item.price;
            if (!pricePaidInPeso) {
              const product = productStockChecks[index].product;
              pricePaidInPeso = product?.price || 0;
            }
            pricePaidInPeso = (pricePaidInPeso ?? 0) * item.quantity;
            
            const order = await prisma.order.create({
              data: {
                userId,
                productId: item.productId,
                quantity: item.quantity,
                pricePaidInPeso,
                address,
                orderGroupId: commonOrderGroupId,
                specialInstructions: item.specialInstructions || null,
                shippingId,
                shippingStatus: 'not-shipped',
              },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                product: {
                  select: {
                    name: true,
                    imagePath: true,
                    price: true,
                  },
                },
              },
            });
            
            // Update product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
            
            return order;
          })
        );
        
        res.status(200).json({
          success: true,
          orderGroupId: commonOrderGroupId,
          orders: createdOrders
        });
      } else {
        // Handle single item orders (original implementation)
        const { userId, productId, quantity, pricePaidInPeso, address, specialInstructions } = req.body;

        // Log the received data for debugging
        console.log('Received order data:', {
          userId,
          productId,
          quantity,
          pricePaidInPeso,
          address,
          specialInstructions
        });

        // Ensure all required fields are present
        if (!userId || !productId || !quantity || !pricePaidInPeso || !address) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify product stock
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.stock < quantity) {
          return res.status(400).json({ error: 'Insufficient stock or invalid product' });
        }

        // Generate a unique orderGroupId
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderGroupId = `GRP-${timestamp}-${randomString}`;
        
        // Create the order using the provided orderGroupId
        const order = await prisma.order.create({
          data: {
            userId,
            productId,
            quantity,
            pricePaidInPeso,
            address,
            orderGroupId,
            specialInstructions,
            shippingId: `SHIP-${timestamp}-${randomString}`,
            shippingStatus: 'not-shipped',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                name: true,
                imagePath: true,
                price: true,
              },
            },
          },
        });

        // Update product stock
        await prisma.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });

        res.status(200).json(order);
      }
    } catch (error) {
      console.error('Detailed error creating order:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'Missing orderId or status' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { shippingStatus: status },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
              imagePath: true,
              price: true,
            },
          },
        },
      });

      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}