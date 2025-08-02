"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send, TestTube } from "lucide-react"
import { type AlumniProfile } from "@/lib/alumni-store"

interface EmailComposerModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  recipients: AlumniProfile[]
}

export function EmailComposerModal({ isOpen, onOpenChange, recipients }: EmailComposerModalProps) {
  const { user } = useUser()
  const [subject, setSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [testEmail, setTestEmail] = useState("")

  useEffect(() => {
    if (user) {
      setTestEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [user])

  const recipientCount = recipients.length

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
      const recipientData = recipients.map((alumni) => ({
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
          recipients: recipientData,
        }),
      })
      if (response.ok) {
        alert(`Bulk email sent to ${recipientCount} alumni!`)
        onOpenChange(false) // Close modal on success
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Compose Email
          </DialogTitle>
          <DialogDescription>
            This email will be sent to {recipientCount} alumni.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <Input
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
              <Textarea
                placeholder="Compose your email message here... You can use variables like {{firstName}} and {{lastName}} for personalization."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
              />
               <p className="text-xs text-gray-500 mt-1">
                 Tip: Use Mailgun variables like {`{{firstName}}`} and {`{{lastName}}`} for personalization
               </p>
            </div>
             <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    ⚠️ This action cannot be undone. Please review your content carefully before sending.
                </p>
            </div>
        </div>
        <DialogFooter className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-1 md:col-span-2 space-y-2">
                 <Input
                    type="email"
                    placeholder="Enter test email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
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
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleSendBulk}
              disabled={isSendingBulk || !subject || !emailBody || recipientCount === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingBulk ? "Sending..." : `Send to ${recipientCount} Alumni`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
