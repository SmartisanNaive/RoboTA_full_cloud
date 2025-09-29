import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Atom } from 'lucide-react';
import { ModulePageHeader } from '../../../components/shared/ModulePageHeader';

const TUTORIAL_PATH = '/cobra-optknock/index.html';

const LIVE_VIDEO_SOURCE = '/lab.mp4';

const LiveVideoFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const ensurePlayback = () => {
      video.play().catch(() => setIsPlaying(false));
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      video.currentTime = 0;
      ensurePlayback();
    };

    video.muted = true;
    video.loop = false;
    ensurePlayback();

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-lg overflow-hidden">
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
        Live Feed
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
  );
};

const SparkLine: React.FC<{ colorFrom: string; colorTo: string; title: string; valueLabel: string; }> = ({
  colorFrom,
  colorTo,
  title,
  valueLabel,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <svg viewBox="0 0 240 110" className="mt-3 h-40 w-full">
        <defs>
          <linearGradient id={`line-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
          <linearGradient id={`area-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colorTo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M20 80 L70 60 L120 45 L170 32 L220 20" stroke={`url(#line-${title})`} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M20 80 L70 60 L120 45 L170 32 L220 20 L220 90 L20 90 Z" fill={`url(#area-${title})`} />
      </svg>
      <p className="mt-2 text-xs font-medium text-slate-500">{valueLabel}</p>
    </div>
  );
};

export const Module4Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white/90 border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
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
        <motion.p
          className="text-slate-600 text-lg text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        >
          Dive into the original OptKnock interactive simulator. The experience retains the classic terminal-driven workflow
          while blending with the SynbioCloudLab learning environment so you can experiment, analyse, and iterate without
          leaving the module.
        </motion.p>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Bilevel optimisation in action',
              body: 'Work through each OptKnock step—model loading, parameter setup, optimisation and analysis—with contextual guidance.'
            },
            {
              title: 'Terminal-first experience',
              body: 'Observe detailed solver logs, structured outputs and chart previews exactly as the standalone tutorial intended.'
            },
            {
              title: 'Seamless module bridge',
              body: 'Use this simulator alongside upstream DNA/protein modules to connect computational design with strain engineering.'
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Launch the sandbox</p>
            <p className="text-slate-600 text-sm">
              Open the simulator in a dedicated tab if you prefer a full-screen terminal view or want to follow along
              with external notes.
            </p>
          </div>
          <a
            href={TUTORIAL_PATH}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:text-blue-700"
          >
            Open in new tab
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-white">
        <iframe
          src={TUTORIAL_PATH}
          title="COBRA OptKnock interactive tutorial"
          className="w-full"
          style={{ minHeight: '900px' }}
        />
      </div>

      <motion.div
        className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-100/60 to-slate-50 shadow-2xl p-8 space-y-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
                  步骤 7 · 自动化实验执行
                </span>
                <span className="text-sm font-medium text-emerald-600">Automated bioreactor cultivation and data capture</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Automated Experiment Execution</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                The OptKnock strategy is now deployed on the bioreactor. Live telemetry, culture conditions, and
                productivity metrics are streamed from the automation layer so you can validate the design before moving to scale-up.
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
                    <li>Feeding: exponential, 0.4 h^-1</li>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
            <SparkLine
              colorFrom="#22c55e"
              colorTo="#0ea5e9"
              title="Growth profile"
              valueLabel="Real-time OD600 readings (log phase)"
            />
            <SparkLine
              colorFrom="#6366f1"
              colorTo="#22d3ee"
              title="Product formation"
              valueLabel="Succinate productivity trajectory (mmol gDW^-1 h^-1)"
            />
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-emerald-700">Run summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm font-semibold">
              <div className="rounded-xl bg-emerald-50 py-4 text-emerald-700 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-emerald-500">Max OD</p>
                <p className="text-2xl">0.85</p>
              </div>
              <div className="rounded-xl bg-cyan-50 py-4 text-cyan-700 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-cyan-500">Succinate yield</p>
                <p className="text-2xl">67.3 mM</p>
              </div>
              <div className="rounded-xl bg-blue-50 py-4 text-blue-700 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-blue-500">Residual glucose</p>
                <p className="text-2xl">0.89 g/L</p>
              </div>
              <div className="rounded-xl bg-amber-50 py-4 text-amber-700 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-amber-500">Productivity</p>
                <p className="text-2xl">1.2 g/L·h</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
              ✅ Experiment validation successful. The automated run confirms growth-coupled production at the predicted
              yield. Deviations remain within ±4.1% of the simulation blueprint.
            </div>
            <button className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              Proceed to optimisation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
