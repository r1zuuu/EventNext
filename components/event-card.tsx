"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Users, Clock, Globe } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/schemas"
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }

  const getBookingTypeBadge = () => {
    switch (event.bookingType) {
      case "free":
        return <Badge className="bg-[#10B981] text-white border-transparent">Free</Badge>
      case "ticketed":
        return <Badge className="bg-[#2563EB] text-white border-transparent">{event.price} PLN</Badge>
      case "approval":
        return <Badge variant="outline">Approval Required</Badge>
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 backdrop-blur-xl bg-white/80 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:bg-white/90">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getBookingTypeBadge()}
              {isFull && <Badge variant="destructive">Full</Badge>}
              {event.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
            </div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{event.title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.shortDescription}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span className="truncate">{formatDateTime(event.startDateTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.onlineUrl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="size-4 shrink-0" />
              <span className="truncate">Online option available</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>
              {isFull ? "No spots left" : `${remainingCapacity} of ${event.capacity} spots left`}
            </span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} className="text-xs bg-[#111827] text-white border-transparent">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge className="text-xs bg-[#111827] text-white border-transparent">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className={`w-full ${isFull || event.status === "cancelled" ? "" : "bg-[#111827] hover:bg-[#111827]/90"}`} variant={isFull || event.status === "cancelled" ? "secondary" : "default"}>
          <Link href={`/events/${event.id}`}>
            {event.status === "cancelled" ? "View Event" : isFull ? "Join Waitlist" : "View & Book"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
