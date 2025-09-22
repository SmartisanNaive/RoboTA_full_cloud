"use client"

import dynamic from "next/dynamic"

const ModuleApp = dynamic(() => import("@/RoboTA_EDU_module_0922/src/App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center text-blue-600">
      Loading RoboTA Education Module...
    </div>
  ),
})

export function RoboTaEduModule() {
  return (
    <div className="min-h-[80vh] overflow-hidden rounded-2xl border border-blue-100 bg-white/60 shadow-lg">
      <ModuleApp useHashRouting />
    </div>
  )
}
