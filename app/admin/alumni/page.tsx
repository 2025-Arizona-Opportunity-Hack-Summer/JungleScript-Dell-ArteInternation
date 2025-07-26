"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  Briefcase,
  Mail,
  Globe,
  AlertCircle,
} from "lucide-react"
import Header from "@/components/layout/header"
import { useAlumniStore, type AlumniProfile } from "@/lib/alumni-store"

const programs = [
  "MFA in Ensemble Based Physical Theatre",
  "Professional Training Program",
  "Summer Workshop - Mask & Movement",
  "Summer Workshop - Clown Intensive",
  "International Summer School",
]

const allTags = [
  "directing",
  "mask making",
  "commedia dell'arte",
  "teaching",
  "clown",
  "technology integration",
  "healthcare clowning",
  "therapeutic arts",
  "mask work",
  "international collaboration",
  "indigenous theatre",
  "storytelling",
  "cultural preservation",
]

export default function AlumniManagement() {
  const { alumni, loading, error, addAlumni, updateAlumni, deleteAlumni, fetchAlumni } = useAlumniStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null)
  const [editingAlumni, setEditingAlumni] = useState<AlumniProfile | null>(null)
  const [originalAlumni, setOriginalAlumni] = useState<AlumniProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const itemsPerPage = isMobile ? 6 : 12

  // Initialize alumni data
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter alumni
  const filteredAlumni = alumni.filter((alumni) => {
    const matchesSearch =
      searchQuery === "" ||
      `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProgram =
      selectedProgram === "all" || alumni.programsAttended.some((p) => p.program === selectedProgram)

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => alumni.tags.includes(tag))

    return matchesSearch && matchesProgram && matchesTags
  })

  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + itemsPerPage)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // CRUD Operations
  const handleDelete = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedAlumni && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await deleteAlumni(selectedAlumni.id)
        setShowDeleteDialog(false)
        setSelectedAlumni(null)
      } catch (error) {
        console.error("Failed to delete alumni:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleEdit = (alumni: AlumniProfile) => {
    const alumniCopy = JSON.parse(JSON.stringify(alumni)) // Deep copy
    setEditingAlumni(alumniCopy)
    setOriginalAlumni(JSON.parse(JSON.stringify(alumni))) // Keep original for comparison
    setShowEditModal(true)
    setSaveError(null)
  }

  const handleAdd = () => {
    const newAlumni: AlumniProfile = {
      id: 0, // Will be set by the store
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        latitude: 0,
        longitude: 0,
      },
      programsAttended: [],
      biography: "",
      currentWork: { title: "", organization: "", location: "" },
      tags: [],
      languagesSpoken: [],
      professionalAchievements: [],
      portfolioLinks: {},
      experiencesAtDellArte: [],
      referrals: [],
      lastUpdated: new Date().toISOString().split("T")[0],
      profilePrivacy: "public",
      donationHistory: [],
    }
    setEditingAlumni(newAlumni)
    setOriginalAlumni(null)
    setShowAddModal(true)
    setSaveError(null)
  }

  const getChangedFields = (original: AlumniProfile, updated: AlumniProfile): Partial<AlumniProfile> => {
    const changes: Partial<AlumniProfile> = {}

    // Compare each field
    if (original.firstName !== updated.firstName) changes.firstName = updated.firstName
    if (original.lastName !== updated.lastName) changes.lastName = updated.lastName
    if (original.email !== updated.email) changes.email = updated.email
    if (original.phone !== updated.phone) changes.phone = updated.phone
    if (original.biography !== updated.biography) changes.biography = updated.biography
    if (original.profilePrivacy !== updated.profilePrivacy) changes.profilePrivacy = updated.profilePrivacy

    // Compare nested objects
    if (JSON.stringify(original.address) !== JSON.stringify(updated.address)) {
      changes.address = updated.address
    }
    if (JSON.stringify(original.currentWork) !== JSON.stringify(updated.currentWork)) {
      changes.currentWork = updated.currentWork
    }
    if (JSON.stringify(original.portfolioLinks) !== JSON.stringify(updated.portfolioLinks)) {
      changes.portfolioLinks = updated.portfolioLinks
    }

    // Compare arrays
    if (JSON.stringify(original.tags) !== JSON.stringify(updated.tags)) {
      changes.tags = updated.tags
    }
    if (JSON.stringify(original.languagesSpoken) !== JSON.stringify(updated.languagesSpoken)) {
      changes.languagesSpoken = updated.languagesSpoken
    }
    if (JSON.stringify(original.professionalAchievements) !== JSON.stringify(updated.professionalAchievements)) {
      changes.professionalAchievements = updated.professionalAchievements
    }
    if (JSON.stringify(original.experiencesAtDellArte) !== JSON.stringify(updated.experiencesAtDellArte)) {
      changes.experiencesAtDellArte = updated.experiencesAtDellArte
    }
    if (JSON.stringify(original.referrals) !== JSON.stringify(updated.referrals)) {
      changes.referrals = updated.referrals
    }
    if (JSON.stringify(original.programsAttended) !== JSON.stringify(updated.programsAttended)) {
      changes.programsAttended = updated.programsAttended
    }
    if (JSON.stringify(original.donationHistory) !== JSON.stringify(updated.donationHistory)) {
      changes.donationHistory = updated.donationHistory
    }

    return changes
  }

  const saveAlumni = async () => {
    if (!editingAlumni || isSubmitting) return

    setIsSubmitting(true)
    setSaveError(null)

    try {
      console.log("=== SAVE ALUMNI START ===")
      console.log("Editing alumni:", editingAlumni)
      console.log("Original alumni:", originalAlumni)

      if (showAddModal) {
        console.log("Adding new alumni")
        await addAlumni(editingAlumni)
      } else if (originalAlumni) {
        // Only send changed fields for updates
        const changes = getChangedFields(originalAlumni, editingAlumni)
        console.log("Detected changes:", changes)

        if (Object.keys(changes).length > 0) {
          console.log("Updating alumni with changes:", changes)
          await updateAlumni(editingAlumni.id, changes)
        } else {
          console.log("No changes detected, skipping update")
        }
      } else {
        // Fallback: send all data if we don't have original
        console.log("No original data, sending all fields")
        await updateAlumni(editingAlumni.id, editingAlumni)
      }

      setShowEditModal(false)
      setShowAddModal(false)
      setEditingAlumni(null)
      setOriginalAlumni(null)
      console.log("=== SAVE ALUMNI SUCCESS ===")
    } catch (error) {
      console.error("Failed to save alumni:", error)
      setSaveError(error instanceof Error ? error.message : "Failed to save alumni")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDetailView = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni)
    setShowDetailModal(true)
  }

  const updateEditingAlumni = (field: string, value: any) => {
    if (!editingAlumni) return

    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setEditingAlumni((prev) => ({
        ...prev!,
        [parent]: {
          ...(prev![parent as keyof AlumniProfile] as any),
          [child]: value,
        },
      }))
    } else {
      setEditingAlumni((prev) => ({ ...prev!, [field]: value }))
    }
  }

  const AlumniCard = ({ alumni }: { alumni: AlumniProfile }) => (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => handleDetailView(alumni)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                {getInitials(alumni.firstName, alumni.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {alumni.firstName} {alumni.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {alumni.address.city}, {alumni.address.state || alumni.address.country}
              </p>
            </div>
          </div>
          <div className="flex space-x-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(alumni)
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(alumni)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EditForm = () => {
    if (!editingAlumni) return null

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
        {saveError && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={editingAlumni.firstName}
              onChange={(e) => updateEditingAlumni("firstName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={editingAlumni.lastName}
              onChange={(e) => updateEditingAlumni("lastName", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={editingAlumni.email}
            onChange={(e) => updateEditingAlumni("email", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={editingAlumni.phone || ""}
            onChange={(e) => updateEditingAlumni("phone", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={editingAlumni.address.city}
              onChange={(e) => updateEditingAlumni("address.city", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={editingAlumni.address.country}
              onChange={(e) => updateEditingAlumni("address.country", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="biography">Biography</Label>
          <Textarea
            id="biography"
            value={editingAlumni.biography || ""}
            onChange={(e) => updateEditingAlumni("biography", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={editingAlumni.currentWork?.title || ""}
              onChange={(e) => updateEditingAlumni("currentWork.title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={editingAlumni.currentWork?.organization || ""}
              onChange={(e) => updateEditingAlumni("currentWork.organization", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={editingAlumni.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newTags = editingAlumni.tags.includes(tag)
                    ? editingAlumni.tags.filter((t) => t !== tag)
                    : [...editingAlumni.tags, tag]
                  updateEditingAlumni("tags", newTags)
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alumni Management</h1>
              <p className="mt-2 text-gray-600">Manage alumni profiles and information</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleAdd}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Alumni
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Program</label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedProgram !== "all" || selectedTags.length > 0) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  {searchQuery && <Badge variant="secondary">Search: "{searchQuery}"</Badge>}
                  {selectedProgram !== "all" && <Badge variant="secondary">Program: {selectedProgram}</Badge>}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      Tag: {tag}
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedProgram("all")
                      setSelectedTags([])
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {paginatedAlumni.length} of {filteredAlumni.length} alumni
            </p>
          </div>

          {/* Alumni Grid */}
          <div className={`grid gap-4 mb-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {paginatedAlumni.map((alumni) => (
              <AlumniCard key={alumni.id} alumni={alumni} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-red-100 text-red-700 text-lg">
                  {selectedAlumni && getInitials(selectedAlumni.firstName, selectedAlumni.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedAlumni?.firstName} {selectedAlumni?.lastName}
                </h2>
                <p className="text-sm text-gray-500 font-normal">Alumni Profile</p>
              </div>
            </DialogTitle>
            <DialogDescription>View detailed information about this alumni member.</DialogDescription>
          </DialogHeader>

          {selectedAlumni && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> {selectedAlumni.email}
                  </p>
                  {selectedAlumni.phone && (
                    <p>
                      <strong>Phone:</strong> {selectedAlumni.phone}
                    </p>
                  )}
                  <p>
                    <strong>Location:</strong> {selectedAlumni.address.city}
                    {selectedAlumni.address.state && `, ${selectedAlumni.address.state}`},{" "}
                    {selectedAlumni.address.country}
                  </p>
                </div>
              </div>

              {/* Current Work */}
              {selectedAlumni.currentWork && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Current Work
                  </h3>
                  <div className="text-sm">
                    <p>
                      <strong>Title:</strong> {selectedAlumni.currentWork.title}
                    </p>
                    <p>
                      <strong>Organization:</strong> {selectedAlumni.currentWork.organization}
                    </p>
                  </div>
                </div>
              )}

              {/* Programs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Programs Attended</h3>
                <div className="space-y-2">
                  {selectedAlumni.programsAttended.map((program, index) => (
                    <div key={index} className="text-sm">
                      <p>
                        <strong>{program.program}</strong>
                      </p>
                      <p className="text-gray-500">Graduated: {program.graduationYear}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biography */}
              {selectedAlumni.biography && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Biography</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAlumni.biography}</p>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlumni.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Portfolio Links */}
              {selectedAlumni.portfolioLinks && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Portfolio Links
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedAlumni.portfolioLinks.website && (
                      <p>
                        <strong>Website:</strong>{" "}
                        <a
                          href={selectedAlumni.portfolioLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedAlumni.portfolioLinks.website}
                        </a>
                      </p>
                    )}
                    {selectedAlumni.portfolioLinks.linkedin && (
                      <p>
                        <strong>LinkedIn:</strong>{" "}
                        <a
                          href={selectedAlumni.portfolioLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedAlumni.portfolioLinks.linkedin}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowDetailModal(false)
                if (selectedAlumni) handleEdit(selectedAlumni)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Alumni Profile</DialogTitle>
            <DialogDescription>Update the alumni information below.</DialogDescription>
          </DialogHeader>
          <EditForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={saveAlumni} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Alumni</DialogTitle>
            <DialogDescription>Create a new alumni profile.</DialogDescription>
          </DialogHeader>
          <EditForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={saveAlumni} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Alumni"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alumni Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAlumni?.firstName} {selectedAlumni?.lastName}'s profile? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
