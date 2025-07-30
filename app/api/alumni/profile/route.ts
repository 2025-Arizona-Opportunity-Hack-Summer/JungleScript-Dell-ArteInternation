import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { data, error } = await supabaseAdmin.from("alumni").select("*").eq("clerkUserId", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // This means no record was found, which is a valid case for a new user.
        return NextResponse.json(null)
      }
      console.error("Error fetching alumni profile:", error)
      return new NextResponse("Internal Server Error", { status: 500 })
    }

    // Merge supabase data with live clerk data
    const profileData = {
      ...data,
      imageUrl: user.imageUrl,
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("[ALUMNI_PROFILE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      return new NextResponse("Email not found for user", { status: 400 })
    }

    const body = await req.json()
    const {
      phone,
      address,
      programs,
      graduationYears,
      currentRole,
      currentOrganization,
      firstName,
      lastName,
      biography,
      websiteUrl,
      linkedinUrl,
      instagramUrl,
      youtubeUrl,
      professionalTags,
      dellArteRoles,
      profileVisibility,
    } = body

    // --- Geocoding Step ---
    let coordinates = {}
    if (address.city && address.country) {
      const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API
      if (mapboxApiKey) {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address.city,
        )},${encodeURIComponent(address.country)}.json?access_token=${mapboxApiKey}&limit=1`
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center
            coordinates = { longitude, latitude }
          }
        } catch (err) {
          console.error("Geocoding failed:", err)
        }
      }
    }
    // --- End Geocoding Step ---

    // Map frontend data to the database schema
    const profileData = {
      clerkUserId: userId,
      imageUrl: user.imageUrl,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email,
      phone: phone,
      address: { ...address, ...coordinates },
      programsAttended: programs, // maps `programs` to `programsAttended`
      biography: biography,
      currentWork: {
        title: currentRole,
        organization: currentOrganization,
      },
      tags: professionalTags, // maps `professionalTags` to `tags`
      portfolioLinks: {
        website: websiteUrl,
        linkedin: linkedinUrl,
        instagram: instagramUrl,
        youtube: youtubeUrl,
      },
      experiencesAtDellArte: dellArteRoles, // maps `dellArteRoles` to `experiencesAtDellArte`
      profilePrivacy: profileVisibility, // maps `profileVisibility` to `profilePrivacy`
      lastUpdated: new Date().toISOString(),
    }

    // Check if an alumni record with this email already exists
    const { data: existingAlumni } = await supabaseAdmin.from("alumni").select("id").eq("email", email).single()

    if (existingAlumni) {
      // Email exists: Link the new Clerk ID and update the profile data.
      const { data, error } = await supabaseAdmin
        .from("alumni")
        .update(profileData)
        .eq("email", email)
        .select()
        .single()

      if (error) {
        console.error("Error linking alumni account:", error)
        return new NextResponse("Failed to save profile", { status: 500 })
      }
      return NextResponse.json(data)
    } else {
      // Email does not exist: Create a new alumni record.
      const { data, error } = await supabaseAdmin
        .from("alumni")
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error("Error creating new alumni profile:", error)
        return new NextResponse("Failed to save profile", { status: 500 })
      }
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("[ALUMNI_PROFILE_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 