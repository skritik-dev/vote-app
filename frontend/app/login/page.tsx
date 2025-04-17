"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "voter"
  const [role, setRole] = useState<"admin" | "voter">(defaultRole as "admin" | "voter")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authService.login(email, password, role)
      
      // Check if the user's role matches the selected role
      if (response.user.role !== role) {
        toast({
          title: "Role mismatch",
          description: `Please login as a ${response.user.role} to access this dashboard.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      // Store the token in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      toast({
        title: "Login successful",
        description: `Welcome back! You are now logged in as a ${role}.`,
      })

      if (role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/voter/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Evote</span>
        </div>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <RadioGroup
                id="role"
                name="role-selection"
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "voter")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="voter" 
                  id="role-voter"
                />
                  <Label htmlFor="role-voter">Voter</Label>
                </div>
                <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="admin" 
                  id="role-admin"
                />
                  <Label htmlFor="role-admin">Election Admin</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href={`/signup?role=${role}`} className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

