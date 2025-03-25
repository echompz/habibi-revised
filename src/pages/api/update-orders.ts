import { NextApiRequest, NextApiResponse } from "next";

// Declare a global variable to store updated orders
declare global {
  var updatedOrders: number;
}

// Initialize the global variable if not already defined
globalThis.updatedOrders = globalThis.updatedOrders || 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Increment the total orders count
      globalThis.updatedOrders += 1;

      return res.status(200).json({
        message: "Orders updated successfully",
        updatedOrders: globalThis.updatedOrders
      });

    } catch (error) {
      console.error("Error updating orders:", error);
      return res.status(500).json({ error: "Failed to update orders" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
