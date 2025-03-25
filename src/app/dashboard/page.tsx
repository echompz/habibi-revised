"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardTitleHeader } from "@/components/ui/card";
import { getDashboardData } from "@/app/_actions/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";


export default function AdminDashboard() {
  // Timeframe states
  const [salesTimeframe, setSalesTimeframe] = useState<"lastWeek" | "lastMonth" | "lastYear">(
    "lastMonth"
  );
  const [earningsTimeframe, setEarningsTimeframe] = useState<"last6Months" | "lastYear">(
    "last6Months"
  );


  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalOrders: number;
    outOfStock: number;
    totalEarnings: number;
    topProducts: { name: string; sales: number }[];
  }>({
    totalProducts: 0,
    totalOrders: 0,
    outOfStock: 0,
    totalEarnings: 0,
    topProducts: [],
  });

  const [earningsHistory, setEarningsHistory] = useState<{ month: string; earnings: number }[]>([]);


  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData(salesTimeframe);
      setDashboardData({
        totalProducts: data.totalProducts,
        totalOrders: data.totalOrders,
        outOfStock: data.outOfStock,
        totalEarnings: data.totalEarnings,
        topProducts: data.topProducts || [],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsHistory = async (timeframe: string) => {
    try {
      setLoading(true);
      const data = await getDashboardData(timeframe);
      setEarningsHistory(data.earningsHistory || []);
    } catch (error) {
      console.error("Failed to load earnings history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchEarningsHistory(earningsTimeframe);
  }, [earningsTimeframe]);

  const { totalProducts, totalOrders, outOfStock, totalEarnings, topProducts } = dashboardData;


  return (
    <div className="container my-6">
      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      </CardTitleHeader>


      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader>Total Products</CardHeader>
          <CardTitle>{totalProducts}</CardTitle>
        </Card>
        <Card className="bg-white">
          <CardHeader>Total Orders</CardHeader>
          <CardTitle>{totalOrders}</CardTitle>
        </Card>
        <Card className="bg-white">
          <CardHeader>Out of Stock</CardHeader>
          <CardTitle>{outOfStock}</CardTitle>
        </Card>
        <Card className="bg-white">
          <CardHeader>Total Earnings</CardHeader>
          <CardTitle className="text-[#65a30d]">₱{totalEarnings.toLocaleString()}</CardTitle>
        </Card>
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Products Sold Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Top Products Sold</h2>
            <Select
              value={salesTimeframe}
              onValueChange={(value) =>
                setSalesTimeframe(value as "lastWeek" | "lastMonth" | "lastYear")
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastWeek">Last Week</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>


        {/* Total Earnings Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Total Earnings</h2>
            <Select
              value={earningsTimeframe}
              onValueChange={(value) => setEarningsTimeframe(value as "last6Months" | "lastYear")}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last6Months">Last 6 Months</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {earningsHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#65a30d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}