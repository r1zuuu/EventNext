import { notFound } from "next/navigation"

import { getEventById } from "@/lib/server-data"

import { AdminEventEditor } from "./event-editor"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  return <AdminEventEditor event={event} />
}
