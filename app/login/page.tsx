"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useStore()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    signIn(email, role)
    router.push("/events")
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Sign in as</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "user" | "admin")} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="user" id="user" className="peer sr-only" />
                  <Label
                    htmlFor="user"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="font-medium">User</span>
                    <span className="text-xs text-muted-foreground">Browse & book events</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                  <Label
                    htmlFor="admin"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Manage events</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a demo app. No real authentication is performed.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
