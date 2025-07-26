"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAlumniStore } from "@/lib/alumni-store"
import { Database, Loader2 } from "lucide-react"

export function DatabaseSeeder() {
  const { seedDatabase, loading, error } = useAlumniStore()
  const [seeded, setSeeded] = useState(false)

  const handleSeed = async () => {
    await seedDatabase()
    setSeeded(true)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database Setup
        </CardTitle>
        <CardDescription>Initialize the Supabase database with sample alumni data</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {seeded && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">Database seeded successfully!</p>
          </div>
        )}

        <Button onClick={handleSeed} disabled={loading || seeded} className="w-full">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {loading ? "Seeding Database..." : seeded ? "Database Seeded" : "Seed Database"}
        </Button>
      </CardContent>
    </Card>
  )
}
