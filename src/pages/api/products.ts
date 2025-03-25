import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sort, categories, minPrice, maxPrice } = req.query;
  let orderBy = {};

  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'name-asc':
      orderBy = { name: 'asc' };
      break;
    case 'name-desc':
      orderBy = { name: 'desc' };
      break;
    case 'category-asc':
      orderBy = { category: 'asc' };
      break;
    case 'category-desc':
      orderBy = { category: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailableForPurchase: true,
        category: categories ? { in: (categories as string).split(',') } : undefined,
        price: {
          gte: parseFloat(minPrice as string),
          lte: parseFloat(maxPrice as string),
        },
      },
      orderBy,
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}