"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ShieldCheck, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

const DEMO_ACCOUNTS = [
  { label: "Admin", username: "admin", password: "admin", icon: ShieldCheck, description: "Pełny dostęp" },
  { label: "User",  username: "user",  password: "user",  icon: User,        description: "Przeglądaj i rezerwuj" },
]

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [seedStatus, setSeedStatus] = useState<"idle" | "seeding" | "done">("idle")

  useEffect(() => {
    const autoSeed = async () => {
      try {
        const res = await fetch("/api/seed")
        if (!res.ok) return
        const { seeded } = await res.json()
        if (!seeded) {
          setSeedStatus("seeding")
          await fetch("/api/seed", { method: "POST" })
          setSeedStatus("done")
        }
      } catch {
        // nie blokujemy logowania
      }
    }
    autoSeed()
  }, [])

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
      setError("Nieprawidłowy login lub hasło")
    }
  }

  const fillDemo = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="w-full max-w-md space-y-4 relative z-10">

        <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-md p-4 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Konta demo — kliknij żeby się zalogować
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc.username, acc.password)}
                className="flex flex-col items-start gap-1 rounded-lg border border-border bg-input/50 backdrop-blur-sm px-4 py-3 text-left transition hover:border-primary/50 hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <acc.icon className="size-4" />
                  {acc.label}
                </div>
                <span className="text-xs text-muted-foreground font-mono">{acc.username} / {acc.password}</span>
                <span className="text-xs text-muted-foreground">{acc.description}</span>
              </button>
            ))}
          </div>
          {seedStatus === "seeding" && (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Ładowanie danych demo...
            </p>
          )}
          {seedStatus === "done" && (
            <p className="mt-3 text-xs text-emerald-400">✓ Dane demo załadowane pomyślnie</p>
          )}
        </div>

        <Card className="bg-card/80 border-white/5 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Calendar className="size-6" />
            </div>
            <CardTitle className="text-2xl text-foreground tracking-tight">EventBook</CardTitle>
            <CardDescription className="text-muted-foreground">
              Zaloguj się, aby przeglądać i rezerwować eventy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Login</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary/90 text-primary-foreground hover:bg-primary transition-colors hover:shadow-lg hover:shadow-primary/30"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin mr-2" />Logowanie...</>
                  : "Zaloguj się"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
