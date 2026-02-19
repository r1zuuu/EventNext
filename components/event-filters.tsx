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
        <Label className="text-xs text-slate-400">Event Type</Label>
        <Select
          value={filters.bookingType}
          onValueChange={(value) => onFiltersChange({ ...filters, bookingType: value })}
        >
          <SelectTrigger className="w-[140px] bg-slate-900/80 border-purple-500/20 text-slate-100 hover:bg-slate-800">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900/80 border-purple-500/20">
            <SelectItem value="all" className="text-slate-100">All types</SelectItem>
            <SelectItem value="free" className="text-slate-100">Free</SelectItem>
            <SelectItem value="ticketed" className="text-slate-100">Ticketed</SelectItem>
            <SelectItem value="approval" className="text-slate-100">Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-400">Tag</Label>
        <Select
          value={filters.tag}
          onValueChange={(value) => onFiltersChange({ ...filters, tag: value })}
        >
          <SelectTrigger className="w-[140px] bg-slate-900/80 border-purple-500/20 text-slate-100 hover:bg-slate-800">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900/80 border-purple-500/20">
            <SelectItem value="all" className="text-slate-100">All tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag} className="text-slate-100">
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-100">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal bg-slate-900/80 border-purple-500/20 text-slate-100 hover:bg-slate-800",
                !filters.dateRange && "text-slate-100"
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
          <PopoverContent className="w-auto p-0 bg-slate-900/80 border-purple-500/20" align="start">
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
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-300 hover:text-slate-100 hover:bg-slate-800">
          <X className="size-3" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
