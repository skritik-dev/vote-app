"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarIcon, LogOut, Search, ShieldCheck, User, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {toast} from 'react-toastify'
import { electionService } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Election {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  hasVoted: boolean;
}

export default function VoterDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await electionService.getAllElections()
        setElections(data)
      } catch (error) {
        toast.error("Failed to fetch elections")

      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    toast.success("You have been successfully logged out.");
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

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Voter Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
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

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="flex w-full">
          <TabsTrigger value="active" className="flex-1">Active Elections</TabsTrigger>
          <TabsTrigger value="voted" className="flex-1">Voted Elections</TabsTrigger>
          <TabsTrigger value="ended" className="flex-1">Ended Elections</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections
              .filter(election => election.status === "running" && !election.hasVoted)
              .map(election => (
                <Card key={election._id}>
                  <CardHeader>
                    <CardTitle>{election.name}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(election.startDate)} - {formatDate(election.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {formatTime(election.startDate)} - {formatTime(election.endDate)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/voter/vote/${election._id}`} className="w-full">
                      <Button className="w-full">Vote Now</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="voted">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections
              .filter(election => election.hasVoted)
              .map(election => (
                <Card key={election._id}>
                  <CardHeader>
                    <CardTitle>{election.name}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(election.startDate)} - {formatDate(election.endDate)}
                        </span>
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Vote Cast</AlertTitle>
                        <AlertDescription>
                          You have already cast your vote for this election.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/voter/results/${election._id}`} className="w-full">
                      <Button className="w-full" variant="outline">
                        View Results
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ended">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections
              .filter(election => election.status === "ended")
              .map(election => (
                <Card key={election._id}>
                  <CardHeader>
                    <CardTitle>{election.name}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(election.startDate)} - {formatDate(election.endDate)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/voter/results/${election._id}`} className="w-full">
                      <Button className="w-full" variant="outline">
                        View Results
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

