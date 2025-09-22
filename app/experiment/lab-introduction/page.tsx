"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Activity } from "lucide-react"

const experimentContent = {
  title: "Introduction to the Laboratory",
  modules: [
    {
      title: "Virtual Lab Tour",
      content: "Use the controls to navigate through the virtual lab...",
    },
    {
      title: "Equipment Identification",
      content: "Click on the highlighted equipment to learn more about each item...",
    },
    {
      title: "Safety Procedure Simulation",
      content: "Follow the prompts to practice proper safety procedures...",
    },
  ],
  code: `
# Virtual Lab Simulation
import virtual_lab

def start_lab_tour():
    virtual_lab.initialize()
    virtual_lab.start_tour()

def identify_equipment(item):
    return virtual_lab.get_equipment_info(item)

def practice_safety_procedure(procedure):
    return virtual_lab.simulate_safety_procedure(procedure)

# Start the virtual lab tour
start_lab_tour()
  `,
}

export default function ExperimentPage() {
  const [activeModule, setActiveModule] = useState(0)
  const [labStatus, setLabStatus] = useState("Initializing...")

  useEffect(() => {
    const timer = setTimeout(() => {
      setLabStatus("Virtual Lab Ready")
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left Column: Course Content */}
      <div className="w-full lg:w-1/3 bg-white shadow-md overflow-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">{experimentContent.title}</h2>
        <ScrollArea className="h-[calc(100vh-120px)]">
          {experimentContent.modules.map((module, index) => (
            <div key={index} className="mb-4">
              <h3
                className={`font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600 ${
                  index === activeModule ? "text-blue-600" : ""
                }`}
                onClick={() => setActiveModule(index)}
              >
                {module.title}
              </h3>
              {index === activeModule && <p className="text-gray-600">{module.content}</p>}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Column: Code and Experiment Monitoring */}
      <div className="w-full lg:w-2/3 flex flex-col p-4">
        {/* Code Editor */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2" /> Code Editor
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
                  <pre>{experimentContent.code}</pre>
                </div>
              </TabsContent>
              <TabsContent value="output">
                <div className="bg-white p-4 rounded-md">
                  <p>Code output will be displayed here...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Experiment Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" /> Virtual Lab Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Current Status:</h4>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span>{labStatus}</span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Active Module:</h4>
                <p>{experimentContent.modules[activeModule].title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Progress:</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${((activeModule + 1) / experimentContent.modules.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

