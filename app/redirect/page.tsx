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
        router.push("/map")
      }
    }
  }, [user, isLoaded, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  )
} 