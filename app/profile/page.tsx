"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { User, Mail, Book } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState({ username: "", email: "", completedExperiments: 0 })
  const router = useRouter()

  useEffect(() => {
    // Always show mock data without authentication
    const mockUser = {
      username: "Guest User",
      email: "guest@example.com",
      completedExperiments: 2,
    }
    setUser(mockUser)
  }, [])

  const totalExperiments = 5 // This should match the total number of experiments in your app
  const progress = (user.completedExperiments / totalExperiments) * 100

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="h-6 w-6 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6 text-gray-500" />
                <p className="text-sm font-medium text-gray-500">Experiments Completed</p>
              </div>
              <p className="text-lg font-semibold">
                {user.completedExperiments} / {totalExperiments}
              </p>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          <Button className="w-full" onClick={() => router.push("/")}>
            Return to Experiments
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

