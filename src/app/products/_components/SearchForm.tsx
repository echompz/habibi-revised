"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface SearchFormProps {
  initialQuery: string
  placeholder?: string
  redirectRoute?: string
  deactivatedPage?: boolean
}

export function SearchForm({ 
  initialQuery, 
  placeholder = "Search...", 
  redirectRoute,
  deactivatedPage = false
}: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Determine the base URL
    const baseUrl = redirectRoute || pathname || "/"

    // Build the URL with the search query
    const url = searchQuery 
      ? `${baseUrl}?search=${encodeURIComponent(searchQuery)}`
      : baseUrl

    router.push(url)
  }, [searchQuery, redirectRoute, pathname, router])

  const handleClear = () => {
    setSearchQuery("")
    const baseUrl = redirectRoute || pathname || "/"
    router.push(baseUrl)
  }

  return (
    <form className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 w-full bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {searchQuery && (
        <Button type="button" variant="outline" onClick={handleClear} className="bg-[#ffffff]">
          Clear
        </Button>
      )}
    </form>
  )
}