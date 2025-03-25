"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"
import { useUserRole } from "@/context/userRoleContext"
import { toast } from "sonner"

const LogoutButton = () => {
  const router = useRouter()
  const { setUserRole } = useUserRole()
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showModal && (e.target as HTMLElement).classList.contains("modal-overlay")) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal])

  const handleLogout = () => {
    // Clear both token and role from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("role")

    // Reset the user role to the default
    setUserRole("customer")

    // Close the modal
    setShowModal(false)

    // Show success message
    toast.success("Logged out successfully")

    // Redirect to login page
    router.push("/login")
  }

  // Prevent page scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showModal])

  // Modal component to be rendered in portal
  const Modal = () => (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full relative z-[100000]">
        <h2 className="text-lg font-semibold mb-2">Are you sure you want to log out?</h2>
        <p className="text-gray-500 mb-4">This will end your current session.</p>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Button variant="destructive" className="w-full bg-[#b5ce90] hover:bg-[#98ad77] text-black border border-[#98ad77]" onClick={() => setShowModal(true)}>
        Logout
      </Button>

      {mounted && showModal && createPortal(<Modal />, document.body)}
    </>
  )
}

export default LogoutButton

