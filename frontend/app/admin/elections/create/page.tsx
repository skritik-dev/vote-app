"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Plus, ShieldCheck, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { electionService } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Candidate {
  name: string
  motto: string
  image?: File
}

export default function CreateElectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [electionName, setElectionName] = useState("")
  const [description, setDescription] = useState("")
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([
    { name: "", motto: "" },
    { name: "", motto: "" },
  ])
  const [voterEmails, setVoterEmails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: "", motto: "" }])
  }

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 2) {
      toast({
        title: "Cannot remove candidate",
        description: "You need at least two candidates for an election.",
        variant: "destructive",
      })
      return
    }
    setCandidates(candidates.filter((_, i) => i !== index))
  }

  const handleCandidateChange = (index: number, field: keyof Candidate, value: string) => {
    setCandidates(
      candidates.map((candidate, i) => (i === index ? { ...candidate, [field]: value } : candidate))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!electionName || !description || !startDateTime || !endDateTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    if (start >= end) {
      toast({
        title: "Invalid date range",
        description: "End date and time must be after start date and time.",
        variant: "destructive",
      })
      return
    }

    const invalidCandidates = candidates.some((candidate) => !candidate.name)
    if (invalidCandidates) {
      toast({
        title: "Invalid candidates",
        description: "All candidates must have a name.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create election data
      const electionData = {
        name: electionName,
        description,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        candidates: candidates.map(candidate => ({
          name: candidate.name,
          motto: candidate.motto || ''
        })),
        type: voterEmails ? 'restricted' : 'open',
        allowedVoters: voterEmails ? voterEmails.split(',').map(email => email.trim()) : []
      }

      // Submit to backend
      await electionService.createElection(electionData)

      toast({
        title: "Election created",
        description: "Your election has been created successfully.",
      })
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create election. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return Array.from({ length: 4 }, (_, j) => {
      const minute = (j * 15).toString().padStart(2, '0')
      return `${hour}:${minute}`
    })
  }).flat()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>Evote</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Election</CardTitle>
              <CardDescription>Set up a new election with candidates and voters</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="electionName">Election Name</Label>
                    <Input
                      id="electionName"
                      placeholder="e.g., Student Council Election 2025"
                      value={electionName}
                      onChange={(e) => setElectionName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide details about this election..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDateTime">Start Date & Time</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="startDateTime"
                          type="datetime-local"
                          value={startDateTime}
                          onChange={(e) => setStartDateTime(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDateTime">End Date & Time</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="endDateTime"
                          type="datetime-local"
                          value={endDateTime}
                          onChange={(e) => setEndDateTime(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voterEmails">Voter Emails (Optional)</Label>
                    <Textarea
                      id="voterEmails"
                      placeholder="Enter comma-separated email addresses for restricted access..."
                      value={voterEmails}
                      onChange={(e) => setVoterEmails(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave empty for open elections. Enter comma-separated emails for restricted elections.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Candidates</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddCandidate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Candidate
                      </Button>
                    </div>

                    {candidates.map((candidate, index) => (
                      <div key={index} className="space-y-4 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Candidate {index + 1}</h3>
                          {candidates.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCandidate(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`candidate-name-${index}`}>Name</Label>
                          <Input
                            id={`candidate-name-${index}`}
                            value={candidate.name}
                            onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`candidate-motto-${index}`}>Motto (Optional)</Label>
                          <Input
                            id={`candidate-motto-${index}`}
                            value={candidate.motto}
                            onChange={(e) => handleCandidateChange(index, "motto", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Election"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Evote. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/help" className="text-sm text-muted-foreground hover:underline">
              Help
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

