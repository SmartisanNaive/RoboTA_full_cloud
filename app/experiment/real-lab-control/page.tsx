"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Thermometer, Droplet, Clock, Power, ExternalLink, Maximize, X } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

// 本地视频文件路径
const VIDEO_SOURCE = '/bf6b192afab4e4a5678859c855f116cf.mp4'

interface VideoFeedProps {
  lightOn: boolean;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ lightOn }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomActive, setZoomActive] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 只在客户端处理时间
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // 简化的视频播放处理
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const video = videoRef.current;
    if (!video) return;

    // 重置状态
    setIsLoading(true);

    // 设置视频源和循环播放
    video.src = VIDEO_SOURCE;
    video.loop = true;

    // 事件监听器
    const onLoadedData = () => {
      console.log("视频数据已加载");
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error("视频加载错误:", target.error);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onTimeUpdate = () => {
      // 当视频接近结束时（最后5秒），重新开始播放以模拟直播
      if (video.duration && video.currentTime > video.duration - 5) {
        video.currentTime = 0;
        video.play().catch(e => console.warn("自动重新播放失败:", e));
      }
    };

    // 添加事件监听
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);

    // 尝试自动播放（静音以避免浏览器限制）
    video.muted = true;
    video.play().catch(err => {
      console.warn("自动播放失败，需要用户手动播放:", err);
      setIsLoading(false);
    });

    // 清理函数
    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.pause();
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // 退出全屏时也退出缩放模式
    if (!isFullscreen === false) {
      setZoomActive(false)
      setZoomLevel(1)
    }
  }

  const toggleZoom = () => {
    if (zoomActive) {
      // 退出缩放模式
      setZoomActive(false)
      setZoomLevel(1)
    } else {
      // 进入缩放模式
      setZoomActive(true)
      setZoomLevel(2)
    }
  }

  const handleZoomIn = () => {
    if (zoomLevel < 4) {
      setZoomLevel(prevLevel => prevLevel + 0.5)
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prevLevel => Math.max(1, prevLevel - 0.5))
      if (zoomLevel - 0.5 <= 1) {
        setZoomActive(false)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomActive || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;
    
    setZoomPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }

  const videoStyle = zoomActive ? {
    transform: `scale(${zoomLevel})`,
    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
    transition: 'transform-origin 0.1s ease-out'
  } : {};

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden" 
      style={{ paddingTop: isFullscreen ? "75%" : "56.25%" }}
      onMouseMove={handleMouseMove}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 text-white rounded-lg z-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>加载实验室实时监控...</p>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white p-4">
          <div className="text-center">
            <div className="text-yellow-400 text-xl mb-3">视频已暂停</div>
            <p className="mb-4">点击播放按钮开始实时监控</p>
            <Button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.error("播放失败:", e));
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              播放视频
            </Button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute top-0 left-0 w-full h-full rounded-lg object-cover ${zoomActive ? 'cursor-zoom-in' : ''}`}
        style={{
          ...videoStyle,
          filter: lightOn ? "brightness(1.3)" : "none"
        }}
      />
      
      {/* 控制按钮组 */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-black/50 hover:bg-black/70 border-0 text-white rounded-full h-10 w-10"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <X size={18} /> : <Maximize size={18} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={`bg-black/50 hover:bg-black/70 border-0 text-white rounded-full h-10 w-10 ${zoomActive ? 'bg-blue-500/70' : ''}`}
          onClick={toggleZoom}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </Button>
      </div>
      
      {/* 放大/缩小控制器 - 仅在缩放模式激活时显示 */}
      {zoomActive && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 rounded-full p-1 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-black/70"
            onClick={handleZoomOut}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </Button>
          <span className="text-white text-xs">{zoomLevel.toFixed(1)}x</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-black/70"
            onClick={handleZoomIn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </Button>
        </div>
      )}
      
      {/* 提示信息 - 仅在缩放模式激活时显示 */}
      {zoomActive && (
        <div className="absolute top-14 left-3 bg-black/50 px-3 py-1 rounded-full text-white text-xs z-10">
          移动鼠标以查看不同区域
        </div>
      )}
      
      {/* 时间和监控指示器 */}
      <div className="absolute top-3 left-3 flex items-center gap-3 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span>{isPlaying ? '监控中' : '待机'}</span>
        </div>
        <span>{currentTime}</span>
      </div>
    </div>
  )
}

export default function RealLabControl() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lightOn, setLightOn] = useState(false)
  const [currentTemp, setCurrentTemp] = useState(25.0)
  const [currentHumidity, setCurrentHumidity] = useState(50.0)
  const [runningTime, setRunningTime] = useState(0)
  const [environmentData, setEnvironmentData] = useState<Array<{time: number; realTime: string; temperature: number; humidity: number}>>([])
  const [showIntro, setShowIntro] = useState(true)
  const [currentDateTime, setCurrentDateTime] = useState({ date: "", time: "" })
  const { language } = useLanguage()

  useEffect(() => {
    // 初始化客户端时间，避免水合错误
    setCurrentDateTime({
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    
    const timer = setInterval(() => {
      if (isMonitoring) {
        setRunningTime((prev) => prev + 1)
        updateEnvironmentData()
      }
      setCurrentDateTime({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });
    }, 1000)

    return () => clearInterval(timer)
  }, [isMonitoring])

  const updateEnvironmentData = () => {
    // 确保仅在客户端运行
    if (typeof window === 'undefined') return;
    
    // Simulate reading from sensors
    const newTemp = currentTemp + (Math.random() * 0.6 - 0.3)
    const newHumidity = currentHumidity + (Math.random() * 1.4 - 0.7)
    
    setCurrentTemp(parseFloat(newTemp.toFixed(1)))
    setCurrentHumidity(parseFloat(newHumidity.toFixed(1)))
    
    // Get current time for data point
    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    
    setEnvironmentData((prev) => [
      ...prev.slice(-29),
      {
        time: runningTime,
        realTime: currentTime,
        temperature: parseFloat(newTemp.toFixed(1)),
        humidity: parseFloat(newHumidity.toFixed(1)),
      },
    ])
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  
  return (
    <div className="bg-blue-50 min-h-screen">
      <div className="container mx-auto p-4">
        {showIntro && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-700">{translate('welcomeRealLab', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">
                {translate('realLabIntro', language)}
              </p>
              <Button 
                variant="outline" 
                className="mt-4 text-blue-600 border-blue-300"
                onClick={() => setShowIntro(false)}
              >
                {translate('gotItButton', language)}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">{translate('realLabTitle', language)}</h1>
              <p className="text-gray-600 text-sm">{translate('realLabSubtitle', language)}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  {currentDateTime.date} {currentDateTime.time}
                </p>
                <a 
                  href="https://docs.google.com/presentation/d/1BDt1BHWNa7s3KH5coSEJfWW6wu1ZIRD4uxe4SwK353o/edit?slide=id.g2d95c265cf8_0_209#slide=id.g2d95c265cf8_0_209" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 text-sm hover:underline flex items-center"
                >
                  {translate('learnMoreLabAutomationLink', language)}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Video Feed */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex justify-between items-center text-blue-800">
                      <span>{translate('realTimeMonitoring', language)}</span>
                      <span className="text-sm text-blue-600">{translate('experimentCameraLive', language)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 relative">
                    <VideoFeed lightOn={lightOn} />
                  </CardContent>
                </Card>
              </div>

              {/* Status Panel */}
              <div className="space-y-8">
                <Card className="border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-blue-800">{translate('status', language)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Thermometer className="text-blue-500" />
                        <span>{translate('currentTemperature', language)}</span>
                      </div>
                      <span className="font-medium text-blue-700">{currentTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplet className="text-blue-500" />
                        <span>{translate('currentHumidity', language)}</span>
                      </div>
                      <span className="font-medium text-blue-700">{currentHumidity.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="text-blue-500" />
                        <span>{translate('runningTime', language)}</span>
                      </div>
                      <span className="font-medium text-blue-700">{formatTime(runningTime)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                      <span>{translate('lightingStatus', language)}</span>
                      <span className="font-medium text-blue-700">{lightOn ? translate('on', language) : translate('off', language)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Control Panel */}
                <Card className="border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-800">{translate('controlPanel', language)}</CardTitle>
                    <p className="text-sm text-green-600">{translate('controlPanelDescription', language)}</p>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Power className={`${lightOn ? "text-green-500" : "text-gray-400"}`} />
                        <span>{translate('lighting', language)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${lightOn ? "text-green-600" : "text-gray-500"}`}>
                          {lightOn ? translate('on', language) : translate('off', language)}
                        </span>
                        <Switch 
                          checked={lightOn} 
                          onCheckedChange={setLightOn}
                          className="data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setIsMonitoring(!isMonitoring)}
                    >
                      {isMonitoring ? translate('stopMonitoring', language) : translate('startMonitoring', language)}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Environment Data Charts */}
              <Card className="lg:col-span-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-800">{translate('environmentDataMonitoring', language)}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={environmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="realTime" />
                      <YAxis yAxisId="temp" domain={[24, 26]} />
                      <YAxis yAxisId="humidity" orientation="right" domain={[45, 55]} />
                      <Tooltip />
                      <Area
                        yAxisId="temp"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name={translate('temperature', language)}
                      />
                      <Area
                        yAxisId="humidity"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                        name={translate('humidity', language)}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

