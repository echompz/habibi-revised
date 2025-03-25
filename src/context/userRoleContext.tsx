"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

interface UserRoleContextType {
  userRole: string
  setUserRole: (role: string) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<string>("customer")

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      // First try to get the role directly (this is how your app currently works)
      const directRole = localStorage.getItem("role")
      if (directRole) {
        setUserRole(directRole)
        console.log("Role set directly from localStorage:", directRole)
        return
      }

      // If no direct role, try to get it from the token (for future compatibility)
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token)
          setUserRole(decodedToken.role)
          console.log("Role set from decoded token:", decodedToken.role)
        } catch (error) {
          console.error("Error decoding token:", error)
        }
      }
    }
  }, [])

  return <UserRoleContext.Provider value={{ userRole, setUserRole }}>{children}</UserRoleContext.Provider>
}

export const useUserRole = () => {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }
  return context
}

