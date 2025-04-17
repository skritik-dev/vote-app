"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarIcon, ShieldCheck, User, LogOut, Play, StopCircle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { electionService } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Candidate {
  _id: string
  name: string
  motto: string
  image?: string
  votes?: number
}

interface Election {
  _id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  candidates: Candidate[]
  type: string
  totalVotes?: number
}

export default function ElectionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const data = await electionService.getElectionById(params.id)
        setElection(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch election details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchElection()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!election) return

    setIsDeleting(true)
    try {
      await electionService.deleteElection(params.id)
      toast({
        title: "Success",
        description: "Election deleted successfully.",
      })
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete election.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStartElection = async () => {
    if (!election) return

    try {
      await electionService.startElection(params.id)
      toast({
        title: "Success",
        description: "Election started successfully.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start election.",
        variant: "destructive",
      })
    }
  }

  const handleEndElection = async () => {
    if (!election) return

    try {
      await electionService.endElection(params.id)
      setElection(prev => prev ? { ...prev, status: 'ended' } : null)
      toast({
        title: "Success",
        description: "Election ended successfully.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end election.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    window.location.href = "/"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Upcoming
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Running
          </Badge>
        )
      case "ended":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Ended
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading election details...</div>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Election not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Evote</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/profile">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
              <div className="flex gap-2">
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/elections/${params.id}/edit`)}
                  disabled={election.status !== 'upcoming'}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </>
              {election.status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndElection}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  End Election
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{election.name}</CardTitle>
                  <CardDescription className="mt-1">{election.description}</CardDescription>
                </div>
                {getStatusBadge(election.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(election.startDate)} {formatTime(election.startDate)} -{" "}
                    {formatDate(election.endDate)} {formatTime(election.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-medium">{election.candidates.length}</span> candidates
                  </div>
                  {election.totalVotes !== undefined && (
                    <div>
                      <span className="font-medium">{election.totalVotes}</span> total votes
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {election.candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.image} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        {candidate.motto && (
                          <p className="text-sm text-muted-foreground">{candidate.motto}</p>
                        )}
                      </div>
                    </div>
                    {candidate.votes !== undefined && (
                      <div className="text-right">
                        <div className="font-medium">{candidate.votes}</div>
                        <div className="text-sm text-muted-foreground">votes</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Evote. All rights reserved.</p>
            <Link href="/help" className="hover:underline">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 