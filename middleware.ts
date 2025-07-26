import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/admin(.*)"])

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/register",
  "/redirect",
  "/api/geocode",
  "/api/webhooks/clerk",
])

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      const { sessionClaims } = await auth()
      if (sessionClaims?.metadata.role !== "admin") {
        const url = req.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }

    if (isPublicRoute(req)) {
      return
    }
  },
  {
    afterSignInUrl: "/redirect",
  },
)

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
} 