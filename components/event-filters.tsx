"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { useMounted } from "@/hooks/use-mounted"

export interface EventFilters {
  bookingType: string
  tag: string
  dateRange: DateRange | undefined
}

interface EventFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  availableTags: string[]
}

export function EventFiltersPanel({ filters, onFiltersChange, availableTags }: EventFiltersProps) {
  const mounted = useMounted()
  const isPresent = <T,>(value: T | null | undefined): value is T => value !== null && value !== undefined

  const activeFilters = [
    filters.bookingType !== "all" ? "bookingType" : null,
    filters.tag !== "all" ? "tag" : null,
    filters.dateRange ? "dateRange" : null,
  ].filter(isPresent)

  const hasActiveFilters = activeFilters.length > 0

  const clearFilters = () => {
    onFiltersChange({
      bookingType: "all",
      tag: "all",
      dateRange: undefined,
    })
  }

  if (!mounted) {
    return <div className="flex flex-wrap items-end gap-4 py-4" />
  }

  return (
    <div className="flex flex-wrap items-end gap-4 py-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Event Type</Label>
        <Select
          value={filters.bookingType}
          onValueChange={(value) => onFiltersChange({ ...filters, bookingType: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="ticketed">Ticketed</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Tag</Label>
        <Select
          value={filters.tag}
          onValueChange={(value) => onFiltersChange({ ...filters, tag: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd")} -{" "}
                    {format(filters.dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => onFiltersChange({ ...filters, dateRange: range })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="size-3" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
