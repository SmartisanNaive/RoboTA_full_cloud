"use client"

import { SectionCard, StepLayout, StepNavButton } from "@/COBRA/OptKnockTeachingModule/src/components/StepLayout"
import { TerminalPanel } from "@/COBRA/OptKnockTeachingModule/src/components/TerminalPanel"
import { useOptKnock } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

const cpuIcon = "https://unpkg.com/lucide-static@latest/icons/cpu.svg"
const targetIcon = "https://unpkg.com/lucide-static@latest/icons/target.svg"

export default function OptKnockStep() {
  const { activeScenario, startStreaming, isStreaming, activeStage, isStageCompleted } = useOptKnock()

  const stageId = "optknock" as const
  const stageRunning = isStreaming && activeStage === stageId
  const stageComplete = isStageCompleted(stageId)
  const statusLabel = stageRunning ? "运行中" : stageComplete ? "完成" : "待执行"
  const buttonLabel = stageComplete ? "重新运行 OptKnock" : "执行 OptKnock"
  const knockoutLabel =
    activeScenario.recommendedKnockouts.length > 0
      ? activeScenario.recommendedKnockouts.join(" · ")
      : "(无)"

  return (
    <StepLayout
      lockNext={!stageComplete}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StepNavButton href="/cobra-optknock/select" label="<< 上一步" />
          <StepNavButton
            href="/cobra-optknock/result"
            label={stageComplete ? "查看结果 >>" : "等待日志"}
            disabled={!stageComplete}
          />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <SectionCard title="执行 OptKnock" icon={cpuIcon}>
          <p>调用 OptKnock 装置后，将构建双层优化模型并通过 Gurobi 12 求解，输出推荐的敲除集合与通量变更。</p>
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
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 text-xs text-slate-600">
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
        </SectionCard>

        <SectionCard title="操作提示" icon={targetIcon}>
          <p>建议敲除组合：{knockoutLabel}</p>
          <p>若需调整方案，请返回上一阶段重新选择反应集。</p>
          <p>运行完成后，将解锁结果摘要与报告生成步骤。</p>
        </SectionCard>
      </div>

      <div className="mt-8">
        <TerminalPanel height={300} />
      </div>
    </StepLayout>
  )
}
