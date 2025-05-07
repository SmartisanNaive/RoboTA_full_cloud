"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Thermometer, Droplet, Clock, Power, ExternalLink, Maximize, X } from "lucide-react"
import Hls from "hls.js"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

// 多个直播流选项 - 按照可靠性顺序排列
const HLS_STREAMS = {
  primary: 'http://120.241.223.14/hls/stream1.m3u8',
  // 备用流选项 - 更可靠的公共测试流
  fallback1: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  // 额外备用流
  fallback2: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  // 最终备选 - 最可靠的Apple测试流
  fallback3: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
}

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
  const [streamError, setStreamError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hlsRef = useRef<Hls | null>(null)
  const [currentStream, setCurrentStream] = useState(HLS_STREAMS.primary)
  const [retryCount, setRetryCount] = useState(0)
  
  // 只在客户端处理时间
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // 尝试下一个备用流并进行连接测试
  const tryNextStream = async () => {
    // 所有可用的流选项
    const allStreams = [
      HLS_STREAMS.primary,
      HLS_STREAMS.fallback1,
      HLS_STREAMS.fallback2,
      HLS_STREAMS.fallback3
    ];
    
    // 从当前流索引开始测试后续的流
    const currentIndex = allStreams.indexOf(currentStream);
    let nextStream = currentStream; // 默认保持当前流
    let foundWorkingStream = false;
    
    // 测试后续每个流直到找到工作的
    for (let i = currentIndex + 1; i < allStreams.length; i++) {
      const streamToTest = allStreams[i];
      console.log(`测试流连接: ${streamToTest}`);
      
      const isStreamWorking = await testStreamConnection(streamToTest);
      if (isStreamWorking) {
        console.log(`找到可用的流: ${streamToTest}`);
        nextStream = streamToTest;
        foundWorkingStream = true;
        break;
      }
    }
    
    // 如果没有找到工作的流，并且我们还没有尝试所有的流，则从头开始测试
    if (!foundWorkingStream && currentIndex > 0) {
      for (let i = 0; i < currentIndex; i++) {
        const streamToTest = allStreams[i];
        console.log(`测试备用流: ${streamToTest}`);
        
        const isStreamWorking = await testStreamConnection(streamToTest);
        if (isStreamWorking) {
          console.log(`找到可用的备用流: ${streamToTest}`);
          nextStream = streamToTest;
          foundWorkingStream = true;
          break;
        }
      }
    }
    
    // 如果找到了新的工作流或者没有其他选择，应用新流
    if (nextStream !== currentStream || !foundWorkingStream) {
      console.log(`切换到${foundWorkingStream ? '工作的' : '下一个'}流地址: ${nextStream}`);
      setCurrentStream(nextStream);
      setRetryCount(0); // 重置重试计数
      
      // 需要刷新视频设置
      if (videoRef.current && hlsRef.current) {
        // 清理现有的HLS实例
        hlsRef.current.destroy();
        hlsRef.current = null;
        
        // 重置视频元素
        const video = videoRef.current;
        video.pause();
        video.src = '';
        video.load();
        
        // 重新设置
        setIsLoading(true);
        setStreamError(false);
      }
    } else {
      console.log(`保持当前流: ${currentStream}`);
    }
  }
  
  // 视频播放处理
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const setupVideo = async () => {
      try {
        const video = videoRef.current;
        if (!video) return () => {};
        
        // 重置状态
        setIsLoading(true);
        setStreamError(false);
        
        // 使用事件监听器处理状态
        const onLoadedData = () => {
          console.log("视频数据已加载");
          setIsLoading(false);
          setRetryCount(0); // 成功加载后重置重试计数
        };
        
        const onError = (e: Event) => {
          const target = e.target as HTMLVideoElement;
          const videoError = target.error;
          
          // Extract detailed error information
          let errorDetails = "未知错误";
          if (videoError) {
            const errorCodes = {
              1: "MEDIA_ERR_ABORTED - 用户中止了加载过程",
              2: "MEDIA_ERR_NETWORK - 网络错误中断了加载过程",
              3: "MEDIA_ERR_DECODE - 解码过程中发生错误",
              4: "MEDIA_ERR_SRC_NOT_SUPPORTED - 视频格式不受支持或无法使用"
            };
            errorDetails = errorCodes[videoError.code] || `错误代码: ${videoError.code}`;
            if (videoError.message) {
              errorDetails += ` - ${videoError.message}`;
            }
          }
          
          console.error("视频加载错误:", errorDetails);
          setStreamError(true);
          setIsLoading(false);
        };
        
        // 添加事件监听
        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('error', onError);
        
        // 使用HLS.js处理播放
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            // 增加错误恢复配置
            fragLoadingMaxRetry: 5,
            manifestLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 5,
            // 重试等待时间（毫秒）
            fragLoadingRetryDelay: 2000,
            manifestLoadingRetryDelay: 2000,
            levelLoadingRetryDelay: 2000,
            // 超时时间（毫秒）
            manifestLoadingTimeOut: 10000,
            fragLoadingTimeOut: 10000,
            levelLoadingTimeOut: 10000,
          });
          
          // 保存HLS实例以便清理
          hlsRef.current = hls;
          
          console.log(`尝试加载流: ${currentStream}`);
          hls.loadSource(currentStream);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MEDIA_ATTACHED, function() {
            console.log("HLS媒体已附加");
            // 尝试播放
            video.play().catch(err => {
              console.warn("自动播放失败，尝试静音播放:", err);
              video.muted = true;
              video.play().catch(muteErr => {
                console.error("静音播放仍然失败:", muteErr);
                setStreamError(true);
              });
            });
          });
          
          hls.on(Hls.Events.ERROR, function(event, data) {
            // Create a more detailed error object
            const errorInfo = {
              type: data.type,
              details: data.details,
              fatal: data.fatal ? "是" : "否",
              url: data.url || "未知",
              response: data.response ? 
                `状态码: ${data.response.code || "未知"}, 信息: ${data.response.text || "无"}` : 
                "无响应数据"
            };
            
            console.error("HLS错误详情:", errorInfo);
            
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error(`致命网络错误 (${data.details})，尝试恢复... (重试: ${retryCount + 1})`);
                  
                  if (retryCount < 3) {
                    // 记录诊断信息
                    console.log(`尝试恢复网络错误: ${data.details}, URL: ${data.url || "未知"}`);
                    // 尝试重新加载
                    hls.startLoad();
                    setRetryCount(prev => prev + 1);
                  } else {
                    // 超过重试次数，尝试使用备用流
                    console.error(`网络错误 ${data.details} 重试失败，切换到备用流`);
                    tryNextStream().catch(e => console.error("切换流失败:", e));
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error(`致命媒体错误 (${data.details})，尝试恢复...`);
                  hls.recoverMediaError();
                  break;
                default:
                  console.error(`无法恢复的HLS错误类型: ${data.type}, 详情: ${data.details}`);
                  if (retryCount < 3) {
                    // 尝试重新创建HLS实例
                    hls.destroy();
                    hlsRef.current = null;
                    
                    // 增加重试计数
                    setRetryCount(prev => prev + 1);
                    
                    // 延迟后重新设置
                    setTimeout(() => {
                      setupVideo();
                    }, 2000);
                  } else {
                    // 超过重试次数，尝试使用备用流
                    tryNextStream().catch(e => console.error("切换流失败:", e));
                  }
                  break;
              }
            } else {
              // 非致命错误，记录但不处理
              console.warn(`非致命HLS错误: ${data.details}, URL: ${data.url || "未知"}`);
            }
          });
          
          // 添加成功事件监听
          hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("HLS清单已解析，准备播放");
          });
        } 
        // 对于原生支持HLS的浏览器（如Safari）
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = currentStream;
          video.addEventListener('loadedmetadata', function() {
            video.play().catch(err => {
              console.warn("自动播放失败，尝试静音播放:", err);
              video.muted = true;
              video.play().catch(muteErr => {
                console.error("静音播放仍然失败:", muteErr);
                setStreamError(true);
              });
            });
          });
        } else {
          console.error("此浏览器既不支持HLS.js也不原生支持HLS");
          setStreamError(true);
        }
        
        // 清理函数
        return () => {
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onError);
          video.pause();
          video.src = '';
          
          // 清理HLS实例
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } catch (error) {
        console.error("视频设置错误:", error);
        setStreamError(true);
        setIsLoading(false);
        // 返回空函数以避免调用错误
        return () => {};
      }
    };
    
    // 正确处理异步清理函数
    let cleanupFn: (() => void) | undefined;
    
    setupVideo().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [currentStream, retryCount]); // 添加依赖项，当流地址或重试次数变化时重新加载

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
            <p>加载实验室直播流...</p>
          </div>
        </div>
      )}
      
      {streamError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-75 text-white p-4">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-3">视频加载失败</div>
            <p className="mb-4">无法连接到实验室摄像头流</p>
            <Button
              onClick={() => {
                setStreamError(false);
                setIsLoading(true);
                // 重置重试计数
                setRetryCount(0);
                // 测试所有可用流并选择工作的流
                tryNextStream().catch(e => console.error("重试加载流失败:", e));
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              重试连接
            </Button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls
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
          disabled={streamError || isLoading}
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
      
      {/* 时间和直播指示器 */}
      <div className="absolute top-3 left-3 flex items-center gap-3 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>LIVE</span>
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

  // 添加测试流连接状态的函数
  const testStreamConnection = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      console.warn(`测试流连接失败: ${url}`, e);
      return false;
    }
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

