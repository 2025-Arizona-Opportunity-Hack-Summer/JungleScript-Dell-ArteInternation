"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function RedirectPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (user?.publicMetadata?.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        // Check if user has an alumni profile before redirecting
        checkUserProfile()
      }
    }
  }, [user, isLoaded, router])

  const checkUserProfile = async () => {
    try {
      const response = await fetch("/api/alumni/profile")
      if (response.ok) {
        const profileData = await response.json()
        if (profileData) {
          // User has a profile, go to map
          router.push("/map")
        } else {
          // No profile exists, redirect to create one
          router.push("/register")
        }
      } else {
        // Error fetching profile, assume they need to create one
        router.push("/register")
      }
    } catch (error) {
      console.error("Error checking user profile:", error)
      // On error, redirect to register to be safe
      router.push("/register")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  )
} 