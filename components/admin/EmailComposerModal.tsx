"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Mail, Send, Plus, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { logger } from "@/lib/logger"
import { type AlumniProfile } from "@/lib/alumni-store"

interface EmailComposerModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  recipients: AlumniProfile[]
}

// Available email variables
const EMAIL_VARIABLES = [
  { key: "firstName", label: "First Name", example: "John" },
  { key: "lastName", label: "Last Name", example: "Doe" },
  { key: "fullName", label: "Full Name", example: "John Doe" },
  { key: "email", label: "Email", example: "john@example.com" },
  { key: "city", label: "City", example: "San Francisco" },
  { key: "state", label: "State", example: "CA" },
  { key: "country", label: "Country", example: "United States" },
  { key: "location", label: "Location", example: "San Francisco, CA" },
  { key: "program", label: "Latest Program", example: "MFA in Physical Theatre" },
  { key: "graduationYear", label: "Graduation Year", example: "2020" },
  { key: "jobTitle", label: "Job Title", example: "Director" },
  { key: "organization", label: "Organization", example: "Local Theater" },
]

export function EmailComposerModal({ isOpen, onOpenChange, recipients }: EmailComposerModalProps) {
  const [subject, setSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const recipientCount = recipients.length

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Function to insert variable at cursor position
  const insertVariable = (variable: string, isSubject: boolean = false) => {
    const variableText = `{{${variable}}}`
    const ref = isSubject ? subjectRef : bodyRef
    const setValue = isSubject ? setSubject : setEmailBody
    const currentValue = isSubject ? subject : emailBody

    if (ref.current) {
      const start = ref.current.selectionStart || 0
      const end = ref.current.selectionEnd || 0
      const newValue = currentValue.slice(0, start) + variableText + currentValue.slice(end)
      setValue(newValue)
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus()
          ref.current.setSelectionRange(start + variableText.length, start + variableText.length)
        }
      }, 0)
    } else {
      // Fallback: append to end
      setValue(currentValue + variableText)
    }
  }

  // Generate preview with sample data from first recipient or example data
  const generatePreview = (text: string) => {
    if (!text) return text
    
    let preview = text
    const sampleRecipient = recipients[0] || null
    
    EMAIL_VARIABLES.forEach((variable) => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g')
      let replacement = variable.example
      
      if (sampleRecipient) {
        switch (variable.key) {
          case 'firstName':
            replacement = sampleRecipient.firstName || variable.example
            break
          case 'lastName':
            replacement = sampleRecipient.lastName || variable.example
            break
          case 'fullName':
            replacement = `${sampleRecipient.firstName || ''} ${sampleRecipient.lastName || ''}`.trim() || variable.example
            break
          case 'email':
            replacement = sampleRecipient.email || variable.example
            break
          case 'city':
            replacement = sampleRecipient.address?.city || variable.example
            break
          case 'state':
            replacement = sampleRecipient.address?.state || variable.example
            break
          case 'country':
            replacement = sampleRecipient.address?.country || variable.example
            break
          case 'location':
            replacement = [sampleRecipient.address?.city, sampleRecipient.address?.state].filter(Boolean).join(', ') || sampleRecipient.address?.country || variable.example
            break
          case 'program':
            const latestProgram = sampleRecipient.programsAttended && sampleRecipient.programsAttended.length > 0 
              ? sampleRecipient.programsAttended[sampleRecipient.programsAttended.length - 1] 
              : null
            replacement = latestProgram?.program || variable.example
            break
          case 'graduationYear':
            const latestYear = sampleRecipient.programsAttended && sampleRecipient.programsAttended.length > 0 
              ? sampleRecipient.programsAttended[sampleRecipient.programsAttended.length - 1] 
              : null
            replacement = latestYear?.graduationYear?.toString() || variable.example
            break
          case 'jobTitle':
            replacement = sampleRecipient.currentWork?.title || variable.example
            break
          case 'organization':
            replacement = sampleRecipient.currentWork?.organization || variable.example
            break
        }
      }
      
      preview = preview.replace(regex, replacement)
    })
    
    return preview
  }

  const handleSendEmail = async () => {
    if (recipientCount === 0) {
      alert("No recipients selected!")
      return
    }
    setIsSending(true)
    try {
      // Send full alumni data to API for variable processing
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: emailBody,
          recipients: recipients, // Send full alumni objects
        }),
      })
      if (response.ok) {
        alert(`Email sent to ${recipientCount} alumni!`)
        onOpenChange(false) // Close modal on success
      } else {
        alert("Failed to send email.")
      }
    } catch (error) {
              logger.error("Error sending email", error)
      alert("An error occurred while sending the email.")
    }
    setIsSending(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-h-[90vh] max-w-[92vw] p-3' : 'sm:max-w-2xl'} overflow-y-auto`}>
        <DialogHeader className={isMobile ? 'pb-1 space-y-0' : ''}>
          <DialogTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
            <Mail className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
            Compose Email
          </DialogTitle>
          {!isMobile && (
            <DialogDescription>
              This email will be sent to {recipientCount} alumni.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className={`${isMobile ? 'space-y-3 py-2' : 'space-y-4 py-4'}`}>
            <div>
              <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-2'}`}>
                <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700`}>Subject Line</label>
                {!isMobile && (
                  <div className="flex flex-wrap gap-1">
                    {EMAIL_VARIABLES.slice(0, 4).map((variable) => (
                      <Button
                        key={variable.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => insertVariable(variable.key, true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {variable.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                ref={subjectRef}
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-2'}`}>
                <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700`}>Email Body</label>
              </div>
              <Textarea
                ref={bodyRef}
                placeholder={isMobile ? "Compose your email..." : "Compose your email message here... Click the variable buttons below to insert personalized content."}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={isMobile ? 4 : 10}
                className={isMobile ? 'text-sm' : ''}
              />
              
              {/* Variables Section - Collapsible on Mobile */}
              {isMobile ? (
                <Collapsible open={showVariables} onOpenChange={setShowVariables} className="mt-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between h-8 text-sm">
                      <span className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Variables ({EMAIL_VARIABLES.length})
                      </span>
                      {showVariables ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {EMAIL_VARIABLES.map((variable) => (
                        <Button
                          key={variable.key}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8 px-3"
                          onClick={() => {
                            insertVariable(variable.key)
                            setShowVariables(false) // Auto-close after selection
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {EMAIL_VARIABLES.map((variable) => (
                      <Badge
                        key={variable.key}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable(variable.key)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {variable.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click any variable to insert it at your cursor position. Variables will be replaced with actual alumni data when sent.
                  </p>
                </div>
              )}
            </div>

            {/* Preview Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className={isMobile ? 'h-9 text-sm px-4' : ''}
                onClick={() => setShowPreviewModal(true)}
                disabled={!subject && !emailBody}
              >
                <Eye className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} mr-2`} />
                Preview Email
              </Button>
            </div>

            {/* Warning - Compact on mobile */}
            <div className={`${isMobile ? 'p-2 bg-yellow-50 border border-yellow-200 rounded' : 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg'}`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-yellow-800`}>
                    ⚠️ {isMobile ? 'Review carefully before sending.' : 'This action cannot be undone. Please review your content carefully before sending.'}
                </p>
            </div>
        </div>
        <DialogFooter className={isMobile ? 'pt-3' : ''}>
            <Button
              className={`w-full bg-primary hover:bg-primary/90 ${isMobile ? 'h-11 text-sm' : ''}`}
              onClick={handleSendEmail}
              disabled={isSending || !subject || !emailBody || recipientCount === 0}
            >
              <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} mr-2`} />
              {isSending ? "Sending..." : `Send to ${recipientCount} Alumni`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Preview Modal */}
    <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
      <DialogContent className={`${isMobile ? 'h-[90vh] max-w-[95vw] p-4' : 'sm:max-w-3xl max-h-[80vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Email Preview
          </DialogTitle>
          <DialogDescription>
            {recipients.length > 0 
              ? `Preview shows how the email will look for ${recipients[0].firstName} ${recipients[0].lastName}. Each recipient will see their own personalized version.`
              : 'Preview shows example data. Select recipients to see actual data preview.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Preview</label>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm font-medium">
                {generatePreview(subject) || <span className="text-gray-400 italic">No subject entered</span>}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Body Preview</label>
            <div className="bg-gray-50 p-4 rounded-lg border min-h-[200px]">
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {generatePreview(emailBody) || <span className="text-gray-400 italic">No email content entered</span>}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 This preview uses {recipients.length > 0 ? 'actual recipient data' : 'example data'}. 
              Variables like {`{{firstName}}`} will be automatically replaced with each recipient's information when the email is sent.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
            Close Preview
          </Button>
          <Button 
            onClick={() => {
              setShowPreviewModal(false)
              // Focus back on the main modal
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Continue Editing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
