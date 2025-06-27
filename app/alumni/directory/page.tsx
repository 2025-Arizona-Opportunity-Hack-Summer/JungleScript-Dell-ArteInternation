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

interface AlumniProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  graduationYear: number
  program: string
  currentRole?: string
  currentOrganization?: string
  location?: string
  professionalTags: string[]
  websiteUrl?: string
  profileVisibility: string
}

const mockAlumni: AlumniProfile[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    graduationYear: 2020,
    program: "MFA in Ensemble-Based Physical Theatre",
    currentRole: "Theatre Director",
    currentOrganization: "Portland Theatre Collective",
    location: "Portland, OR",
    professionalTags: ["Directing", "Teaching", "Physical Theatre"],
    websiteUrl: "https://sarahjohnson.com",
    profileVisibility: "public",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    graduationYear: 2018,
    program: "Summer Intensive",
    currentRole: "Movement Coach",
    currentOrganization: "Freelance",
    location: "San Francisco, CA",
    professionalTags: ["Movement", "Coaching", "Workshop Facilitation"],
    profileVisibility: "alumni-only",
  },
  {
    id: "3",
    firstName: "Elena",
    lastName: "Rodriguez",
    email: "elena.rodriguez@email.com",
    graduationYear: 2019,
    program: "Professional Training Program",
    currentRole: "Arts Administrator",
    currentOrganization: "Lincoln Center",
    location: "New York, NY",
    professionalTags: ["Administration", "Arts Management", "Event Planning"],
    profileVisibility: "public",
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@email.com",
    graduationYear: 2021,
    program: "MFA in Ensemble-Based Physical Theatre",
    currentRole: "Teaching Artist",
    currentOrganization: "Various Schools",
    location: "Seattle, WA",
    professionalTags: ["Teaching", "Youth Theatre", "Community Outreach"],
    profileVisibility: "public",
  },
  {
    id: "5",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@email.com",
    graduationYear: 2017,
    program: "International Summer School",
    currentRole: "Performer",
    currentOrganization: "Cirque du Soleil",
    location: "Montreal, Canada",
    professionalTags: ["Performance", "Acrobatics", "International Touring"],
    profileVisibility: "alumni-only",
  },
  {
    id: "6",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@email.com",
    graduationYear: 2022,
    program: "MFA in Ensemble-Based Physical Theatre",
    currentRole: "Theatre Producer",
    currentOrganization: "Independent",
    location: "Los Angeles, CA",
    professionalTags: ["Producing", "Fundraising", "Project Management"],
    websiteUrl: "https://jameswilsonproductions.com",
    profileVisibility: "public",
  },
]

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

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>(mockAlumni)
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>(mockAlumni)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("All Programs")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedTag, setSelectedTag] = useState("All Tags")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = alumni

    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.currentOrganization?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedProgram !== "All Programs") {
      filtered = filtered.filter((person) => person.program === selectedProgram)
    }

    if (selectedYear !== "All Years") {
      filtered = filtered.filter((person) => person.graduationYear.toString() === selectedYear)
    }

    if (selectedTag !== "All Tags") {
      filtered = filtered.filter((person) => person.professionalTags.includes(selectedTag))
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
                        {getInitials(person.firstName, person.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {person.firstName} {person.lastName}
                      </h3>
                      <div className="mt-1 space-y-1">
                        {person.currentRole && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{person.currentRole}</span>
                          </div>
                        )}
                        {person.currentOrganization && (
                          <p className="text-sm text-gray-500 truncate">{person.currentOrganization}</p>
                        )}
                        {person.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{person.location}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Class of {person.graduationYear}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {person.professionalTags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {person.professionalTags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{person.professionalTags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        {person.websiteUrl && (
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
