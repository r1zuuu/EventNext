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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 text-white">
            <Calendar className="size-6" />
          </div>
          <CardTitle className="text-2xl text-white">Welcome to EventBook</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to browse events and manage your bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-slate-700/50 text-slate-200 text-sm p-3 border border-slate-600">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
