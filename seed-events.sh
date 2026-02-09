#!/bin/bash

# Events data
events=(
  '{
    "title": "Tech Startup Networking Night",
    "shortDescription": "Connect with founders, investors, and tech enthusiasts in Warsaw'\''s vibrant startup scene.",
    "longDescription": "Join us for an evening of networking, lightning talks, and discussions about the latest trends in technology and entrepreneurship.",
    "location": "WeWork Mennica Legacy, Warsaw",
    "startDateTime": "'$(date -d '+1 day' -u +%Y-%m-%dT%H:%M:%SZ)'",
    "endDateTime": "'$(date -d '+1 day +3 hours' -u +%Y-%m-%dT%H:%M:%SZ)'",
    "capacity": 50,
    "bookingType": "free",
    "tags": ["networking", "tech", "startup"],
    "status": "published",
    "organizerName": "Warsaw Tech Hub",
    "organizerEmail": "events@warsawtechhub.com"
  }'
)

# Add each event
for event in "${events[@]}"; do
  curl -X POST http://localhost:3000/api/events \
    -H "Content-Type: application/json" \
    -d "$event"
  echo ""
done
