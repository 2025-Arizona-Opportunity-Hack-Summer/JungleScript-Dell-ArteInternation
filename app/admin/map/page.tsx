"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, X, Mail, Phone, Globe, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import Header from "@/components/layout/header"
import { useAlumniStore, type AlumniProfile } from "@/lib/alumni-store"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API || ""

export default function AdminMapPage() {
  const { alumni, loading, error, fetchAlumni } = useAlumniStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Initialize alumni data
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  // Filter alumni based on search
  const filteredAlumni = alumni.filter((alumni) => {
    const fullName = `${alumni.firstName} ${alumni.lastName}`.toLowerCase()
    const location = `${alumni.address.city} ${alumni.address.state || ""} ${alumni.address.country}`.toLowerCase()
    const searchLower = searchQuery.toLowerCase()

    return (
      fullName.includes(searchLower) ||
      location.includes(searchLower) ||
      alumni.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  })

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxgl.accessToken) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 30], // Default center (will be adjusted)
      zoom: 1.5,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add markers when alumni data or map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || !filteredAlumni.length) return

    // Clear existing markers
    markers.forEach((marker) => marker.remove())
    const newMarkers: mapboxgl.Marker[] = []

    // Add markers for each alumni with valid coordinates
    filteredAlumni.forEach((alumni) => {
      if (alumni.address.latitude && alumni.address.longitude) {
        const el = document.createElement("div")
        el.className = "alumni-marker"
        el.style.backgroundColor = "#e11d48"
        el.style.width = "15px"
        el.style.height = "15px"
        el.style.borderRadius = "50%"
        el.style.cursor = "pointer"
        el.style.border = "2px solid white"
        el.style.boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)"

        const marker = new mapboxgl.Marker(el)
          .setLngLat([alumni.address.longitude, alumni.address.latitude])
          .addTo(map.current!)

        marker.getElement().addEventListener("click", () => {
          setSelectedAlumni(alumni)
          const index = filteredAlumni.findIndex((a) => a.id === alumni.id)
          setCurrentProfileIndex(index)
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)

    // Fit map to markers if we have any
    if (newMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredAlumni.forEach((alumni) => {
        if (alumni.address.latitude && alumni.address.longitude) {
          bounds.extend([alumni.address.longitude, alumni.address.latitude])
        }
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [filteredAlumni, mapLoaded])

  // Handle profile navigation
  const navigateProfile = (direction: "next" | "prev") => {
    if (filteredAlumni.length === 0) return

    const newIndex =
      direction === "next"
        ? (currentProfileIndex + 1) % filteredAlumni.length
        : (currentProfileIndex - 1 + filteredAlumni.length) % filteredAlumni.length

    setCurrentProfileIndex(newIndex)
    setSelectedAlumni(filteredAlumni[newIndex])

    // Center map on the selected alumni
    if (map.current && filteredAlumni[newIndex].address.latitude && filteredAlumni[newIndex].address.longitude) {
      map.current.flyTo({
        center: [filteredAlumni[newIndex].address.longitude, filteredAlumni[newIndex].address.latitude],
        zoom: 10,
        speed: 1.2,
      })
    }
  }

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Handle alumni selection
  const handleSelectAlumni = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni)
    const index = filteredAlumni.findIndex((a) => a.id === alumni.id)
    setCurrentProfileIndex(index)

    // Center map on the selected alumni
    if (map.current && alumni.address.latitude && alumni.address.longitude) {
      map.current.flyTo({
        center: [alumni.address.longitude, alumni.address.latitude],
        zoom: 10,
        speed: 1.2,
      })
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
          <Button onClick={() => fetchAlumni()} className="mt-4">
            Retry
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div
          className={`${
            isMobile ? (selectedAlumni ? "hidden" : "block") : "w-1/3 max-w-md"
          } bg-white border-r border-gray-200 overflow-y-auto`}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Alumni Map</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search alumni by name, location, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              {filteredAlumni.length} {filteredAlumni.length === 1 ? "alumnus" : "alumni"} found
            </p>

            <div className="space-y-3">
              {filteredAlumni.map((alumni) => (
                <Card
                  key={alumni.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAlumni?.id === alumni.id ? "ring-2 ring-red-500" : ""
                  }`}
                  onClick={() => handleSelectAlumni(alumni)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {getInitials(alumni.firstName, alumni.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {alumni.firstName} {alumni.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {alumni.address.city}, {alumni.address.state || alumni.address.country}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAlumni.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No alumni found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Mobile Back Button */}
          {isMobile && selectedAlumni && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 left-4 z-10 bg-white"
              onClick={() => setSelectedAlumni(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to List
            </Button>
          )}

          {/* Selected Alumni Profile */}
          {selectedAlumni && (
            <div
              className={`${
                isMobile
                  ? "absolute bottom-0 left-0 right-0 max-h-[60vh] rounded-t-xl"
                  : "absolute bottom-8 right-8 w-96 rounded-xl"
              } bg-white shadow-xl overflow-y-auto z-10`}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-red-100 text-red-700 text-lg">
                        {getInitials(selectedAlumni.firstName, selectedAlumni.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedAlumni.firstName} {selectedAlumni.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedAlumni.address.city}, {selectedAlumni.address.state || selectedAlumni.address.country}
                      </p>
                    </div>
                  </div>
                  {!isMobile && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAlumni(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Programs */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Programs Attended</h3>
                  <div className="space-y-1">
                    {selectedAlumni.programsAttended.map((program, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{program.program}</p>
                        <p className="text-gray-500">
                          {program.cohort} • Graduated {program.graduationYear}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Work */}
                {selectedAlumni.currentWork && selectedAlumni.currentWork.title && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Current Work</h3>
                    <p className="text-sm">
                      <span className="font-medium">{selectedAlumni.currentWork.title}</span>
                      {selectedAlumni.currentWork.organization && (
                        <>
                          {" "}
                          at <span>{selectedAlumni.currentWork.organization}</span>
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedAlumni.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlumni.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Button */}
                <div className="pt-2">
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setShowContactModal(true)}>
                    Contact Alumni
                  </Button>
                </div>
              </div>

              {/* Navigation Buttons */}
              {filteredAlumni.length > 1 && (
                <div className="flex border-t border-gray-200">
                  <Button variant="ghost" className="flex-1 rounded-none py-3" onClick={() => navigateProfile("prev")}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                  </Button>
                  <div className="border-r border-gray-200"></div>
                  <Button variant="ghost" className="flex-1 rounded-none py-3" onClick={() => navigateProfile("next")}>
                    Next <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Contact {selectedAlumni?.firstName} {selectedAlumni?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAlumni?.email && (
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a href={`mailto:${selectedAlumni.email}`} className="text-blue-600 hover:underline">
                    {selectedAlumni.email}
                  </a>
                </div>
              </div>
            )}

            {selectedAlumni?.phone && (
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a href={`tel:${selectedAlumni.phone}`} className="text-blue-600 hover:underline">
                    {selectedAlumni.phone}
                  </a>
                </div>
              </div>
            )}

            {selectedAlumni?.portfolioLinks?.website && (
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Globe className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a
                    href={
                      selectedAlumni.portfolioLinks.website.startsWith("http")
                        ? selectedAlumni.portfolioLinks.website
                        : `https://${selectedAlumni.portfolioLinks.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedAlumni.portfolioLinks.website}
                  </a>
                </div>
              </div>
            )}

            {selectedAlumni?.address && (
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p>
                    {selectedAlumni.address.city}
                    {selectedAlumni.address.state && `, ${selectedAlumni.address.state}`},{" "}
                    {selectedAlumni.address.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
