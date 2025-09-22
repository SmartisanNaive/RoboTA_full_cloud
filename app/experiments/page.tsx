"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"
import { RoboTaEduModule } from "./RoboTaEduModuleWrapper"

export default function ExperimentsPage() {
  const [activeModule, setActiveModule] = useState(0)
  const { language } = useLanguage()
  const [modules, setModules] = useState([
    {
      title: translate('module1Title', language),
      content: translate('module1Content', language),
    },
    {
      title: translate('module2Title', language),
      content: translate('module2Content', language),
    },
    {
      title: translate('module3Title', language),
      content: translate('module3Content', language),
    },
    {
      title: translate('module4Title', language),
      content: translate('module4Content', language),
    },
    {
      title: translate('module5Title', language),
      content: translate('module5Content', language),
    },
    {
      title: translate('module6Title', language),
      content: translate('module6Content', language),
    },
  ])

  // Update modules when language changes
  useEffect(() => {
    setModules([
      {
        title: translate('module1Title', language),
        content: translate('module1Content', language),
      },
      {
        title: translate('module2Title', language),
        content: translate('module2Content', language),
      },
      {
        title: translate('module3Title', language),
        content: translate('module3Content', language),
      },
      {
        title: translate('module4Title', language),
        content: translate('module4Content', language),
      },
      {
        title: translate('module5Title', language),
        content: translate('module5Content', language),
      },
      {
        title: translate('module6Title', language),
        content: translate('module6Content', language),
      },
    ])
  }, [language])

  const nextModule = () => {
    if (activeModule < modules.length - 1) {
      setActiveModule(activeModule + 1)
    }
  }

  const prevModule = () => {
    if (activeModule > 0) {
      setActiveModule(activeModule - 1)
    }
  }

  const activeModuleDetails = modules[activeModule]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="flex flex-col border-blue-100/80 bg-white/80 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-2xl font-semibold text-blue-700">
                <BookOpen className="mr-2 h-5 w-5" />
                {language === "en" ? "Course Modules" : "课程模块"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Browse the learning focus for each synthetic biology module."
                  : "浏览每个合成生物学模块的学习要点。"}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-inner">
                <h2 className="text-lg font-semibold text-blue-700">
                  {activeModuleDetails?.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeModuleDetails?.content}
                </p>
              </div>
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <button
                      key={`${module.title}-${index}`}
                      onClick={() => setActiveModule(index)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                        index === activeModule
                          ? "border-blue-400 bg-blue-50/90 text-blue-700 shadow-md"
                          : "border-transparent bg-white/80 hover:border-blue-200 hover:bg-blue-50/70"
                      }`}
                    >
                      <div className="text-sm font-semibold">{module.title}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{module.content}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={prevModule} disabled={activeModule === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {translate("previousModule", language)}
                </Button>
                <Button
                  variant="outline"
                  onClick={nextModule}
                  disabled={activeModule === modules.length - 1}
                >
                  {translate("nextModule", language)}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-blue-100 bg-white/90 shadow-2xl">
              <CardHeader className="space-y-2 border-b border-blue-100 bg-white/80">
                <CardTitle className="text-3xl font-bold text-blue-600">
                  {translate("courseTitle", language)}
                </CardTitle>
                <p className="text-base text-gray-700">{translate("courseSubtitle", language)}</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[70vh] w-full overflow-hidden">
                  <iframe
                    src="https://www.yuque.com/gaoyuan-fe0av/robota"
                    className="h-full w-full"
                    title="RoboTA Cloud Course"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/90 shadow-2xl">
              <CardHeader className="space-y-1 border-b border-blue-100 bg-white/80">
                <CardTitle className="text-2xl font-semibold text-blue-600">
                  {language === "en"
                    ? "RoboTA Interactive Learning Module"
                    : "RoboTA 互动学习模块"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === "en"
                    ? "Explore guided experiments, analytics, and simulations powered by RoboTA."
                    : "体验 RoboTA 提供的实验指导、数据分析与仿真内容。"}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <RoboTaEduModule />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

