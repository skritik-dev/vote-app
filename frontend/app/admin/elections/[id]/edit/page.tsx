"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Save, X, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { electionService } from "@/lib/api"

interface Election {
  _id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  candidates: Array<{
    name: string
    motto: string
    image?: string
  }>
  type: string
  allowedVoters: string[]
}

export default function EditElectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election>({
    _id: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
    candidates: [],
    type: "open",
    allowedVoters: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const data = await electionService.getElectionById(params.id)
        if (data.status !== 'upcoming') {
          toast({
            title: "Cannot edit election",
            description: "Only upcoming elections can be edited.",
            variant: "destructive",
          })
          router.push(`/admin/elections/${params.id}`)
          return
        }
        setElection(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch election details.",
          variant: "destructive",
        })
        router.push("/admin/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchElection()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setElection((prev: Election) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await electionService.updateElection(params.id, election)
      toast({
        title: "Success",
        description: "Election updated successfully.",
      })
      router.push(`/admin/elections/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update election.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/admin/elections/${params.id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Election Details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Election</CardTitle>
          <CardDescription>Update the election details below.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Election Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={election.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={election.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={election.startDate}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={election.endDate}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedVoters">Voter Emails (Optional)</Label>
                <Textarea
                  id="allowedVoters"
                  name="allowedVoters"
                  value={election.allowedVoters.join(', ')}
                  onChange={(e) => {
                    const emails = e.target.value.split(',').map(email => email.trim())
                    setElection((prev: Election) => ({ ...prev, allowedVoters: emails }))
                  }}
                  placeholder="Enter comma-separated email addresses for restricted access..."
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty for open elections. Enter comma-separated emails for restricted elections.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 