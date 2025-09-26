"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CobraOptKnockHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            COBRA OptKnock 教程
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            代谢工程优化策略交互式学习平台
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Getting Started */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">开始学习</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                欢迎来到 COBRA OptKnock 交互式教程！本平台将带您深入了解代谢工程中的
                OptKnock 算法，通过实际操作学习如何优化微生物代谢网络以提高目标产物产量。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/cobra-optknock/tutorial" className="block">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">📚 交互式教程</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        从基础概念开始，逐步学习 OptKnock 算法的原理和应用
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/cobra-optknock/dashboard" className="block">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">🎯 快速开始</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        选择预设方案，直接开始优化实验
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <Link href="/cobra-optknock/start">
                <Button size="lg" className="w-full md:w-auto">
                  🚀 开始完整教程流程
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tutorial Steps */}
          <Card>
            <CardHeader>
              <CardTitle>教程步骤</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <Badge variant="outline" className="bg-blue-100">1</Badge>
                  <span className="text-sm">环境初始化</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Badge variant="outline" className="bg-gray-100">2</Badge>
                  <span className="text-sm">模型配置</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Badge variant="outline" className="bg-gray-100">3</Badge>
                  <span className="text-sm">反应选择</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Badge variant="outline" className="bg-gray-100">4</Badge>
                  <span className="text-sm">OptKnock执行</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Badge variant="outline" className="bg-gray-100">5</Badge>
                  <span className="text-sm">结果分析</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  <Badge variant="outline" className="bg-gray-100">6</Badge>
                  <span className="text-sm">报告生成</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔬 代谢途径可视化</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  交互式代谢网络图，直观展示反应关系和通量变化
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 实时数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  动态展示优化结果，比较生长速率与产物产量的权衡关系
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎓 教学导向</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  专为教学设计，包含详细的概念解释和实例分析
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ 模拟执行</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  虚拟 MATLAB 环境模拟，展示真实的 OptKnock 执行过程
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔄 多种策略</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  7种预设优化方案，从初级到高级，满足不同学习需求
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📝 智能报告</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  自动生成优化报告，包含详细的策略分析和建议
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning outcomes */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">学习目标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">🎯 核心概念</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 代谢工程基本原理</li>
                    <li>• 约束性建模方法</li>
                    <li>• OptKnock 算法原理</li>
                    <li>• 双层次优化策略</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">🛠️ 实践技能</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 代谢网络分析</li>
                    <li>• 反应敲除策略设计</li>
                    <li>• 结果解读与优化</li>
                    <li>• 工业应用思考</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
