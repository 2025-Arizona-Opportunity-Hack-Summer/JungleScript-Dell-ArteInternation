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
import { Save } from "lucide-react"
import AddressAutofill from "@/components/ui/address-autofill"

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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      router.push("/map") // Redirect to the map page on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <main className="max-w-2xl w-full mx-auto py-6 sm:px-6 lg:px-8">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
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

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 hover:bg-red-700">
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
