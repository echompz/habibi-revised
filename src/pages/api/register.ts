import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, password, role } = req.body;

    // Validate input fields
    if (!email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Generate JWT Token
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}