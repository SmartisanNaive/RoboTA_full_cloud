"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Combined container with title and iframe */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Title section */}
          <div className="p-5 text-center border-b border-blue-100">
            <h1 className="text-3xl font-bold mb-2 text-blue-600">{language === 'en' ? 'Synthetic Biology Course' : '合成生物学课程'}</h1>
            <p className="text-lg text-gray-700">
              {language === 'en' 
                ? 'A comprehensive course covering six essential modules in synthetic biology'
                : '涵盖合成生物学六个基本模块的综合课程'}
            </p>
          </div>
          
          {/* iframe section */}
          <div className="h-[80vh] w-full">
            <iframe 
              src="https://www.yuque.com/gaoyuan-fe0av/robota" 
              className="w-full h-full" 
              title="RoboTA Cloud Course"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}

