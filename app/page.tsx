"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUserRedirect, AuthLoadingStates } from "@/lib/auth-utils"

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      const redirectResult = getAuthenticatedUserRedirect(user)
      if (redirectResult.shouldRedirect && redirectResult.redirectTo) {
        router.push(redirectResult.redirectTo)
      }
    }
  }, [isLoaded, user, router])

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div>{AuthLoadingStates.checking}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Dell'Arte Alumni Network</h1>
        <p className="text-lg text-gray-700 mb-8">
          Connect with fellow alumni, discover opportunities, and stay in touch with the Dell'Arte community.
        </p>
        <div className="flex space-x-4">
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div>{AuthLoadingStates.redirecting}</div>
    </div>
  )
}
