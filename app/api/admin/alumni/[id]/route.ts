import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

// PUT /api/admin/alumni/[id] - Update alumni
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const alumniId = parseInt(params.id)
    if (isNaN(alumniId)) {
      return new NextResponse("Invalid alumni ID", { status: 400 })
    }

    const body = await req.json()
    const isAdmin = sessionClaims?.metadata?.role === "admin"

    if (isAdmin) {
      // Admin: Can update any record using admin client
      const { data, error } = await supabaseAdmin
        .from("alumni")
        .update(body)
        .eq("id", alumniId)
        .select()
        .single()

      if (error) {
        console.error("Error updating alumni (admin):", error)
        return new NextResponse("Failed to update alumni", { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Regular user: Can only update their own record (RLS will enforce this)
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from("alumni")
        .update(body)
        .eq("id", alumniId)
        .select()
        .single()

      if (error) {
        console.error("Error updating alumni (user):", error)
        if (error.code === "PGRST116") {
          return new NextResponse("Not found or access denied", { status: 404 })
        }
        return new NextResponse("Failed to update alumni", { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("[ADMIN_ALUMNI_PUT]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// DELETE /api/admin/alumni/[id] - Delete alumni (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const alumniId = parseInt(params.id)
    if (isNaN(alumniId)) {
      return new NextResponse("Invalid alumni ID", { status: 400 })
    }

    // Use admin client for delete operations
    const { error } = await supabaseAdmin
      .from("alumni")
      .delete()
      .eq("id", alumniId)

    if (error) {
      console.error("Error deleting alumni:", error)
      return new NextResponse("Failed to delete alumni", { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ADMIN_ALUMNI_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}