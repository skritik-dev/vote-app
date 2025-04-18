"use client"
import Link from "next/link"
import { ArrowLeft, Download, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {toast} from "react-toastify"

// Mock election results data
const electionData = {
  id: "4",
  name: "Club President Election",
  description: "Election for the new club president and officers",
  startDate: "2025-03-10T09:00:00",
  endDate: "2025-03-10T18:00:00",
  totalVoters: 45,
  votesCount: 38,
  candidates: [
    { id: "c1", name: "Emily Johnson", position: "Current Vice President", votes: 17 },
    { id: "c2", name: "Michael Chen", position: "Treasurer", votes: 12 },
    { id: "c3", name: "Sarah Williams", position: "Events Coordinator", votes: 9 },
  ],
}

export default function ElectionResultsPage({ params }: { params: { id: string } }) {

  const handleDownloadResults = () => {
    toast.success("Election results have been downloaded as CSV.")
  }

  // Calculate percentages and find the winner
  const totalVotes = electionData.votesCount
  const candidatesWithPercentage = electionData.candidates.map((candidate) => ({
    ...candidate,
    percentage: Math.round((candidate.votes / totalVotes) * 100),
  }))

  // Sort candidates by votes (highest first)
  const sortedCandidates = [...candidatesWithPercentage].sort((a, b) => b.votes - a.votes)
  const winner = sortedCandidates[0]

  // Calculate participation rate
  const participationRate = Math.round((electionData.votesCount / electionData.totalVoters) * 100)

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
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{electionData.name} Results</h1>
              <p className="text-muted-foreground mt-1">{electionData.description}</p>
            </div>
            <Button variant="outline" onClick={handleDownloadResults}>
              <Download className="mr-2 h-4 w-4" />
              Download Results
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Winner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{winner.name}</div>
                <div className="text-muted-foreground">{winner.position}</div>
                <div className="mt-2 text-primary font-medium">
                  {winner.votes} votes ({winner.percentage}%)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{participationRate}%</div>
                <div className="text-muted-foreground">
                  {electionData.votesCount} out of {electionData.totalVoters} voters
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{electionData.votesCount}</div>
                <div className="text-muted-foreground">Across {electionData.candidates.length} candidates</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="results">Results Breakdown</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Vote Distribution</CardTitle>
                  <CardDescription>Breakdown of votes by candidate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sortedCandidates.map((candidate) => (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-muted-foreground">{candidate.position}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{candidate.votes} votes</div>
                            <div className="text-sm text-muted-foreground">{candidate.percentage}%</div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                          <div className="h-full bg-primary" style={{ width: `${candidate.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Analytics</CardTitle>
                  <CardDescription>Insights about voter participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Participation by Time</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Most votes were cast between 12:00 PM and 2:00 PM.
                      </p>
                      <div className="h-40 w-full bg-muted/30 flex items-end justify-between gap-1 rounded-md p-4">
                        {[15, 25, 40, 65, 85, 70, 45, 30, 20].map((height, i) => (
                          <div
                            key={i}
                            className="w-full bg-primary h-full rounded-sm"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Voter Demographics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Age Groups</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>18-24</span>
                              <span>35%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>25-34</span>
                              <span>45%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>35-44</span>
                              <span>15%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>45+</span>
                              <span>5%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Voting Method</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Mobile</span>
                              <span>65%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Desktop</span>
                              <span>35%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

