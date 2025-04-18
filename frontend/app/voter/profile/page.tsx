"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarIcon, LogOut, ShieldCheck, User, Eye, BarChart2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"

// Mock data for voter profile
const voterProfile = {
  id: "voter123",
  name: "John Doe",
  email: "john.doe@example.com",
  registrationDate: "2024-01-15",
  verified: true,
}

// Mock data for voting history
const votingHistory = [
  {
    id: "election1",
    name: "Student Council Election 2024",
    organizer: "University of Technology",
    votedOn: "2024-03-15T14:30:00",
    status: "completed",
  },
  {
    id: "election2",
    name: "Department Head Election",
    organizer: "Computer Science Department",
    votedOn: "2024-02-20T10:15:00",
    status: "completed",
  },
]

export default function VoterProfile() {

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    toast.success("You have been successfully logged out.")
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 font-bold text-xl">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>Evote</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/voter/dashboard">
                <User className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Voter Profile</h1>
            <p className="text-muted-foreground">View your profile details and voting history.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Voter Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your voter account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{voterProfile.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{voterProfile.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Registration Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(voterProfile.registrationDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {voterProfile.verified ? "Verified" : "Pending Verification"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Voting History Card */}
            <Card>
              <CardHeader>
                <CardTitle>Voting History</CardTitle>
                <CardDescription>Elections you have participated in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {votingHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No voting history found.</p>
                ) : (
                  votingHistory.map((election) => (
                    <Card key={election.id} className="border">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{election.name}</CardTitle>
                        <CardDescription>{election.organizer}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Voted on {formatDate(election.votedOn)} at {formatTime(election.votedOn)}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/voter/election/${election.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/voter/election/${election.id}/results`}>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            View Results
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Evote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 