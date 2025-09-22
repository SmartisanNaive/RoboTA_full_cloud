"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Code, Activity, ChevronRight, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const experimentContent = {
  "lab-introduction": {
    title: "Introduction to the Laboratory",
    modules: [
      {
        title: "Virtual Lab Tour",
        content:
          "Use the controls to navigate through the virtual lab. Click on highlighted areas to learn more about different lab sections.",
        task: "Identify at least 5 key areas in the lab.",
      },
      {
        title: "Equipment Identification",
        content:
          "Click on the highlighted equipment to learn more about each item. Try to memorize their names and functions.",
        task: "Match 10 pieces of equipment with their correct names and functions.",
      },
      {
        title: "Safety Procedure Simulation",
        content:
          "Follow the prompts to practice proper safety procedures. You'll be asked to respond to various scenarios.",
        task: "Successfully complete a safety drill by choosing the correct actions in a given scenario.",
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
  },
  "colorful-reactions": {
    title: "Colorful Chemical Reactions",
    modules: [
      {
        title: "Experiment Setup",
        content: "Prepare your workspace with the following materials: test tubes, pipettes, and safety equipment...",
      },
      {
        title: "Conducting the Experiment",
        content: "Step 1: Carefully mix solutions A and B in a test tube...",
      },
      {
        title: "Analyzing Results",
        content: "Observe the color changes and record your observations. Compare with expected results...",
      },
    ],
    code: `
# Colorful Chemical Reactions Simulation
import numpy as np
import matplotlib.pyplot as plt

def simulate_reaction(reagent_a, reagent_b, time):
    # Simulated color change over time
    color_change = np.sin(time * (reagent_a + reagent_b)) * 100 + 100
    return color_change

# Set up experiment parameters
reagent_a = 0.5  # concentration of reagent A
reagent_b = 0.3  # concentration of reagent B
time = np.linspace(0, 10, 100)  # time points

# Run simulation
results = simulate_reaction(reagent_a, reagent_b, time)

# Plot results
plt.figure(figsize=(10, 6))
plt.plot(time, results)
plt.title('Simulated Color Change in Chemical Reaction')
plt.xlabel('Time (s)')
plt.ylabel('Color Intensity')
plt.show()
    `,
  },
  // Add more experiments as needed
}

export default function ExperimentPage({ params }: { params: { id: string } }) {
  const [activeModule, setActiveModule] = useState(0)
  const [labStatus, setLabStatus] = useState("Initializing...")
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [showLabTourDialog, setShowLabTourDialog] = useState(false)
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false)
  const [showSafetyDialog, setShowSafetyDialog] = useState(false)
  const router = useRouter()

  const experiment = experimentContent[params.id as keyof typeof experimentContent]

  useEffect(() => {
    if (!experiment) {
      router.push("/404")
    } else {
      const timer = setTimeout(() => {
        setLabStatus("Virtual Lab Ready")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [experiment, router])

  if (!experiment) {
    return null
  }

  const handleCompleteTask = () => {
    if (activeModule === 0) {
      setShowLabTourDialog(true)
    } else if (activeModule === 1) {
      setShowEquipmentDialog(true)
    } else {
      setShowSafetyDialog(true)
    }
  }

  const completeTask = () => {
    setTaskCompleted(true)
    // In a real app, you'd send this data to your backend
    alert("Task completed! You can now move to the next module.")
  }

  const nextModule = () => {
    if (activeModule < experiment.modules.length - 1) {
      setActiveModule(activeModule + 1)
      setTaskCompleted(false)
    }
  }

  const prevModule = () => {
    if (activeModule > 0) {
      setActiveModule(activeModule - 1)
      setTaskCompleted(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left Column: Course Content */}
      <div className="w-full lg:w-1/3 bg-white shadow-md overflow-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">{experiment.title}</h2>
        <ScrollArea className="h-[calc(100vh-120px)]">
          {experiment.modules.map((module, index) => (
            <div key={index} className="mb-4">
              <h3
                className={`font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600 ${
                  index === activeModule ? "text-blue-600" : ""
                }`}
                onClick={() => setActiveModule(index)}
              >
                {module.title}
              </h3>
              {index === activeModule && (
                <div>
                  <p className="text-gray-600 mb-2">{module.content}</p>
                  <p className="text-gray-800 font-semibold">Task: {module.task}</p>
                  <Button onClick={handleCompleteTask} className="mt-2" disabled={taskCompleted}>
                    {taskCompleted ? "Completed" : "Complete Task"}
                  </Button>
                </div>
              )}
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
                  <pre>{experiment.code}</pre>
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
                <p>{experiment.modules[activeModule].title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Progress:</h4>
                <Progress value={((activeModule + 1) / experiment.modules.length) * 100} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button variant="outline" onClick={prevModule} disabled={activeModule === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          onClick={nextModule}
          disabled={activeModule === experiment.modules.length - 1 || !taskCompleted}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <AlertDialog open={showLabTourDialog} onOpenChange={setShowLabTourDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Virtual Lab Tour Quiz</AlertDialogTitle>
            <AlertDialogDescription>Identify the following areas in the lab:</AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">Safety shower location</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Chemical storage area</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-three" id="option-three" />
              <Label htmlFor="option-three">Biosafety cabinet</Label>
            </div>
          </RadioGroup>
          <AlertDialogFooter>
            <AlertDialogAction onClick={completeTask}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEquipmentDialog} onOpenChange={setShowEquipmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Equipment Identification Quiz</AlertDialogTitle>
            <AlertDialogDescription>Match the following equipment with its function:</AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">Micropipette - Precise liquid measurement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Centrifuge - Separating components of a mixture</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-three" id="option-three" />
              <Label htmlFor="option-three">Incubator - Maintaining optimal growth conditions</Label>
            </div>
          </RadioGroup>
          <AlertDialogFooter>
            <AlertDialogAction onClick={completeTask}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSafetyDialog} onOpenChange={setShowSafetyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Safety Procedure Quiz</AlertDialogTitle>
            <AlertDialogDescription>Choose the correct action for the following scenario:</AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">
                You spill a chemical on your skin. What's the first thing you should do?
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Rinse the affected area with water for at least 15 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-three" id="option-three" />
              <Label htmlFor="option-three">Notify your supervisor</Label>
            </div>
          </RadioGroup>
          <AlertDialogFooter>
            <AlertDialogAction onClick={completeTask}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

