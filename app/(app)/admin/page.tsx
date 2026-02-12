"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Calendar, CalendarCheck, TrendingUp, Users, XCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { isToday, parseISO, isAfter } from "date-fns"
import { ChartAreaDefault } from "@/components/ui/chartshadcn"

export default function AdminDashboardPage() {
  const { events, bookings, role } = useStore()

  const stats = useMemo(() => {
    const now = new Date()

    const upcomingEvents = events.filter(
      (e) =>
        e.status === "published" &&
        Boolean(e.startDateTime) &&
        isAfter(parseISO(e.startDateTime), now)
    ).length

    const todayBookings = bookings.filter(
      (b) => Boolean(b.createdAt) && isToday(parseISO(b.createdAt))
    ).length

    const totalCapacity = events
      .filter((e) => e.status === "published")
      .reduce((sum, e) => sum + e.capacity, 0)

const totalBooked = bookings
  .filter((b) => b.status === "confirmed" || b.status === "checked_in")
  .reduce((sum, b) => sum + b.quantity, 0)

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" }) // "Jan", "Feb"...
}

function buildMockOccupancySeries(currentRate: number, months = 6) {
  const now = new Date()

  // Zrobimy wcześniejsze miesiące trochę niżej, a do teraz dojdziemy do currentRate
  const start = clamp(currentRate - 18) // deterministyczny start

  const data = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    const t = months === 1 ? 1 : i / (months - 1) // 0..1
    const base = start + (currentRate - start) * t

    const wobble = (i % 2 === 0 ? 2 : -2)
    const value = clamp(Math.round(base + wobble))

    return { month: monthLabel(d), occupancyRate: value }
  })

  // ostatni punkt MUSI być realny:
  data[data.length - 1] = { month: monthLabel(now), occupancyRate: clamp(currentRate) }

  return data
}

// --- użycie ---
const occupancyRate =
  totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0

const chartData = buildMockOccupancySeries(occupancyRate, 6)

const cancellations = bookings.filter((b) => b.status === "cancelled").length

const pendingApprovals = bookings.filter((b) => b.status === "pending").length

return {
  upcomingEvents,
  todayBookings,
  occupancyRate,
  cancellations,
  pendingApprovals,
  chartData,
}
  }, [events, bookings])

  if (role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                Switch to admin mode to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use the toggle in the sidebar to switch roles
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader showSearch={false} />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Overview of your events and bookings</p>
            </div>
            <Button asChild>
              <Link href="/admin/events/new">Create Event</Link>
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">Published events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
                <CalendarCheck className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayBookings}</div>
                <p className="text-xs text-muted-foreground">New bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">Across all events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
                <XCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancellations}</div>
                <p className="text-xs text-muted-foreground">Total cancelled</p>
              </CardContent>
            </Card>
          </div>

          <ChartAreaDefault
            data={stats.chartData}
            title="Occupancy rate"
            description="Last 6 months"
          />

          {/* Pending Approvals Alert */}
          {stats.pendingApprovals > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-800">
                  <Users className="size-4" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">
                  You have {stats.pendingApprovals} booking{stats.pendingApprovals > 1 ? "s" : ""} waiting for approval.
                </p>
                <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
                  <Link href="/admin/bookings">Review Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Management</CardTitle>
                <CardDescription>Create, edit, and manage your events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href="/admin/events">View All</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/admin/events/new">Create New</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Management</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
