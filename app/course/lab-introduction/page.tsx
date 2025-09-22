"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, BookOpen, AlertTriangle } from "lucide-react"
import Link from "next/link"

const courseContent = {
  title: "Introduction to the Laboratory",
  modules: [
    {
      title: "Lab Safety",
      content: "In this module, we'll cover essential lab safety practices...",
      safetyTips: [
        "安全第一，按章操作。",
        "爱护设备，轻拿轻放。",
        "异常报告，切勿擅动。",
        "失误损坏，可能赔偿。",
        "账号保密，责任自负。",
        "务必遵守！ 安全实验，你我共责！",
      ],
    },
    {
      title: "Lab Equipment",
      content: "Let's explore the various equipment you'll encounter in a synthetic biology lab...",
    },
    {
      title: "Basic Lab Procedures",
      content: "We'll go through some fundamental procedures you'll use in many experiments...",
    },
  ],
}

export default function CoursePage() {
  const [activeModule, setActiveModule] = useState(0)
  const [safetyAccepted, setSafetyAccepted] = useState(false)

  const nextModule = () => {
    if (activeModule < courseContent.modules.length - 1) {
      setActiveModule(activeModule + 1)
    }
  }

  const prevModule = () => {
    if (activeModule > 0) {
      setActiveModule(activeModule - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">{courseContent.title}</h1>
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-blue-700">
              <BookOpen className="mr-2" />
              {courseContent.modules[activeModule].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <p className="text-gray-700 mb-6">{courseContent.modules[activeModule].content}</p>
              {activeModule === 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-yellow-700">Important Safety Tips</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-2">
                    {courseContent.modules[0].safetyTips.map((tip, index) => (
                      <li key={index} className="text-yellow-700">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ScrollArea>
            <div className="mt-6 flex justify-between">
              <Button onClick={prevModule} disabled={activeModule === 0} variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {activeModule === courseContent.modules.length - 1 ? (
                <Link href={`/experiment/lab-introduction`}>
                  <Button className="bg-green-500 hover:bg-green-600">Start Virtual Lab</Button>
                </Link>
              ) : activeModule === 0 ? (
                <Button
                  onClick={() => {
                    setSafetyAccepted(true)
                    nextModule()
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={safetyAccepted}
                >
                  {safetyAccepted ? "Accepted" : "ACCEPT"} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={nextModule} className="bg-blue-600 hover:bg-blue-700">
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

