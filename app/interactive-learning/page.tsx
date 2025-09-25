"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"
import { RoboTaEduModule } from "../experiments/RoboTaEduModuleWrapper"

export default function InteractiveLearningPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-blue-800">
              {translate("interactiveLearning", language)}
            </h1>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              {translate("interactiveLearningDesc", language)}
            </p>
          </div>

          {/* Main Content */}
          <Card className="border-blue-100 bg-white/90 shadow-2xl">
            <CardHeader className="space-y-1 border-b border-blue-100 bg-white/80">
              <CardTitle className="text-2xl font-semibold text-blue-600">
                {translate("interactiveLearning", language)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {translate("interactiveLearningDesc", language)}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <RoboTaEduModule />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-100 bg-white/90 shadow-xl">
              <CardHeader className="space-y-1 border-b border-blue-100 bg-white/80">
                <CardTitle className="text-xl font-semibold text-blue-600">
                  {language === "en" ? "What You'll Learn" : "您将学到什么"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {language === "en"
                      ? "Guided experiments with step-by-step instructions"
                      : "带有分步指导的引导式实验"}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {language === "en"
                      ? "Real-time data analysis and visualization"
                      : "实时数据分析和可视化"}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {language === "en"
                      ? "Interactive simulations of biological processes"
                      : "生物过程的交互式模拟"}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {language === "en"
                      ? "Hands-on experience with laboratory automation"
                      : "实验室自动化的实践经验"}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/90 shadow-xl">
              <CardHeader className="space-y-1 border-b border-blue-100 bg-white/80">
                <CardTitle className="text-xl font-semibold text-blue-600">
                  {language === "en" ? "Getting Started" : "开始使用"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "en" ? "Explore Modules" : "探索模块"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Browse through available learning modules"
                          : "浏览可用的学习模块"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "en" ? "Follow Instructions" : "按照指导操作"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Step-by-step guidance through each experiment"
                          : "每个实验的分步指导"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {language === "en" ? "Analyze Results" : "分析结果"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Review data and insights from your experiments"
                          : "查看实验的数据和见解"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}