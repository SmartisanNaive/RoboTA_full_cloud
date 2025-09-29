import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Atom } from 'lucide-react'
import { ModulePageHeader } from '../../../components/shared/ModulePageHeader'
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator'

const TUTORIAL_PATH = '/cobra-optknock/index.html'
const LIVE_VIDEO_SOURCE = '/lab.mp4'

const introHighlights = [
  {
    title: 'Bilevel optimisation in action',
    body: 'Work through each OptKnock panel—model loading, parameter tuning, gene selection, execution, and analysis.'
  },
  {
    title: 'Terminal-first experience',
    body: 'Observe solver logs, structured outputs, and chart previews exactly as the original OptKnock tutorial intended.'
  },
  {
    title: 'Seamless module bridge',
    body: 'Pair the simulator with upstream DNA/protein modules to connect computational design with strain engineering.'
  }
]

const stageMeta = [
  {
    badge: 'Step 1',
    title: 'Interactive overview',
    subtitle: 'Get oriented inside the OptKnock simulator',
    description:
      'Use the embedded tutorial to understand the full seven-step workflow. Review the navigation tabs and familiarise yourself with the available resources before diving into detailed configuration.'
  },
  {
    badge: 'Step 2',
    title: 'Model setup',
    subtitle: 'Load the iJO1366 metabolic network and baseline constraints',
    description:
      'Inside the simulator, follow the instructions to initialise the COBRA Toolbox, configure the solver, and load the genome-scale model prior to optimisation.'
  },
  {
    badge: 'Step 3',
    title: 'Parameter tuning',
    subtitle: 'Select substrates, limits, and growth constraints',
    description:
      'Adjust feed conditions, uptake rates, and objective weights. These parameters define the search space that OptKnock will explore when identifying growth-coupled strategies.'
  },
  {
    badge: 'Step 4',
    title: 'Gene set selection',
    subtitle: 'Choose candidate reactions or genes for knockout screening',
    description:
      'Review curated gene sets and select those you wish to evaluate. The simulator will map your selection to reaction knockouts while preserving key viability constraints.'
  },
  {
    badge: 'Step 5',
    title: 'Execute OptKnock',
    subtitle: 'Run the optimisation and monitor solver progress',
    description:
      'Launch the optimisation routine, track solver output, and inspect intermediate feasibility checks. Ensure the optimisation converges before moving to the analysis panel.'
  },
  {
    badge: 'Step 6',
    title: 'Results analysis',
    subtitle: 'Inspect flux redistributions and growth coupling outcomes',
    description:
      'Use the reporting view to compare wild-type versus engineered phenotypes, review flux charts, and confirm that the strategy meets growth-coupling targets.'
  }
]

const metricCards = [
  {
    label: 'Max OD600',
    value: '0.85',
    labelClass: 'text-emerald-500',
    valueClass: 'text-emerald-700',
    background: 'bg-emerald-50'
  },
  {
    label: 'Succinate yield',
    value: '67.3 mM',
    labelClass: 'text-cyan-500',
    valueClass: 'text-cyan-700',
    background: 'bg-cyan-50'
  },
  {
    label: 'Residual glucose',
    value: '0.89 g/L',
    labelClass: 'text-blue-500',
    valueClass: 'text-blue-700',
    background: 'bg-blue-50'
  },
  {
    label: 'Productivity',
    value: '1.2 g/L·h',
    labelClass: 'text-amber-500',
    valueClass: 'text-amber-700',
    background: 'bg-amber-50'
  }
]

const steps = [
  'Overview',
  'Model setup',
  'Parameter tuning',
  'Gene set selection',
  'Execute OptKnock',
  'Results analysis',
  'Automated execution'
]

const LiveVideoFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const ensurePlayback = () => {
      video.play().catch(() => setIsPlaying(false))
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      video.currentTime = 0
      ensurePlayback()
    }

    video.muted = true
    video.loop = false
    ensurePlayback()

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  return (
    <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-lg overflow-hidden">
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
        Live feed
      </div>
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 text-white">
          <div className="rounded-xl bg-slate-800/80 px-6 py-4 text-center shadow-lg">
            <p className="text-sm font-medium">Stream paused</p>
            <p className="mt-2 text-xs text-slate-300">Tap to resume real-time preview</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={LIVE_VIDEO_SOURCE}
        playsInline
        muted
        autoPlay
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-emerald-700 shadow">
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        Automated bioreactor monitoring
      </div>
    </div>
  )
}

const MetricsGrid: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 text-center text-sm font-semibold">
    {metricCards.map(card => (
      <div key={card.label} className={`rounded-xl ${card.background} py-4 shadow-sm`}>
        <p className={`text-xs uppercase tracking-wide ${card.labelClass}`}>{card.label}</p>
        <p className={`text-2xl ${card.valueClass}`}>{card.value}</p>
      </div>
    ))}
  </div>
)

const ResultsMetricsPanel: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
    <h3 className="text-base font-semibold text-emerald-700">Key run metrics</h3>
    <div className="mt-4">
      <MetricsGrid />
    </div>
    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
      {message}
    </div>
  </div>
)

const AutomationStage: React.FC = () => (
  <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-100/60 to-slate-50 shadow-2xl p-8 space-y-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Step 7 · Automated execution
            </span>
            <span className="text-sm font-medium text-emerald-600">Automated bioreactor cultivation and data capture</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Automated Experiment Execution</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Deploy the OptKnock strategy on the bioreactor hardware. Live telemetry, culture conditions, and productivity metrics are streamed from the automation layer so you can validate the computational design before moving to scale-up.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-emerald-700">Experiment design</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Culture conditions</p>
              <ul className="mt-2 space-y-1">
                <li>Temperature: 37 °C</li>
                <li>pH: 7.0 ± 0.1</li>
                <li>Dissolved oxygen: 30%</li>
                <li>Agitation: 200 rpm</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Monitoring signals</p>
              <ul className="mt-2 space-y-1">
                <li>Optical density (OD600)</li>
                <li>Biomass capacitance</li>
                <li>Off-gas CO2 / O2 ratio</li>
                <li>Culture temperature</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Run profile</p>
              <ul className="mt-2 space-y-1">
                <li>Duration: 48 hours</li>
                <li>Feeding: exponential, 0.4 h⁻¹</li>
                <li>Sampling: every 4 hours</li>
                <li>Replicates: triplicate run</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
              Start automated execution
            </button>
            <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">Robot state: ONLINE · Control loop stable</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <LiveVideoFeed />
      </div>
    </div>

    <ResultsMetricsPanel message="✅ Automated validation successful. Growth-coupled production remains within ±4.1% of the simulated optimum, confirming deployment readiness." />

    <div className="flex justify-end">
      <button className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
        Proceed to downstream optimisation
      </button>
    </div>
  </div>
)

const SimulatorInstructions: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  const stage = stageMeta[stepIndex]

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-sm space-y-6">
      {stepIndex === 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Embedded experience</p>
              <p className="text-slate-600 text-sm">
                The OptKnock tutorial runs directly below. Use the in-simulator navigation to move across steps 1–6 and return here when you are ready for automation.
              </p>
            </div>
            <a
              href={TUTORIAL_PATH}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:text-blue-700"
            >
              Launch full-screen view
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </>
      )}

      {stepIndex === 5 && (
        <ResultsMetricsPanel message="✅ Optimisation completed. Review the flux distributions and coupling metrics, then continue to Step 7 for automated validation." />
      )}
    </div>
  )
}

export const Module4Home: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    setCurrentStep(prev => (prev === steps.length - 1 ? prev : prev + 1))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => (prev === 0 ? prev : prev - 1))
  }

  const isSimulatorStage = currentStep <= 5

  const nextButtonLabel = currentStep === steps.length - 1
    ? 'Restart module'
    : currentStep === 5
    ? 'Move to Step 7 · Automated execution'
    : 'Next step'

  const handlePrimaryAction = () => {
    if (currentStep === steps.length - 1) {
      setCurrentStep(0)
    } else {
      handleNext()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <ModulePageHeader
        icon={Atom}
        title="Module 4 · COBRA OptKnock Tutorial"
        subtitle="Combine bilevel optimisation theory with a preserved terminal-first simulation experience"
        gradientFrom="from-slate-700"
        gradientTo="to-blue-600"
        iconGradientFrom="from-blue-500"
        iconGradientTo="to-slate-600"
        accentDotColor="bg-emerald-400"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={isSimulatorStage ? `stage-${currentStep}` : 'automation'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-8"
        >
          <SimulatorInstructions stepIndex={currentStep} />
        </motion.div>
      </AnimatePresence>

      <div className="rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-white">
        <iframe
          src={TUTORIAL_PATH}
          title="COBRA OptKnock interactive tutorial"
          className="w-full"
          style={{ minHeight: '900px' }}
        />
      </div>
    </div>
  )
}
