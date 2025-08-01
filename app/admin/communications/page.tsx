"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Users, Send, TestTube } from "lucide-react"

import { useUser } from "@clerk/nextjs"
import { useAlumniStore } from "@/lib/alumni-store"

const programs = [
  "MFA in Ensemble Based Physical Theatre",
  "Professional Training Program",
  "Summer Workshop - Mask & Movement",
  "Summer Workshop - Clown Intensive",
]

const allTags = [
  "directing",
  "mask making",
  "teaching",
  "clown",
  "technology integration",
  "healthcare clowning",
  "therapeutic arts",
]

const emailTemplates = [
  { id: "newsletter", name: "Monthly Newsletter" },
  { id: "event", name: "Event Announcement" },
  { id: "fundraising", name: "Fundraising Campaign" },
  { id: "reunion", name: "Alumni Reunion" },
]

export default function Communications() {
    const { user } = useUser()
  const { alumni, loading, error, fetchAlumni } = useAlumniStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [recipientCount, setRecipientCount] = useState(0)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [testEmail, setTestEmail] = useState("")

  useEffect(() => {
    if (user) {
      setTestEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [user])

  // Initialize alumni data
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  // Calculate recipient count based on filters
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

  // Calculate recipient count based on filters
  useEffect(() => {
    setRecipientCount(filteredAlumni.length)
  }, [filteredAlumni])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

    const handleSendTest = async () => {
    setIsSendingTest(true)
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: emailBody,
          isTest: true,
          testRecipient: testEmail,
        }),
      })
      if (response.ok) {
        alert("Test email sent successfully!")
      } else {
        alert("Failed to send test email.")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      alert("An error occurred while sending the test email.")
    }
    setIsSendingTest(false)
  }

  const handleSendBulk = async () => {
    if (recipientCount === 0) {
      alert("No recipients selected!")
      return
    }
    setIsSendingBulk(true)
    try {
      const recipients = filteredAlumni.map((alumni) => ({
        email: alumni.email,
        firstName: alumni.firstName,
        lastName: alumni.lastName,
      }))
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: emailBody,
          recipients,
        }),
      })
      if (response.ok) {
        alert(`Bulk email sent to ${recipientCount} alumni!`)
      } else {
        alert("Failed to send bulk email.")
      }
    } catch (error) {
      console.error("Error sending bulk email:", error)
      alert("An error occurred while sending the bulk email.")
    }
    setIsSendingBulk(false)
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
            <p className="mt-2 text-gray-600">Send targeted bulk emails to alumni segments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Build Recipient List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Build Recipient List
                  </CardTitle>
                  <CardDescription>Use filters to select which alumni will receive the email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or Email</label>
                    <Input
                      placeholder="Search alumni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

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

                  {/* Recipient Count */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">
                        This email will be sent to {recipientCount} alumni
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Compose Email */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Compose Email
                  </CardTitle>
                  <CardDescription>Create your email content and send to selected recipients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Mailgun Template</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <Input
                      placeholder="Enter email subject..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Email Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                    <Textarea
                      placeholder="Compose your email message here... You can use variables like {{firstName}} and {{lastName}} for personalization."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use Mailgun variables like {`{{firstName}}`} and {`{{lastName}}`} for personalization
                    </p>
                  </div>

                  {/* Action Buttons */}
                                    <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter test email address"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleSendTest}
                      disabled={isSendingTest || !subject || !emailBody || !testEmail}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {isSendingTest ? "Sending Test..." : "Send Test Email"}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleSendBulk}
                    disabled={isSendingBulk || !subject || !emailBody || recipientCount === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSendingBulk ? "Sending..." : `Send Bulk Email to ${recipientCount} Alumni`}
                  </Button>

                  {/* Warning */}
                  {recipientCount > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This will send an email to {recipientCount} recipients. Please review your content carefully
                        before sending.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
