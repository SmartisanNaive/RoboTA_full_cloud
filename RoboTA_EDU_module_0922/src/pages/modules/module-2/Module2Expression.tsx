import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Beaker, BarChart3, Play, Upload } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { ContentLayout } from '../../../components/shared/ContentLayout';
import { SliderControl, SelectControl } from '../../../components/shared/FormControls';
import { InteractiveChart } from '../../../components/shared/InteractiveChart';
import { NotificationCard, FileUploader } from '../../../components/shared/NotificationCard';
import { WellPlate } from '../../../components/shared/WellPlate';

export const Module2Expression: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  
  // Setup parameters
  const [temperature, setTemperature] = useState(37);
  const [incubationTime, setIncubationTime] = useState(4);
  const [proteinType, setProteinType] = useState('gfp');
  
  // Simulation data
  const [simulationData, setSimulationData] = useState([
    { x: 0, y: 0 },
    { x: 1, y: 15 },
    { x: 2, y: 45 },
    { x: 3, y: 78 },
    { x: 4, y: 95 },
    { x: 5, y: 98 }
  ]);

  const proteinOptions = [
    { value: 'gfp', label: 'Green Fluorescent Protein (GFP)' },
    { value: 'rfp', label: 'Red Fluorescent Protein (RFP)' },
    { value: 'luciferase', label: 'Firefly Luciferase' }
  ];

  const generateWells = () => {
    const wells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const intensity = Math.random() * 0.8 + 0.2;
        wells.push({
          id: `well-${row}-${col}`,
          row,
          col,
          content: `Sample ${row * 4 + col + 1}`,
          color: proteinType === 'gfp' ? `rgba(34, 197, 94, ${intensity})` : 
                 proteinType === 'rfp' ? `rgba(239, 68, 68, ${intensity})` : 
                 `rgba(251, 191, 36, ${intensity})`,
          opacity: 1
        });
      }
    }
    return wells;
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // Handle file processing here
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Learn
        return (
          <ContentLayout
            title="📚 Cell-free Gene Expression Fundamentals"
            subtitle="Understanding the principles of protein synthesis in vitro"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">🧬 Transcription Process</h3>
                  <p className="text-blue-800 text-sm">
                    RNA polymerase reads DNA template and synthesizes mRNA containing the genetic code for protein production.
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3">🔄 Translation Process</h3>
                  <p className="text-green-800 text-sm">
                    Ribosomes decode mRNA and assemble amino acids into functional proteins using tRNA molecules.
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3">⚗️ Cell-free System Advantages</h3>
                <ul className="text-purple-800 text-sm space-y-2">
                  <li>• Controlled environment without cellular interference</li>
                  <li>• Rapid protein production (hours vs days)</li>
                  <li>• Easy optimization of reaction conditions</li>
                  <li>• Real-time monitoring capabilities</li>
                </ul>
              </div>
            </div>
          </ContentLayout>
        );

      case 1: // Setup
        return (
          <div className="space-y-8">
            <ContentLayout
              title="⚙️ Expression System Setup"
              subtitle="Configure your cell-free protein expression parameters"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <SliderControl
                    label="Incubation Temperature"
                    value={temperature}
                    min={25}
                    max={42}
                    step={1}
                    unit="°C"
                    onChange={setTemperature}
                    description="Optimal temperature for protein folding and enzyme activity"
                  />
                  
                  <SliderControl
                    label="Incubation Time"
                    value={incubationTime}
                    min={1}
                    max={8}
                    step={0.5}
                    unit=" hours"
                    onChange={setIncubationTime}
                    description="Duration of protein expression reaction"
                  />
                  
                  <SelectControl
                    label="Target Protein"
                    value={proteinType}
                    options={proteinOptions}
                    onChange={setProteinType}
                    description="Select the protein to express in the cell-free system"
                  />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">📋 Experiment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Temperature:</span>
                      <span className="font-medium">{temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Duration:</span>
                      <span className="font-medium">{incubationTime} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Protein:</span>
                      <span className="font-medium">{proteinOptions.find(p => p.value === proteinType)?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ContentLayout>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">👁️ Microplate Preview</h3>
              <WellPlate wells={generateWells()} />
            </div>
          </div>
        );

      case 2: // Simulate
        return (
          <div className="space-y-8">
            <ContentLayout
              title="🧪 Expression Simulation"
              subtitle="Visualize protein expression kinetics over time"
            >
              <div className="text-center mb-6">
                <motion.button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-purple-500 text-white rounded-lg hover:from-secondary-600 hover:to-purple-600 transition-all font-medium shadow-lg mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-5 w-5" />
                  <span>Run Expression Simulation</span>
                </motion.button>
              </div>
            </ContentLayout>
            
            <InteractiveChart
              title="Protein Expression Kinetics"
              data={simulationData}
              xLabel="Time (hours)"
              yLabel="Fluorescence Intensity (AU)"
              color="#8b5cf6"
            />
          </div>
        );

      case 3: // Experiment
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <ContentLayout
              title="🔬 Live Experiment Monitoring"
              subtitle="Real-time tracking of protein expression"
            >
              <div className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>[15:30:12] Expression reaction initiated</div>
                  <div>[15:30:15] Temperature stabilized at {temperature}°C</div>
                  <div>[15:45:30] Fluorescence detection started</div>
                  <div>[16:30:45] Expression proceeding normally</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
                  <div className="text-sm text-blue-800">
                    <p>• Temperature: {temperature}°C ✓</p>
                    <p>• Progress: 65% complete</p>
                    <p>• Estimated completion: 1.5 hours</p>
                  </div>
                </div>
              </div>
            </ContentLayout>
            
            <div className="space-y-6">
              <NotificationCard
                type="info"
                title="Data Collection"
                message="Upload experimental data files for analysis"
              >
                <FileUploader
                  onFileSelect={handleFileUpload}
                  acceptedTypes=".csv,.xlsx"
                  maxSize={5}
                />
              </NotificationCard>
              
              <NotificationCard
                type="success"
                title="Expression Complete"
                message="Protein expression has finished successfully. Proceed to analysis."
              />
            </div>
          </div>
        );

      case 4: // Analyze
        return (
          <div className="space-y-8">
            <ContentLayout
              title="📊 Expression Analysis"
              subtitle="Comprehensive analysis of protein expression results"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">85%</div>
                  <div className="text-sm text-green-600">Expression Efficiency</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">2.3 mg/mL</div>
                  <div className="text-sm text-blue-600">Protein Concentration</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">4.2 hours</div>
                  <div className="text-sm text-purple-600">Optimal Expression Time</div>
                </div>
              </div>
            </ContentLayout>
            
            <InteractiveChart
              title="Final Expression Profile"
              data={simulationData}
              xLabel="Time (hours)"
              yLabel="Protein Concentration (mg/mL)"
              color="#10b981"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-secondary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Module 2A: Cell-free Gene Expression
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Explore protein synthesis in controlled cell-free systems
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={currentStep} />
        
        <div className="mt-8 flex justify-center space-x-4 mb-8">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                index === currentStep
                  ? 'bg-secondary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {renderStepContent()}
        </div>
      </motion.div>
    </div>
  );
};