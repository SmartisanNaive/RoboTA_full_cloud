"use client"

import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

const bookIcon = "https://unpkg.com/lucide-static@latest/icons/book-open.svg"
const gridIcon = "https://unpkg.com/lucide-static@latest/icons/grid.svg"

export default function ModelStep() {
  const { activeScenario, startStreaming, isStreaming, activeStage, isStageCompleted } = useOptKnock()

  const stageId = "model" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "重新载入模型" : "载入模型"

  return (
    <StepLayout
      lockNext={!stageComplete}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock" label="<< 上一步" />
          <StepNavButton href="/cobra-optknock/select" label="选择反应集 >>" disabled={!stageComplete} />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="读取 iJO1366" icon={bookIcon}>
          <p>运行后将加载 iJO1366 模型、设置生物量目标函数，并更新关键的碳源与交换反应约束，确保 OptKnock 的基准环境一致。</p>
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
          <p className="text-xs text-slate-500">状态：{statusLabel}</p>
        </SectionCard>

        <SectionCard title="模型概览" icon={gridIcon}>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-slate-600">
            <div>
              <div className="text-slate-500">Reactions</div>
              <div className="text-lg font-semibold text-[#0A84FF]">2583</div>
            </div>
            <div>
              <div className="text-slate-500">Metabolites</div>
              <div className="text-lg font-semibold text-[#0A84FF]">1805</div>
            </div>
            <div>
              <div className="text-slate-500">Genes</div>
              <div className="text-lg font-semibold text-[#0A84FF]">1366</div>
            </div>
            <div>
              <div className="text-slate-500">Objective</div>
              <div className="text-sm text-[#0A84FF]">BIOMASS_Ec_iJO1366_core_53p95M</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>碳源：D-Glucose（下限 -10 mmol/gDW/h）</li>
            <li>氧供：EX_o2_e ≥ 0</li>
            <li>开放产物：succinate、acetate、CO₂ 等</li>
            <li>当前场景：{activeScenario.title}</li>
          </ul>
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={240} />
      </div>
    </StepLayout>
  )
}
