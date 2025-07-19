// File: components/forms/ProfileForm.tsx
"use client";

import { useState } from "react";
// ... (keep all your other component imports from the original file)
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

// ... (keep your ProfileData interface and constant arrays)
interface ProfileData {
  firstName: string
  lastName: string
  //... all other fields
}

// This component now receives the initial data as a prop
export default function ProfileForm({ initialData }: { initialData: ProfileData }) {
  // Initialize state with the data fetched from the server
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Your handleInputChange and handleArrayChange functions remain exactly the same
  const handleInputChange = (field: string, value: string) => { /* ... no changes needed ... */ };
  const handleArrayChange = (field: string, value: string, checked: boolean) => { /* ... no changes needed ... */ };
  const getInitials = (firstName: string, lastName: string) => { /* ... no changes needed ... */ };

  // This is the updated save handler
  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Hide success message after 3s

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // All your original JSX for the form goes here.
    // It will work as-is because it reads from the `profileData` state.
    <div className="space-y-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-gray-600">Update your information to stay connected</p>
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
        
        {/* Paste ALL the <Card> sections from your original file here */}
        {/* ... Profile Header Card ... */}
        {/* ... Basic Information Card ... */}
        {/* ... etc. ... */}

        {/* The Save button at the end */}
        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
            </Button>
        </div>
    </div>
  );
}