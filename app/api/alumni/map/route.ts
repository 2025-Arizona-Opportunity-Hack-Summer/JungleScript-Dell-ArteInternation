import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth()

    let query = supabaseAdmin.from("alumni").select("id, firstName, lastName, email, phone, address, programsAttended, currentWork, biography, tags, portfolioLinks, lastUpdated, profilePrivacy, imageUrl, clerkUserId")

    const userRole = sessionClaims?.metadata?.role
    
    if (userRole === "admin") {
      // Admins can see everyone
    } else if (userId) {
      // Logged-in alumni can see public profiles
      query = query.eq("profilePrivacy", "public")
    } else {
      // Not-logged-in users can only see public profiles (shouldn't happen since app requires auth)
      query = query.eq("profilePrivacy", "public")
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching alumni for map:", error)
      return new NextResponse("Internal Server Error", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[ALUMNI_MAP_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 