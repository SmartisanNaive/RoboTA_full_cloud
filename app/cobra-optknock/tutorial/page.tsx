'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetabolicPathway } from '@/COBRA/OptKnockTeachingModule/src/components/MetabolicPathway'
import { TerminalPanel } from '@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel'

interface TutorialStep {
  id: number
  title: string
  description: string
  content: string
  interactive?: boolean
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "代谢工程基础",
    description: "了解代谢工程的基本概念和OptKnock算法",
    content: `
代谢工程是通过基因工程手段改造微生物代谢网络，提高目标产物产量的学科。
OptKnock是一种基于约束的建模方法，通过双层次优化算法识别最优的反应敲除组合。

主要步骤：
1. 构建代谢网络模型
2. 设定目标函数（如最大化产物产量）
3. 寻找最优敲除策略
4. 验证和优化结果
    `
  },
  {
    id: 2,
    title: "琥珀酸生产途径",
    description: "理解琥珀酸的生物合成途径",
    content: `
琥珀酸是一种重要的平台化学品，广泛应用于食品、医药和化工行业。

主要生产途径：
- 糖酵解途径：葡萄糖 → 丙酮酸
- TCA循环：丙酮酸 → 琥珀酸
- 发酵途径：竞争性产物生成

关键反应：
- LDH_D：乳酸脱氢酶（竞争途径）
- ALCD2x：乙醇脱氢酶（竞争途径）
- SDH：琥珀酸脱氢酶（消耗途径）
    `
  },
  {
    id: 3,
    title: "OptKnock算法原理",
    description: "深入理解OptKnock的双层次优化策略",
    content: `
OptKnock采用双层次线性规划方法：

外层问题：最大化产物产量
- 寻找最优的敲除组合
- 考虑细胞生长约束

内层问题：最大化生物量
- 在给定敲除条件下优化通量分布
- 确保方案的生物学可行性

数学表达：
max z = cᵀx（产物产量）
s.t. max vᵀx（生物量）
     Sx = 0（质量平衡）
     x_min ≤ x ≤ x_max（通量约束）
    `
  },
  {
    id: 4,
    title: "反应选择策略",
    description: "学习如何选择合适的敲除目标",
    content: `
反应选择原则：
1. 识别竞争途径的节点
2. 分析代谢通量分布
3. 考虑基因操作可行性
4. 评估细胞生长影响

常见策略：
- 阻断副产物生成途径
- 强化目标产物合成路径
- 平衡生长与生产的关系
    `,
    interactive: true
  },
  {
    id: 5,
    title: "结果分析与优化",
    description: "学习如何解读优化结果",
    content: `
结果分析要点：
1. 产物产量提升倍数
2. 生长速率变化
3. 通量分布改变
4. 热力学可行性检查

优化策略：
- 多轮迭代优化
- 组合不同策略
- 考虑动态调控
    `
  }
]

interface Reaction {
  id: string
  name: string
  type: string
  description: string
}

const keyReactions: Reaction[] = [
  {
    id: 'LDH_D',
    name: '乳酸脱氢酶',
    type: '竞争途径',
    description: '将丙酮酸转化为乳酸，与琥珀酸生产竞争碳流'
  },
  {
    id: 'ALCD2x',
    name: '乙醇脱氢酶',
    type: '竞争途径',
    description: '将乙醛转化为乙醇，是主要的发酵副产物途径'
  },
  {
    id: 'PFK',
    name: '磷酸果糖激酶',
    type: '糖酵解',
    description: '糖酵解的关键调控点，影响整体碳流'
  },
  {
    id: 'SDH',
    name: '琥珀酸脱氢酶',
    type: 'TCA循环',
    description: '将琥珀酸转化为富马酸，敲除可积累琥珀酸'
  }
]

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])
  const [knockedOutReactions, setKnockedOutReactions] = useState<string[]>([])
  const [showPathway, setShowPathway] = useState(false)

  const handleReactionSelect = (reactionId: string) => {
    setSelectedReactions(prev =>
      prev.includes(reactionId)
        ? prev.filter(id => id !== reactionId)
        : [...prev, reactionId]
    )
  }

  const applyKnockouts = () => {
    setKnockedOutReactions(selectedReactions)
  }

  const resetSelection = () => {
    setSelectedReactions([])
    setKnockedOutReactions([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">OptKnock 交互式教程</h1>
        <p className="text-lg text-gray-600">
          深入学习代谢工程优化算法的原理与应用
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 步骤导航 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>教程步骤</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tutorialSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentStep === index
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-sm">{step.title}</div>
                <div className="text-xs text-gray-600 mt-1">{step.description}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {tutorialSteps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                  {tutorialSteps[currentStep].description}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-sm">
                  {tutorialSteps[currentStep].content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 交互式组件 */}
          {tutorialSteps[currentStep].interactive && (
            <Tabs defaultValue="selection" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="selection">反应选择</TabsTrigger>
                <TabsTrigger value="pathway">途径可视化</TabsTrigger>
                <TabsTrigger value="results">预期结果</TabsTrigger>
              </TabsList>

              <TabsContent value="selection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>选择敲除反应</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keyReactions.map(reaction => (
                        <div
                          key={reaction.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedReactions.includes(reaction.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleReactionSelect(reaction.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reaction.name}</h4>
                            <Badge variant="outline">{reaction.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{reaction.description}</p>
                          <div className="mt-2 text-xs font-mono text-gray-500">
                            ID: {reaction.id}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button onClick={applyKnockouts} disabled={selectedReactions.length === 0}>
                        应用敲除
                      </Button>
                      <Button variant="outline" onClick={resetSelection}>
                        重置选择
                      </Button>
                      <Button variant="outline" onClick={() => setShowPathway(true)}>
                        查看途径
                      </Button>
                    </div>

                    {selectedReactions.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">已选择反应：</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedReactions.map(reaction => (
                            <Badge key={reaction} variant="secondary">
                              {reaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pathway" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>代谢途径可视化</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[600px] border rounded-lg">
                      <MetabolicPathway
                        onReactionSelect={handleReactionSelect}
                        selectedReactions={selectedReactions}
                        knockedOutReactions={knockedOutReactions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>预期优化结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {knockedOutReactions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-gray-600">敲除组合</div>
                            <div className="font-semibold text-green-700">
                              {knockedOutReactions.join(' + ')}
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-gray-600">预期琥珀酸通量</div>
                            <div className="font-semibold text-blue-700">
                              {knockedOutReactions.includes('LDH_D') && knockedOutReactions.includes('ALCD2x')
                                ? '4.80 mmol/gDW/h'
                                : knockedOutReactions.includes('SDH')
                                ? '6.90 mmol/gDW/h'
                                : '3.25-5.95 mmol/gDW/h'
                              }
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">预期效果</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• 阻断竞争途径，重定向碳流</li>
                            <li>• 琥珀酸产量提升4-8倍</li>
                            <li>• 生长速率适度降低</li>
                            <li>• 需要进一步优化工艺条件</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        请先选择敲除反应查看预期结果
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* 终端面板 */}
          <Card>
            <CardHeader>
              <CardTitle>算法执行日志</CardTitle>
            </CardHeader>
            <CardContent>
              <TerminalPanel height={300} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
          disabled={currentStep === tutorialSteps.length - 1}
        >
          下一步
        </Button>
      </div>
    </div>
  )
}