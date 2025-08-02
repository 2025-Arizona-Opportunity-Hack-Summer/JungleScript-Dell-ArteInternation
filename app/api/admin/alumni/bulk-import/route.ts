import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { logger } from "@/lib/logger"

// POST /api/admin/alumni/bulk-import - Bulk import alumni records (admin only)
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

    const { records } = await req.json()

    if (!Array.isArray(records) || records.length === 0) {
      return new NextResponse("Invalid records data", { status: 400 })
    }

    logger.api.info("admin/alumni/bulk-import", "Starting bulk import", { 
      recordCount: records.length,
      sampleRecord: records[0]
    })

    // Use admin client for bulk insert
    const { data, error } = await supabaseAdmin
      .from("alumni")
      .insert(records)
      .select()

    if (error) {
      logger.api.error("admin/alumni/bulk-import", "Bulk import failed", error)
      return new NextResponse("Failed to import records", { status: 500 })
    }

    logger.api.info("admin/alumni/bulk-import", "Bulk import successful", {
      insertedCount: data?.length || 0
    })

    return NextResponse.json({ 
      success: true, 
      insertedCount: data?.length || 0,
      records: data 
    })
  } catch (error) {
    logger.api.error("admin/alumni/bulk-import", "Unexpected error in bulk import", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}