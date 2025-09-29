"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export default function ExperimentsPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
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
        </div>
      </div>
    </div>
  )
}
