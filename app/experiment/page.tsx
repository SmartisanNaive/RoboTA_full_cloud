"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Activity, ChevronRight, ChevronLeft } from "lucide-react"

const modules = [
  {
    title: "Introduction to SynBio",
    lessons: ["What is Synthetic Biology?", "History and Key Concepts", "Applications and Future Prospects"],
  },
  {
    title: "Cell-Free Systems",
    lessons: ["Basics of Cell-Free Systems", "Advantages and Limitations", "Applications in Research"],
  },
  {
    title: "Protein Expression",
    lessons: ["Fundamentals of Protein Expression", "Expression Systems", "Purification Techniques"],
  },
]

export default function ExperimentPage() {
  const [activeModule, setActiveModule] = useState(0)
  const [activeLesson, setActiveLesson] = useState(0)

  const currentModule = modules[activeModule]
  const currentLesson = currentModule.lessons[activeLesson]

  const nextLesson = () => {
    if (activeLesson < currentModule.lessons.length - 1) {
      setActiveLesson(activeLesson + 1)
    } else if (activeModule < modules.length - 1) {
      setActiveModule(activeModule + 1)
      setActiveLesson(0)
    }
  }

  const prevLesson = () => {
    if (activeLesson > 0) {
      setActiveLesson(activeLesson - 1)
    } else if (activeModule > 0) {
      setActiveModule(activeModule - 1)
      setActiveLesson(modules[activeModule - 1].lessons.length - 1)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Left Column: Course Content */}
      <div className="w-full lg:w-1/3 bg-white shadow-md overflow-auto">
        <div className="p-4 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">SynBio Experiment</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)] p-4">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="mb-4">
              <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
              <ul className="space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li
                    key={lessonIndex}
                    className={`cursor-pointer hover:text-blue-600 ${
                      moduleIndex === activeModule && lessonIndex === activeLesson ? "text-blue-600 font-medium" : ""
                    }`}
                    onClick={() => {
                      setActiveModule(moduleIndex)
                      setActiveLesson(lessonIndex)
                    }}
                  >
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Column: Colab and Experiment Monitoring */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {/* Colab Code Editor */}
        <Card className="flex-1 m-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2" /> Colab Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="code" className="w-full">
              <TabsList>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
              <TabsContent value="code">
                <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm">
                  <pre>{`
# SynBio Experiment Code
import numpy as np
import matplotlib.pyplot as plt

def run_experiment(param1, param2):
    # Simulated experiment data
    data = np.random.rand(100) * param1 + param2
    return data

# Run experiment
results = run_experiment(1.5, 0.5)

# Plot results
plt.plot(results)
plt.title('Experiment Results')
plt.xlabel('Time')
plt.ylabel('Measurement')
plt.show()
                  `}</pre>
                </div>
              </TabsContent>
              <TabsContent value="output">
                <div className="bg-white p-4 rounded-md">
                  <p>Experiment output will be displayed here...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Experiment Monitoring */}
        <Card className="flex-1 m-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" /> Experiment Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Current Status:</h4>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span>Experiment in progress</span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Parameters:</h4>
                <ul className="list-disc list-inside">
                  <li>Temperature: 37°C</li>
                  <li>pH: 7.2</li>
                  <li>Agitation: 150 rpm</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Real-time Graph:</h4>
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  [Real-time experiment graph placeholder]
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button variant="outline" onClick={prevLesson} disabled={activeModule === 0 && activeLesson === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          onClick={nextLesson}
          disabled={
            activeModule === modules.length - 1 && activeLesson === modules[modules.length - 1].lessons.length - 1
          }
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

