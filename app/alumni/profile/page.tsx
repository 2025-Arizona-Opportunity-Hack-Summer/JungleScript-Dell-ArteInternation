"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucideUser, Briefcase, Save, Eye, UploadCloud } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import AddressAutofill from "@/components/ui/address-autofill"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { z } from "zod"
import Link from "next/link"

const phoneSchema = z.string().regex(/^\d+$/, "Phone number must contain only digits")
const emailSchema = z.string().email("Invalid email address")

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
  linkedinUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
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
  const { user } = useUser()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | null }>({})

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      setLoading(true)
      try {
        const response = await fetch("/api/alumni/profile")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setProfileData({
              ...data,
              phone: data.phone || "",
              address: data.address || { street: "", city: "", state: "", country: "" },
              programs: data.programsAttended || [],
              graduationYears: data.graduationYears || [],
              biography: data.biography || "",
              websiteUrl: data.portfolioLinks?.website || "",
              linkedinUrl: data.portfolioLinks?.linkedin || "",
              instagramUrl: data.portfolioLinks?.instagram || "",
              youtubeUrl: data.portfolioLinks?.youtube || "",
              professionalTags: data.tags || [],
              dellArteRoles: data.experiencesAtDellArte || [],
              profileVisibility: data.profilePrivacy || "public",
              // Remap fields from the database to the form structure
              currentRole: data.currentWork?.title || "",
              currentOrganization: data.currentWork?.organization || "",
            })
          }
        } else {
          // If no profile exists, still populate with Clerk data
          setProfileData((prev) => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.primaryEmailAddress?.emailAddress || "",
          }))
        }
      } catch (err) {
        setError("Failed to load profile. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (field: string, value: string | object) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileData] as any),
          [child]: value,
        },
      }))
    } else if (field === 'address' && typeof value === 'object') {
      setProfileData((prev) => ({...prev, address: value as any}))
    }
    else {
      setProfileData((prev) => ({ ...prev, [field]: value }))
    }

    if (field === "phone") {
      const result = phoneSchema.safeParse(value)
      setValidationErrors((prev) => ({ ...prev, phone: result.success ? null : result.error.issues[0].message }))
    } else if (field === "email") {
      const result = emailSchema.safeParse(value)
      setValidationErrors((prev) => ({ ...prev, email: result.success ? null : result.error.issues[0].message }))
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
    setError(null)
    setSaved(false)
    try {
      const response = await fetch("/api/alumni/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile.")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!user) return false
    try {
      await user.setProfileImage({ file })
      // Force a reload of the user object to get the new image URL
      await user.reload()
      return true
    } catch (error) {
      console.error("Error uploading profile image:", error)
      setError("Failed to upload profile image.")
      return false
    }
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
          setImgSrc(reader.result)
        }
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    return new Promise<File | null>((resolve) => {
      const canvas = document.createElement("canvas")
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        )
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }
          resolve(new File([blob], "newFile.jpeg", { type: "image/jpeg" }))
        },
        "image/jpeg",
        1
      )
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">Update your information to stay connected with the Dell'Arte community</p>
        </div>

        {saved && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-4">
                <button onClick={() => setShowUploadModal(true)} className="relative">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl} alt={`${profileData.firstName} ${profileData.lastName}`} />
                    <AvatarFallback className="bg-red-100 text-red-700 text-xl">
                      {getInitials(profileData.firstName || "U", profileData.lastName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">Edit</p>
                  </div>
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 break-words">{profileData.email}</p>
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
                  {validationErrors.email && <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    This is your public email for others to contact you. To change your sign-in email, go to{" "}
                    <Link href="/account" className="text-blue-600 hover:underline">
                      Account Settings
                    </Link>
                    .
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}
                </div>
              </div>

              <AddressAutofill
                value={profileData.address}
                onChange={(address) => handleInputChange("address", address)}
                apiKey={process.env.NEXT_PUBLIC_MAPBOX_API || ""}
              />
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

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileData.linkedinUrl || ""}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram Profile</Label>
                <Input
                  id="instagramUrl"
                  placeholder="https://instagram.com/yourprofile"
                  value={profileData.instagramUrl || ""}
                  onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube Channel</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://youtube.com/c/yourchannel"
                  value={profileData.youtubeUrl || ""}
                  onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
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
                        onCheckedChange={(checked) =>
                          handleArrayChange("professionalTags", tag, checked as boolean)
                        }
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
                        onCheckedChange={(checked) =>
                          handleArrayChange("dellArteRoles", role, checked as boolean)
                        }
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
            <Button
              onClick={handleSave}
              disabled={loading || !!validationErrors.phone || !!validationErrors.email}
              className="bg-red-600 hover:bg-red-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Select and crop a new image to use as your profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <input
              type="file"
              accept="image/*"
              id="profile-image-upload"
              className="hidden"
              onChange={onSelectFile}
            />
            {imgSrc ? (
              <div className="flex flex-col items-center">
                <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} circularCrop>
                  <img ref={imgRef} src={imgSrc} style={{ maxHeight: "400px" }} />
                </ReactCrop>
                <Button
                  onClick={async () => {
                    if (crop?.width && crop?.height && imgRef.current) {
                      const croppedImage = await getCroppedImg(imgRef.current, crop)
                      if (croppedImage) {
                        const uploadSuccess = await handleImageUpload(croppedImage)
                        if (uploadSuccess) {
                          await handleSave()
                        }
                        setShowUploadModal(false)
                        setImgSrc("")
                      }
                    }
                  }}
                  className="mt-4"
                >
                  Save Cropped Image
                </Button>
              </div>
            ) : (
              <label
                htmlFor="profile-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50"
              >
                <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">Click to upload</p>
                <p className="text-sm text-gray-600">or drag and drop an image</p>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadModal(false)
              setImgSrc("")
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
