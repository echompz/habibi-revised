import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user's role matches the requested role
    if (user.role !== role) {
      return res.status(401).json({ error: "Invalid role for this user" });
    }

    // Check if user.password is null
    if (user.password === null) {
      console.error("User password is null for email:", email);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        username: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({ 
      message: "Login successful", 
      token, 
      role: user.role,
      name: user.name // Optionally send name back to frontend
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
