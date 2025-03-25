import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const shipments = await prisma.shipping.findMany()
      res.status(200).json(shipments)
    } catch (error) {
      console.error("API Error:", error)
      res.status(500).json({ message: "Internal Server Error" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).json({ message: `Method ${req.method} not allowed` })
  }
}
// here is api routing
