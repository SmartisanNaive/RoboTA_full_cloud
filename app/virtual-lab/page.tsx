"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Sun, Play, RotateCcw, Code, FileCode, FlaskRound, Sparkles, Dna, Microscope, ExternalLink, Server, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import type { OnChange } from "@monaco-editor/react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

const pythonExample = `# Simple Python demo code
import math

def calculate_circle_area(radius):
    """Calculate circle area"""
    return math.pi * radius ** 2

# Calculate areas for different radii
radii = [1, 2, 3, 4, 5]
areas = [calculate_circle_area(r) for r in radii]

# Print results
for i, (r, a) in enumerate(zip(radii, areas)):
    print(f"Radius {r} circle area: {a:.2f}")

# Calculate total area
total_area = sum(areas)
print(f"Total area: {total_area:.2f}")
`

const opentronExample = `
from opentrons import protocol_api
from opentrons import types
import random

metadata = {
    'ctxName': 'SLAS Demo',
    'author': 'Rami Farawi <rami.farawi@opentrons.com',
}
requirements = {
    'robotType': 'OT-3',
    'apiLevel': '2.19'
}




def run(protocol: protocol_api.ProtocolContext):



    # DECK SETUP AND LABWARE
    temp_mod = protocol.load_module('temperature module gen2', '3')
    thermocycler = protocol.load_module('thermocycler module gen2')
    heater_shaker = protocol.load_module('heaterShakerModuleV1', '1')
    heater_shaker.close_labware_latch()
    tc_plate = thermocycler.load_labware('armadillo_96_wellplate_200ul_pcr_full_skirt')
    temp_plate = temp_mod.load_labware('opentrons_24_aluminumblock_nest_1.5ml_screwcap')
    moved_plate = protocol.load_labware('armadillo_96_wellplate_200ul_pcr_full_skirt', 2)

    hs_plate = heater_shaker.load_labware('armadillo_96_wellplate_200ul_pcr_full_skirt')

    tiprack_50 = protocol.load_labware('opentrons_flex_96_filtertiprack_200ul',  '9')
    tiprack_1000 = protocol.load_labware('opentrons_flex_96_filtertiprack_200ul',  '6')

    # LOAD PIPETTES
    p1000 = protocol.load_instrument("flex_1channel_1000", "left", tip_racks=[tiprack_1000])
    m50 = protocol.load_instrument("flex_8channel_1000", "right", tip_racks=[tiprack_50])

    p1000tips = [tip for tip in tiprack_1000.wells()]

    m50.well_bottom_clearance.aspirate = 3
    m50.well_bottom_clearance.dispense = 3
    p1000.well_bottom_clearance.aspirate = 3
    p1000.well_bottom_clearance.dispense = 3

    # COMMANDS
    num_runs = 1

    thermocycler.open_lid()
    heater_shaker.close_labware_latch()

    random_wells = ['G7', 'B2', 'B4', 'E12', 'A8', 'H1', 'C3', 'D9', 'H10',
                    'A2', 'C11', 'B4', 'A6', 'D9', 'C9', 'H1', 'A11', 'D3']

    for run in range(num_runs):

        p1000.pick_up_tip(p1000tips[random.randint(0, 95)])
        p1000.aspirate(10, temp_plate.wells_by_name()['A1'])
        p1000.dispense(10, tc_plate.wells_by_name()['A1'])
        p1000.aspirate(10, temp_plate.wells_by_name()['B1'])
        p1000.dispense(10, tc_plate.wells_by_name()['B1'])

        # HIT PICK ON 96 WELL
        p1000.distribute(10, hs_plate.wells()[0],
                         [hs_plate.wells_by_name()[well]
                          for well in random_wells],
                         new_tip='never')

        p1000.return_tip()

        # -- Close the lid of Thermocycler
        thermocycler.close_lid()

        # -- Open the lid of the Thermocycler.
        thermocycler.open_lid()

        # -- Run heater shaker for 10 seconds
        heater_shaker.set_and_wait_for_shake_speed(500)
        protocol.delay(seconds=8)
        heater_shaker.deactivate_shaker()

        # -- Pipette entire row of heater shaker
        m50.pick_up_tip()
        for i, col in enumerate(hs_plate.rows()[0]):

            m50.aspirate(1, col)
            if i % 4 == 0:
                m50.touch_tip()
        m50.return_tip()

        # -- Move the plate onto magnetic block.
        protocol.move_labware(
            labware=moved_plate,
            new_location=8,
            use_gripper=True
        )

        # -- Move plate from magnetic block back to deck using the gripper.
        protocol.move_labware(
            labware=moved_plate,
            new_location=2,
            use_gripper=True
        )

        # -- Repeat.

    # CHANGE TIPS NOTIFICATION
    dt = 0.1
    for _ in range(5):
        protocol.set_rail_lights(True)
        protocol.delay(seconds=1-dt)
        protocol.set_rail_lights(False)
        protocol.delay(seconds=1-dt)
        dt += 0.2
`

export default function VirtualLab() {
  const router = useRouter()
  const [code, setCode] = useState(pythonExample)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("python")
  const [showIntro, setShowIntro] = useState(true)
  const [useLocalServer, setUseLocalServer] = useState(false)
  const { language } = useLanguage()

  // Server configuration - keeping IPs internal without directly exposing them in UI
  const serverConfig = {
    remote: {
      apiEndpoint: "http://120.241.223.14:8000/api/analyze",
      viewerBaseUrl: "http://120.241.223.14:3001"
    },
    local: {
      apiEndpoint: "http://localhost:8000/api/analyze",
      viewerBaseUrl: "http://localhost:3001"
    }
  }

  // Get the current server configuration based on useLocalServer state
  const getCurrentServerConfig = () => {
    return useLocalServer ? serverConfig.local : serverConfig.remote;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCode(value === "python" ? pythonExample : opentronExample)
    setOutput("")
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Running code...")

    if (activeTab === "python") {
      try {
        const response = await fetch("/api/execute-python", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
          throw new Error(errorData.error || `Server error (${response.status}): Please check your code for syntax errors or invalid operations.`);
        }

        const data = await response.json()
        setOutput(data.output)
      } catch (error) {
        console.error("Error executing Python code:", error)
        setOutput(`Error: ${error instanceof Error ? error.message : "Code execution failed. Please check for syntax errors."}`);
      }
    } else {
      // Get current server configuration
      const { apiEndpoint, viewerBaseUrl } = getCurrentServerConfig();
      const serverMode = useLocalServer ? "LOCAL" : "REMOTE";
      
      try {
        // 创建一个文件对象
        const codeFile = new File([code], "protocol.py", { type: "text/plain" })
        
        // 创建 FormData 并附加文件
        const formData = new FormData()
        formData.append("files", codeFile)
        // 添加默认的运行时参数值和文件路径（空对象）
        formData.append("rtp_values", "{}")
        formData.append("rtp_files", "{}")
        
        // Show enhanced server information with more details
        setOutput(
          `🔄 Sending protocol to analysis API...\n\n` +
          `📡 Server Configuration:\n` +
          `• Mode: ${serverMode}\n` +
          `• API: ${useLocalServer ? 'localhost:8000/api' : 'Remote server'}\n` +
          `• Viewer: ${useLocalServer ? 'localhost:3001' : 'Remote viewer'}\n\n` +
          `Please wait while the protocol is being analyzed...`
        )
        
        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formData,
          // Add a timeout to avoid long waits if server is down
          signal: AbortSignal.timeout(15000) // 15 seconds timeout
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API responded with status: ${response.status}\n\nDetails: ${errorText || "No additional error details available"}`)
        }
        
        const data = await response.json()
        
        if (data.analysisId) {
          // Enhanced output with more details - don't show full URLs in UI
          const timelineUrl = `${viewerBaseUrl}/${data.analysisId}/timeline`;
          const detailsUrl = `${viewerBaseUrl}/${data.analysisId}/details`;
          
          // Fetch the full analysis result to display more details
          try {
            const analysisResponse = await fetch(`${apiEndpoint.replace('/analyze', '')}/analysis/${data.analysisId}`, {
              signal: AbortSignal.timeout(5000) // 5 seconds timeout
            });
            
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              
              // Extract the key information for display
              const result = analysisData.result || 'UNKNOWN';
              const robotType = analysisData.robotType || 'Not specified';
              const numCommands = analysisData.commands?.length || 0;
              const numLabware = Object.keys(analysisData.labware || {}).length;
              const numPipettes = Object.keys(analysisData.pipettes || {}).length;
              const numErrors = analysisData.errors?.length || 0;
              const hasModules = Object.keys(analysisData.modules || {}).length > 0;
              
              // Create a more detailed output with specific error information
              let outputText = `🔬 Protocol Analysis Complete\n\n` +
                `${numErrors > 0 ? '⚠️ Status: ' + result : '✅ Status: ' + result}\n` +
                `🤖 Robot Type: ${robotType}\n\n` +
                `📊 Analysis Results:\n` +
                `• Commands: ${numCommands}\n` +
                `• Labware: ${numLabware}\n` +
                `• Pipettes: ${numPipettes}\n` +
                (hasModules ? `• Modules: Yes\n` : '');
              
              // Add detailed error information if there are errors
              if (numErrors > 0) {
                outputText += `\n🚫 Errors Found (${numErrors}):\n`;
                
                // Display each error with detailed information
                analysisData.errors.forEach((error: any, index: number) => {
                  outputText += `\nError ${index + 1}:\n`;
                  outputText += `• Code: ${error.errorCode || "Unknown"}\n`;
                  outputText += `• Message: ${error.detail || error.message || "No message provided"}\n`;
                  
                  // Add error location information if available
                  if (error.path) {
                    outputText += `• Location: ${error.path.join(" > ")}\n`;
                  }
                  
                  // Add command information if available
                  if (error.commandId !== undefined) {
                    outputText += `• Command ID: ${error.commandId}\n`;
                    
                    // Look up the command details if available
                    const command = analysisData.commands?.find((cmd: any) => cmd.id === error.commandId);
                    if (command) {
                      outputText += `• Command: ${command.command} (Line: ${command.meta?.startLine || "unknown"})\n`;
                    }
                  }
                  
                  // Add suggestions if available
                  if (error.suggestions?.length > 0) {
                    outputText += `• Suggestions: ${error.suggestions.join(", ")}\n`;
                  }
                });
              }
              
              outputText += `\n🔑 Analysis ID: ${data.analysisId}\n\n` +
                `🔍 Opening detailed visualization in a new window...\n` +
                `If it doesn't open automatically, please check your popup blocker settings.`;
              
              setOutput(outputText);
            } else {
              // Fall back to basic output if we can't get the details
              setOutput(
                `✅ Protocol Analysis Successful!\n\n` +
                `Analysis ID: ${data.analysisId}\n\n` +
                `Opening detailed visualization in a new window...\n` +
                `If it doesn't open automatically, please check your popup blocker settings.`
              );
            }
          } catch (e) {
            // Fall back to basic output if fetching details fails
            setOutput(
              `✅ Protocol Analysis Successful!\n\n` +
              `Analysis ID: ${data.analysisId}\n\n` +
              `Opening detailed visualization in a new window...\n` +
              `If it doesn't open automatically, please check your popup blocker settings.`
            );
          }
          
          // Open in new window instead of redirecting
          setTimeout(() => {
            window.open(timelineUrl, '_blank');
          }, 2000);
        } else {
          setOutput(`Error: No analysis ID received from API\n\nResponse data: ${JSON.stringify(data, null, 2)}`)
        }
      } catch (error) {
        console.error("Error sending code to API:", error)
        
        // More detailed error message
        let errorMessage = `Error: Protocol Analysis Failed\n\n`;
        
        // Check for different error types to provide better feedback
        if (error instanceof TypeError && error.message.includes('fetch')) {
          errorMessage += `Details: Failed to fetch - Unable to connect to the server\n\n`;
          errorMessage += `Current server mode: ${serverMode}\n\n`;
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          errorMessage += `Details: Request timed out after 15 seconds\n\n`;
        } else {
          errorMessage += `Details: ${error instanceof Error ? error.message : "Unknown error occurred"}\n\n`;
        }
        
        errorMessage += 
          `Possible reasons for failure:\n` +
          `- Network connectivity issues\n` +
          `- Server is not running or unreachable\n` +
          `- Syntax errors in your protocol\n` +
          `- Server unavailable or overloaded\n` +
          `- Protocol contains unsupported operations\n\n` +
          `Troubleshooting steps:\n` +
          `- Try switching to ${useLocalServer ? 'REMOTE' : 'LOCAL'} server using the toggle button\n` +
          `- Verify your network connection\n` +
          `- Check your code for syntax errors\n`;
        
        setOutput(errorMessage);
      }
    }
    setIsRunning(false)
  }

  const resetCode = () => {
    setCode(activeTab === "python" ? pythonExample : opentronExample)
    setOutput("")
  }

  // Toggle between local and remote servers
  const toggleServerMode = () => {
    setUseLocalServer(!useLocalServer);
    setOutput("");  // Clear output when switching servers
  }

  return (
    <div className="bg-blue-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2 flex items-center justify-center">
            <Microscope className="mr-3 h-8 w-8 text-blue-600" />
            {translate('virtualLabTitle', language)}
          </h1>
          <p className="text-lg text-blue-700 max-w-3xl mx-auto">
            {translate('virtualLabSubtitle', language)}
          </p>
        </div>

        {showIntro && (
          <Card className="mb-8 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-700 flex items-center">
                <FlaskRound className="mr-2 h-5 w-5 text-blue-600" />
                {translate('welcomeVirtualLab', language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">
                {translate('virtualLabIntro', language)} <a href="https://docs.opentrons.com/v2/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline-flex">{translate('opentronsDocs', language)} <ExternalLink className="ml-1 h-3 w-3" /></a>
              </p>
              <Button 
                variant="outline" 
                className="mt-4 text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={() => setShowIntro(false)}
              >
                {translate('gotIt', language)}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-blue-50 to-white border-blue-200 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-lg text-green-700 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-green-600" />
                  {translate('features', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Code className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{translate('feature1VirtualLab', language)}</p>
                </div>
                <div className="flex items-start">
                  <Dna className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{translate('feature2VirtualLab', language)}</p>
                </div>
                <div className="flex items-start">
                  <FileCode className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{translate('feature3VirtualLab', language)}</p>
                </div>
                
                {/* Improved server toggle option */}
                {activeTab === "opentrons" && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-green-100">
                    <Button
                      variant="outline"
                      onClick={toggleServerMode}
                      className={`w-full mt-2 flex items-center justify-center gap-2 ${useLocalServer 
                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' 
                        : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'}`}
                    >
                      <span className="text-sm">
                        {useLocalServer ? 'Using Local Server' : 'Using Remote Server'}
                      </span>
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <a 
                  href="https://docs.google.com/presentation/d/1BDt1BHWNa7s3KH5coSEJfWW6wu1ZIRD4uxe4SwK353o/edit?slide=id.g2d95c265cf8_0_209#slide=id.g2d95c265cf8_0_209" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 text-sm hover:underline flex items-center"
                >
                  {translate('learnMoreLabAutomation', language)}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Code Editor Section */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-purple-200 h-full bg-purple-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-purple-100 to-purple-50 border-b border-purple-200">
                    <CardTitle className="text-xl font-bold text-purple-800 flex items-center">
                      <FileCode className="mr-2 h-5 w-5 text-purple-600" />
                      {translate('codeEditor', language)}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-[400px]">
                        <TabsList className="border border-purple-200 p-1 bg-purple-50">
                          <TabsTrigger value="python" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">Python</TabsTrigger>
                          <TabsTrigger value="opentrons" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">Virtual-Run</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="border rounded-md overflow-hidden border-purple-200" style={{ height: "550px" }}>
                      <Editor
                        height="100%"
                        defaultLanguage="python"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: "on",
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={resetCode}
                        className="flex items-center bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                        disabled={isRunning}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {translate('reset', language)}
                      </Button>
                      <Button
                        onClick={runCode}
                        className="flex items-center bg-purple-600 hover:bg-purple-700"
                        disabled={isRunning}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {translate('runCode', language)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Output Section */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-orange-200 h-full bg-orange-50">
                  <CardHeader className="pb-2 bg-gradient-to-r from-orange-100 to-orange-50 border-b border-orange-200">
                    <CardTitle className="text-xl font-bold text-orange-800 flex items-center">
                      <Code className="mr-2 h-5 w-5 text-orange-600" />
                      {translate('output', language)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div 
                      className="border rounded-md p-4 bg-orange-50 font-mono text-sm overflow-auto border-orange-200" 
                      style={{ height: "600px", whiteSpace: "pre-wrap" }}
                    >
                      {output || (
                        <div>
                          {translate('outputPlaceholder', language)}
                          {activeTab === "opentrons" && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md text-blue-800">
                              <div className="flex items-center space-x-2">
                                <Server className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Server Status:</span>
                                <span className="flex items-center">
                                  {useLocalServer ? "LOCAL" : "REMOTE"}
                                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                </span>
                              </div>
                              {useLocalServer && (
                                <div className="mt-2 pl-6 text-sm text-blue-700 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <Globe className="h-3 w-3 mr-1 text-blue-500" />
                                    <span>API: localhost:8000/api</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ExternalLink className="h-3 w-3 mr-1 text-blue-500" />
                                    <span>Viewer: localhost:3001</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200 shadow-md mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700 flex items-center">
              <Dna className="mr-2 h-5 w-5 text-blue-600" />
              {translate('gettingStarted', language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-blue-800">
              <li>{translate('gettingStartedStep1', language)}</li>
              <li>{translate('gettingStartedStep2', language)}</li>
              <li>{translate('gettingStartedStep3', language)}</li>
              <li>{translate('gettingStartedStep4', language)}</li>
              <li>{translate('gettingStartedStep5', language)}</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}