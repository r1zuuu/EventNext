"use client"

import { useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { EventCard } from "@/components/event-card"
import { EventFiltersPanel, type EventFilters } from "@/components/event-filters"
import { useStore } from "@/lib/store"
import { isWithinInterval, parseISO } from "date-fns"

export default function EventsPage() {
  const { events, fetchEvents, loadingEvents } = useStore()
  const eventsList = Array.isArray(events) ? events : []
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<EventFilters>({
    bookingType: "all",
    tag: "all",
    dateRange: undefined,
  })

  useEffect(() => {
    if (eventsList.length === 0 && !loadingEvents) {
      fetchEvents()
    }
  }, [eventsList.length, fetchEvents, loadingEvents])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    eventsList.forEach((event) => (event.tags ?? []).forEach((tag) => tags.add(tag))) //event.tags is string[] | null but forEach is only on string[]
    return Array.from(tags).sort()
  }, [eventsList])

  const filteredEvents = useMemo(() => {
    return eventsList.filter((event) => {
      // Only show published events
      if (event.status !== "published") return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.shortDescription.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          (event.tags ?? []).some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Booking type filter
      if (filters.bookingType !== "all" && event.bookingType !== filters.bookingType) {
        return false
      }

      // Tag filter
      if (filters.tag !== "all" && !(event.tags ?? []).includes(filters.tag)) {
        return false
      }

      // Date range filter
      if (filters.dateRange?.from) {
        const eventDate = parseISO(event.startDateTime)
        const from = filters.dateRange.from
        const to = filters.dateRange.to || filters.dateRange.from

        if (!isWithinInterval(eventDate, { start: from, end: to })) {
          return false
        }
      }

      return true
    })
  }, [eventsList, search, filters])

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F6F8]">
      <AppHeader searchValue={search} onSearchChange={setSearch} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
            <p className="text-muted-foreground">
              Discover and book events in your area
            </p>
          </div>

          <EventFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
          />

          {loadingEvents ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <svg
                  className="size-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-lg">No events found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {search || filters.bookingType !== "all" || filters.tag !== "all" || filters.dateRange
                  ? "Try adjusting your filters or search terms"
                  : "Check back later for upcoming events"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
