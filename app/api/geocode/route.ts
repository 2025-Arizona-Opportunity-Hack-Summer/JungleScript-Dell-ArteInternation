import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { city, country, query } = await request.json()

  // support both old format (city, country) and new format (full query)
  let searchQuery: string
  if (query) {
    searchQuery = query
  } else if (city && country) {
    searchQuery = `${city}, ${country}`
  } else if (city) {
    searchQuery = city
  } else {
    return NextResponse.json({ error: "City, country, or query is required" }, { status: 400 })
  }

  const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API
  if (!mapboxApiKey) {
    return NextResponse.json({ error: "Mapbox API key is not configured" }, { status: 500 })
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    searchQuery,
  )}.json?access_token=${mapboxApiKey}&limit=1`

  try {
    const response = await fetch(endpoint)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return NextResponse.json({ latitude, longitude })
    } else {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch geocoding data" }, { status: 500 })
  }
} 