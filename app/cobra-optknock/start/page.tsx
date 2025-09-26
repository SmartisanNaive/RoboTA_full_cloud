"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

const serverIcon = "https://unpkg.com/lucide-static@latest/icons/server-cog.svg"
const infoIcon = "https://unpkg.com/lucide-static@latest/icons/info.svg"

export default function LoadStep() {
  const router = useRouter()
  const { startStreaming, isStreaming, activeStage, isStageCompleted } = useOptKnock()

  const stageId = "load" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "重新加载环境" : "加载 CobraToolbox"

  // Auto-redirect to model step if already completed
  useEffect(() => {
    if (stageComplete) {
      router.push("/cobra-optknock/model")
    }
  }, [stageComplete, router])

  return (
    <StepLayout
      lockNext={!stageComplete}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock" label="<< 返回主页" />
          <StepNavButton href="/cobra-optknock/model" label="进入模型配置 >>" disabled={!stageComplete} />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <SectionCard title="初始化环境" icon={serverIcon}>
          <p>点击按钮触发虚拟 MATLAB 初始化，包括导入 CobraToolbox、配置 Gurobi 12 求解器与依赖检查，终端日志会记录每一步状态。</p>
          <button
            type="button"
            onClick={() => startStreaming(stageId)}
            disabled={stageRunning}
            className="cssbuttons-io-button"
          >
            <span>{buttonLabel}</span>
            <span className="icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </button>
          <p className="text-xs text-slate-600">状态：{statusLabel}</p>
        </SectionCard>

        <SectionCard title="环境信息" icon={infoIcon}>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>运行框架：CobraToolbox</li>
            <li>求解器：Gurobi 12</li>
            <li>用途：OptKnock 全流程模拟与记录</li>
            <li>说明：初始化完成后将解锁模型配置步骤</li>
          </ul>
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={240} />
      </div>
    </StepLayout>
  )
}