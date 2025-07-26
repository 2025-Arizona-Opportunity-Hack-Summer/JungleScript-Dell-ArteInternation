import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/register",
  "/api/geocode",
  "/api/webhooks/clerk",
])

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return
  }
})

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
} 