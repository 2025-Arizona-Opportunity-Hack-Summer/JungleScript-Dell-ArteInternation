"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MapPin, ChevronDown, ChevronUp, ChevronLeft, ArrowLeft, Share2, LucideUser } from "lucide-react"
import type mapboxgl from "mapbox-gl"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Phone, Mail, Globe, Linkedin, Instagram, Youtube } from "lucide-react"
import { useAlumniStore, type AlumniProfile } from "@/lib/alumni-store"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function AlumniMap() {
  const { user } = useUser()
  const router = useRouter()
  const { alumni, loading, error, fetchAlumni } = useAlumniStore()

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const mapboxRef = useRef<typeof import("mapbox-gl")["default"] | null>(null)
  const [mapboxReady, setMapboxReady] = useState(false)
  const [markers, setMarkers] = useState<Map<string, any>>(new Map())
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [geojson, setGeojson] = useState({
    type: "FeatureCollection",
    features: [] as any[],
  })
  const [searchFocused, setSearchFocused] = useState(false)

  const [showContactModal, setShowContactModal] = useState(false)
  const [showWebsiteModal, setShowWebsiteModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isBioExpanded, setIsBioExpanded] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize alumni data
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumni) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchLower) ||
        `${alumni.address.city}, ${alumni.address.state || alumni.address.country}`.toLowerCase().includes(searchLower) ||
        alumni.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    })
  }, [alumni, searchQuery])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Show welcome modal for non-admin users
  useEffect(() => {
    if (user) {
      // Check for a flag in localStorage to see if the modal has been shown in this session
      const welcomeModalShown = sessionStorage.getItem("welcomeModalShown")
      const userRole = user.publicMetadata?.role as string | undefined

      if (!welcomeModalShown && userRole !== "admin") {
        setShowWelcomeModal(true)
        sessionStorage.setItem("welcomeModalShown", "true")
      }
    }
  }, [user])

  // Dynamically load Mapbox GL JS & its CSS
  useEffect(() => {
    ;(async () => {
      try {
        const cssId = "mapbox-gl-css"
        if (!document.getElementById(cssId)) {
          const link = document.createElement("link")
          link.id = cssId
          link.rel = "stylesheet"
          link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css"
          document.head.appendChild(link)
        }

        const mbModule = await import("mapbox-gl")
        mbModule.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API || ""
        mapboxRef.current = mbModule.default
        setMapboxReady(true)
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("⚠️  Failed to load Mapbox-GL. Map will be disabled.", err)
        }
        setMapboxReady(false)
      }
    })()
  }, [])

  // Convert alumni data to GeoJSON format
  useEffect(() => {
    const newGeojson = {
      type: "FeatureCollection",
      features: filteredAlumni
        .filter((alumni) => alumni.address?.longitude && alumni.address?.latitude)
        .map((alumni) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [alumni.address.longitude, alumni.address.latitude],
          },
          properties: {
            id: alumni.id.toString(),
            firstName: alumni.firstName,
            lastName: alumni.lastName,
            location: `${alumni.address.city}, ${alumni.address.state || alumni.address.country}`,
            program: alumni.programsAttended[0]?.program || "Dell'Arte Alumni",
          },
        })),
    }
    setGeojson(newGeojson)
  }, [filteredAlumni])

  // Initialize map
  useEffect(() => {
    if (!mapboxReady || !mapContainer.current || map.current) return
    if (!mapboxRef.current || !process.env.NEXT_PUBLIC_MAPBOX_API) return

    try {
      const localMap = new mapboxRef.current.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [20, 20],
        zoom: 2,
        projection: "mercator",
      })

      localMap.addControl(new mapboxRef.current.NavigationControl(), "top-right")

      localMap.on("load", () => {
        // Map is ready
      })

      map.current = localMap
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("⚠️  Unable to create Mapbox map:", err)
      }
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [mapboxReady, isMobile])

  // Add markers
  useEffect(() => {
    if (!mapboxReady || !map.current || !mapboxRef.current) return

    // Clear existing markers
    markers.forEach((marker) => marker.remove())
    const newMarkers = new Map()

    // Add markers to map
    for (const feature of geojson.features) {
      const el = document.createElement("div")
      const initials = `${feature.properties.firstName.charAt(0)}${feature.properties.lastName.charAt(0)}`

      el.style.cssText = `
        width: 50px;
        height: 50px;
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
        font-size: 14px;
      `
      el.textContent = initials

      el.addEventListener("click", () => {
        const clickedAlumni = alumni.find((a) => a.id.toString() === feature.properties.id)
        if (clickedAlumni) {
          handleAlumniClick(clickedAlumni)
        }
      })

      const marker = new mapboxRef.current.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map.current)

      newMarkers.set(feature.properties.id, marker)
    }

    setMarkers(newMarkers)
  }, [geojson, mapboxReady, alumni])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getLocation = (alumni: AlumniProfile) => {
    return `${alumni.address.city}, ${alumni.address.state || alumni.address.country}`
  }

  const getLastActive = (alumni: AlumniProfile) => {
    if (!alumni.lastUpdated) return "Last updated info not available"
    const lastUpdated = new Date(alumni.lastUpdated)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Last updated today"
    if (diffDays <= 7) return `Last updated ${diffDays} days ago`
    if (diffDays <= 30) return `Last updated ${Math.ceil(diffDays / 7)} weeks ago`
    return `Last updated ${Math.ceil(diffDays / 30)} months ago`
  }

  const handleContactClick = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni)
    setShowContactModal(true)
  }

  const handleWebsiteClick = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni)
    setShowWebsiteModal(true)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const formatSocialUrl = (platform: string, value: string) => {
    if (value.startsWith("http")) return value

    switch (platform) {
      case "linkedin":
        return value.startsWith("linkedin.com")
          ? `https://${value}`
          : `https://linkedin.com/in/${value.replace("@", "")}`
      case "instagram":
        return `https://instagram.com/${value.replace("@", "")}`
      case "youtube":
        return value.startsWith("youtube.com") ? `https://${value}` : `https://youtube.com/${value}`
      case "website":
        return value.startsWith("http") ? value : `https://${value}`
      default:
        return value
    }
  }

  const handleSearchFocus = () => {
    setShowWelcomeModal(false)
    if (isMobile) {
      setSidebarExpanded(true)
      setSearchFocused(true)
    }
    // Focus the search input after a brief delay to ensure it's rendered
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  const handleUpdateProfile = () => {
    setShowWelcomeModal(false)
    window.location.href = "/alumni/profile"
  }

  const handleReferral = async () => {
    setShowWelcomeModal(false)
    const shareData = {
      title: "Join Dell'Arte Alumni Network",
      text: "Connect with Dell'Arte International alumni worldwide and discover opportunities in physical theatre!",
      url: window.location.origin,
    }

    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.origin)
        alert("Link copied to clipboard!")
      }
    } else {
      // Desktop fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin)
        alert("Invitation link copied to clipboard! Share it with your friends.")
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = window.location.origin
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("Invitation link copied to clipboard! Share it with your friends.")
      }
    }
  }

  const handleAlumniClick = (alumni: AlumniProfile) => {
    setSelectedAlumniId(alumni.id.toString())
    setSelectedAlumni(alumni)
    setViewMode("detail")

    if (isMobile) {
      setSidebarExpanded(true)
    }

    if (map.current && alumni.address?.longitude && alumni.address?.latitude) {
      if (isMobile) {
        // On mobile, use padding to account for the profile panel
        // This ensures the marker appears in the visible area above the panel
        map.current.flyTo({
          center: [alumni.address.longitude, alumni.address.latitude],
          zoom: 8,
          duration: 1000,
          padding: {
            top: 50,
            bottom: window.innerHeight * 0.5 + 50, // Account for profile panel height
            left: 20,
            right: 20,
          },
        })
      } else {
        // Desktop behavior remains unchanged
        map.current.flyTo({
          center: [alumni.address.longitude, alumni.address.latitude],
          zoom: 8,
          duration: 1000,
        })
      }
    }
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedAlumni(null)
    setSelectedAlumniId(null)
  }

  const getFormattedDate = () => {
    if (selectedAlumni && selectedAlumni.lastUpdated) {
      return format(new Date(selectedAlumni.lastUpdated), "MMMM d, yyyy")
    }
    return "N/A"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
          <Button onClick={() => fetchAlumni()} className="mt-4">
            Retry
          </Button>
        </main>
      </div>
    )
  }

  if (!mapboxReady && !process.env.NEXT_PUBLIC_MAPBOX_API) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-gray-700">
            Map view is unavailable – missing or invalid Mapbox credentials.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map Container with Margins */}
      <main className="p-6">
        <div className="relative h-[calc(100vh-128px)] bg-gray-400 rounded-2xl overflow-hidden shadow-lg">
          {/* Map Background */}
          {process.env.NEXT_PUBLIC_MAPBOX_API ? (
            <div ref={mapContainer} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Mapbox API key required</p>
                <p className="text-sm opacity-80">Add NEXT_PUBLIC_MAPBOX_API to environment variables</p>
              </div>
            </div>
          )}

          {/* Mobile Overlay */}
          {isMobile && (
            <>
              {/* Mobile Bottom Panel */}
              <div className="absolute bottom-0 left-0 right-0 z-40">
                {/* Collapsed State */}
                {!sidebarExpanded && (
                  <div
                    className={`bg-white rounded-t-xl shadow-lg p-4 transition-all duration-300 ${searchFocused ? "h-[50vh]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="relative flex-1 mr-4">
                        <Input
                          ref={searchInputRef}
                          placeholder="Search for Alumni"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                    {searchFocused && (
                      <div className="mt-4 flex-1 overflow-y-auto">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Users of the network ({filteredAlumni.length})
                        </h3>
                        <div className="space-y-3 px-1">
                          {filteredAlumni.map((alumni) => (
                            <Card
                              key={alumni.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedAlumniId === alumni.id.toString() ? "ring-2 ring-blue-500 bg-blue-50" : ""
                              }`}
                              onClick={() => handleAlumniClick(alumni)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="text-sm bg-red-100 text-red-700">
                                      {getInitials(alumni.firstName, alumni.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {alumni.firstName} {alumni.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{getLocation(alumni)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSidebarExpanded(true)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Expanded State */}
                {sidebarExpanded && (
                  <div
                    className={`bg-white rounded-t-xl shadow-lg flex flex-col ${viewMode === "detail" ? "h-auto max-h-[50vh]" : "h-[50vh]"}`}
                  >
                    {/* Header */}
                    <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                      {viewMode === "detail" ? (
                        <Button variant="ghost" size="sm" onClick={handleBackToList}>
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          <span className="font-normal">Back</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(false)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      )}
                      {viewMode === "list" && (
                        <div className="relative flex-1 mx-4">
                          <Input
                            ref={searchInputRef}
                            placeholder="Search for Alumni"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {viewMode === "list" ? (
                        /* Users Section */
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Users of the network ({filteredAlumni.length})
                          </h3>
                          <div className="space-y-3 px-1">
                            {filteredAlumni.map((alumni) => (
                              <Card
                                key={alumni.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedAlumniId === alumni.id.toString() ? "ring-2 ring-blue-500 bg-blue-50" : ""
                                }`}
                                onClick={() => handleAlumniClick(alumni)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="text-sm bg-red-100 text-red-700">
                                        {getInitials(alumni.firstName, alumni.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm">
                                        {alumni.firstName} {alumni.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{getLocation(alumni)}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Detail View */
                        selectedAlumni && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-14 w-14">
                                <AvatarFallback className="text-lg bg-red-100 text-red-700">
                                  {getInitials(selectedAlumni.firstName, selectedAlumni.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900">
                                  {selectedAlumni.firstName} {selectedAlumni.lastName}
                                </h2>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {getLocation(selectedAlumni)}
                                </p>
                                <p className="text-sm text-gray-500">{getLastActive(selectedAlumni)}</p>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              {selectedAlumni?.currentWork?.title && (
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">Current Work</h3>
                                  <p className="text-gray-600">{selectedAlumni.currentWork.title}</p>
                                  {selectedAlumni.currentWork.organization && (
                                    <p className="text-xs text-gray-500">{selectedAlumni.currentWork.organization}</p>
                                  )}
                                </div>
                              )}

                              {selectedAlumni?.programsAttended?.[0]?.program && (
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">Program</h3>
                                  <p className="text-gray-600">{selectedAlumni.programsAttended[0].program}</p>
                                  {selectedAlumni.programsAttended[0].cohort && (
                                    <p className="text-xs text-gray-500">{selectedAlumni.programsAttended[0].cohort}</p>
                                  )}
                                </div>
                              )}

                              {selectedAlumni?.biography && (
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">About</h3>
                                  <div
                                    className={`text-gray-600 text-xs leading-relaxed custom-scroll ${
                                      isBioExpanded ? "max-h-24 overflow-y-auto" : "line-clamp-2"
                                    }`}
                                  >
                                    {selectedAlumni.biography}
                                  </div>
                                  {selectedAlumni.biography.length > 100 && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 h-auto"
                                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                                    >
                                      {isBioExpanded ? "Read less" : "Read more"}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <Button size="sm" className="flex-1" onClick={() => handleContactClick(selectedAlumni)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                                {(selectedAlumni.portfolioLinks?.website ||
                                  selectedAlumni.portfolioLinks?.linkedin ||
                                  selectedAlumni.portfolioLinks?.instagram ||
                                  selectedAlumni.portfolioLinks?.youtube) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleWebsiteClick(selectedAlumni)}
                                  >
                                    <Globe className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Collapse Button - only show in list view */}
                    {viewMode === "list" && (
                      <div className="p-2 border-t border-gray-200">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => setSidebarExpanded(false)}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Desktop Floating Sidebar */}
          {!isMobile && (
            <div
              className={`absolute top-6 left-6 z-40 w-96 max-w-[clamp(330px,25vw,400px)] ${viewMode === "detail" ? "max-h-[calc(100vh-128px)]" : "bottom-6"}`}
            >
              <div
                className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col ${viewMode === "detail" ? "h-auto" : "h-full"}`}
              >
                {/* Fixed Header with Search or Back Button */}
                <div className="p-3 border-b border-gray-200 flex-shrink-0">
                  {viewMode === "detail" ? (
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2 h-8 w-8 p-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="font-medium text-gray-800">Profile Details</h2>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        ref={searchInputRef}
                        placeholder="Search for Alumni"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`${viewMode === "list" ? "flex-1 overflow-y-auto" : ""} p-4`}>
                  {viewMode === "list" ? (
                    /* List View */
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Users of the network ({filteredAlumni.length})
                      </h3>
                      <div className="space-y-3 px-1">
                        {filteredAlumni.map((alumni) => (
                          <Card
                            key={alumni.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedAlumniId === alumni.id.toString() ? "ring-2 ring-blue-500 bg-blue-50" : ""
                            }`}
                            onClick={() => handleAlumniClick(alumni)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="text-sm bg-red-100 text-red-700">
                                    {getInitials(alumni.firstName, alumni.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {alumni.firstName} {alumni.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{getLocation(alumni)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Detail View */
                    selectedAlumni && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-xl bg-red-100 text-red-700">
                              {getInitials(selectedAlumni.firstName, selectedAlumni.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                              {selectedAlumni.firstName} {selectedAlumni.lastName}
                            </h2>
                            <p className="text-gray-600 flex items-center mb-1 text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {getLocation(selectedAlumni)}
                            </p>
                            <p className="text-xs text-gray-500">{getLastActive(selectedAlumni)}</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          {selectedAlumni?.currentWork?.title && (
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">Current Work</h3>
                              <p className="text-gray-600">{selectedAlumni.currentWork.title}</p>
                              {selectedAlumni.currentWork.organization && (
                                <p className="text-xs text-gray-500">{selectedAlumni.currentWork.organization}</p>
                              )}
                            </div>
                          )}

                          {selectedAlumni?.programsAttended?.[0]?.program && (
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">Program</h3>
                              <p className="text-gray-600">{selectedAlumni.programsAttended[0].program}</p>
                              {selectedAlumni.programsAttended[0].cohort && (
                                <p className="text-xs text-gray-500">{selectedAlumni.programsAttended[0].cohort}</p>
                              )}
                            </div>
                          )}

                          {selectedAlumni?.biography && (
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">About</h3>
                              <div className={`space-y-2 ${isBioExpanded ? "max-h-36 overflow-y-auto" : ""}`}>
                                <div
                                  className={`text-gray-600 text-xs leading-relaxed ${
                                    !isBioExpanded ? "line-clamp-4" : ""
                                  }`}
                                >
                                  {selectedAlumni.biography}
                                </div>
                              </div>
                              {selectedAlumni.biography.length > 200 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto mt-1"
                                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                                >
                                  {isBioExpanded ? "Read less" : "Read more"}
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="flex space-x-3 pt-4">
                            <Button className="flex-1" onClick={() => handleContactClick(selectedAlumni)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                            {(selectedAlumni.portfolioLinks?.website ||
                              selectedAlumni.portfolioLinks?.linkedin ||
                              selectedAlumni.portfolioLinks?.instagram ||
                              selectedAlumni.portfolioLinks?.youtube) && (
                              <Button variant="outline" onClick={() => handleWebsiteClick(selectedAlumni)}>
                                <Globe className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Welcome Modal */}
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Welcome, {user?.firstName}! 🎭</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-center text-gray-600 mb-6">Ready to connect with the Dell'Arte community?</p>

              <Button
                onClick={handleSearchFocus}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Search className="h-4 w-4" />
                <span>Search for Alumni</span>
              </Button>

              <Button
                onClick={handleUpdateProfile}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 bg-transparent"
              >
                <LucideUser className="h-4 w-4" />
                <span>Update Profile</span>
              </Button>

              <Button
                onClick={handleReferral}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 bg-transparent"
              >
                <Share2 className="h-4 w-4" />
                <span>Refer a Friend</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact {selectedAlumni?.firstName} {selectedAlumni?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAlumni?.email && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href={`mailto:${selectedAlumni.email}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    {selectedAlumni.email}
                  </a>
                </div>
              </div>
            )}
            {selectedAlumni?.phone && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <a href={`tel:${selectedAlumni.phone}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    {selectedAlumni.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Website Modal */}
      <Dialog open={showWebsiteModal} onOpenChange={setShowWebsiteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              {selectedAlumni?.firstName}'s Links
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedAlumni?.portfolioLinks?.website && (
              <a
                href={formatSocialUrl("website", selectedAlumni.portfolioLinks.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getSocialIcon("website")}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Website</p>
                  <p className="text-xs text-gray-600 truncate">{selectedAlumni.portfolioLinks.website}</p>
                </div>
              </a>
            )}
            {selectedAlumni?.portfolioLinks?.linkedin && (
              <a
                href={formatSocialUrl("linkedin", selectedAlumni.portfolioLinks.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getSocialIcon("linkedin")}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                  <p className="text-xs text-gray-600 truncate">{selectedAlumni.portfolioLinks.linkedin}</p>
                </div>
              </a>
            )}
            {selectedAlumni?.portfolioLinks?.instagram && (
              <a
                href={formatSocialUrl("instagram", selectedAlumni.portfolioLinks.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getSocialIcon("instagram")}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Instagram</p>
                  <p className="text-xs text-gray-600 truncate">{selectedAlumni.portfolioLinks.instagram}</p>
                </div>
              </a>
            )}
            {selectedAlumni?.portfolioLinks?.youtube && (
              <a
                href={formatSocialUrl("youtube", selectedAlumni.portfolioLinks.youtube)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getSocialIcon("youtube")}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">YouTube</p>
                  <p className="text-xs text-gray-600 truncate">{selectedAlumni.portfolioLinks.youtube}</p>
                </div>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
