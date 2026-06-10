"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Users, Clock, Globe } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/schemas"
import { BookingTypeBadge } from "@/components/badges"
import { useStore } from "@/lib/store"
import { format } from "date-fns"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const [mounted, setMounted] = useState(false)
  const { getBookedCount } = useStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const bookedCount = mounted ? getBookedCount(event.id) : 0
  const remainingCapacity = event.capacity - bookedCount
  const isFull = remainingCapacity <= 0

  function formatDateTime(date: string): string
  function formatDateTime(date: Date): string
  function formatDateTime(date: string | Date) {
    const parsedDate = typeof date === "string" ? new Date(date) : date
    if (Number.isNaN(parsedDate.getTime())) {
      return "TBD"
    }
    return format(parsedDate, "MMM d, yyyy 'at' h:mm a")
  }


  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 bg-card/80 border border-primary/10 hover:border-primary/30 hover:-translate-y-1 backdrop-blur-sm">
      {/* Image placeholder with subtle primary gradient */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-card overflow-hidden">
        <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CalendarDays className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <BookingTypeBadge bookingType={event.bookingType} price={event.price} />
              {isFull && <Badge className="bg-primary/10 text-primary border-primary/20">Full</Badge>}
              {event.status === "cancelled" && <Badge className="bg-primary/10 text-primary border-primary/20">Cancelled</Badge>}
            </div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.shortDescription}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary/60" />
            <span className="truncate">{formatDateTime(event.startDateTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.onlineUrl && (
            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Globe className="h-4 w-4 shrink-0 text-primary/60" />
              <span className="truncate">Online option available</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0 text-primary/60" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {isFull ? "No spots left" : `${remainingCapacity} of ${event.capacity} spots`}
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-primary/80 transition-all duration-300"
                  style={{ width: `${Math.min((bookedCount / event.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {(event.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {(event.tags ?? []).slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
              >
                #{tag}
              </Badge>
            ))}
            {(event.tags ?? []).length > 3 && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                +{(event.tags ?? []).length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Button 
          asChild 
          className={`w-full font-medium transition-all duration-300 ${
            isFull || event.status === "cancelled" 
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
              : "bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-lg hover:shadow-primary/20 hover:text-primary-foreground group-hover:scale-105 active:scale-95"
          }`}
        >
          <Link href={`/events/${event.id}`}>
            {event.status === "cancelled" ? "View Event" : isFull ? "Join Waitlist" : "View & Book"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function EventCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden bg-card/40 border border-white/5 backdrop-blur-sm shadow-sm">
      <div className="h-40 bg-secondary/30 animate-pulse" />
      <CardHeader className="pb-3 pt-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-secondary/40 rounded animate-pulse" />
          <div className="h-5 w-24 bg-secondary/40 rounded animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-secondary/40 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pb-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-secondary/40 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-secondary/40 rounded animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
             <div className="h-4 w-4 bg-secondary/40 rounded animate-pulse" />
             <div className="h-4 w-1/2 bg-secondary/40 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
             <div className="h-4 w-4 bg-secondary/40 rounded animate-pulse" />
             <div className="h-4 w-1/3 bg-secondary/40 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
             <div className="h-4 w-4 bg-secondary/40 rounded animate-pulse" />
             <div className="h-4 w-2/3 bg-secondary/40 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <div className="h-10 w-full bg-secondary/40 rounded animate-pulse" />
      </CardFooter>
    </Card>
  )
}
