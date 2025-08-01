"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Eye } from "lucide-react"
import AddressAutofill from "@/components/ui/address-autofill"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

const phoneSchema = z.string().regex(/^\d+$/, "Phone number must contain only digits")

const programs = [
  "MFA in Ensemble-Based Physical Theatre",
  "Summer Intensive",
  "Professional Training Program",
  "International Summer School",
  "Pedagogy Program",
]

export default function RegisterPage() {
  const { user } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
    programs: [] as string[],
    graduationYears: [] as string[],
    currentRole: "",
    currentOrganization: "",
    firstName: "",
    lastName: "",
    profileVisibility: "public",
    websiteUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
  })
  const [privacyConsentChecked, setPrivacyConsentChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | null }>({})

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      }))
    }
  }, [user])

  const handleInputChange = (field: string, value: string | object) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof formData] as any),
          [child]: value,
        },
      }))
    } else if (field === 'address' && typeof value === 'object') {
      setFormData((prev) => ({ ...prev, address: value as any}))
    }
    else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (field === "phone") {
      const result = phoneSchema.safeParse(value)
      setValidationErrors((prev) => ({ ...prev, phone: result.success ? null : result.error.issues[0].message }))
    } else if (field === "firstName" || field === "lastName") {
      if (!value) {
        setValidationErrors((prev) => ({ ...prev, [field]: `${field === "firstName" ? "First" : "Last"} name is required.` }))
      } else {
        setValidationErrors((prev) => ({ ...prev, [field]: null }))
      }
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof formData] as string[]), value]
        : (prev[field as keyof typeof formData] as string[]).filter((item) => item !== value),
    }))
  }

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string | null } = {}
    if (!formData.firstName) {
      newErrors.firstName = "First name is required."
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required."
    }
    if (!privacyConsentChecked) {
      newErrors.privacyConsent = "You must agree to the privacy terms."
    }

    setValidationErrors((prev) => ({ ...prev, ...newErrors }))

    if (Object.values(newErrors).some((e) => e !== null) || Object.values(validationErrors).some((e) => e !== null)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/alumni/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        throw new Error("Failed to save profile.")
      }
      router.push("/map?from_register=true") // Redirect to the map page on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
      <main className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Welcome! Please fill out the information below to finish setting up your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                  {validationErrors.firstName && <p className="text-sm text-red-600 mt-1">{validationErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                  {validationErrors.lastName && <p className="text-sm text-red-600 mt-1">{validationErrors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
                {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}
              </div>

              <AddressAutofill
                value={formData.address}
                onChange={(address) => handleInputChange("address", address)}
                apiKey={process.env.NEXT_PUBLIC_MAPBOX_API || ""}
              />
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Programs Attended</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((program) => (
                    <div key={program} className="flex items-center space-x-2">
                      <Checkbox
                        id={program}
                        checked={formData.programs.includes(program)}
                        onCheckedChange={(checked) => handleArrayChange("programs", program, checked as boolean)}
                      />
                      <Label htmlFor={program} className="text-sm font-normal">
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
                  value={formData.graduationYears.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      graduationYears: e.target.value.split(",").map((year) => year.trim()).filter(Boolean),
                    }))
                  }
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Theatre Director"
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange("currentRole", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentOrganization">Current Organization</Label>
                  <Input
                    id="currentOrganization"
                    placeholder="e.g., Portland Theatre Collective"
                    value={formData.currentOrganization}
                    onChange={(e) => handleInputChange("currentOrganization", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                placeholder="https://yourwebsite.com"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
              <Input
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram Profile</Label>
              <Input
                id="instagramUrl"
                placeholder="https://instagram.com/yourprofile"
                value={formData.instagramUrl}
                onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube Channel</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://youtube.com/c/yourchannel"
                value={formData.youtubeUrl}
                onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-2">
              <Label htmlFor="profileVisibility" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Profile Privacy
              </Label>
              <Select
                value={formData.profileVisibility}
                onValueChange={(value) => handleInputChange("profileVisibility", value)}
              >
                <SelectTrigger id="profileVisibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="alumni-only">Alumni Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="privacyConsent"
                  checked={privacyConsentChecked}
                  onCheckedChange={(checked) => {
                    setPrivacyConsentChecked(checked as boolean)
                    if (checked) {
                      setValidationErrors((prev) => ({ ...prev, privacyConsent: null }))
                    }
                  }}
                />
                <label
                  htmlFor="privacyConsent"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand that if my profile is public, my contact information will be visible to everyone. My
                  exact street address will never be shown, only my city and country.
                </label>
              </div>
              {validationErrors.privacyConsent && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.privacyConsent}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !privacyConsentChecked ||
                  !!validationErrors.phone
                }
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
