"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarIcon, LogOut, Plus, Search, ShieldCheck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { electionService } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Election {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  candidates: Array<{ name: string }>;
  type: string;
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await electionService.getAllElections()
        console.log('Fetched elections:', data) // Debug log
        setElections(data)
      } catch (error: any) {
        console.error('Error in fetchElections:', error)
        setError(error.message || 'Failed to fetch elections')
        toast({
          title: "Error",
          description: error.message || "Failed to fetch elections",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [toast])

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

  const filteredElections = elections.filter(election =>
    election.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    election.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading elections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/admin/elections/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search elections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>

        {["all", "running", "upcoming", "ended"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filteredElections.filter((election) => tab === "all" || election.status === tab).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No elections found.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredElections
                  .filter((election) => tab === "all" || election.status === tab)
                  .map((election) => (
                    <Card key={election._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{election.name}</CardTitle>
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
                              {formatDate(election.startDate)} - {formatDate(election.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="font-medium">{election.candidates.length}</span> candidates
                            </div>
                            <div>
                              <span className="font-medium">{election.type}</span> type
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/admin/elections/${election._id}`} className="w-full">
                          <Button className="w-full">View Details</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

