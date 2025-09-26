'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Scenario {
  id: number
  name: string
  knockouts: string[]
  succinateFlux: number
  growthRate: number
  yieldImprovement: string
  strategy: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const scenarios: Scenario[] = [
  {
    id: 1,
    name: "原始集",
    knockouts: ["LDH_D", "ALCD2x"],
    succinateFlux: 4.80,
    growthRate: 0.67,
    yieldImprovement: "6.1×",
    strategy: "通过阻断乳酸与乙醇支路，将碳流推向琥珀酸分泌",
    difficulty: "beginner"
  },
  {
    id: 2,
    name: "TCA循环重点",
    knockouts: ["ICDHyr", "AKGDH", "ALCD2x"],
    succinateFlux: 6.35,
    growthRate: 0.58,
    yieldImprovement: "7.9×",
    strategy: "强调三羧酸循环重定向，说明多敲除策略的影响",
    difficulty: "intermediate"
  },
  {
    id: 3,
    name: "糖酵解优化",
    knockouts: ["PFK", "PFL"],
    succinateFlux: 5.10,
    growthRate: 0.61,
    yieldImprovement: "6.6×",
    strategy: "展示糖酵解关键节点的调控改善产物合成",
    difficulty: "intermediate"
  },
  {
    id: 4,
    name: "最小集",
    knockouts: ["PFL", "FRD2"],
    succinateFlux: 3.25,
    growthRate: 0.72,
    yieldImprovement: "4.3×",
    strategy: "最小改动策略，侧重核心反应的作用",
    difficulty: "beginner"
  },
  {
    id: 5,
    name: "丙酮酸分流",
    knockouts: ["PFL", "POX", "ALCD2x"],
    succinateFlux: 5.95,
    growthRate: 0.55,
    yieldImprovement: "7.3×",
    strategy: "阻断发酵副产物促进琥珀酸堆积",
    difficulty: "advanced"
  },
  {
    id: 6,
    name: "混合策略",
    knockouts: ["LDH_D", "AKGDH", "PTAr"],
    succinateFlux: 5.60,
    growthRate: 0.59,
    yieldImprovement: "7.0×",
    strategy: "多通路协同调控，多目标权衡案例",
    difficulty: "advanced"
  },
  {
    id: 7,
    name: "琥珀酸特异性",
    knockouts: ["SDH", "AKGDH"],
    succinateFlux: 6.90,
    growthRate: 0.49,
    yieldImprovement: "8.6×",
    strategy: "产量最大化 vs 生长牺牲的极端情况",
    difficulty: "advanced"
  }
]

const getDifficultyColor = (difficulty: Scenario['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800'
    case 'intermediate': return 'bg-yellow-100 text-yellow-800'
    case 'advanced': return 'bg-red-100 text-red-800'
  }
}

const getDifficultyLabel = (difficulty: Scenario['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return '初级'
    case 'intermediate': return '中级'
    case 'advanced': return '高级'
  }
}

export default function Dashboard() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">COBRA OptKnock 教程</h1>
        <p className="text-lg text-gray-600">
          代谢工程优化策略交互式学习平台
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 教程导航 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>教程步骤</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/cobra-optknock" className="block">
              <Button variant="outline" className="w-full justify-start">
                1. 环境初始化
              </Button>
            </Link>
            <Link href="/cobra-optknock/model" className="block">
              <Button variant="outline" className="w-full justify-start">
                2. 模型配置
              </Button>
            </Link>
            <Link href="/cobra-optknock/select" className="block">
              <Button variant="outline" className="w-full justify-start">
                3. 反应选择
              </Button>
            </Link>
            <Link href="/cobra-optknock/optknock" className="block">
              <Button variant="outline" className="w-full justify-start">
                4. OptKnock执行
              </Button>
            </Link>
            <Link href="/cobra-optknock/result" className="block">
              <Button variant="outline" className="w-full justify-start">
                5. 结果分析
              </Button>
            </Link>
            <Link href="/cobra-optknock/report" className="block">
              <Button variant="outline" className="w-full justify-start">
                6. 报告生成
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 方案选择 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>选择优化方案</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scenarios" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scenarios">预设方案</TabsTrigger>
                <TabsTrigger value="comparison">对比分析</TabsTrigger>
                <TabsTrigger value="learning">学习目标</TabsTrigger>
              </TabsList>

              <TabsContent value="scenarios" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map(scenario => (
                    <Card
                      key={scenario.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedScenario?.id === scenario.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <Badge className={getDifficultyColor(scenario.difficulty)}>
                            {getDifficultyLabel(scenario.difficulty)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>敲除反应:</span>
                            <span className="font-mono text-xs">
                              {scenario.knockouts.join(", ")}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">琥珀酸通量:</span>
                              <div className="font-semibold text-green-600">
                                {scenario.succinateFlux}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">生长速率:</span>
                              <div className="font-semibold text-blue-600">
                                {scenario.growthRate}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge className="bg-purple-100 text-purple-800">
                              产率提升: {scenario.yieldImprovement}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">方案名称</th>
                        <th className="text-center p-2">敲除数量</th>
                        <th className="text-center p-2">琥珀酸通量</th>
                        <th className="text-center p-2">生长速率</th>
                        <th className="text-center p-2">产率提升</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map(scenario => (
                        <tr key={scenario.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{scenario.name}</td>
                          <td className="text-center p-2">{scenario.knockouts.length}</td>
                          <td className="text-center p-2 text-green-600 font-semibold">
                            {scenario.succinateFlux}
                          </td>
                          <td className="text-center p-2 text-blue-600">
                            {scenario.growthRate}
                          </td>
                          <td className="text-center p-2 text-purple-600 font-semibold">
                            {scenario.yieldImprovement}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="learning" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">学习目标</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 理解代谢工程基本原理</li>
                        <li>• 掌握OptKnock算法应用</li>
                        <li>• 学习代谢通量分析方法</li>
                        <li>• 培养系统优化思维</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">应用领域</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 生物燃料生产</li>
                        <li>• 化学品生物合成</li>
                        <li>• 药物中间体制造</li>
                        <li>• 环境生物技术</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 快速开始 */}
      {selectedScenario && (
        <Card>
          <CardHeader>
            <CardTitle>快速开始 - {selectedScenario.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1">
                <p className="text-gray-600 mb-3">{selectedScenario.strategy}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedScenario.knockouts.map(knockout => (
                    <Badge key={knockout} variant="destructive">
                      {knockout}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/cobra-optknock">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    开始教程
                  </Button>
                </Link>
                <Link href="/cobra-optknock/select">
                  <Button variant="outline">
                    自定义设置
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}