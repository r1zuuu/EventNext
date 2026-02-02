"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { autoSlotsFormSchema, type AutoSlotsFormData, type SessionSlot } from "@/lib/schemas"
import { format, addMinutes } from "date-fns"

interface AutoSlotsDialogProps {
  baseStartTime: Date
  onSlotsGenerated: (slots: SessionSlot[]) => void
}

export function AutoSlotsDialog({ baseStartTime, onSlotsGenerated }: AutoSlotsDialogProps) {
  const [open, setOpen] = useState(false)
  const [generatedSlots, setGeneratedSlots] = useState<SessionSlot[]>([])

  const form = useForm<AutoSlotsFormData>({
    resolver: zodResolver(autoSlotsFormSchema),
    defaultValues: {
      sessionDuration: 60,
      breakDuration: 15,
      numberOfSessions: 3,
    },
  })

  const generateSlots = (data: AutoSlotsFormData) => {
    const slots: SessionSlot[] = []
    let currentStart = baseStartTime

    for (let i = 0; i < data.numberOfSessions; i++) {
      const sessionEnd = addMinutes(currentStart, data.sessionDuration)
      slots.push({
        id: `slot-${Date.now()}-${i}`,
        startTime: currentStart.toISOString(),
        endTime: sessionEnd.toISOString(),
      })
      currentStart = addMinutes(sessionEnd, data.breakDuration)
    }

    setGeneratedSlots(slots)
  }

  const removeSlot = (id: string) => {
    setGeneratedSlots(generatedSlots.filter((s) => s.id !== id))
  }

  const handleConfirm = () => {
    onSlotsGenerated(generatedSlots)
    setOpen(false)
    setGeneratedSlots([])
    form.reset()
  }

  const formatSlotTime = (isoString: string) => {
    return format(new Date(isoString), "h:mm a")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Clock className="size-4 mr-2" />
          Auto Generate Sessions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Session Slots</DialogTitle>
          <DialogDescription>
            Create multiple session slots automatically from a template. You can adjust individual slots after generation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(generateSlots)} className="space-y-4">
            <div className="grid gap-4 grid-cols-3">
              <FormField
                control={form.control}
                name="sessionDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breakDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfSessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sessions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>Starting from {format(baseStartTime, "h:mm a 'on' MMM d, yyyy")}</span>
            </div>

            <Button type="submit" className="w-full">
              Generate Preview
            </Button>
          </form>
        </Form>

        {generatedSlots.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Generated Sessions</p>
              <p className="text-xs text-muted-foreground">{generatedSlots.length} sessions</p>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {generatedSlots.map((slot, index) => (
                  <Card key={slot.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Session {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(slot.id)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setGeneratedSlots([])}
              >
                Clear
              </Button>
              <Button type="button" className="flex-1" onClick={handleConfirm}>
                Use These Slots
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
