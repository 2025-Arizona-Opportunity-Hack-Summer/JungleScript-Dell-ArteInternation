"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucideUser, Briefcase, Save, Eye } from "lucide-react"
import Header from "@/components/layout/header"

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
}

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    country: string
  }
  programs: string[]
  graduationYears: string[]
  biography: string
  currentRole: string
  currentOrganization: string
  websiteUrl: string
  professionalTags: string[]
  dellArteRoles: string[]
  profileVisibility: string
}

const programs = [
  "MFA in Ensemble-Based Physical Theatre",
  "Summer Intensive",
  "Professional Training Program",
  "International Summer School",
  "Pedagogy Program",
]

const professionalTags = [
  "Directing",
  "Teaching",
  "Performance",
  "Movement",
  "Administration",
  "Producing",
  "Coaching",
  "Writing",
  "Design",
  "Technical Theatre",
]

const dellArteRoles = [
  "Guest Teacher",
  "Workshop Leader",
  "Administrative Staff",
  "Board Member",
  "Volunteer",
  "Mentor",
]

export default function AlumniProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
    programs: [],
    graduationYears: [],
    biography: "",
    currentRole: "",
    currentOrganization: "",
    websiteUrl: "",
    professionalTags: [],
    dellArteRoles: [],
    profileVisibility: "public",
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Load existing profile data
      setProfileData((prev) => ({
        ...prev,
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        email: parsedUser.email || "",
        programs: parsedUser.program ? [parsedUser.program] : [],
        graduationYears: parsedUser.graduationYear ? [parsedUser.graduationYear] : [],
      }))
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileData] as any),
          [child]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof ProfileData] as string[]), value]
        : (prev[field as keyof ProfileData] as string[]).filter((item) => item !== value),
    }))
  }

  const handleSave = async () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSaved(true)
      setLoading(false)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-gray-600">Update your information to stay connected with the Dell'Arte community</p>
          </div>

          {saved && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-red-100 text-red-700 text-xl">
                      {getInitials(profileData.firstName || "U", profileData.lastName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LucideUser className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      placeholder="Street Address"
                      value={profileData.address.street}
                      onChange={(e) => handleInputChange("address.street", e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="City"
                        value={profileData.address.city}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                      />
                      <Input
                        placeholder="State/Province"
                        value={profileData.address.state}
                        onChange={(e) => handleInputChange("address.state", e.target.value)}
                      />
                      <Input
                        placeholder="Country"
                        value={profileData.address.country}
                        onChange={(e) => handleInputChange("address.country", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Background</CardTitle>
                <CardDescription>Your Dell'Arte education and programs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Programs Attended</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map((program) => (
                      <div key={program} className="flex items-center space-x-2">
                        <Checkbox
                          id={program}
                          checked={profileData.programs.includes(program)}
                          onCheckedChange={(checked) => handleArrayChange("programs", program, checked as boolean)}
                        />
                        <Label htmlFor={program} className="text-sm">
                          {program}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYears">Graduation Years</Label>
                  <Input
                    id="graduationYears"
                    placeholder="e.g., 2020, 2022"
                    value={profileData.graduationYears.join(", ")}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        graduationYears: e.target.value
                          .split(",")
                          .map((year) => year.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your current work and professional focus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    placeholder="Tell us about yourself, your work, and your journey since Dell'Arte..."
                    value={profileData.biography}
                    onChange={(e) => handleInputChange("biography", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input
                      id="currentRole"
                      placeholder="e.g., Theatre Director"
                      value={profileData.currentRole}
                      onChange={(e) => handleInputChange("currentRole", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentOrganization">Current Organization</Label>
                    <Input
                      id="currentOrganization"
                      placeholder="e.g., Portland Theatre Collective"
                      value={profileData.currentOrganization}
                      onChange={(e) => handleInputChange("currentOrganization", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://yourwebsite.com"
                    value={profileData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Professional Focus Areas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {professionalTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={profileData.professionalTags.includes(tag)}
                          onCheckedChange={(checked) => handleArrayChange("professionalTags", tag, checked as boolean)}
                        />
                        <Label htmlFor={tag} className="text-sm">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dell'Arte Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Dell'Arte Experience</CardTitle>
                <CardDescription>Your involvement with Dell'Arte beyond being a student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Roles at Dell'Arte</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dellArteRoles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={role}
                          checked={profileData.dellArteRoles.includes(role)}
                          onCheckedChange={(checked) => handleArrayChange("dellArteRoles", role, checked as boolean)}
                        />
                        <Label htmlFor={role} className="text-sm">
                          {role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control who can see your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select
                    value={profileData.profileVisibility}
                    onValueChange={(value) => handleInputChange("profileVisibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Visible to everyone</SelectItem>
                      <SelectItem value="alumni-only">Alumni Only - Visible to Dell'Arte alumni</SelectItem>
                      <SelectItem value="private">Private - Only visible to you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
