"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, AlertCircle, BarChart2, Users, Award } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import{ toast } from 'react-toastify'
import { electionService } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  voterStatus?: Array<{
    email: string
    hasVoted: boolean
    votedAt?: string
  }>
  totalVotes: number
}

interface VoteResult {
  candidateId: string
  votes: number
}

export default function ElectionResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [election, setElection] = useState<Election | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const electionData = await electionService.getElectionById(params.id)
        
        if (electionData.status !== 'ended') {
          toast.error("Election results will be available after the election has ended.")
          router.push("/voter/dashboard")
          return
        }
        
        const resultsResponse = await electionService.getElectionResults(params.id)

        const candidatesWithVotes = electionData.candidates.map((candidate: Candidate) => ({
          ...candidate,
          votes: 0
        }))

        if (resultsResponse && Array.isArray(resultsResponse)) {
          const updatedCandidates = resultsResponse.map((result: VoteResult) => {
            const candidateIndex = candidatesWithVotes.findIndex((c: Candidate) => c._id === result.candidateId)
            if (candidateIndex !== -1) {
              return {
                ...candidatesWithVotes[candidateIndex],
                votes: result.votes || 0
              }
            }
            return null
          }).filter((candidate: Candidate | null) => candidate !== null)

          setElection({
            ...electionData,
            candidates: updatedCandidates as Candidate[],
            totalVotes: updatedCandidates.reduce((sum: number, candidate: Candidate) => sum + (candidate.votes || 0), 0)
          })
        }
      } catch (error) {
        console.error('Error fetching election results:', error)
        toast.error("Failed to fetch election results. Please try again later.");
      } finally {
        setIsLoading(false)
      }
    }

    fetchElection()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground animate-pulse">Loading election results...</div>
        </div>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Election not found or results are not available.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalVotes = election.totalVotes || election.candidates.reduce((sum: number, candidate: Candidate) => sum + (candidate.votes || 0), 0)
  const candidatesWithPercentage = election.candidates.map((candidate: Candidate) => ({
    ...candidate,
    percentage: totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0
  }))

  const maxVotes = Math.max(...candidatesWithPercentage.map(c => c.votes || 0))
  const winners = candidatesWithPercentage.filter(c => (c.votes || 0) === maxVotes)
  const isTie = winners.length > 1

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/voter/dashboard">
          <Button variant="ghost" className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{election.name}</h1>
          <p className="text-muted-foreground max-w-3xl">{election.description}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{totalVotes}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                  <p className="text-2xl font-bold">{election.candidates.length}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participation</p>
                  <p className="text-2xl font-bold">
                    {election.voterStatus?.length ? 
                      Math.round((totalVotes / election.voterStatus.length) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winner Announcement */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {isTie ? "Election Tie" : "Election Winner"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTie ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The following candidates are tied with {maxVotes} votes each:
                </p>
                <div className="flex flex-wrap gap-4">
                  {winners.map((winner) => (
                    <div key={winner._id} className="flex items-center gap-3 bg-primary/10 p-4 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={winner.image} />
                        <AvatarFallback>{winner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{winner.name}</p>
                        <p className="text-sm text-muted-foreground">{winner.percentage.toFixed(1)}% of votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={winners[0].image} />
                  <AvatarFallback>{winners[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">{winners[0].name}</h3>
                  <p className="text-muted-foreground">{winners[0].motto}</p>
                  <div className="mt-2 flex items-center justify-center sm:justify-start gap-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      {maxVotes} votes
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {winners[0].percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>Breakdown of votes for each candidate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {candidatesWithPercentage
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .map((candidate) => (
                  <div key={candidate._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
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
                      <div className="text-right">
                        <p className="font-medium">{candidate.votes || 0} votes</p>
                        <p className="text-sm text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress 
                      value={candidate.percentage} 
                      className={`h-2 ${winners.some(w => w._id === candidate._id) ? 'bg-yellow-500' : ''}`}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}