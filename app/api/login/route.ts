import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (username === "admin" && password === "123456") {
    // Simple token without using jwt
    const token = btoa(`${username}:${Date.now()}`)
    return NextResponse.json({ token })
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
}

