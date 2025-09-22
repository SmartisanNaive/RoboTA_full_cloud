"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, BookOpen, PlayCircle, ImageIcon } from "lucide-react"

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

export default function CoursePage() {
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">SynBio Course</h2>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={prevLesson} disabled={activeModule === 0 && activeLesson === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Lesson
            </Button>
            <Button
              variant="outline"
              onClick={nextLesson}
              disabled={
                activeModule === modules.length - 1 && activeLesson === modules[modules.length - 1].lessons.length - 1
              }
            >
              Next Lesson <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-4">{currentModule.title}</h1>
          <h2 className="text-2xl font-semibold mb-6">{currentLesson}</h2>

          {/* Lesson Content */}
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <BookOpen className="mr-2" /> Reading Material
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu
                  sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla
                  enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat
                  nisl ut dapibus.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <PlayCircle className="mr-2" /> Video Lecture
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Video Placeholder
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <ImageIcon className="mr-2" /> Supplementary Image
              </h3>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Image Placeholder
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8">
            <Button onClick={nextLesson} className="w-full">
              Next Lesson
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

