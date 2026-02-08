"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setLoading(true)
    setError("")

    const success = await signIn(username, password)
    setLoading(false)

    if (success) {
      router.push("/events")
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-foreground text-background">
            <Calendar className="size-6" />
          </div>
          <CardTitle className="text-2xl">Welcome to EventBook</CardTitle>
          <CardDescription>
            Sign in to browse events and manage your bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin or user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Demo credentials:</p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-xs">
                <p><span className="font-mono">admin</span> / <span className="font-mono">admin</span></p>
                <p><span className="font-mono">user</span> / <span className="font-mono">user</span></p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
