"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, MapPin, Briefcase, Calendar, Mail, Globe } from "lucide-react"
import Header from "@/components/layout/header"
import { fetchAllAlumni, type AlumniProfile } from "@/lib/supabase"

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("All Programs")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedTag, setSelectedTag] = useState("All Tags")
  const [showFilters, setShowFilters] = useState(false)

  const programs = [
    "All Programs",
    "MFA in Ensemble-Based Physical Theatre",
    "Summer Intensive",
    "Professional Training Program",
    "International Summer School",
    "Pedagogy Program",
  ]

  const graduationYears = [
    "All Years",
    ...Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()),
  ]

  const professionalTags = [
    "All Tags",
    "Directing",
    "Teaching",
    "Performance",
    "Movement",
    "Administration",
    "Producing",
    "Coaching",
  ]

  // Fetch alumni data from Supabase - OPTIMIZED!
  useEffect(() => {
    async function loadAlumni() {
      const startTime = performance.now()

      try {
        const data = await fetchAllAlumni()
        setAlumni(data)
        setFilteredAlumni(data)

        const endTime = performance.now()
        console.log(`Directory loaded ${data.length} alumni in ${Math.round(endTime - startTime)}ms`)
      } catch (error) {
        console.error("Error loading alumni:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAlumni()
  }, [])

  useEffect(() => {
    let filtered = alumni

    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${person.city || ""} ${person.country || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.current_organization?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedProgram !== "All Programs") {
      filtered = filtered.filter((person) => person.programs?.some((p) => p.name === selectedProgram))
    }

    if (selectedYear !== "All Years") {
      filtered = filtered.filter((person) =>
        person.programs?.some((p) => p.graduation_year.toString() === selectedYear),
      )
    }

    if (selectedTag !== "All Tags") {
      filtered = filtered.filter((person) => person.professional_tags?.some((tag) => tag.name === selectedTag))
    }

    setFilteredAlumni(filtered)
  }, [searchTerm, selectedProgram, selectedYear, selectedTag, alumni])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedProgram("All Programs")
    setSelectedYear("All Years")
    setSelectedTag("All Tags")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
            <p className="mt-2 text-gray-600">Connect with {filteredAlumni.length} Dell'Arte alumni worldwide</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, location, or organization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                      <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {graduationYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Focus</label>
                      <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {professionalTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3">
                      <Button variant="outline" onClick={clearFilters} size="sm">
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((person) => (
              <Card key={person.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {getInitials(person.first_name, person.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {person.first_name} {person.last_name}
                      </h3>
                      <div className="mt-1 space-y-1">
                        {person.current_role && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{person.current_role}</span>
                          </div>
                        )}
                        {person.current_organization && (
                          <p className="text-sm text-gray-500 truncate">{person.current_organization}</p>
                        )}
                        {person.city && person.country && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {person.city}, {person.country}
                            </span>
                          </div>
                        )}
                        {person.programs && person.programs.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>Class of {person.programs[0].graduation_year}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {person.professional_tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag.name} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {person.professional_tags && person.professional_tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{person.professional_tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        {person.website_url && (
                          <Button size="sm" variant="outline">
                            <Globe className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlumni.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No alumni found</h3>
                <p className="mt-2">Try adjusting your search criteria or filters.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
