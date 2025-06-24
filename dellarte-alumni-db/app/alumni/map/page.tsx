"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import Header from "@/components/layout/header"
import { Switch } from "@/components/ui/switch"
import { fetchAlumniForMap, type AlumniProfile } from "@/lib/supabase"
import type mapboxgl from "mapbox-gl"

export default function AlumniMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const mapboxRef = useRef<typeof import("mapbox-gl") | null>(null)
  const [mapboxReady, setMapboxReady] = useState(false)

  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchPeople, setSearchPeople] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [showMap, setShowMap] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchAsIMove, setSearchAsIMove] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null)
  const itemsPerPage = 6

  // Fetch alumni data from Supabase - OPTIMIZED!
  useEffect(() => {
    async function loadAlumni() {
      const startTime = performance.now()

      try {
        const data = await fetchAlumniForMap()
        setAlumni(data)

        const endTime = performance.now()
        console.log(`Map loaded ${data.length} alumni with coordinates in ${Math.round(endTime - startTime)}ms`)
      } catch (error) {
        console.error("Error loading alumni for map:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAlumni()
  }, [])

  // Dynamically load Mapbox GL JS & its CSS
  useEffect(() => {
    let isMounted = true

    async function loadMapbox() {
      try {
        // Inject CSS once
        const cssId = "mapbox-gl-css"
        if (!document.getElementById(cssId)) {
          const link = document.createElement("link")
          link.id = cssId
          link.rel = "stylesheet"
          link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          document.head.appendChild(link)
        }

        // Dynamically import Mapbox
        const mapboxgl = await import("mapbox-gl")

        if (!isMounted) return

        mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API || ""
        mapboxRef.current = mapboxgl.default
        setMapboxReady(true)

        console.log("Mapbox loaded successfully", {
          hasApiKey: !!process.env.NEXT_PUBLIC_MAPBOX_API,
          apiKeyLength: process.env.NEXT_PUBLIC_MAPBOX_API?.length,
        })
      } catch (error) {
        console.error("Failed to load Mapbox:", error)
      }
    }

    loadMapbox()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredAlumni = alumni.filter((alumni) => {
    const nameMatch = `${alumni.first_name} ${alumni.last_name}`.toLowerCase().includes(searchPeople.toLowerCase())
    const locationMatch = `${alumni.city || ""} ${alumni.country || ""}`
      .toLowerCase()
      .includes(searchLocation.toLowerCase())
    return nameMatch && locationMatch
  })

  const paginatedAlumni = filteredAlumni.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage)

  // Initialize map
  useEffect(() => {
    console.log("Map initialization effect triggered", {
      mapboxReady,
      hasContainer: !!mapContainer.current,
      hasExistingMap: !!map.current,
      hasApiKey: !!process.env.NEXT_PUBLIC_MAPBOX_API,
    })

    if (!mapboxReady) {
      console.log("Mapbox not ready yet")
      return
    }

    if (!mapContainer.current) {
      console.log("Map container not found")
      return
    }

    if (map.current) {
      console.log("Map already exists")
      return
    }

    const mb = mapboxRef.current
    if (!mb) {
      console.error("Mapbox reference not found")
      return
    }

    if (!process.env.NEXT_PUBLIC_MAPBOX_API) {
      console.error("Mapbox API key not found")
      return
    }

    try {
      console.log("Initializing map...")
      console.log("Container element:", mapContainer.current)
      console.log("Mapbox version:", mb.version)

      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          map.current = new mb.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/mapbox/streets-v12", // Changed from "mapbox://styles/mapbox/light-v11"
            center: [0, 20],
            zoom: 1.5,
          })

          console.log("Map instance created:", map.current)

          map.current.addControl(new mb.NavigationControl(), "top-right")

          map.current.on("load", () => {
            console.log("Map loaded successfully")
          })

          map.current.on("error", (e) => {
            console.error("Map error:", e)
          })

          map.current.on("style.load", () => {
            console.log("Map style loaded")
          })
        } catch (innerError) {
          console.error("Error in setTimeout map creation:", innerError)
        }
      }, 100)
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      console.log("Cleaning up map")
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxReady])

  // Add markers to map - NOW ENABLED!
  useEffect(() => {
    if (!mapboxReady || !map.current) return

    console.log("Adding markers for", filteredAlumni.length, "alumni")

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add new markers for filtered alumni
    filteredAlumni.forEach((alumniProfile, index) => {
      if (!alumniProfile.latitude || !alumniProfile.longitude) {
        console.log(`Skipping alumni ${alumniProfile.first_name} - no coordinates`)
        return
      }

      try {
        // Create custom marker element
        const markerElement = document.createElement("div")
        markerElement.className = "custom-marker"
        markerElement.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      transition: transform 0.2s ease;
      transform-origin: center center;
      position: relative;
    `
        markerElement.textContent = `${alumniProfile.first_name.charAt(0)}${alumniProfile.last_name.charAt(0)}`

        markerElement.addEventListener("mouseenter", () => {
          markerElement.style.transform = "scale(1.1)"
          markerElement.style.zIndex = "1000"
        })

        markerElement.addEventListener("mouseleave", () => {
          markerElement.style.transform = "scale(1)"
          markerElement.style.zIndex = "auto"
        })

        // Create popup
        const mb = mapboxRef.current
        if (!mb) return

        const popup = new mb.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(`
      <div class="p-3 min-w-[200px]">
        <h3 class="font-semibold text-gray-900">${alumniProfile.first_name} ${alumniProfile.last_name}</h3>
        <p class="text-sm text-gray-600 mb-2">${alumniProfile.city || "Unknown City"}, ${alumniProfile.country || "Unknown Country"}</p>
        <p class="text-xs text-gray-500 mb-2">${alumniProfile.programs?.[0]?.name || "Dell'Arte Alumni"}</p>
        <p class="text-xs text-gray-700 line-clamp-2">${alumniProfile.biography || "Dell'Arte alumni member"}</p>
        <div class="mt-2 text-xs text-gray-500">Last active: ${new Date(alumniProfile.last_active).toLocaleDateString()}</div>
      </div>
    `)

        // Create marker
        const marker = new mb.Marker(markerElement)
          .setLngLat([
            Number.parseFloat(alumniProfile.longitude.toString()),
            Number.parseFloat(alumniProfile.latitude.toString()),
          ])
          .setPopup(popup)
          .addTo(map.current!)

        // Add click event to select alumni
        markerElement.addEventListener("click", () => {
          setSelectedAlumni(alumniProfile)
          map.current?.flyTo({
            center: [
              Number.parseFloat(alumniProfile.longitude!.toString()),
              Number.parseFloat(alumniProfile.latitude!.toString()),
            ],
            zoom: 8,
            duration: 1000,
          })
        })

        markers.current.push(marker)
        console.log(
          `Added marker ${index + 1} for ${alumniProfile.first_name} at [${alumniProfile.longitude}, ${alumniProfile.latitude}]`,
        )
      } catch (error) {
        console.error(`Error creating marker for ${alumniProfile.first_name}:`, error)
      }
    })

    console.log(`Successfully added ${markers.current.length} markers to map`)
  }, [filteredAlumni, mapboxReady])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleAlumniClick = (alumniProfile: AlumniProfile) => {
    setSelectedAlumni(alumniProfile)
    if (map.current && alumniProfile.latitude && alumniProfile.longitude) {
      map.current.flyTo({
        center: [alumniProfile.longitude, alumniProfile.latitude],
        zoom: 8,
        duration: 1000,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Search for People</p>
                <div className="relative">
                  <Input
                    placeholder="Type a Name or Keyword"
                    value={searchPeople}
                    onChange={(e) => setSearchPeople(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Search by Location</p>
                <div className="relative">
                  <Input
                    placeholder="Type and select a Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <MapPin className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="secondary">Clear all filters</Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show Map:</span>
                <Switch checked={showMap} onCheckedChange={setShowMap} />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <Label className="text-sm font-medium">Program</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="program-mfa" />
                      <Label htmlFor="program-mfa" className="text-sm">
                        MFA in Physical Theatre
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="program-summer" />
                      <Label htmlFor="program-summer" className="text-sm">
                        Summer Intensive
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Graduation Year</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="year-2020" />
                      <Label htmlFor="year-2020" className="text-sm">
                        2020-2024
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="year-2015" />
                      <Label htmlFor="year-2015" className="text-sm">
                        2015-2019
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="loc-europe" />
                      <Label htmlFor="loc-europe" className="text-sm">
                        Europe
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="loc-americas" />
                      <Label htmlFor="loc-americas" className="text-sm">
                        Americas
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Users of the network ({filteredAlumni.length})</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Button variant="outline" className="text-sm">
                  A-Z First Name
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Alumni List */}
              <div className={`space-y-4 ${showMap ? "lg:col-span-2" : "lg:col-span-5"}`}>
                {paginatedAlumni.map((alumniProfile) => (
                  <Card
                    key={alumniProfile.id}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      selectedAlumni?.id === alumniProfile.id ? "ring-2 ring-red-500 bg-red-50" : "hover:shadow-md"
                    }`}
                    onClick={() => handleAlumniClick(alumniProfile)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16 rounded-full">
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {getInitials(alumniProfile.first_name, alumniProfile.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {alumniProfile.first_name} {alumniProfile.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {alumniProfile.city || "Unknown City"}, {alumniProfile.country || "Unknown Country"} · Last
                            active {new Date(alumniProfile.last_active).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {alumniProfile.biography || "Dell'Arte alumni member"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-blue-500" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mapbox Map */}
              {showMap && (
                <div className="lg:col-span-3 relative">
                  <div className="relative h-[600px] rounded-lg overflow-hidden">
                    {process.env.NEXT_PUBLIC_MAPBOX_API ? (
                      <div ref={mapContainer} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Mapbox API key required</p>
                          <p className="text-sm text-gray-500">Add NEXT_PUBLIC_MAPBOX_API to environment variables</p>
                        </div>
                      </div>
                    )}

                    {/* Search as I move checkbox */}
                    <div className="absolute top-4 left-4 bg-white rounded-md p-2 flex items-center gap-2 shadow-md">
                      <Checkbox
                        id="search-as-move"
                        checked={searchAsIMove}
                        onCheckedChange={(checked) => setSearchAsIMove(checked as boolean)}
                      />
                      <Label htmlFor="search-as-move" className="text-sm">
                        Search as I move the map
                      </Label>
                    </div>

                    {/* Selected alumni info */}
                    {selectedAlumni && (
                      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg max-w-sm">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-red-100 text-red-700">
                              {getInitials(selectedAlumni.first_name, selectedAlumni.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {selectedAlumni.first_name} {selectedAlumni.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedAlumni.city || "Unknown City"}, {selectedAlumni.country || "Unknown Country"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedAlumni.programs?.[0]?.name || "Dell'Arte Alumni"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setSelectedAlumni(null)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
