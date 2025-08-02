"use client"

import React, { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
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
  X,
} from "lucide-react"
import { useAlumniStore, type AlumniProfile } from "@/lib/alumni-store"
import { logger } from "@/lib/logger"
import { EmailComposerModal } from "@/components/admin/EmailComposerModal"
import type { ReactElement } from "react"
import type { NextPage } from "next"
import { z } from "zod"

const phoneSchema = z.string().regex(/^\d+$/, "Phone number must contain only digits")
const emailSchema = z.string().email("Invalid email address")

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

const ArrayInput = ({
  label,
  items,
  setItems,
}: {
  label: string
  items: string[] | undefined | null
  setItems: (items: string[]) => void
}) => {
  const [inputValue, setInputValue] = useState("")

  const handleAddItem = () => {
    const currentItems = items || []
    if (inputValue && !currentItems.includes(inputValue)) {
      setItems([...currentItems, inputValue])
      setInputValue("")
    }
  }

  const handleRemoveItem = (itemToRemove: string) => {
    const currentItems = items || []
    setItems(currentItems.filter((item) => item !== itemToRemove))
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center space-x-2 mt-2">
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Add a ${label.toLowerCase().slice(0, -1)}...`} />
        <Button type="button" variant="outline" onClick={handleAddItem}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {(items || []).map((item) => (
          <Badge key={item} variant="secondary">
            {item}
            <button type="button" className="ml-2" onClick={() => handleRemoveItem(item)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}

const EditForm = ({
  editingAlumni,
  updateEditingAlumni,
  saveError,
  validationErrors,
}: {
  editingAlumni: AlumniProfile | null
  updateEditingAlumni: (field: string, value: any) => void
  saveError: string | null
  validationErrors: { [key: string]: string | null }
}) => {
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
        {validationErrors.email && <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={editingAlumni.phone || ""}
          onChange={(e) => updateEditingAlumni("phone", e.target.value)}
        />
        {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}
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
          <Label htmlFor="state">State / Province</Label>
          <Input
            id="state"
            value={editingAlumni.address.state || ""}
            onChange={(e) => updateEditingAlumni("address.state", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zipCode">Zip / Postal Code</Label>
          <Input
            id="zipCode"
            value={editingAlumni.address.zipCode || ""}
            onChange={(e) => updateEditingAlumni("address.zipCode", e.target.value)}
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
        <Label>Portfolio Links</Label>
        <div className="space-y-2 mt-2">
          <Input
            placeholder="Website URL"
            value={editingAlumni.portfolioLinks?.website || ""}
            onChange={(e) => updateEditingAlumni("portfolioLinks.website", e.target.value)}
          />
          <Input
            placeholder="LinkedIn URL"
            value={editingAlumni.portfolioLinks?.linkedin || ""}
            onChange={(e) => updateEditingAlumni("portfolioLinks.linkedin", e.target.value)}
          />
          <Input
            placeholder="Instagram Handle"
            value={editingAlumni.portfolioLinks?.instagram || ""}
            onChange={(e) => updateEditingAlumni("portfolioLinks.instagram", e.target.value)}
          />
          <Input
            placeholder="YouTube Channel URL"
            value={editingAlumni.portfolioLinks?.youtube || ""}
            onChange={(e) => updateEditingAlumni("portfolioLinks.youtube", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Programs Attended</Label>
        <div className="space-y-2 mt-2">
          {(editingAlumni.programsAttended || []).map((program, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
              <div className="grid grid-cols-3 gap-2 flex-1">
                <Input
                  placeholder="Program Name"
                  value={program.program}
                  onChange={(e) => {
                    const newPrograms = [...editingAlumni.programsAttended]
                    newPrograms[index].program = e.target.value
                    updateEditingAlumni("programsAttended", newPrograms)
                  }}
                />
                <Input
                  placeholder="Graduation Year"
                  type="number"
                  value={program.graduationYear}
                  onChange={(e) => {
                    const newPrograms = [...editingAlumni.programsAttended]
                    newPrograms[index].graduationYear = Number(e.target.value)
                    updateEditingAlumni("programsAttended", newPrograms)
                  }}
                />
                <Input
                  placeholder="Cohort"
                  value={program.cohort || ""}
                  onChange={(e) => {
                    const newPrograms = [...editingAlumni.programsAttended]
                    newPrograms[index].cohort = e.target.value
                    updateEditingAlumni("programsAttended", newPrograms)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPrograms = editingAlumni.programsAttended.filter((_, i) => i !== index)
                  updateEditingAlumni("programsAttended", newPrograms)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newPrograms = [
                ...editingAlumni.programsAttended,
                { program: "", graduationYear: new Date().getFullYear(), cohort: "" },
              ]
              updateEditingAlumni("programsAttended", newPrograms)
            }}
          >
            Add Program
          </Button>
        </div>
      </div>

      <ArrayInput
        label="Languages Spoken"
        items={editingAlumni.languagesSpoken}
        setItems={(items) => updateEditingAlumni("languagesSpoken", items)}
      />
      <ArrayInput
        label="Professional Achievements"
        items={editingAlumni.professionalAchievements}
        setItems={(items) => updateEditingAlumni("professionalAchievements", items)}
      />
      <ArrayInput
        label="Experiences at Dell'Arte"
        items={editingAlumni.experiencesAtDellArte}
        setItems={(items) => updateEditingAlumni("experiencesAtDellArte", items)}
      />
      <ArrayInput
        label="Referrals"
        items={editingAlumni.referrals}
        setItems={(items) => updateEditingAlumni("referrals", items)}
      />

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={(editingAlumni.tags || []).includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                const currentTags = editingAlumni.tags || []
                const newTags = currentTags.includes(tag)
                  ? currentTags.filter((t) => t !== tag)
                  : [...currentTags, tag]
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



const AlumniCard = React.memo(({ alumni, onSelect, isSelected, onEdit, onDelete }: { alumni: AlumniProfile; onSelect: (alumni: AlumniProfile) => void; isSelected: boolean; onEdit: (alumni: AlumniProfile) => void; onDelete: (alumni: AlumniProfile) => void; }) => (
    <Card 
      className={`transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onSelect(alumni)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => onSelect(alumni)}
              className="mr-2"
            />
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={alumni.imageUrl} alt={`${alumni.firstName} ${alumni.lastName}`} className="object-cover" />
              <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold">
                {`${alumni.firstName.charAt(0)}${alumni.lastName.charAt(0)}`.toUpperCase()}
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
                e.stopPropagation();
                onEdit(alumni);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(alumni);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
));
AlumniCard.displayName = "AlumniCard";

export default function AlumniManagement(): ReactNode {
  const { alumni, loading, error, addAlumni, updateAlumni, deleteAlumni, fetchAlumni } = useAlumniStore()

    const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [selectedAccountStatus, setSelectedAccountStatus] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
const [tagFilterMode, setTagFilterMode] = useState<"OR" | "AND">("OR")
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  
  const [selectedAlumniForActions, setSelectedAlumniForActions] = useState<AlumniProfile[]>([])

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null)
  const [editingAlumni, setEditingAlumni] = useState<AlumniProfile | null>(null)
  const [originalAlumni, setOriginalAlumni] = useState<AlumniProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | null }>({})

  const itemsPerPage = isMobile ? 6 : 12

  // Initialize alumni data
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const isNowMobile = window.innerWidth < 768
      if(isNowMobile) {
        logger.debug("Mobile view activated");
      }
      setIsMobile(isNowMobile);
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Reset to the first page on any filter change
    useEffect(() => {
    setCurrentPage(1); 
  }, [searchQuery, selectedProgram, selectedCountry, selectedTags, selectedAccountStatus]);

  // Filter alumni
  const { filteredAlumni, uniqueCountries } = useMemo(() => {
    const countries = new Set<string>()
    alumni.forEach(alum => {
      if (alum.address?.country) {
        if (alum.address.country === 'USA') {
          countries.add('United States');
        } else {
          countries.add(alum.address.country);
        }
      }
    });

    const filtered = alumni.filter((alumni) => {
      const matchesSearch =
        searchQuery === "" ||
        `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumni.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesProgram =
        selectedProgram === "all" || alumni.programsAttended.some((p) => p.program === selectedProgram)

      const matchesCountry =
        selectedCountry === "all" ||
        (selectedCountry === "United States"
          ? alumni.address.country === "United States" || alumni.address.country === "USA"
          : alumni.address.country === selectedCountry)

      
            const lowercasedAlumniTags = alumni.tags.map(t => t.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        (tagFilterMode === 'OR' 
          ? selectedTags.some((tag) => lowercasedAlumniTags.includes(tag.toLowerCase()))
          : selectedTags.every((tag) => lowercasedAlumniTags.includes(tag.toLowerCase())))

      const matchesAccountStatus =
        selectedAccountStatus === "all" ||
        (selectedAccountStatus === "hasAccount" && alumni.clerkUserId) ||
        (selectedAccountStatus === "noAccount" && !alumni.clerkUserId)

      return matchesSearch && matchesProgram && matchesCountry && matchesTags && matchesAccountStatus
    })

    return {
      filteredAlumni: filtered,
      uniqueCountries: Array.from(countries).sort()
    }
  }, [alumni, searchQuery, selectedProgram, selectedCountry, selectedTags, selectedAccountStatus, tagFilterMode]);

  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + itemsPerPage)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Bulk selection logic
  const handleSelectAlumni = (alumni: AlumniProfile) => {
    setSelectedAlumniForActions((prev) => {
      if (prev.find((a) => a.id === alumni.id)) {
        return prev.filter((a) => a.id !== alumni.id)
      } else {
        return [...prev, alumni]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedAlumniForActions.length === paginatedAlumni.length) {
      setSelectedAlumniForActions([])
    } else {
      setSelectedAlumniForActions(paginatedAlumni)
    }
  }

  // Clear selection when filters change
  useEffect(() => {
    setSelectedAlumniForActions([])
  }, [searchQuery, selectedProgram, selectedCountry, selectedTags, selectedAccountStatus])

  // CRUD Operations
  const handleDelete = (alumniToDelete: AlumniProfile) => {
    setSelectedAlumniForActions([alumniToDelete])
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedAlumniForActions.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await Promise.all(selectedAlumniForActions.map((alumni) => deleteAlumni(alumni.id)))
      setShowDeleteDialog(false)
      setSelectedAlumniForActions([])
    } catch (error) {
              logger.error("Failed to delete alumni", error)
    } finally {
      setIsSubmitting(false)
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
      // geocode address if it has changed
      if (
        showAddModal ||
        (originalAlumni &&
          (originalAlumni.address.city !== editingAlumni.address.city ||
            originalAlumni.address.state !== editingAlumni.address.state ||
            originalAlumni.address.country !== editingAlumni.address.country))
      ) {
        if (editingAlumni.address.city) {
          // improved geocoding with multiple fallback attempts
          const geocodeAttempts = []
          
          // attempt 1: city, state, country (most specific)
          if (editingAlumni.address.city && editingAlumni.address.state && editingAlumni.address.country) {
            geocodeAttempts.push(`${editingAlumni.address.city}, ${editingAlumni.address.state}, ${editingAlumni.address.country}`)
          }
          
          // attempt 2: city, country (original logic)
          if (editingAlumni.address.city && editingAlumni.address.country) {
            geocodeAttempts.push(`${editingAlumni.address.city}, ${editingAlumni.address.country}`)
          }
          
          // attempt 3: city, state (for US addresses without explicit country)
          if (editingAlumni.address.city && editingAlumni.address.state) {
            geocodeAttempts.push(`${editingAlumni.address.city}, ${editingAlumni.address.state}`)
            // also try with US as country for state abbreviations
            geocodeAttempts.push(`${editingAlumni.address.city}, ${editingAlumni.address.state}, United States`)
          }
          
          // attempt 4: just city as last resort
          geocodeAttempts.push(editingAlumni.address.city)
          
          let geocodeSuccess = false
          
          // try each geocoding attempt until one succeeds
          for (const searchQuery of geocodeAttempts) {
            try {
              const response = await fetch("/api/geocode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query: searchQuery // use the new query parameter for full address strings
                }),
              })

              if (response.ok) {
                const { latitude, longitude } = await response.json()
                editingAlumni.address.latitude = latitude
                editingAlumni.address.longitude = longitude
                geocodeSuccess = true
                console.log(`Geocoding successful with: ${searchQuery}`)
                break // success, exit the loop
              }
            } catch (err) {
              console.warn(`Geocoding attempt failed for: ${searchQuery}`, err)
            }
          }
          
          if (!geocodeSuccess) {
            console.warn('All geocoding attempts failed for address:', editingAlumni.address)
          }
        }
      }

          logger.debug("Save alumni operation started", { editingAlumni, originalAlumni })

      if (showAddModal) {
        logger.debug("Adding new alumni")
        await addAlumni(editingAlumni)
      } else if (originalAlumni) {
        // Only send changed fields for updates
        const changes = getChangedFields(originalAlumni, editingAlumni)
        logger.debug("Detected changes", changes)

        if (Object.keys(changes).length > 0) {
          logger.debug("Updating alumni with changes", changes)
          await updateAlumni(editingAlumni)
              } else {
        logger.debug("No changes detected, skipping update")
        }
      } else {
        // Fallback: send all data if we don't have original
        logger.debug("No original data, sending all fields")
        await updateAlumni(editingAlumni)
      }

      setShowEditModal(false)
      setShowAddModal(false)
      setEditingAlumni(null)
      setOriginalAlumni(null)
      logger.debug("Save alumni operation completed successfully")
    } catch (error) {
      logger.error("Failed to save alumni", error)
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

    if (field === "phone") {
      const result = phoneSchema.safeParse(value)
      setValidationErrors((prev) => ({ ...prev, phone: result.success ? null : result.error.issues[0].message }))
    } else if (field === "email") {
      const result = emailSchema.safeParse(value)
      setValidationErrors((prev) => ({ ...prev, email: result.success ? null : result.error.issues[0].message }))
    }
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

  return (
    <>
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alumni Management</h1>
                <p className="mt-2 text-gray-600">Manage alumni profiles and information</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                  <Button 
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto" 
                    onClick={() => setShowEmailModal(true)} 
                    disabled={selectedAlumniForActions.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Selected ({selectedAlumniForActions.length})
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto" 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={selectedAlumniForActions.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedAlumniForActions.length})
                  </Button>
                </div>
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={handleAdd}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Alumni
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="filters">
              <AccordionTrigger>
                <div className="flex items-center text-lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Controls
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2">
                <div className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    {/* Account Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      <Select value={selectedAccountStatus} onValueChange={setSelectedAccountStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="hasAccount">Has Account</SelectItem>
                          <SelectItem value="noAccount">No Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          {uniqueCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags Filter */}
                    <div className="md:col-span-3">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Filter by Tags</label>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${tagFilterMode === 'OR' ? 'text-primary' : 'text-gray-500'}`}>OR</span>
                          <Switch
                            checked={tagFilterMode === 'AND'}
                            onCheckedChange={(checked) => setTagFilterMode(checked ? 'AND' : 'OR')}
                          />
                          <span className={`text-sm ${tagFilterMode === 'AND' ? 'text-primary' : 'text-gray-500'}`}>AND</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary-600 hover:bg-primary-600/90" : ""}`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(searchQuery || selectedProgram !== "all" || selectedCountry !== "all" || selectedTags.length > 0 || selectedAccountStatus !== "all") && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>Active filters:</span>
                      {searchQuery && <Badge variant="secondary">Search: "{searchQuery}"</Badge>}
                      {selectedProgram !== "all" && <Badge variant="secondary">Program: {selectedProgram}</Badge>}
                      {selectedCountry !== "all" && <Badge variant="secondary">Country: {selectedCountry}</Badge>}
                      {selectedAccountStatus === "hasAccount" && <Badge variant="secondary">Status: Has Account</Badge>}
                      {selectedAccountStatus === "noAccount" && <Badge variant="secondary">Status: No Account</Badge>}
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
                          setSelectedCountry("all")
                          setSelectedTags([])
                          setSelectedAccountStatus("all")
                        }}
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Results Summary */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={selectedAlumniForActions.length === paginatedAlumni.length && paginatedAlumni.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="text-sm font-medium">
                  Select All on Page
                </Label>
                {selectedAlumniForActions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAlumniForActions([])}>
                    Clear Selection
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Showing {paginatedAlumni.length} of {filteredAlumni.length} alumni
              </p>
            </div>
          )}

          {/* Alumni Grid */}
          <div className={`grid gap-4 mb-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {paginatedAlumni.map((alumni) => (
              <AlumniCard 
                key={alumni.id} 
                alumni={alumni} 
                onSelect={handleSelectAlumni}
                isSelected={selectedAlumniForActions.some((a) => a.id === alumni.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={selectedAlumni?.imageUrl}
                  alt={`${selectedAlumni?.firstName} ${selectedAlumni?.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary-100 text-primary-600 text-lg">
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
              className="bg-primary hover:bg-primary/90"
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
          <EditForm
            editingAlumni={editingAlumni}
            updateEditingAlumni={updateEditingAlumni}
            saveError={saveError}
            validationErrors={validationErrors}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={saveAlumni}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting || !!validationErrors.phone || !!validationErrors.email}
            >
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
          <EditForm
            editingAlumni={editingAlumni}
            updateEditingAlumni={updateEditingAlumni}
            saveError={saveError}
            validationErrors={validationErrors}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={saveAlumni}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting || !!validationErrors.phone || !!validationErrors.email}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Alumni"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Alumni Profile{selectedAlumniForActions.length > 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <div className="font-medium text-foreground">
                  {selectedAlumniForActions.length === 1 
                    ? `You are about to permanently delete ${selectedAlumniForActions[0]?.firstName} ${selectedAlumniForActions[0]?.lastName}'s profile data.`
                    : `You are about to permanently delete ${selectedAlumniForActions.length} alumni profiles.`
                  }
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-2">
                  <div className="font-medium text-yellow-800">What will happen:</div>
                  <ul className="text-yellow-700 space-y-1 text-xs">
                    <li>• Profile data will be permanently removed from the database</li>
                    <li>• Alumni will no longer appear on the map or in searches</li>
                    <li>• Their Clerk account will remain active</li>
                    <li>• They can recreate their profile if they log in again</li>
                  </ul>
                </div>
                
                <div className="text-destructive font-medium">
                  This action cannot be undone.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setSelectedAlumniForActions([]);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isMobile && selectedAlumniForActions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{selectedAlumniForActions.length} selected</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                logger.debug("Opening email modal from mobile bar");
                setShowEmailModal(true)
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAlumniForActions([])}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      <EmailComposerModal
        isOpen={showEmailModal}
        onOpenChange={setShowEmailModal}
        recipients={selectedAlumniForActions}
      />
    </>
  )
}
