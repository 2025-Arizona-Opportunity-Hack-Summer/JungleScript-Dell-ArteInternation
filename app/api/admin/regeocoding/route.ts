import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { logger } from "@/lib/logger"

// admin-only endpoint to re-geocode alumni addresses
export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth()
    const userRole = sessionClaims?.metadata?.role

    // only admins can use this endpoint
    if (userRole !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { force = false, limit = 50 } = await request.json()

    logger.api.info("admin/regeocoding", "Starting re-geocoding process", { force, limit })

    // find alumni with addresses but missing or outdated coordinates
    let query = supabaseAdmin
      .from("alumni")
      .select("id, firstName, lastName, address")
      .not("address", "is", null)
      .limit(limit)

    if (!force) {
      // only process records missing coordinates
      query = query.or("address->>latitude.is.null,address->>longitude.is.null")
    }

    const { data: alumni, error } = await query

    if (error) {
      logger.api.error("admin/regeocoding", "Failed to fetch alumni", error)
      return new NextResponse("Failed to fetch alumni", { status: 500 })
    }

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[]
    }

    const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API
    if (!mapboxApiKey) {
      return new NextResponse("Mapbox API key not configured", { status: 500 })
    }

    // process each alumni record
    for (const alum of alumni) {
      results.processed++
      
      const address = alum.address
      if (!address?.city) {
        results.skipped++
        results.details.push({ 
          id: alum.id, 
          name: `${alum.firstName} ${alum.lastName}`, 
          status: 'skipped', 
          reason: 'no city' 
        })
        continue
      }

      // improved geocoding with multiple fallback attempts
      const geocodeAttempts = []
      
      // attempt 1: city, state, country (most specific)
      if (address.city && address.state && address.country) {
        geocodeAttempts.push(`${address.city}, ${address.state}, ${address.country}`)
      }
      
      // attempt 2: city, country
      if (address.city && address.country) {
        geocodeAttempts.push(`${address.city}, ${address.country}`)
      }
      
      // attempt 3: city, state (for US addresses)
      if (address.city && address.state) {
        geocodeAttempts.push(`${address.city}, ${address.state}`)
        geocodeAttempts.push(`${address.city}, ${address.state}, United States`)
      }
      
      // attempt 4: just city
      geocodeAttempts.push(address.city)

      let coordinates = null
      let successfulQuery = null

      // try each geocoding attempt until one succeeds
      for (const searchQuery of geocodeAttempts) {
        try {
          const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${mapboxApiKey}&limit=1`

          const response = await fetch(endpoint)
          const data = await response.json()

          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center
            coordinates = { longitude, latitude }
            successfulQuery = searchQuery
            break
          }
        } catch (err) {
          logger.api.warn("admin/regeocoding", `Geocoding attempt failed for: ${searchQuery}`, err)
        }
      }

      if (coordinates) {
        // update the alumni record with new coordinates
        const updatedAddress = { ...address, ...coordinates }
        
        const { error: updateError } = await supabaseAdmin
          .from("alumni")
          .update({ address: updatedAddress })
          .eq("id", alum.id)

        if (updateError) {
          results.failed++
          results.details.push({ 
            id: alum.id, 
            name: `${alum.firstName} ${alum.lastName}`, 
            status: 'failed', 
            reason: 'database update failed',
            error: updateError.message
          })
          logger.api.error("admin/regeocoding", "Failed to update coordinates", updateError)
        } else {
          results.success++
          results.details.push({ 
            id: alum.id, 
            name: `${alum.firstName} ${alum.lastName}`, 
            status: 'success', 
            query: successfulQuery,
            coordinates
          })
        }
      } else {
        results.failed++
        results.details.push({ 
          id: alum.id, 
          name: `${alum.firstName} ${alum.lastName}`, 
          status: 'failed', 
          reason: 'geocoding failed',
          address
        })
      }

      // small delay to be respectful to mapbox api
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    logger.api.info("admin/regeocoding", "Re-geocoding complete", results)
    return NextResponse.json(results)

  } catch (error) {
    logger.api.error("admin/regeocoding", "Unexpected error", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}