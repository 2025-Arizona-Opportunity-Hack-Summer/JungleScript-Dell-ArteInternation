import type { User } from "@clerk/nextjs/server"
import { logger } from "./logger"

// Type definitions for authentication
export type UserRole = "admin" | "user"

export interface UserAuthData {
  user: User | null
  isAdmin: boolean
  role: UserRole
  isLoaded: boolean
}

export interface RedirectResult {
  shouldRedirect: boolean
  redirectTo?: string
  reason?: string
}

// centralized role checking
export function getUserRole(user: User | null | undefined): UserRole {
  return user?.publicMetadata?.role === "admin" ? "admin" : "user"
}

// check if user is admin
export function isUserAdmin(user: User | null | undefined): boolean {
  return getUserRole(user) === "admin"
}

// get user auth data for components
export function getUserAuthData(user: User | null | undefined, isLoaded: boolean): UserAuthData {
  return {
    user: user || null,
    isAdmin: isUserAdmin(user),
    role: getUserRole(user),
    isLoaded
  }
}

// determine redirect path for authenticated users
export function getAuthenticatedUserRedirect(user: User | null | undefined): RedirectResult {
  if (!user) {
    return { shouldRedirect: false }
  }

  if (isUserAdmin(user)) {
    return {
      shouldRedirect: true,
      redirectTo: "/admin/dashboard",
      reason: "admin_user"
    }
  }

  return {
    shouldRedirect: true,
    redirectTo: "/map",
    reason: "regular_user"
  }
}

// check user profile and determine redirect for post-signin
export async function getPostSigninRedirect(user: User | null | undefined): Promise<RedirectResult> {
  if (!user) {
    return { shouldRedirect: false }
  }

  if (isUserAdmin(user)) {
    return {
      shouldRedirect: true,
      redirectTo: "/admin/dashboard",
      reason: "admin_signin"
    }
  }

  // For regular users, check if they have a profile
  try {
    logger.debug("Checking user profile for post-signin redirect")
    const response = await fetch("/api/alumni/profile")
    
    if (response.ok) {
      const profileData = await response.json()
      if (profileData) {
        // User has a profile, go to map
        return {
          shouldRedirect: true,
          redirectTo: "/map",
          reason: "has_profile"
        }
      } else {
        // No profile exists, redirect to create one
        return {
          shouldRedirect: true,
          redirectTo: "/register",
          reason: "needs_profile"
        }
      }
    } else {
      // Error fetching profile, assume they need to create one
      logger.warn("Error fetching profile for redirect, defaulting to register")
      return {
        shouldRedirect: true,
        redirectTo: "/register",
        reason: "profile_fetch_error"
      }
    }
  } catch (error) {
    logger.error("Error checking user profile for redirect", error)
    // On error, redirect to register to be safe
    return {
      shouldRedirect: true,
      redirectTo: "/register",
      reason: "profile_check_error"
    }
  }
}

// server-side auth checking for API routes
export function validateServerAuth(userId: string | null, sessionClaims: any) {
  if (!userId) {
    return { isValid: false, isAdmin: false, error: "Unauthorized" }
  }

  const isAdmin = sessionClaims?.metadata?.role === "admin"
  
  return {
    isValid: true,
    isAdmin,
    role: isAdmin ? "admin" as UserRole : "user" as UserRole,
    error: null
  }
}

// check if user can access admin routes
export function canAccessAdminRoutes(sessionClaims: any): boolean {
  return sessionClaims?.metadata?.role === "admin"
}

// navigation items based on user role
export function getNavigationItems(isAdmin: boolean) {
  if (isAdmin) {
    return [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/alumni", label: "Alumni" },
      { href: "/admin/import", label: "Import" },
      { href: "/map", label: "Map" },
    ]
  }

  return [
    { href: "/map", label: "Map" },
    { href: "/alumni/profile", label: "Profile" },
  ]
}

// loading state component props
export interface AuthLoadingProps {
  message?: string
  className?: string
}

// common loading states for auth components
export const AuthLoadingStates = {
  checking: "Checking authentication...",
  loading: "Loading...",
  redirecting: "Redirecting...",
} as const