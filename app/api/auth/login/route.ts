'use server'

import { NextRequest, NextResponse } from 'next/server'

const USERS = {
  admin: {
    password: 'admin',
    role: 'admin' as const,
    email: 'admin@eventnext.com',
  },
  user: {
    password: 'user',
    role: 'user' as const,
    email: 'user@eventnext.com',
  },
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Walidacja
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Sprawdzanie użytkownika
    const user = USERS[username as keyof typeof USERS]

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Zwracamy dane użytkownika (bez hasła!)
    return NextResponse.json({
      username,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
