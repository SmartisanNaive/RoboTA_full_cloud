"use client"

import Link from "next/link"
import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

const chartIcon = "https://unpkg.com/lucide-static@latest/icons/line-chart.svg"
const noteIcon = "https://unpkg.com/lucide-static@latest/icons/notebook.svg"

export default function ResultStep() {
  const { activeScenario, resetStreaming, startStreaming, isStreaming, activeStage, isStageCompleted } = useOptKnock()

  const stageId = "result" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "刷新结果摘要" : "生成结果摘要"

  return (
    <StepLayout
      lockNext={!stageComplete}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock/optknock" label="<< 上一步" />
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
            <StepNavButton href="/cobra-optknock/report" label="生成报告 >>" disabled={!stageComplete} />
            <button
              onClick={() => resetStreaming()}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              重置流程
            </button>
            <Link
              href="/cobra-optknock"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              新建会话
            </Link>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="结果概要" icon={chartIcon}>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-slate-600">
            <div>
              <div className="text-slate-500">Scenario</div>
              <div className="text-lg font-semibold text-slate-900">{activeScenario.title}</div>
            </div>
            <div>
              <div className="text-slate-500">succFlux</div>
              <div className="text-lg font-semibold text-[#0A84FF]">{activeScenario.succFlux.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-500">growth</div>
              <div className="text-lg font-semibold text-[#0A84FF]">{activeScenario.growthRate.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-500">yield ×</div>
              <div className="text-lg font-semibold text-[#0A84FF]">{activeScenario.yieldImprovement.toFixed(1)}</div>
            </div>
          </div>
          <div>
            <div className="text-slate-500">敲除组合</div>
            <div className="text-sm text-slate-600">{activeScenario.recommendedKnockouts.join(" · ") || "(无)"}</div>
          </div>
          <div>
            <div className="text-slate-500">完整反应列表</div>
            <div className="mt-2 grid max-h-48 gap-1 overflow-y-auto rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-slate-600">
              {activeScenario.reactions.map((rxn) => (
                <span key={rxn}>{rxn}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">状态：{statusLabel}</p>
        </SectionCard>

        <SectionCard title="策略建议" icon={noteIcon}>
          <ol className="space-y-2 text-sm text-slate-600">
            {activeScenario.llmInsights.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ol>
          {stageRunning && <p className="text-xs text-slate-500">日志生成中，请稍候。</p>}
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={260} />
      </div>
    </StepLayout>
  )
}
