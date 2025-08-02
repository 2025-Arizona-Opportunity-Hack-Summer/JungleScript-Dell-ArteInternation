"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { getPostSigninRedirect, AuthLoadingStates } from "@/lib/auth-utils"
import { logger } from "@/lib/logger"

export default function RedirectPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      handleRedirect()
    }
  }, [user, isLoaded, router])

  const handleRedirect = async () => {
    try {
      const redirectResult = await getPostSigninRedirect(user)
      if (redirectResult.shouldRedirect && redirectResult.redirectTo) {
        logger.debug("Post-signin redirect", {
          redirectTo: redirectResult.redirectTo,
          reason: redirectResult.reason
        })
        router.push(redirectResult.redirectTo)
      }
    } catch (error) {
      logger.error("Error handling post-signin redirect", error)
      // Fallback to register page
      router.push("/register")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p>{AuthLoadingStates.redirecting}</p>
    </div>
  )
} 