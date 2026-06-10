"use client"

import type { UseFormReturn } from "react-hook-form"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EventFormValues } from "./schema"

interface BasicsTabProps {
  form: UseFormReturn<EventFormValues>
  tags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}

export function BasicsTab({ form, tags, tagInput, onTagInputChange, onAddTag, onRemoveTag }: BasicsTabProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Basic Information</CardTitle>
        <CardDescription className="text-muted-foreground">Core details about your event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary (max 200 chars)"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  maxLength={200}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-muted-foreground">
                {field.value?.length || 0}/200 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Full Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of your event"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label className="text-foreground">Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onAddTag()
                }
              }}
            />
            <Button type="button" variant="outline" className="bg-secondary border-border/50 text-secondary-foreground hover:bg-secondary/80" onClick={onAddTag}>
              <Plus className="size-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} className="bg-secondary text-secondary-foreground border-border/50 gap-1">
                  {tag}
                  <button type="button" onClick={() => onRemoveTag(tag)}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
