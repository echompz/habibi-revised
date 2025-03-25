import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          order: {
            include: {
              product: true,
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { orderId, rating, comment } = req.body;

      // Validate input
      if (!orderId || !rating || !comment) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if order exists and is delivered
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.shippingStatus !== "delivered") {
        return res.status(400).json({ error: "Can only review delivered orders" });
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: { orderId },
      });

      if (existingReview) {
        return res.status(400).json({ error: "Review already exists for this order" });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          orderId,
        },
        include: {
          order: {
            include: {
              product: true,
              user: true,
            },
          },
        },
      });

      return res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}