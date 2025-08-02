import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { logger } from "@/lib/logger"
import { validateServerAuth } from "@/lib/auth-utils"

// GET /api/admin/alumni - Fetch all alumni (admin only)
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth()
    
    // use centralized auth validation
    const authResult = validateServerAuth(userId, sessionClaims)
    if (!authResult.isValid) {
      return new NextResponse(authResult.error || "Unauthorized", { status: 401 })
    }

    const { isAdmin } = authResult
    
    if (isAdmin) {
      // Admin: Use admin client to bypass RLS and get all records
      const { data, error } = await supabaseAdmin
        .from("alumni")
        .select("*")
        .order("lastName", { ascending: true })

      if (error) {
        logger.api.error("admin/alumni", "Error fetching alumni (admin)", error)
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
        logger.api.error("admin/alumni", "Error fetching alumni (user)", error)
        return new NextResponse("Internal Server Error", { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    logger.api.error("admin/alumni", "Unexpected error in GET", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// POST /api/admin/alumni - Create new alumni (admin only)
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth()
    
    // use centralized auth validation
    const authResult = validateServerAuth(userId, sessionClaims)
    if (!authResult.isValid) {
      return new NextResponse(authResult.error || "Unauthorized", { status: 401 })
    }

    if (!authResult.isAdmin) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 })
    }

    const body = await req.json()

    // Remove id field to let PostgreSQL auto-generate it for new records
    const { id, ...bodyWithoutId } = body

    logger.api.info("admin/alumni", "Creating new alumni", { 
      hasIdField: id !== undefined,
      idValue: id 
    })

    // Use admin client for admin operations
    const { data, error } = await supabaseAdmin
      .from("alumni")
      .insert([bodyWithoutId])
      .select()
      .single()

    if (error) {
      logger.api.error("admin/alumni", "Error creating alumni", error)
      return new NextResponse("Failed to create alumni", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.api.error("admin/alumni", "Unexpected error in POST", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}