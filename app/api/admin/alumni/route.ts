import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// GET /api/admin/alumni - Fetch all alumni (admin only)
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin
    const isAdmin = sessionClaims?.metadata?.role === "admin"
    
    if (isAdmin) {
      // Admin: Use admin client to bypass RLS and get all records
      const { data, error } = await supabaseAdmin
        .from("alumni")
        .select("*")
        .order("lastName", { ascending: true })

      if (error) {
        console.error("Error fetching alumni (admin):", error)
        return new NextResponse("Internal Server Error", { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Regular user: Use authenticated client with RLS
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from("alumni")
        .select("*")
        .order("lastName", { ascending: true })

      if (error) {
        console.error("Error fetching alumni (user):", error)
        return new NextResponse("Internal Server Error", { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("[ADMIN_ALUMNI_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// POST /api/admin/alumni - Create new alumni (admin only)
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is admin
    const isAdmin = sessionClaims?.metadata?.role === "admin"
    
    if (!isAdmin) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 })
    }

    const body = await req.json()

    // Use admin client for admin operations
    const { data, error } = await supabaseAdmin
      .from("alumni")
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error("Error creating alumni:", error)
      return new NextResponse("Failed to create alumni", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[ADMIN_ALUMNI_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}