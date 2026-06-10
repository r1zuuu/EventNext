"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"

export type { User }

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      setUsers(await response.json())
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers().catch(() => {})
  }, [])

  const addUser = async (userData: { username: string; email: string; password: string; role: "user" | "admin" }) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create user")
    }
    const newUser = await response.json()
    setUsers((prev) => [newUser, ...prev])
    return newUser as User
  }

  const updateUser = async (id: string, userData: { username: string; email: string; role: "user" | "admin" }) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update user")
    }
    const updatedUser = await response.json()
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    return updatedUser as User
  }

  const deleteUser = async (id: string) => {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete user")
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return { users, loading, fetchUsers, addUser, updateUser, deleteUser }
}
