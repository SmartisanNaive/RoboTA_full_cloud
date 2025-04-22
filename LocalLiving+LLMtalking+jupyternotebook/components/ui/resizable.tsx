"use client"

import * as React from "react"
import { GripVertical, GripHorizontal } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.Panel ref={ref} className={cn("relative h-full w-full overflow-auto", className)} {...props} />
))
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean
  }
>(({ className, withHandle = false, ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-blue-200 dark:bg-slate-700 transition-colors duration-150 ease-in-out data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:w-px hover:bg-blue-300 dark:hover:bg-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-4 items-center justify-center rounded-full border border-blue-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="text-blue-600 dark:text-blue-400">
          {props["data-panel-group-direction"] === "vertical" ? (
            <GripHorizontal className="h-2.5 w-2.5" />
          ) : (
            <GripVertical className="h-2.5 w-2.5" />
          )}
        </div>
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

