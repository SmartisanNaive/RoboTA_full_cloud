"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react"
import Link from "next/link"

// This would typically come from a database or API
const courseContent = {
  "colorful-reactions": {
    title: "Colorful Chemical Reactions",
    modules: [
      {
        title: "Introduction to Chemical Reactions",
        content: "Chemical reactions are processes where substances combine to form new substances...",
      },
      {
        title: "Understanding Color Changes",
        content: "Color changes in chemical reactions often indicate the formation of new compounds...",
      },
      {
        title: "Safety Precautions",
        content: "When conducting chemical experiments, always wear safety goggles and gloves...",
      },
    ],
  },
  // Add more courses as needed
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [activeModule, setActiveModule] = useState(0)
  const course = courseContent[params.id as keyof typeof courseContent]

  if (!course) {
    return <div>Course not found</div>
  }

  const nextModule = () => {
    if (activeModule < course.modules.length - 1) {
      setActiveModule(activeModule + 1)
    }
  }

  const prevModule = () => {
    if (activeModule > 0) {
      setActiveModule(activeModule - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">{course.title}</h1>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" />
              {course.modules[activeModule].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh]">
              <p className="text-gray-700">{course.modules[activeModule].content}</p>
            </ScrollArea>
            <div className="mt-4 flex justify-between">
              <Button onClick={prevModule} disabled={activeModule === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {activeModule === course.modules.length - 1 ? (
                <Link href={`/experiment/${params.id}`}>
                  <Button className="bg-green-500 hover:bg-green-600">Start Experiment</Button>
                </Link>
              ) : (
                <Button onClick={nextModule}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

