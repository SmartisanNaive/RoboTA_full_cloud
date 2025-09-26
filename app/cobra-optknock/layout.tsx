"use client"

import type { ReactNode } from "react"
import { OptKnockProvider } from "@/COBRA/OptKnockTeachingModule/src/OptKnockContext"

export default function CobraOptKnockLayout({ children }: { children: ReactNode }) {
  return <OptKnockProvider>{children}</OptKnockProvider>
}
