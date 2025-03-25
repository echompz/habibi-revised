"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardTitleHeader } from "@/components/ui/card"
import { Package, ShoppingCart, Filter } from "lucide-react"
import { SearchForm } from "../products/_components/SearchForm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { fetchLogs } from "@/app/_actions/logs"

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "product" | "product-update" | "order" | "order-update"
}

export default function Logs() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get("search") || ""
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    async function loadLogs() {
      const data = await fetchLogs(searchQuery)
      setLogs(data)
    }
    loadLogs()
  }, [searchQuery])

  const filteredLogs = filter === "all" ? logs : logs.filter(log => log.type === filter)

  return (
    <div className="p-6 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between">
      <CardTitleHeader className="text-lg">
        <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>
      </CardTitleHeader>

        {/* Search & Filter Row */}
        <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
          {/* Enlarged Search Input */}
          <div className="flex-grow md:w-[200px] lg:w-[300px]">
            <SearchForm initialQuery={searchQuery} className="w-full" />
          </div>

          {/* Filter Dropdown */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="border border-border bg-muted/20 px-4 py-2 rounded-lg flex items-center space-x-2 w-48">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <SelectValue placeholder="Filter Logs" />
            </SelectTrigger>
            <SelectContent className="w-48" align="end" side="bottom">
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="product">Product Created</SelectItem>
              <SelectItem value="product-update">Product Updated</SelectItem>
              <SelectItem value="order">Order Created</SelectItem>
              <SelectItem value="order-update">Order Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Display */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No logs found matching your search." : "No logs available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLogs.map((log) => {
            const logTypeInfo = getLogTypeInfo(log.type)
            return (
              <Card key={log.id} className="border border-border rounded-lg shadow-md transition hover:shadow-lg">
                <CardHeader className="flex items-center justify-between bg-muted/40 p-4 rounded-t-lg">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${logTypeInfo.color}`}>
                    {logTypeInfo.label}
                  </div>
                  {logTypeInfo.icon}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold">{log.message}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-2">
                    <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Helper function for log icons and colors
function getLogTypeInfo(type: LogEntry["type"]) {
  switch (type) {
    case "product":
      return { icon: <Package className="w-6 h-6 text-chart-1" />, label: "Product Created", color: "bg-chart-1/20 text-chart-1" }
    case "product-update":
      return { icon: <Package className="w-6 h-6 text-chart-2" />, label: "Product Updated", color: "bg-chart-2/20 text-chart-2" }
    case "order":
      return { icon: <ShoppingCart className="w-6 h-6 text-chart-3" />, label: "Order Created", color: "bg-chart-3/20 text-chart-3" }
    case "order-update":
      return { icon: <ShoppingCart className="w-6 h-6 text-chart-4" />, label: "Order Updated", color: "bg-chart-4/20 text-chart-4" }
    default:
      return { icon: null, label: "Unknown", color: "bg-gray-300 text-gray-700" }
  }
}
