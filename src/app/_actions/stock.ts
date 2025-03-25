"use server"

import db from "@/data/db";
import { revalidatePath } from "next/cache";

export async function addStock(productId: string, quantity: number) {
    try {
        await db.product.update({
            where: { id: productId },
            data: {
                stock: {
                    increment: quantity
                }
            }
        });
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error adding stock:', error);
        return { success: false };
    }
}

export async function removeStock(productId: string, quantity: number) {
    try {
        const product = await db.product.findUnique({
            where: { id: productId },
            select: { stock: true }
        });

        if (!product || product.stock < quantity) {
            return { success: false, error: "Insufficient stock" };
        }

        await db.product.update({
            where: { id: productId },
            data: {
                stock: {
                    decrement: quantity
                }
            }
        });
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error removing stock:', error);
        return { success: false };
    }
}

export async function updateStock(productId: string, quantity: number) {
    try {
        await db.product.update({
            where: { id: productId },
            data: {
                stock: quantity
            }
        });
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false };
    }
}