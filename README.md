
---

## 2) `EventNext`

```markdown
# EventNext

EventNext is a full-stack event management platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

The project is designed to support the creation, publication, and booking of events. It includes a structured data model for events, users, and bookings, which makes it suitable for handling both public event listings and internal event administration.

## Features

- event listing and navigation
- support for published, draft, and cancelled events
- booking system with attendee data and booking status
- user accounts with role-based access
- structured backend data model with Prisma
- PostgreSQL integration
- Docker support for local development and deployment

## Tech Stack

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- React Hook Form
- Zod

## Data Model

The application includes three core entities:

- `Event` for event details, scheduling, pricing, and organizer information
- `Booking` for attendee registration and booking management
- `User` for authentication and role handling

This structure makes the project suitable for a scalable event platform with both user-facing and administrative functionality.

## Getting Started

To run the project locally:

```bash
npm install
npm run dev
