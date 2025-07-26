"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"
import Header from "@/components/layout/header"
import { supabase } from "@/lib/supabase"
import { useAlumniStore } from "@/lib/alumni-store"

interface ValidationResult {
  valid: any[]
  errors: { record: number; error: string }[]
  summary: {
    total: number
    valid: number
    errors: number
  }
}

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const { fetchAlumni } = useAlumniStore()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && uploadedFile.type === "application/json") {
      setFile(uploadedFile)
      setValidationResult(null)
      setImportComplete(false)
    }
  }

  const handleValidateAndPreview = async () => {
    if (!file) return

    setIsValidating(true)
    setValidationResult(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result
        if (typeof text !== "string") {
          throw new Error("File is not a valid text file.")
        }
        const records = JSON.parse(text)

        if (!Array.isArray(records)) {
          throw new Error("JSON file must contain an array of alumni records.")
        }

        if (!supabase) {
          throw new Error("Supabase client is not available. Check your environment variables.")
        }

        const { data: existingAlumni, error: fetchError } = await supabase.from("alumni").select("email")

        if (fetchError) {
          throw new Error(`Error fetching existing alumni: ${fetchError.message}`)
        }

        const existingEmails = new Set(existingAlumni.map((a) => a.email))

        const validationResult: ValidationResult = {
          valid: [],
          errors: [],
          summary: {
            total: records.length,
            valid: 0,
            errors: 0,
          },
        }

        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          const recordNumber = i + 1

          if (!record.email || !record.firstName || !record.lastName) {
            validationResult.errors.push({
              record: recordNumber,
              error: "Missing required fields: email, firstName, or lastName.",
            })
            validationResult.summary.errors++
          } else if (existingEmails.has(record.email)) {
            validationResult.errors.push({ record: recordNumber, error: `Email '${record.email}' already exists.` })
            validationResult.summary.errors++
          } else {
            validationResult.valid.push(record)
            validationResult.summary.valid++
          }
        }

        setValidationResult(validationResult)
      } catch (err: any) {
        setValidationResult({
          valid: [],
          errors: [{ record: 0, error: `Error parsing JSON: ${err.message}` }],
          summary: { total: 0, valid: 0, errors: 1 },
        })
      } finally {
        setIsValidating(false)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) return

    setIsImporting(true)

    if (!supabase) {
      setValidationResult((prev) => ({
        ...prev!,
        errors: [...(prev?.errors || []), { record: 0, error: "Supabase client is not available." }],
      }))
      setIsImporting(false)
      return
    }

    const { error } = await supabase.from("alumni").insert(validationResult.valid)

    if (error) {
      setValidationResult((prev) => ({
        ...prev!,
        errors: [...(prev?.errors || []), { record: 0, error: `Import failed: ${error.message}` }],
      }))
    } else {
      setImportComplete(true)
      await fetchAlumni() // Refresh the alumni store
    }

    setIsImporting(false)
  }

  const downloadTemplate = () => {
    const template = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        country: "USA",
        latitude: 37.7749,
        longitude: -122.4194,
      },
      programsAttended: [
        {
          program: "MFA in Ensemble Based Physical Theatre",
          graduationYear: 2020,
          cohort: "Class of 2020",
        },
      ],
      biography: "Brief biography...",
      currentWork: {
        title: "Theatre Director",
        organization: "Local Theatre Company",
        location: "Anytown, CA",
      },
      tags: ["directing", "teaching"],
      languagesSpoken: ["English"],
      professionalAchievements: ["Achievement 1"],
      portfolioLinks: {
        website: "https://example.com",
      },
      experiencesAtDellArte: ["Experience 1"],
      referrals: [],
      lastUpdated: "2024-01-01",
      profilePrivacy: "public",
      donationHistory: [],
    }

    const blob = new Blob([JSON.stringify([template], null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "alumni-template.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
            <p className="mt-2 text-gray-600">Bulk upload alumni data from JSON files</p>
          </div>

          {/* Template Download */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download Template
              </CardTitle>
              <CardDescription>Download a sample JSON file to see the expected data structure</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Step 1: Upload JSON File
              </CardTitle>
              <CardDescription>Select a JSON file containing alumni data to import</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">{file ? file.name : "Choose a JSON file"}</p>
                  <p className="text-sm text-gray-600">Click to browse or drag and drop your file here</p>
                </label>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">File uploaded: {file.name}</span>
                  </div>
                  <Button
                    onClick={handleValidateAndPreview}
                    disabled={isValidating}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isValidating ? "Validating..." : "Validate & Preview"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <>
              {/* Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Step 2: Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{validationResult.summary.total}</div>
                      <div className="text-sm text-blue-800">Total Records</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{validationResult.summary.valid}</div>
                      <div className="text-sm text-green-800">Valid Records</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{validationResult.summary.errors}</div>
                      <div className="text-sm text-red-800">Records with Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      Validation Errors
                    </CardTitle>
                    <CardDescription>The following records have errors and will not be imported</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {validationResult.errors.map((error, index) => (
                        <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm">
                            <strong>Record #{error.record}:</strong> {error.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Valid Records Preview
                  </CardTitle>
                  <CardDescription>Preview of the first few valid records that will be imported</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Program</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.valid.slice(0, 5).map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {record.firstName} {record.lastName}
                          </TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>
                            {record.address.city}, {record.address.country}
                          </TableCell>
                          <TableCell>{record.programsAttended[0]?.program}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {validationResult.valid.length > 5 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ... and {validationResult.valid.length - 5} more records
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Import Button */}
              {validationResult.summary.valid > 0 && !importComplete && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Import Data</CardTitle>
                    <CardDescription>Import the valid records to the database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleImport} disabled={isImporting} className="bg-green-600 hover:bg-green-700">
                      {isImporting ? "Importing..." : `Import ${validationResult.summary.valid} Valid Records`}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Import Success */}
              {importComplete && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">Import Complete!</h3>
                      <p className="text-green-600">
                        {validationResult.summary.valid} records were successfully added or updated.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
