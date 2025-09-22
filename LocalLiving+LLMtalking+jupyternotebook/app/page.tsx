"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, Moon, Sun, LayoutGrid, Bell, BellOff, Settings, Zap, Clock, Laptop, ZoomIn, ZoomOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Hls from "hls.js"

export default function LabDashboard() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [jupyterLoading, setJupyterLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [systemStatus, setSystemStatus] = useState("Running normally")
  const [panelSizes, setPanelSizes] = useState({ left: 60, right: 40 })
  const [rightPanelSizes, setRightPanelSizes] = useState({ top: 65, bottom: 35 })
  const [activeTab, setActiveTab] = useState("monitor")
  const [jupyterTab, setJupyterTab] = useState("clusters")
  const [jupyterServerUrl, setJupyterServerUrl] = useState("http://localhost:8888")
  const [showJupyterConfig, setShowJupyterConfig] = useState(false)
  const [useCorsProxy, setUseCorsProxy] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [showJupyterPanel, setShowJupyterPanel] = useState(true)

  // Update current time - only on client side
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const resetLayout = () => {
    setActivePanel(null)
    setIsFullscreen(false)
    setPanelSizes({ left: 60, right: 40 })
    setRightPanelSizes({ top: 65, bottom: 35 })
  }

  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes({ left: sizes[0], right: sizes[1] })
  }

  const handleRightPanelResize = (sizes: number[]) => {
    setRightPanelSizes({ top: sizes[0], bottom: sizes[1] })
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-blue-50 dark:bg-blue-950">
      <header className="bg-white dark:bg-blue-900 shadow-sm px-4 py-3 border-b border-blue-100 dark:border-blue-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 dark:bg-blue-500 text-white p-1.5 rounded-md">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">Laboratory Dashboard</h1>
              <p className="text-xs text-blue-500 dark:text-blue-400">{formatDate(currentTime)}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 bg-blue-50 dark:bg-blue-800 rounded-md px-2 py-1">
            <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{formatTime(currentTime)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetLayout}
                    className="border-blue-200 dark:border-blue-700"
                  >
                    <LayoutGrid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Layout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNotifications(!notifications)}
                    className="border-blue-200 dark:border-blue-700"
                  >
                    {notifications ? (
                      <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <BellOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{notifications ? "Turn off notifications" : "Turn on notifications"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="border-blue-200 dark:border-blue-700"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-blue-200 dark:border-blue-700">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Refresh All Panels</DropdownMenuItem>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden">
        {isFullscreen ? (
          // Fullscreen mode
          <div className="h-full">
            {activePanel === "chat" && (
              <DifyPanel
                isFullscreen={true}
                onToggleFullscreen={() => {
                  setActivePanel(null)
                  setIsFullscreen(false)
                }}
              />
            )}
            {activePanel === "video" && (
              <VideoPanel
                isFullscreen={true}
                onToggleFullscreen={() => {
                  setActivePanel(null)
                  setIsFullscreen(false)
                }}
              />
            )}
            {activePanel === "jupyter" && (
              <JupyterPanel
                isFullscreen={true}
                onToggleFullscreen={() => {
                  setActivePanel(null)
                  setIsFullscreen(false)
                }}
                isLoading={jupyterLoading}
                onLoad={() => setJupyterLoading(false)}
                activeTab={jupyterTab}
                onTabChange={setJupyterTab}
                serverUrl={jupyterServerUrl}
                onConfigClick={() => setShowJupyterConfig(true)}
                useCorsProxy={useCorsProxy}
                authToken={authToken}
              />
            )}
          </div>
        ) : (
          // Normal mode - using resizable panels
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes) => handlePanelResize(sizes)}
            className="h-full rounded-lg"
          >
            {/* Left side Robot Teach Assistant panel */}
            <ResizablePanel defaultSize={panelSizes.left} minSize={30}>
              <DifyPanel
                isFullscreen={false}
                onToggleFullscreen={() => {
                  setActivePanel("chat")
                  setIsFullscreen(true)
                }}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right side panels */}
            {activePanel === "jupyter" ? (
              <ResizablePanel defaultSize={rightPanelSizes.bottom} minSize={20}>
                <JupyterPanel
                  isFullscreen={true}
                  onToggleFullscreen={() => setActivePanel(null)}
                  isLoading={jupyterLoading}
                  onLoad={() => setJupyterLoading(false)}
                  activeTab={jupyterTab}
                  onTabChange={setJupyterTab}
                  serverUrl={jupyterServerUrl}
                  onConfigClick={() => setShowJupyterConfig(true)}
                  useCorsProxy={useCorsProxy}
                  authToken={authToken}
                  onToggleVisibility={() => setShowJupyterPanel(!showJupyterPanel)}
                  isVisible={showJupyterPanel}
                />
              </ResizablePanel>
            ) : (
            <ResizablePanel defaultSize={panelSizes.right} minSize={30}>
              {showJupyterPanel ? (
                <ResizablePanelGroup
                  direction="vertical"
                  onLayout={(sizes) => handleRightPanelResize(sizes)}
                  className="h-full"
                >
                  {/* Video monitoring panel - top */}
                  <ResizablePanel defaultSize={rightPanelSizes.top} minSize={20}>
                    <VideoPanel
                      isFullscreen={false}
                      onToggleFullscreen={() => {
                        setActivePanel("video")
                        setIsFullscreen(true)
                      }}
                      onToggleJupyter={() => setShowJupyterPanel(!showJupyterPanel)}
                      showJupyter={showJupyterPanel}
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  {/* Jupyter Notebook panel - bottom */}
                  <ResizablePanel defaultSize={rightPanelSizes.bottom} minSize={20}>
                    <JupyterPanel
                      isFullscreen={false}
                      onToggleFullscreen={() => setActivePanel("jupyter")}
                      isLoading={jupyterLoading}
                      onLoad={() => setJupyterLoading(false)}
                      activeTab={jupyterTab}
                      onTabChange={setJupyterTab}
                      serverUrl={jupyterServerUrl}
                      onConfigClick={() => setShowJupyterConfig(true)}
                      useCorsProxy={useCorsProxy}
                      authToken={authToken}
                      onToggleVisibility={() => setShowJupyterPanel(!showJupyterPanel)}
                      isVisible={showJupyterPanel}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                // Show only video panel when Jupyter is hidden
                <VideoPanel
                  isFullscreen={false}
                  onToggleFullscreen={() => {
                    setActivePanel("video")
                    setIsFullscreen(true)
                  }}
                  onToggleJupyter={() => setShowJupyterPanel(!showJupyterPanel)}
                  showJupyter={showJupyterPanel}
                />
              )}
            </ResizablePanel>
            )}
          </ResizablePanelGroup>
        )}
      </main>

      <footer className="bg-white dark:bg-blue-900 text-xs py-2 text-blue-500 dark:text-blue-300 border-t border-blue-100 dark:border-blue-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Laboratory Dashboard © 2025. For issues, please contact gaoyuanbio@qq.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>
              System Status: <span className="text-green-500 dark:text-green-400">Running normally</span>
            </span>
            <span>Version: 1.2.0</span>
          </div>
        </div>
      </footer>

      {/* Jupyter Configuration Dialog */}
      <Dialog open={showJupyterConfig} onOpenChange={setShowJupyterConfig}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blue-700 dark:text-blue-300">Jupyter Server Configuration</DialogTitle>
            <DialogDescription className="text-blue-600/80 dark:text-blue-400/80">
              Configure the connection to your Jupyter Notebook server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="server-url" className="text-right text-blue-700 dark:text-blue-300">
                Server URL
              </Label>
              <Input
                id="server-url"
                value={jupyterServerUrl}
                onChange={(e) => setJupyterServerUrl(e.target.value)}
                className="col-span-3 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
                placeholder="http://hostname:port"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-blue-700 dark:text-blue-300">
                Presets
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setJupyterServerUrl("http://localhost:8888")}
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  localhost:8888
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setJupyterServerUrl("http://127.0.0.1:8888")}
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  127.0.0.1:8888
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setJupyterServerUrl("http://10.31.2.161:8888")}
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  10.31.2.161:8888
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setJupyterServerUrl("http://10.31.2.161:48888")}
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  10.31.2.161:48888
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auth-token" className="text-right text-blue-700 dark:text-blue-300">
                Auth Token
              </Label>
              <Input
                id="auth-token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Optional: your_token_here"
                className="col-span-3 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-blue-700 dark:text-blue-300">
                CORS Proxy
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use-cors-proxy"
                  checked={useCorsProxy}
                  onChange={(e) => setUseCorsProxy(e.target.checked)}
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="use-cors-proxy" className="text-sm font-normal text-blue-700 dark:text-blue-300">
                  Use CORS proxy (helps with connection issues)
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setJupyterLoading(true);
                setShowJupyterConfig(false);
                // Reset error state to trigger a new connection attempt
                if (useCorsProxy || authToken.trim() !== '') {
                  setJupyterLoading(true);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Robot Teach Assistant panel component
function DifyPanel({ isFullscreen, onToggleFullscreen }: { isFullscreen: boolean; onToggleFullscreen: () => void }) {
  const [isClient, setIsClient] = useState(false)
  const [showDelayNotice, setShowDelayNotice] = useState(true)
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <Card className="h-full border-blue-200 dark:border-blue-900 bg-white dark:bg-blue-900 transition-all duration-300 ease-in-out overflow-hidden shadow-md">
      <div className="flex justify-between items-center p-3 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
          <h2 className="font-semibold text-blue-700 dark:text-blue-300">Robot Teach Assistant</h2>
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
          >
            Online
          </Badge>
          {showDelayNotice && (
            <div className="ml-2 flex items-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-2 py-0.5">
              <span className="text-xs text-amber-700 dark:text-amber-400 mr-2">Please be patient, there may be a few seconds of control delay</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDelayNotice(false)} 
                className="h-5 text-xs px-2 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800"
              >
                I got it
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleFullscreen}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <CardContent className="p-0 h-[calc(100%-49px)] bg-blue-50/50 dark:bg-blue-900/50">
        {isClient ? (
          <iframe
            src="http://localhost/chat/HsNhbMuLPJPbwuUV"
            className="w-full h-full border-0"
            title="Robot Teach Assistant"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="text-blue-600 dark:text-blue-400">Loading Robot Teach Assistant...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Video Feed component for HLS streaming
export const VideoFeed = ({ lightOn = true }: { lightOn?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // HLS stream sources
  const HLS_STREAMS = {
    primary: 'http://120.241.223.14/hls/stream1.m3u8',
    fallback1: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    fallback2: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    fallback3: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
  };
  
  const streamList = [
    HLS_STREAMS.primary,
    HLS_STREAMS.fallback1,
    HLS_STREAMS.fallback2,
    HLS_STREAMS.fallback3
  ];

  // Test if a stream is accessible
  const testStreamConnection = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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
  };

  // Try next stream in the list when current fails
  const tryNextStream = async () => {
    if (currentStream < streamList.length - 1) {
      const nextStream = currentStream + 1;
      setCurrentStream(nextStream);
      setRetryCount(0);
      console.log(`Switching to fallback stream #${nextStream}: ${streamList[nextStream]}`);
    } else {
      setError("All video streams failed. Please check your connection.");
    }
  };

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    let hls: Hls | null = null;
    
    const initializeHls = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const streamUrl = streamList[currentStream];
        
        // Test stream connection before initializing HLS
        const isStreamAccessible = await testStreamConnection(streamUrl);
        if (!isStreamAccessible) {
          throw new Error("Stream not accessible");
        }
        
        if (Hls.isSupported()) {
          hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            enableWorker: true,
          });
          
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.warn("Autoplay prevented:", e));
            setIsLoading(false);
          });
          
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error:", data);
                  if (retryCount < 3) {
                    hls?.destroy();
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => initializeHls(), 2000);
                  } else {
                    tryNextStream();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error:", data);
                  hls?.recoverMediaError();
                  break;
                default:
                  hls?.destroy();
                  setError(`Video playback error: ${data.details}`);
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari which has native HLS support
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(e => console.warn("Autoplay prevented:", e));
            setIsLoading(false);
          });
          
          video.addEventListener('error', () => {
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              setTimeout(() => initializeHls(), 2000);
            } else {
              tryNextStream();
            }
          });
        } else {
          setError("Your browser doesn't support HLS video playback.");
        }
      } catch (err) {
        console.error("Error initializing HLS:", err);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => initializeHls(), 2000);
        } else {
          tryNextStream();
        }
      }
    };
    
    initializeHls();
    
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [currentStream, retryCount]);

  // Handle zoom controls
  const increaseZoom = () => {
    if (zoomLevel < 4) {
      setZoomLevel(prev => prev + 1);
    }
  };
  
  const decreaseZoom = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => prev - 1);
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <p className="text-blue-300">Connecting to video stream...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="bg-black/80 p-4 rounded-lg max-w-xs text-center">
            <div className="text-red-500 mb-2">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-white text-sm mb-3">{error}</p>
            <Button
              variant="outline"
              className="text-xs text-blue-300 border-blue-700 hover:bg-blue-900"
              onClick={() => {
                setRetryCount(0);
                setError(null);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      <div 
        className="h-full w-full overflow-hidden"
        style={{ 
          filter: lightOn ? 'brightness(100%)' : 'brightness(70%)',
        }}
      >
        <div 
          className="relative h-full w-full"
          style={{ 
            overflow: 'hidden',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            playsInline
            muted
            autoPlay
          />
        </div>
        
        {!isLoading && !error && (
          <>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-md flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>Live Monitor • {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-md flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Camera: {currentStream === 0 ? 'Primary' : `Fallback ${currentStream}`}</span>
            </div>
            
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white rounded-md flex items-center">
              <div className="flex items-center px-2">
                <span className="text-xs">Zoom:</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-black/80"
                onClick={decreaseZoom}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="px-2 flex items-center text-xs">
                {zoomLevel}x
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-black/80"
                onClick={increaseZoom}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Video monitoring panel component
function VideoPanel({ 
  isFullscreen, 
  onToggleFullscreen,
  onToggleJupyter,
  showJupyter
}: { 
  isFullscreen: boolean; 
  onToggleFullscreen: () => void;
  onToggleJupyter?: () => void;
  showJupyter?: boolean;
}) {
  const [temperature, setTemperature] = useState<number | null>(null)
  const [recordingStatus, setRecordingStatus] = useState("Recording")
  const [isClient, setIsClient] = useState(false)
  const [lightOn, setLightOn] = useState(true)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    // Initialize temperature on client-side only
    setTemperature(+(Math.random() * 2 + 23).toFixed(1))
  }, [])

  // Simulate temperature changes - client-side only
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setTemperature(+(Math.random() * 2 + 23).toFixed(1))
    }, 10000)

    return () => clearInterval(interval)
  }, [isClient])

  return (
    <Card className="h-full border-blue-200 dark:border-blue-900 bg-white dark:bg-blue-900 transition-all duration-300 ease-in-out overflow-hidden shadow-md">
      <div className="flex justify-between items-center p-3 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
          <h2 className="font-semibold text-blue-700 dark:text-blue-300">Shenzhen SIAT Live Monitoring</h2>
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          >
            {recordingStatus}
          </Badge>
          {temperature !== null && (
            <div className="ml-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-0.5">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{temperature}°C</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {onToggleJupyter && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleJupyter}
                    className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    {showJupyter ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="9" height="9" rx="1"></rect>
                        <rect x="13" y="2" width="9" height="9" rx="1"></rect>
                        <rect x="2" y="13" width="9" height="9" rx="1"></rect>
                        <rect x="13" y="13" width="9" height="9" rx="1"></rect>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2"></rect>
                      </svg>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showJupyter ? "Hide Jupyter Panel" : "Show Jupyter Panel"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleFullscreen}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <CardContent className="p-0 h-[calc(100%-49px)] bg-black relative">
        {isClient ? (
          <VideoFeed lightOn={lightOn} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="text-blue-300">Loading video feed...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Jupyter Notebook panel component
function JupyterPanel({
  isFullscreen,
  onToggleFullscreen,
  isLoading,
  onLoad,
  activeTab,
  onTabChange,
  serverUrl,
  onConfigClick,
  useCorsProxy,
  authToken,
  onToggleVisibility,
  isVisible
}: {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  isLoading: boolean
  onLoad: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  serverUrl: string
  onConfigClick: () => void
  useCorsProxy: boolean
  authToken: string
  onToggleVisibility?: () => void
  isVisible?: boolean
}) {
  const [iframeError, setIframeError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const handleIframeError = () => {
    setIframeError(true)
  }
  
  const retryConnection = () => {
    setIframeError(false)
    setRetryCount(prev => prev + 1)
    // Force iframe reload by changing the key
  }

  const toggleFallback = () => {
    setUseFallback(!useFallback)
  }

  const togglePanelOpen = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  // Reset error state when switching tabs or when server URL changes
  useEffect(() => {
    setIframeError(false)
  }, [activeTab, serverUrl])

  // Build the URL with potential token
  const buildUrl = (baseUrl: string) => {
    if (authToken && authToken.trim() !== '') {
      // Add token parameter if provided
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${encodeURIComponent(authToken)}`;
    }
    return baseUrl;
  };

  // Try different approaches to connect to Jupyter
  const getProxiedUrl = (url: string) => {
    if (!useCorsProxy) return url;
    
    // Try different CORS proxy services
    // Option 1: allorigins
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    // If the above doesn't work, you can try these alternatives by uncommenting:
    // Option 2: cors-anywhere (may require authorization)
    // return `https://cors-anywhere.herokuapp.com/${url}`;
    
    // Option 3: thingproxy
    // return `https://thingproxy.freeboard.io/fetch/${url}`;
  };

  const directLinkUrl = activeTab === "files" 
    ? `${serverUrl}/tree` 
    : activeTab === "running" 
      ? `${serverUrl}/running` 
      : `${serverUrl}/tree`;
      
  const finalUrl = buildUrl(directLinkUrl);
  const iframeSrc = getProxiedUrl(finalUrl);

  // Render fallback content for Jupyter
  const renderFallbackContent = () => {
    const notebookContent = {
      "experiment_1.ipynb": {
        cells: [
          { type: "markdown", content: "# Experiment 1: Data Analysis\n\nThis is a sample notebook for demonstrating data analysis workflow." },
          { type: "code", content: "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Load data\ndata = pd.read_csv('data.csv')\ndata.head()" },
          { type: "markdown", content: "## Data Preprocessing\n\nNext, we need to clean and preprocess the data." },
          { type: "code", content: "# Handle missing values\ndata.fillna(0, inplace=True)\n\n# Standardize data\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ndata_scaled = scaler.fit_transform(data.select_dtypes(include=['float64', 'int64']))" }
        ]
      },
      "data_analysis.ipynb": {
        cells: [
          { type: "markdown", content: "# Data Analysis Report\n\nThis notebook contains detailed analysis of experimental data." },
          { type: "code", content: "import pandas as pd\nimport seaborn as sns\n\n# Load processed data\ndf = pd.read_csv('processed_data.csv')\n\n# Display basic statistics\ndf.describe()" },
          { type: "markdown", content: "## Visualization\n\nLet's create some visualizations to understand the data." },
          { type: "code", content: "# Create correlation heatmap\nplt.figure(figsize=(10, 8))\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\nplt.title('Feature Correlation Matrix')\nplt.show()" }
        ]
      },
      "visualization.ipynb": {
        cells: [
          { type: "markdown", content: "# Data Visualization\n\nThis notebook focuses on creating high-quality data visualizations." },
          { type: "code", content: "import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Set style\nsns.set(style='whitegrid')\nplt.rcParams['figure.figsize'] = (12, 8)" },
          { type: "markdown", content: "## Time Series Analysis\n\nBelow we'll analyze time series data." },
          { type: "code", content: "# Create time series plot\ntime_data = pd.read_csv('time_series.csv', parse_dates=['date'])\nplt.figure(figsize=(14, 6))\nsns.lineplot(x='date', y='value', data=time_data)\nplt.title('Time Series Data')\nplt.xlabel('Date')\nplt.ylabel('Value')\nplt.xticks(rotation=45)\nplt.tight_layout()\nplt.show()" }
        ]
      }
    };
    
    const renderNotebook = (name: string) => {
      const notebook = notebookContent[name as keyof typeof notebookContent];
      if (!notebook) return null;
      
      return (
        <div className="bg-white dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-900 p-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">{name}</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedNotebook(null)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Back to List
            </Button>
          </div>
          
          <div className="space-y-4">
            {notebook.cells.map((cell, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md ${
                  cell.type === 'markdown' 
                    ? 'bg-blue-50 dark:bg-blue-900/30' 
                    : 'bg-gray-50 dark:bg-blue-900 font-mono text-sm'
                }`}
              >
                {cell.type === 'markdown' ? (
                  <div dangerouslySetInnerHTML={{ __html: cell.content.replace(/\n/g, '<br>') }} />
                ) : (
                  <pre className="whitespace-pre-wrap">{cell.content}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="h-full bg-white dark:bg-blue-900 p-6 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">Jupyter Notebook (Local Mode)</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFallback}
            className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Try Remote Connection
          </Button>
        </div>
        
        {selectedNotebook ? (
          renderNotebook(selectedNotebook)
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.keys(notebookContent).map(name => (
                <Card 
                  key={name}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-100 dark:border-blue-900"
                  onClick={() => setSelectedNotebook(name)}
                >
                  <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">{name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {name === "experiment_1.ipynb" && "Last modified: Today, 10:23 AM"}
                    {name === "data_analysis.ipynb" && "Last modified: Yesterday, 3:45 PM"}
                    {name === "visualization.ipynb" && "Last modified: 2 days ago"}
                  </p>
                </Card>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">Connection Troubleshooting</h4>
              <ul className="text-sm space-y-2 text-blue-600 dark:text-blue-400">
                <li>• Ensure the Jupyter server is running</li>
                <li>• Verify the IP address and port are correct</li>
                <li>• Check if your network can reach the server</li>
                <li>• Check if firewall settings are blocking the connection</li>
                <li>• Try running <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">jupyter notebook</code> command in terminal to start a local server</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => window.open("https://jupyter.org/try-jupyter/lab/", "_blank")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Jupyter Online
              </Button>
              <Button 
                onClick={onConfigClick}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Configure Connection
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full border-blue-200 dark:border-blue-900 bg-white dark:bg-blue-900 transition-all duration-300 ease-in-out overflow-hidden shadow-md">
      <div className="flex justify-between items-center p-3 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isLoading ? "bg-amber-500" : "bg-green-500"}`}></div>
          <h2 className="font-semibold text-blue-700 dark:text-blue-300">Jupyter Notebook</h2>
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
          >
            {!isPanelOpen ? "Closed" : useFallback ? "Local Mode" : isLoading ? "Connecting" : "Connected"}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePanelOpen}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  {isPanelOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <polyline points="14 8 19 12 14 16"></polyline>
                    </svg>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPanelOpen ? "Close Notebook" : "Open Notebook"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFallback}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 21h5v-5"></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{useFallback ? "Try Remote Connection" : "Use Local Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(iframeSrc, '_blank')}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in New Tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onConfigClick}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure Jupyter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleFullscreen}
                  className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <CardContent className="p-0 h-[calc(100%-49px)] bg-blue-50/50 dark:bg-blue-900/50 relative">
        {!isPanelOpen ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-blue-500 dark:text-blue-400 mb-4"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Jupyter Notebook Closed</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-4">
                Click the button below to open the Jupyter Notebook interface.
              </p>
              <Button
                onClick={togglePanelOpen}
                className="bg-blue-600 hover:bg-blue-700 text-white mx-auto"
              >
                Open Notebook
              </Button>
            </div>
          </div>
        ) : useFallback ? (
          renderFallbackContent()
        ) : (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full h-full">
          <div className="absolute top-2 left-2 z-10">
            <TabsList className="h-8 bg-blue-50 dark:bg-blue-800">
              <TabsTrigger
                value="files"
                className="text-xs h-6 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="running"
                className="text-xs h-6 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900"
              >
                Running
              </TabsTrigger>
              <TabsTrigger
                value="clusters"
                className="text-xs h-6 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900"
              >
                Clusters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="files" className="m-0 h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/80 z-10">
                <div className="flex flex-col items-center">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400">Loading Jupyter Notebook...</p>
                </div>
              </div>
            )}
              {iframeError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/80 z-10">
                  <div className="flex flex-col items-center max-w-md p-6 bg-white dark:bg-blue-900 rounded-lg shadow-lg">
                    <div className="text-red-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Connection Error</h3>
                    <p className="text-blue-600 dark:text-blue-400 mb-4 text-center">
                      Unable to connect to Jupyter Notebook at {iframeSrc}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-md mb-4 w-full">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Troubleshooting Steps:</h4>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 list-disc pl-5 space-y-1">
                        <li>Check if the Jupyter server is running</li>
                        <li>Verify the IP address and port are correct</li>
                        <li>Ensure your network can reach the server</li>
                        <li>Check if authentication is required</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={retryConnection}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Retry Connection
                      </Button>
                      <Button 
                        onClick={toggleFallback}
                        variant="outline"
                        className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      >
                        Use Local Mode
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Only render iframe on client-side
                isClient && (
            <iframe
                    key={`jupyter-iframe-${retryCount}`}
                    src={iframeSrc}
              className="w-full h-full border-0"
              title="Jupyter Notebook"
              onLoad={onLoad}
                    onError={handleIframeError}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
                )
              )}
          </TabsContent>

          <TabsContent value="running" className="m-0 h-full">
              {iframeError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 dark:bg-blue-900/80 z-10">
                  <div className="flex flex-col items-center max-w-md p-6 bg-white dark:bg-blue-900 rounded-lg shadow-lg">
                    <div className="text-red-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Connection Error</h3>
                    <p className="text-blue-600 dark:text-blue-400 mb-4 text-center">
                      Unable to connect to Jupyter Running at {iframeSrc}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-md mb-4 w-full">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Troubleshooting Steps:</h4>
                      <ul className="text-sm text-blue-600 dark:text-blue-400 list-disc pl-5 space-y-1">
                        <li>Check if the Jupyter server is running</li>
                        <li>Verify the IP address and port are correct</li>
                        <li>Ensure your network can reach the server</li>
                        <li>Check if authentication is required</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={retryConnection}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Retry Connection
                      </Button>
                      <Button 
                        onClick={() => window.open(iframeSrc, '_blank')}
                        variant="outline"
                        className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Only render iframe on client-side
                isClient && (
                  <iframe 
                    key={`jupyter-iframe-running-${retryCount}`}
                    src={iframeSrc} 
                    className="w-full h-full border-0" 
                    title="Jupyter Running" 
                    onError={handleIframeError}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                )
              )}
          </TabsContent>

          <TabsContent value="clusters" className="m-0 h-full">
            <div className="flex items-center justify-center h-full bg-blue-50 dark:bg-blue-900 p-4 overflow-auto">
              <div className="text-center w-full max-w-md">
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Cluster Management</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-4">
                  This feature allows you to manage Jupyter computing clusters.
                </p>
                <div className="bg-white dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Available Clusters</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-800 rounded-md">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">Local Python 3</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-800 rounded-md">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">Remote TensorFlow</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-800 rounded-md">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">GPU Cluster</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

