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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-4">

        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Konta demo — kliknij żeby się zalogować
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc.username, acc.password)}
                className="flex flex-col items-start gap-1 rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <acc.icon className="size-4" />
                  {acc.label}
                </div>
                <span className="text-xs text-slate-500 font-mono">{acc.username} / {acc.password}</span>
                <span className="text-xs text-slate-400">{acc.description}</span>
              </button>
            ))}
          </div>
          {seedStatus === "seeding" && (
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="size-3 animate-spin" /> Ładowanie danych demo...
            </p>
          )}
          {seedStatus === "done" && (
            <p className="mt-3 text-xs text-emerald-400">✓ Dane demo załadowane pomyślnie</p>
          )}
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 text-white">
              <Calendar className="size-6" />
            </div>
            <CardTitle className="text-2xl text-white">EventBook</CardTitle>
            <CardDescription className="text-slate-400">
              Zaloguj się, aby przeglądać i rezerwować eventy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-slate-700/50 text-slate-200 text-sm p-3 border border-slate-600">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">Login</Label>
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
                <Label htmlFor="password" className="text-slate-200">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors"
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
