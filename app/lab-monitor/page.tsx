"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, Activity, Database, AlertTriangle } from "lucide-react"
import { PseudoLiveStream } from "@/components/PseudoLiveStream"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export default function LabMonitorPage() {
  const [selectedView, setSelectedView] = useState("live")
  const { language } = useLanguage()

  // 模拟实验室数据
  const labData = {
    temperature: 23.5,
    humidity: 65,
    status: "运行中",
    lastUpdate: new Date().toLocaleString(),
    alerts: [],
    devices: {
      pipette: "正常",
      heater: "正常",
      centrifuge: "待机",
      camera: "在线"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {translate("backToHome", "返回首页")}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {translate("labMonitorTitle", "实验室监控中心")}
              </h1>
              <p className="text-gray-600 mt-1">
                {translate("labMonitorSubtitle", "实时监控实验室设备状态和实验进程")}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {translate("settings", "设置")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 主要视频区域 */}
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              <PseudoLiveStream />
            </div>
          </div>

          {/* 侧边栏信息面板 */}
          <div className="space-y-6">
            {/* 设备状态 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  {translate("deviceStatus", "设备状态")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(labData.devices).map(([device, status]) => (
                  <div key={device} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {translate(device, device)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      status === "正常" || status === "在线"
                        ? "bg-green-100 text-green-800"
                        : status === "待机"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {translate(status, status)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 环境数据 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  {translate("environmentData", "环境数据")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">温度</span>
                  <span className="font-semibold">{labData.temperature}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">湿度</span>
                  <span className="font-semibold">{labData.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">状态</span>
                  <span className="font-semibold text-green-600">{labData.status}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    {translate("lastUpdate", "最后更新")}: {labData.lastUpdate}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 警报信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  {translate("alerts", "警报")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {labData.alerts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {translate("noAlerts", "暂无警报")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {labData.alerts.map((alert, index) => (
                      <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded text-red-700">
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {translate("quickActions", "快速操作")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open("/experiment/real-lab-control", "_blank")}
                >
                  {translate("openLabControl", "打开实验室控制")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  {translate("viewLogs", "查看日志")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  {translate("exportData", "导出数据")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}