"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, FileCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"
import { OptKnockTeachingModule } from "@/COBRA/optknock-module"

export default function CobraOptKnockPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/interactive-learning">
            <Button variant="ghost" className="gap-2 text-blue-700 hover:bg-blue-100/80">
              <ArrowLeft className="h-4 w-4" />
              {language === "en" ? "Back to Interactive Learning" : "返回互动学习"}
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileCode className="h-4 w-4" />
            <span>COBRA/tutorial_optKnock_expanded_chinese.m</span>
            <span className="text-slate-400">·</span>
            <span>COBRA/result.md</span>
          </div>
        </div>

        <Card className="border-blue-100 bg-white/90 shadow-2xl">
          <CardHeader className="space-y-2 border-b border-blue-100 bg-white/80">
            <CardTitle className="flex items-center gap-2 text-3xl font-semibold text-blue-700">
              <BookOpen className="h-7 w-7" />
              {language === "en"
                ? "OptKnock Succinate Optimization (Teaching Simulation)"
                : "OptKnock 琥珀酸优化 · 教学仿真模块"}
            </CardTitle>
            <CardDescription className="text-base text-blue-700">
              {language === "en"
                ? "Replay the MATLAB OptKnock tutorial with precomputed scenarios, streaming terminal output, and classroom-oriented insights."
                : "基于预计算情境重放 MATLAB OptKnock 教程，提供流式终端输出与课堂解读。"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <OptKnockTeachingModule />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
