import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function BookingStatusBadge({ status }: { status: string }): ReactNode {
  switch (status) {
    case "confirmed":
      return <Badge variant="default">Confirmed</Badge>
    case "pending":
      return <Badge variant="secondary">Pending Approval</Badge>
    case "waitlist":
      return <Badge variant="outline">Waitlist</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    case "checked_in":
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Checked In</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function EventStatusBadge({ status }: { status: string }): ReactNode {
  switch (status) {
    case "published":
      return <Badge variant="default">Published</Badge>
    case "draft":
      return <Badge variant="secondary">Draft</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function BookingTypeBadge({ bookingType, price }: { bookingType: string; price?: number | null }): ReactNode {
  switch (bookingType) {
    case "free":
      return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Free</Badge>
    case "ticketed":
      return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{price} PLN</Badge>
    case "approval":
      return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Approval</Badge>
    default:
      return null
  }
}
