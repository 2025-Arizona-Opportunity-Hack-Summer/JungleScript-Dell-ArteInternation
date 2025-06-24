"use client"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    // Redirect to alumni dashboard by default
    window.location.href = "/alumni/dashboard"
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
