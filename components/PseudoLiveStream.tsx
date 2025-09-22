"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Maximize, X, ExternalLink, Thermometer, Droplet, Clock, Power } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

interface PseudoLiveStreamProps {
  className?: string
}

export const PseudoLiveStream: React.FC<PseudoLiveStreamProps> = ({ className = "" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lightOn, setLightOn] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [isConnected, setIsConnected] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // 更新时间显示
  useState(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  })

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleConnection = () => {
    setIsConnected(!isConnected)
  }

  return (
    <div ref={containerRef} className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <Card className="h-full border-0 bg-transparent">
        <CardHeader className="pb-2 space-y-0 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {translate("labControlTitle", "实验室实时监控")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">{currentTime}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/experiment/real-lab-control", "_blank")}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <div className="relative h-full">
            {/* 嵌入的 real-lab-control 页面 */}
            <iframe
              src="/experiment/real-lab-control"
              className="w-full h-full border-0"
              title="实验室实时控制"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />

            {/* 连接状态覆盖层 */}
            {!isConnected && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center text-white">
                  <X className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-semibold mb-2">连接已断开</p>
                  <Button onClick={toggleConnection} className="mt-4">
                    重新连接
                  </Button>
                </div>
              </div>
            )}

            {/* 控制面板覆盖层 */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-60 rounded-lg p-3 text-white">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-blue-400" />
                  <span>23.5°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplet className="h-4 w-4 text-cyan-400" />
                  <span>65%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span>运行中</span>
                </div>
              </div>
            </div>

            {/* 快速控制 */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Power className="h-4 w-4 text-yellow-400" />
                  <span className="text-white text-sm">设备电源</span>
                  <Switch
                    checked={lightOn}
                    onCheckedChange={setLightOn}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleConnection}
                    className="bg-transparent border-gray-500 text-white hover:bg-gray-700"
                  >
                    {isConnected ? "断开" : "连接"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open("/experiment/real-lab-control", "_blank")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    详细控制
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}