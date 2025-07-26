import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { city, country } = await request.json()

  if (!city || !country) {
    return NextResponse.json({ error: "City and country are required" }, { status: 400 })
  }

  const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API
  if (!mapboxApiKey) {
    return NextResponse.json({ error: "Mapbox API key is not configured" }, { status: 500 })
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    city,
  )},${encodeURIComponent(country)}.json?access_token=${mapboxApiKey}&limit=1`

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