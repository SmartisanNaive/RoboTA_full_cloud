"use client"

import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { ScenarioSelector } from "@/COBRA/OptKnockTeachingModule/src/components/ScenarioSelector"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

const filterIcon = "https://unpkg.com/lucide-static@latest/icons/filter.svg"
const listIcon = "https://unpkg.com/lucide-static@latest/icons/list.svg"

export default function SelectStep() {
  const { activeScenario, startStreaming, isStreaming, activeStage, isStageCompleted } = useOptKnock()

  const stageId = "select" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "重新确认方案" : "确认当前方案"

  return (
    <StepLayout
      lockNext={!stageComplete}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock/model" label="<< 上一步" />
          <StepNavButton href="/cobra-optknock/optknock" label="运行 OptKnock >>" disabled={!stageComplete} />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <SectionCard title="选择反应集" icon={filterIcon}>
          <p>点击卡片浏览不同敲除组合，确认后系统会写入配置并输出关键指标，为 OptKnock 运行做准备。</p>
          <ScenarioSelector />
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

        <SectionCard title="方案速览" icon={listIcon}>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-slate-500">场景</div>
              <div className="text-lg font-semibold text-slate-900">{activeScenario.title}</div>
            </div>
            <div>
              <div className="text-slate-500">说明</div>
              <div>{activeScenario.subtitle}</div>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700">
              <div>
                <div className="text-slate-500">succFlux</div>
                <div className="text-base font-semibold text-[#0A84FF]">{activeScenario.succFlux.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500">growth</div>
                <div className="text-base font-semibold text-[#0A84FF]">{activeScenario.growthRate.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500">yield ×</div>
                <div className="text-base font-semibold text-[#0A84FF]">{activeScenario.yieldImprovement.toFixed(1)}</div>
              </div>
            </div>
            <div>
              <div className="text-slate-500">完整反应列表</div>
              <div className="mt-2 grid max-h-48 gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700">
                {activeScenario.reactions.map((rxn) => (
                  <span key={rxn}>{rxn}</span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={260} />
      </div>
    </StepLayout>
  )
}
