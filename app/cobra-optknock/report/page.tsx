"use client"

import { useMemo } from "react"
import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"
import { baseline } from "@/COBRA/OptKnockTeachingModule/src/data"

const clipboardIcon = "https://unpkg.com/lucide-static@latest/icons/clipboard-list.svg"
const compassIcon = "https://unpkg.com/lucide-static@latest/icons/compass.svg"

export default function ReportStep() {
  const { activeScenario, startStreaming, isStreaming, activeStage, isStageCompleted, resetStreaming } = useOptKnock()

  const stageId = "report" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "刷新报告" : "生成完整报告"

  const improvement = useMemo(() => {
    const diff = activeScenario.succFlux - baseline.succFlux
    return {
      diff: diff.toFixed(2),
      fold: activeScenario.yieldImprovement.toFixed(1),
    }
  }, [activeScenario])

  return (
    <StepLayout
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock/result" label="<< 上一步" />
          <div className="flex flex-wrap items-center justify-end gap-3">
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
            <button
              onClick={() => resetStreaming()}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              重置全部流程
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="运行报告" icon={clipboardIcon} description="整合关键指标、反应集合与本次仿真配置">
          <p>场景：{activeScenario.title}</p>
          <p>琥珀酸通量提升：+{improvement.diff} mmol/gDW/h · {improvement.fold} 倍</p>
          <p>敲除组合：{activeScenario.recommendedKnockouts.join(" · ") || "(无)"}</p>
          <p>状态：{statusLabel}</p>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-slate-600">
            <p className="mb-2 text-slate-500">完整反应列表</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {activeScenario.reactions.map((rxn) => (
                <div key={rxn}>{rxn}</div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="操作说明" icon={compassIcon}>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>点击生成按钮导出完整分析记录，可复制终端内容作为附件。</li>
            <li>如需调整不同反应集，返回第一阶段重新选择。</li>
            <li>确保日志保存于 `COBRA/result.md`，便于后续追踪。</li>
          </ul>
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={280} />
      </div>
    </StepLayout>
  )
}
