"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, Pencil, Copy, Eye, EyeOff, Trash2, Users } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminEventsPage() {
  const { events, role, updateEvent, deleteEvent, duplicateEvent, getBookedCount } = useStore()
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredEvents = useMemo(() => {
    if (!search) return events
    const searchLower = search.toLowerCase()
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.location.toLowerCase().includes(searchLower)
    )
  }, [events, search])

  const handlePublish = (id: string, publish: boolean) => {
    updateEvent(id, { status: publish ? "published" : "draft" })
    toast.success(publish ? "Event published" : "Event unpublished")
  }

  const handleCancel = (id: string) => {
    updateEvent(id, { status: "cancelled" })
    toast.success("Event cancelled")
  }

  const handleDuplicate = (id: string) => {
    const newEvent = duplicateEvent(id)
    if (newEvent) {
      toast.success("Event duplicated", {
        description: `"${newEvent.title}" has been created as a draft.`,
      })
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteEvent(deleteId)
      setDeleteId(null)
      toast.success("Event deleted")
    }
  }

  const getStatusBadge = (status: string) => {
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

  const getBookingTypeBadge = (type: string, price?: number) => {
    switch (type) {
      case "free":
        return <Badge variant="outline">Free</Badge>
      case "ticketed":
        return <Badge variant="outline">{price} PLN</Badge>
      case "approval":
        return <Badge variant="outline">Approval</Badge>
      default:
        return null
    }
  }

  if (role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader showSearch={false} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>Switch to admin mode to access this page</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader searchValue={search} onSearchChange={setSearch} />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
              <p className="text-muted-foreground">Manage your events</p>
            </div>
            <Button asChild>
              <Link href="/admin/events/new">
                <Plus className="size-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-muted-foreground">No events found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event, index) => {
                    const booked = getBookedCount(event.id)
                    return (
                      <TableRow key={event.id ?? `${event.title}-${index}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {Number.isNaN(new Date(event.startDateTime).getTime()) ? (
                              <>
                                <p>TBD</p>
                                <p className="text-muted-foreground">TBD</p>
                              </>
                            ) : (
                              <>
                                <p>{format(new Date(event.startDateTime), "MMM d, yyyy")}</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(event.startDateTime), "h:mm a")}
                                </p>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getBookingTypeBadge(event.bookingType, event.price)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {booked} / {event.capacity}
                            </p>
                            <p className="text-muted-foreground">
                              {event.capacity - booked} left
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                  <Pencil className="size-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}/bookings`}>
                                  <Users className="size-4 mr-2" />
                                  View Bookings
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(event.id)}>
                                <Copy className="size-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {event.status === "draft" && (
                                <DropdownMenuItem onClick={() => handlePublish(event.id, true)}>
                                  <Eye className="size-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {event.status === "published" && (
                                <DropdownMenuItem onClick={() => handlePublish(event.id, false)}>
                                  <EyeOff className="size-4 mr-2" />
                                  Unpublish
                                </DropdownMenuItem>
                              )}
                              {event.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => handleCancel(event.id)}
                                  className="text-destructive"
                                >
                                  <EyeOff className="size-4 mr-2" />
                                  Cancel Event
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(event.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone. All
              associated bookings will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
