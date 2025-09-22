import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { username, email, password } = await request.json()

  // In a real app, you would save this to a database
  // For now, we'll just return a success response
  return NextResponse.json({ success: true })
}

