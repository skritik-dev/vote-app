"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Info, AlertCircle } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { electionService } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Candidate {
  _id: string
  name: string
  motto: string
  image?: string
}

interface VoterStatus {
  email: string
  hasVoted: boolean
  votedAt?: string
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
  voterStatus?: VoterStatus[]
}

export default function VotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const electionData = await electionService.getElectionById(params.id)
        setElection(electionData)

        // Check if user has already voted
        const voterStatus = electionData.voterStatus?.find(
          (vs: VoterStatus) => vs.email === localStorage.getItem('email')
        )
        if (voterStatus?.hasVoted) {
          setHasVoted(true)
        }
      } catch (error) {
        console.error('Error fetching election:', error)
        toast({
          title: "Error",
          description: "Failed to fetch election details",
          variant: "destructive",
        })
      }
    }

    fetchElection()
  }, [params.id, toast])

  const handleCandidateSelect = (candidateId: string) => {
    // If clicking the same candidate, deselect it
    if (selectedCandidate === candidateId) {
      setSelectedCandidate(null)
    } else {
      setSelectedCandidate(candidateId)
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate || isVoting || hasVoted) return

    try {
      setIsVoting(true)
      await electionService.castVote({
        electionId: params.id,
        candidateId: selectedCandidate
      })
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded.",
      })
      setHasVoted(true)
      router.push("/voter/dashboard")
    } catch (error) {
      console.error('Error casting vote:', error)
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to cast vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  if (!election) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (election.status !== 'running') {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Election Not Active</CardTitle>
            <CardDescription>This election is not currently running</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Already Voted</CardTitle>
            <CardDescription>You have already cast your vote in this election</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/voter/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{election.name}</CardTitle>
              <CardDescription className="mt-2">{election.description}</CardDescription>
            </div>
            <Alert className="w-auto p-3 max-w-xs">
              <Info className="h-4 w-4" />
              <AlertTitle>Active Election</AlertTitle>
              <AlertDescription>Please select one candidate</AlertDescription>
            </Alert>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                Select Your Candidate
              </h3>
              
              <RadioGroup
                value={selectedCandidate || ""}
                onValueChange={handleCandidateSelect}
                className="space-y-4"
              >
                {election.candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedCandidate === candidate._id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem 
                        value={candidate._id} 
                        id={candidate._id}
                        className="h-5 w-5"
                      />
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={candidate.image} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{candidate.name}</h3>
                        {candidate.motto && (
                          <p className="text-sm text-muted-foreground">{candidate.motto}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {selectedCandidate && (
              <Alert className="bg-primary/10 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>Confirmation</AlertTitle>
                <AlertDescription>
                  You have selected {election.candidates.find(c => c._id === selectedCandidate)?.name}. 
                  Click the button below to cast your vote.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6 pb-6 bg-muted/20">
          <Button
            onClick={handleVote}
            disabled={!selectedCandidate || isVoting || hasVoted}
            className="min-w-[200px] h-12 text-base"
            size="lg"
          >
            {isVoting ? "Casting Vote..." : "Cast Your Vote"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
