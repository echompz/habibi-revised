"use server";
import db from "@/data/db";
import { subMonths, subWeeks, subYears, format } from "date-fns";

export async function getDashboardData(timeframe: "lastWeek" | "lastMonth" | "lastYear" | "last6Months" | "lastYear") {
  try {
    let startDate;
    if (timeframe === "lastWeek") {
      startDate = subWeeks(new Date(), 1);
    } else if (timeframe === "lastMonth") {
      startDate = subMonths(new Date(), 1);
    } else if (timeframe === "last6Months") {
      startDate = subMonths(new Date(), 6);
    } else {
      startDate = subYears(new Date(), 1);
    }

    const [totalProducts, totalOrders, outOfStock, earnings, topProducts, earningsHistory] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.product.count({ where: { stock: 0 } }),
      db.order.aggregate({ _sum: { pricePaidInPeso: true } }),
      db.order.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
      Promise.all(
        Array.from({ length: timeframe === "last6Months" ? 6 : 12 }, (_, i) => {
          const month = subMonths(new Date(), i);
          return db.order.aggregate({
            where: {
              createdAt: {
                gte: new Date(month.getFullYear(), month.getMonth(), 1),
                lt: new Date(month.getFullYear(), month.getMonth() + 1, 1),
              },
            },
            _sum: { pricePaidInPeso: true },
          }).then((res) => ({
            month: format(month, "MMMM"),
            earnings: res._sum.pricePaidInPeso || 0,
          }));
        })
      ).then((data) => data.reverse()),
    ]);

    const productDetails = await db.product.findMany({
      where: { id: { in: topProducts.map((item) => item.productId) } },
      select: { id: true, name: true },
    });

    const topProductsData = topProducts.map((item) => ({
      name: productDetails.find((p) => p.id === item.productId)?.name || "Unknown",
      sales: item._count.productId || 0,
    }));

    return {
      totalProducts,
      totalOrders,
      outOfStock,
      totalEarnings: earnings._sum.pricePaidInPeso || 0,
      topProducts: topProductsData,
      earningsHistory,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      outOfStock: 0,
      totalEarnings: 0,
      topProducts: [],
      earningsHistory: [],
    };
  }
}