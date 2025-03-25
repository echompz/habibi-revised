import { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "@/middleware/auth";
import db from "@/data/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define Zod schema for order data validation
const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const placeOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerAddress: z.string().min(1, "Customer address is required"),
  totalAmount: z.number().min(0, "Total amount must be a non-negative number"),
  cartItems: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
});

type PlaceOrderResponse = {
  success: boolean;
  errors?: {
    customerName?: string[];
    customerEmail?: string[];
    customerAddress?: string[];
    totalAmount?: string[];
    cartItems?: string[];
    general?: string[];
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<PlaceOrderResponse>) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, errors: { general: ["Method Not Allowed"] } });
  }

  console.log("Place order action called");

  try {
    // Convert FormData to a plain object
    const formData = req.body;
    const formDataObject: any = { ...formData, totalAmount: parseFloat(formData.totalAmount), cartItems: JSON.parse(formData.cartItems) };

    // Validate form data using Zod
    const result = placeOrderSchema.safeParse(formDataObject);
    if (result.success === false) {
      return res.status(400).json({
        success: false,
        errors: result.error.formErrors.fieldErrors,
      });
    }

    const { customerName, customerEmail, customerAddress, totalAmount, cartItems } = result.data;

    console.log("Creating orders for items:", cartItems);

    // Create orders in database
    const orderPromises = cartItems.map((item: any) => {
      return db.order.create({
        data: {
          pricePaidInPeso: totalAmount / cartItems.length, // Or use item.price if available
          quantity: item.quantity,
          address: customerAddress,
          userId: req.user.userId, // Use the authenticated user's ID
          productId: item.productId,
        },
      });
    });

    const results = await Promise.all(orderPromises);
    console.log(`Created ${results.length} orders successfully`);

    // Revalidate pages
    revalidatePath("/customerdashboard");
    revalidatePath("/orders");

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({
      success: false,
      errors: {
        general: ["Order creation failed. Please try again."],
      },
    });
  }
};

export default authenticate(handler);