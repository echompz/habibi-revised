"use client"

import { Nav, NavLink } from "@/components/Nav"
import { HomeIcon, ShoppingCartIcon, TruckIcon, StarIcon, ScissorsIcon, ClockIcon } from "@heroicons/react/24/solid"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/context/userRoleContext"
import LogoutButton from "@/components/LogoutButton"
import { useEffect } from "react"

const Menu = () => {
  const pathname = usePathname()
  const { userRole } = useUserRole()

  // For debugging
  useEffect(() => {
    console.log("Menu component - Current user role:", userRole)
    console.log("localStorage role:", typeof window !== "undefined" ? localStorage.getItem("role") : null)
    console.log(
      "localStorage token:",
      typeof window !== "undefined" ? (localStorage.getItem("token") ? "exists" : "not found") : null,
    )
  }, [userRole])

  // Do not display the menu on the login or register pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav>
      <Nav>
        {userRole === "seller" ? (
          <>
            <NavLink href="/dashboard">
              <HomeIcon className="h-6 w-6 mr-3" /> Dashboard
            </NavLink>
            <NavLink href="/orders">
              <ShoppingCartIcon className="h-6 w-6 mr-3" /> Orders
            </NavLink>
            <NavLink href="/reviews">
              <StarIcon className="h-6 w-6 mr-3" /> Reviews
            </NavLink>
            <NavLink href="/products">
              <ScissorsIcon className="h-6 w-6 mr-3" /> Products
            </NavLink>
            <NavLink href="/logs">
              <ClockIcon className="h-6 w-6 mr-3" /> Logs
            </NavLink>
          </>
        ) : (
          <>
            <NavLink href="/customerdashboard">
              <ShoppingCartIcon className="h-6 w-6 mr-3" /> Shop Products
            </NavLink>
            <NavLink href="/customerorders">
              <ClockIcon className="h-6 w-6 mr-3" /> My Orders
            </NavLink>
          </>
        )}
        <LogoutButton />
      </Nav>
    </nav>
  )
}

export default Menu

