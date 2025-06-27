"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react"
import Header from "@/components/layout/header"
import type mapboxgl from "mapbox-gl"

interface AlumniProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  location: string
  coordinates: [number, number] // [longitude, latitude]
  lastActive: string
  bio: string
  profileImage?: string
  graduationYear: number
  program: string
  isMentor?: boolean
  mentorSpecialties?: string[]
}

const mockAlumni: AlumniProfile[] = [
  {
    id: "1",
    firstName: "Michelle",
    lastName: "Lagarde",
    email: "michelle.lagarde@email.com",
    location: "Paris, France",
    coordinates: [2.3522, 48.8566],
    lastActive: "Last active today",
    bio: "Experienced Theatre Director and Performer in various sectors (Physical Theatre, Clown, Mask). Also teaching workshops.",
    graduationYear: 2018,
    program: "MFA in Ensemble-Based Physical Theatre",
    isMentor: true,
    mentorSpecialties: ["Directing", "Physical Theatre"],
  },
  {
    id: "2",
    firstName: "Ling",
    lastName: "Juan",
    email: "ling.juan@email.com",
    location: "Cochabamba, Bolivia",
    coordinates: [-66.1568, -17.3895],
    lastActive: "Last active today",
    bio: "Confirmed performer mastering Physical Theatre and Devised Work. Also traveling lover.",
    graduationYear: 2019,
    program: "Professional Training Program",
  },
  {
    id: "3",
    firstName: "Astou",
    lastName: "Fox",
    email: "astou.fox@email.com",
    location: "Vancouver, Canada",
    coordinates: [-123.1207, 49.2827],
    lastActive: "Last active today",
    bio: "6 years old Professional as lead of Operations in a strong theatre company. Now I'm consultant for emerging artists.",
    graduationYear: 2017,
    program: "Summer Intensive",
    isMentor: true,
    mentorSpecialties: ["Operations", "Consulting"],
  },
  {
    id: "4",
    firstName: "Doyle",
    lastName: "Tran",
    email: "doyle.tran@email.com",
    location: "Cape Town, South Africa",
    coordinates: [18.4241, -33.9249],
    lastActive: "Last active today",
    bio: "Lecturer and speaker about Physical Theatre. I also wrote few essays and articles, you can find them on my website.",
    graduationYear: 2020,
    program: "MFA in Ensemble-Based Physical Theatre",
    isMentor: true,
    mentorSpecialties: ["Teaching", "Writing"],
  },
  {
    id: "5",
    firstName: "Niklas",
    lastName: "Klemens",
    email: "niklas.klemens@email.com",
    location: "Gothenburg, Sweden",
    coordinates: [11.9746, 57.7089],
    lastActive: "Last active today",
    bio: "Senior UX designer. I'm judge on Awwwards for 2 years. I spend my free time working my theatre projects.",
    graduationYear: 2016,
    program: "International Summer School",
  },
  {
    id: "6",
    firstName: "Malek",
    lastName: "Jordan",
    email: "malek.jordan@email.com",
    location: "Fes, Morocco",
    coordinates: [-5.0003, 34.0181],
    lastActive: "Last active 2 days ago",
    bio: "Last year as student in a renowned High School of management. I'm also a photographer and theatre enthusiast.",
    graduationYear: 2022,
    program: "Summer Intensive",
  },
  {
    id: "7",
    firstName: "Amanda",
    lastName: "Agustina",
    email: "amanda.agustina@email.com",
    location: "Jakarta, Indonesia",
    coordinates: [106.8456, -6.2088],
    lastActive: "Last active today",
    bio: "Hello, my name is Amanda Agustina. I'm an engineer and love playing chess. I also am a theatre director on weekends.",
    graduationYear: 2021,
    program: "Professional Training Program",
    isMentor: true,
    mentorSpecialties: ["Engineering", "Career Transition"],
  },
  {
    id: "8",
    firstName: "Yohanes",
    lastName: "Sri",
    email: "yohanes.sri@email.com",
    location: "Mumbai, India",
    coordinates: [72.8777, 19.076],
    lastActive: "Last active 2 days ago",
    bio: "Teacher in some of renown EdTech schools and training. Also directing physical theatre productions.",
    graduationYear: 2019,
    program: "Pedagogy Program",
  },
  {
    id: "9",
    firstName: "Carlos",
    lastName: "Rodriguez",
    email: "carlos.rodriguez@email.com",
    location: "Mexico City, Mexico",
    coordinates: [-99.1332, 19.4326],
    lastActive: "Last active today",
    bio: "Physical theatre performer and workshop facilitator. Working with indigenous communities to preserve traditional performance arts.",
    graduationYear: 2020,
    program: "MFA in Ensemble-Based Physical Theatre",
  },
  {
    id: "10",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@email.com",
    location: "London, UK",
    coordinates: [-0.1276, 51.5074],
    lastActive: "Last active today",
    bio: "Theatre director and educator. Currently running a physical theatre company in London's West End.",
    graduationYear: 2015,
    program: "Professional Training Program",
    isMentor: true,
    mentorSpecialties: ["Directing", "Education"],
  },
  {
    id: "11",
    firstName: "Sofia",
    lastName: "Martinez",
    email: "sofia.martinez@email.com",
    location: "Barcelona, Spain",
    coordinates: [2.1734, 41.3851],
    lastActive: "Last active today",
    bio: "Contemporary dance choreographer integrating physical theatre techniques into modern performances.",
    graduationYear: 2019,
    program: "Summer Intensive",
    isMentor: true,
    mentorSpecialties: ["Choreography", "Movement"],
  },
  {
    id: "12",
    firstName: "Kenji",
    lastName: "Tanaka",
    email: "kenji.tanaka@email.com",
    location: "Tokyo, Japan",
    coordinates: [139.6917, 35.6895],
    lastActive: "Last active yesterday",
    bio: "Butoh performer and teacher, bridging traditional Japanese theatre with Dell'Arte techniques.",
    graduationYear: 2018,
    program: "International Summer School",
  },
  {
    id: "13",
    firstName: "Isabella",
    lastName: "Romano",
    email: "isabella.romano@email.com",
    location: "Rome, Italy",
    coordinates: [12.4964, 41.9028],
    lastActive: "Last active today",
    bio: "Commedia dell'arte specialist working with traditional Italian theatre companies.",
    graduationYear: 2020,
    program: "Professional Training Program",
    isMentor: true,
    mentorSpecialties: ["Traditional Theatre", "Mask Work"],
  },
  {
    id: "14",
    firstName: "Lucas",
    lastName: "Silva",
    email: "lucas.silva@email.com",
    location: "São Paulo, Brazil",
    coordinates: [-46.6333, -23.5505],
    lastActive: "Last active today",
    bio: "Street performer and social activist using theatre for community development in urban areas.",
    graduationYear: 2021,
    program: "Summer Intensive",
  },
  {
    id: "15",
    firstName: "Amara",
    lastName: "Okafor",
    email: "amara.okafor@email.com",
    location: "Lagos, Nigeria",
    coordinates: [3.3792, 6.5244],
    lastActive: "Last active 3 days ago",
    bio: "Storyteller and performer combining African traditional performance with physical theatre.",
    graduationYear: 2017,
    program: "MFA in Ensemble-Based Physical Theatre",
    isMentor: true,
    mentorSpecialties: ["Storytelling", "Cultural Integration"],
  },
  {
    id: "16",
    firstName: "Oliver",
    lastName: "Schmidt",
    email: "oliver.schmidt@email.com",
    location: "Berlin, Germany",
    coordinates: [13.405, 52.52],
    lastActive: "Last active today",
    bio: "Experimental theatre director exploring the intersection of technology and physical performance.",
    graduationYear: 2019,
    program: "Professional Training Program",
  },
  {
    id: "17",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@email.com",
    location: "New Delhi, India",
    coordinates: [77.1025, 28.7041],
    lastActive: "Last active today",
    bio: "Theatre therapist using physical theatre techniques in healing and community wellness programs.",
    graduationYear: 2018,
    program: "Pedagogy Program",
    isMentor: true,
    mentorSpecialties: ["Theatre Therapy", "Community Work"],
  },
  {
    id: "18",
    firstName: "James",
    lastName: "O'Connor",
    email: "james.oconnor@email.com",
    location: "Dublin, Ireland",
    coordinates: [-6.2603, 53.3498],
    lastActive: "Last active yesterday",
    bio: "Clown performer and workshop facilitator specializing in medical clowning and hospital performances.",
    graduationYear: 2020,
    program: "Summer Intensive",
  },
  {
    id: "19",
    firstName: "Ana",
    lastName: "Petrov",
    email: "ana.petrov@email.com",
    location: "Belgrade, Serbia",
    coordinates: [20.4489, 44.7866],
    lastActive: "Last active today",
    bio: "Physical theatre researcher and academic, documenting Eastern European performance traditions.",
    graduationYear: 2016,
    program: "MFA in Ensemble-Based Physical Theatre",
    isMentor: true,
    mentorSpecialties: ["Research", "Documentation"],
  },
  {
    id: "20",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    location: "Seoul, South Korea",
    coordinates: [126.978, 37.5665],
    lastActive: "Last active today",
    bio: "Multimedia artist creating immersive theatre experiences combining physical performance with digital art.",
    graduationYear: 2021,
    program: "International Summer School",
  },
]

export default function AlumniMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const mapboxRef = useRef<typeof import("mapbox-gl") | null>(null)
  const [mapboxReady, setMapboxReady] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [geojson, setGeojson] = useState({
    type: "FeatureCollection",
    features: [] as any[],
  })

  const filteredAlumni = mockAlumni.filter((alumni) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchLower) ||
      alumni.location.toLowerCase().includes(searchLower)
    )
  })

  const nearbyMentors = mockAlumni.filter((alumni) => alumni.isMentor)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  // Convert alumni data to GeoJSON format exactly like the example
  useEffect(() => {
    const newGeojson = {
      type: "FeatureCollection",
      features: filteredAlumni.map((alumni) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: alumni.coordinates,
        },
        properties: {
          id: alumni.id,
          firstName: alumni.firstName,
          lastName: alumni.lastName,
          location: alumni.location,
          isMentor: alumni.isMentor || false,
          program: alumni.program,
          mentorSpecialties: alumni.mentorSpecialties || [],
        },
      })),
    }
    setGeojson(newGeojson)
  }, [searchQuery])

  // Initialize map with globe projection
  useEffect(() => {
    if (!mapboxReady || !mapContainer.current || map.current) return
    if (!mapboxRef.current || !process.env.NEXT_PUBLIC_MAPBOX_API) return

    try {
      const localMap = new mapboxRef.current.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-96, 37.8],
        zoom: 3,
        projection: "globe", // Switch to globe projection
        // Add padding to account for sidebar on desktop
        padding: !isMobile ? { left: 420, top: 0, right: 0, bottom: 0 } : { left: 0, top: 0, right: 0, bottom: 0 },
      })

      localMap.addControl(new mapboxRef.current.NavigationControl(), "top-right")
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
  }, [mapboxReady, isMobile]) // Add isMobile as dependency

  // Add markers exactly like the Mapbox example
  useEffect(() => {
    if (!mapboxReady || !map.current || !mapboxRef.current) return

    // Remove existing markers
    map.current.getSource("alumni-markers")?.setData({
      type: "FeatureCollection",
      features: [],
    })

    // Add markers to map exactly like the example
    for (const feature of geojson.features) {
      // Create a HTML element for each feature
      const el = document.createElement("div")

      const isMentor = feature.properties.isMentor
      const initials = `${feature.properties.firstName.charAt(0)}${feature.properties.lastName.charAt(0)}`

      // Style our custom marker
      el.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        background: linear-gradient(135deg, ${isMentor ? "#059669" : "#dc2626"}, ${isMentor ? "#047857" : "#b91c1c"});
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      `
      el.textContent = initials

      // Make a marker for each feature and add it to the map - exactly like the example
      new mapboxRef.current.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
          new mapboxRef.current.Popup({ offset: 25 }) // add popups
            .setHTML(
              `<div style="text-align: center; font-family: system-ui, sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">
                    ${feature.properties.firstName} ${feature.properties.lastName}
                    ${feature.properties.isMentor ? '<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 12px; font-size: 10px; margin-left: 4px;">Mentor</span>' : ""}
                  </h3>
                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${feature.properties.location}</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">${feature.properties.program}</p>
                  ${
                    feature.properties.mentorSpecialties.length > 0
                      ? `<p style="margin: 4px 0 0 0; color: #059669; font-size: 11px;">${feature.properties.mentorSpecialties.join(", ")}</p>`
                      : ""
                  }
                </div>`,
            ),
        )
        .addTo(map.current)
    }
  }, [geojson, mapboxReady])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleAlumniClick = (alumni: AlumniProfile) => {
    if (map.current) {
      map.current.flyTo({
        center: alumni.coordinates,
        zoom: 8,
        duration: 500,
      })
    }
  }

  if (!mapboxReady && !process.env.NEXT_PUBLIC_MAPBOX_API) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />

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
              {/* Mobile Top Search Bar */}
              <div className="absolute top-4 left-4 right-4 z-40">
                <div className="relative">
                  <Input
                    placeholder="Search for locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/90 backdrop-blur-sm border-white/20"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              {/* Mobile Bottom Panel */}
              <div className="absolute bottom-0 left-0 right-0 z-40">
                {/* Collapsed State */}
                {!sidebarExpanded && (
                  <div className="bg-white rounded-t-xl shadow-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="relative flex-1 mr-4">
                        <Input
                          placeholder="Search for locations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSidebarExpanded(true)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Expanded State */}
                {sidebarExpanded && (
                  <div className="bg-white h-[70vh] rounded-t-xl shadow-lg flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(false)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1 mx-4">
                        <Input
                          placeholder="Search for locations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Users Section */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Users of the network ({filteredAlumni.length})
                        </h3>
                        <div className="space-y-3 px-1">
                          {filteredAlumni.slice(0, 6).map((alumni) => (
                            <Card
                              key={alumni.id}
                              className={`cursor-pointer transition-all hover:shadow-md`}
                              onClick={() => handleAlumniClick(alumni)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback
                                      className={`text-sm ${alumni.isMentor ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                    >
                                      {getInitials(alumni.firstName, alumni.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-900 text-sm">
                                        {alumni.firstName} {alumni.lastName}
                                      </p>
                                      {alumni.isMentor && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                          Mentor
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{alumni.location}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Mentors Nearby */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Mentors Nearby ({nearbyMentors.length})
                        </h3>
                        <div className="space-y-3 px-1">
                          {nearbyMentors.map((mentor) => (
                            <Card
                              key={`mentor-${mentor.id}`}
                              className={`cursor-pointer transition-all hover:shadow-md`}
                              onClick={() => handleAlumniClick(mentor)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                                      {getInitials(mentor.firstName, mentor.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-900 text-sm">
                                        {mentor.firstName} {mentor.lastName}
                                      </p>
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        Mentor
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{mentor.location}</p>
                                    {mentor.mentorSpecialties && (
                                      <p className="text-xs text-green-600 truncate">
                                        {mentor.mentorSpecialties.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Collapse Button */}
                    <div className="p-2 border-t border-gray-200">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSidebarExpanded(false)}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Desktop Floating Sidebar */}
          {!isMobile && (
            <div className="absolute top-6 left-6 bottom-6 z-40 w-96 max-w-[clamp(330px,25vw,400px)]">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                {/* Fixed Header with Search */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="relative">
                    <Input
                      placeholder="Search for locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>

                {/* Split Content - 50/50 */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Users Section - Takes exactly 50% */}
                  <div className="flex-1 flex flex-col p-4 border-b border-gray-200 min-h-0">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex-shrink-0">
                      Users of the network ({filteredAlumni.length})
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto px-1 min-h-0">
                      {filteredAlumni.slice(0, 20).map((alumni) => (
                        <Card
                          key={alumni.id}
                          className={`cursor-pointer transition-all hover:shadow-md`}
                          onClick={() => handleAlumniClick(alumni)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback
                                  className={`text-sm ${alumni.isMentor ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                >
                                  {getInitials(alumni.firstName, alumni.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {alumni.firstName} {alumni.lastName}
                                  </p>
                                  {alumni.isMentor && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                      Mentor
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{alumni.location}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Mentors Section - Takes exactly 50% */}
                  <div className="flex-1 flex flex-col p-4 min-h-0">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex-shrink-0">
                      Mentors Nearby ({nearbyMentors.length})
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto px-1 min-h-0">
                      {nearbyMentors.map((mentor) => (
                        <Card
                          key={`mentor-${mentor.id}`}
                          className={`cursor-pointer transition-all hover:shadow-md`}
                          onClick={() => handleAlumniClick(mentor)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                                  {getInitials(mentor.firstName, mentor.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {mentor.firstName} {mentor.lastName}
                                  </p>
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Mentor
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{mentor.location}</p>
                                {mentor.mentorSpecialties && (
                                  <p className="text-xs text-green-600 truncate">
                                    {mentor.mentorSpecialties.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
