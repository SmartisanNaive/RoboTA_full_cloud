import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { ContentLayout } from '../../../components/shared/ContentLayout';
import { SliderControl, SelectControl } from '../../../components/shared/FormControls';
import { InteractiveChart } from '../../../components/shared/InteractiveChart';
import { NotificationCard, FileUploader } from '../../../components/shared/NotificationCard';

export const Module2Purification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  
  // Setup parameters
  const [columnType, setColumnType] = useState('his-tag');
  const [flowRate, setFlowRate] = useState(1.0);
  const [elutionVolume, setElutionVolume] = useState(5);
  
  const columnOptions = [
    { value: 'his-tag', label: 'His-Tag Affinity Column' },
    { value: 'gst', label: 'GST Affinity Column' },
    { value: 'ion-exchange', label: 'Ion Exchange Column' }
  ];

  const chromatogramData = [
    { x: 0, y: 0.1 },
    { x: 5, y: 0.1 },
    { x: 10, y: 0.2 },
    { x: 15, y: 0.8 },
    { x: 20, y: 2.5 },
    { x: 25, y: 1.2 },
    { x: 30, y: 0.3 },
    { x: 35, y: 0.1 }
  ];

  const handleFileUpload = (file: File) => {
    console.log('Purification data uploaded:', file.name);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Learn
        return (
          <ContentLayout
            title="📚 Protein Purification Principles"
            subtitle="Understanding chromatographic separation techniques"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">🧲 Affinity Chromatography</h3>
                  <p className="text-blue-800 text-sm">
                    Proteins bind specifically to immobilized ligands based on biological affinity, 
                    allowing highly selective purification.
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3">⚡ Ion Exchange</h3>
                  <p className="text-green-800 text-sm">
                    Separation based on charge differences between proteins and the stationary phase 
                    at different pH conditions.
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3">🎯 Purification Strategy</h3>
                <ul className="text-purple-800 text-sm space-y-2">
                  <li>• Choose appropriate column based on protein properties</li>
                  <li>• Optimize binding and washing conditions</li>
                  <li>• Select elution method for maximum purity</li>
                  <li>• Monitor protein concentration and activity</li>
                </ul>
              </div>
            </div>
          </ContentLayout>
        );

      case 1: // Setup
        return (
          <ContentLayout
            title="⚙️ Purification Setup"
            subtitle="Configure chromatography parameters for optimal separation"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SelectControl
                  label="Column Type"
                  value={columnType}
                  options={columnOptions}
                  onChange={setColumnType}
                  description="Select the appropriate column for your target protein"
                />
                
                <SliderControl
                  label="Flow Rate"
                  value={flowRate}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  unit=" mL/min"
                  onChange={setFlowRate}
                  description="Optimal flow rate for binding and resolution"
                />
                
                <SliderControl
                  label="Elution Volume"
                  value={elutionVolume}
                  min={2}
                  max={10}
                  step={0.5}
                  unit=" mL"
                  onChange={setElutionVolume}
                  description="Volume of elution buffer to collect protein"
                />
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">📋 Purification Protocol</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Column:</span>
                    <span className="font-medium">{columnOptions.find(c => c.value === columnType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Flow Rate:</span>
                    <span className="font-medium">{flowRate} mL/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Elution Volume:</span>
                    <span className="font-medium">{elutionVolume} mL</span>
                  </div>
                </div>
              </div>
            </div>
          </ContentLayout>
        );

      case 2: // Simulate
        return (
          <div className="space-y-8">
            <ContentLayout
              title="🧪 Chromatography Simulation"
              subtitle="Predict separation profile and optimize conditions"
            />
            
            <InteractiveChart
              title="Predicted Chromatogram"
              data={chromatogramData}
              xLabel="Elution Volume (mL)"
              yLabel="Absorbance (280 nm)"
              color="#8b5cf6"
            />
          </div>
        );

      case 3: // Experiment
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            <ContentLayout
              title="🔬 Purification Monitoring"
              subtitle="Real-time chromatography tracking"
            >
              <div className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>[14:20:05] Column equilibration complete</div>
                  <div>[14:25:10] Sample loading initiated</div>
                  <div>[14:45:30] Washing phase started</div>
                  <div>[15:15:45] Elution in progress</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Current Status</h4>
                  <div className="text-sm text-purple-800">
                    <p>• Flow Rate: {flowRate} mL/min ✓</p>
                    <p>• Pressure: Normal</p>
                    <p>• Collection: Fraction 8/15</p>
                  </div>
                </div>
              </div>
            </ContentLayout>
            
            <div className="space-y-6">
              <NotificationCard
                type="info"
                title="Data Upload"
                message="Upload chromatography data for analysis"
              >
                <FileUploader
                  onFileSelect={handleFileUpload}
                  acceptedTypes=".csv,.txt"
                  maxSize={5}
                />
              </NotificationCard>
              
              <NotificationCard
                type="success"
                title="Purification Complete"
                message="Protein purification finished. High purity achieved."
              />
            </div>
          </div>
        );

      case 4: // Analyze
        return (
          <div className="space-y-8">
            <ContentLayout
              title="📊 Purification Analysis"
              subtitle="Comprehensive evaluation of purification results"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">95%</div>
                  <div className="text-sm text-blue-600">Purity</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">78%</div>
                  <div className="text-sm text-green-600">Recovery</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">15x</div>
                  <div className="text-sm text-purple-600">Purification Fold</div>
                </div>
              </div>
            </ContentLayout>
            
            <InteractiveChart
              title="Final Chromatogram"
              data={chromatogramData}
              xLabel="Elution Volume (mL)"
              yLabel="Absorbance (280 nm)"
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
            <Droplets className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Module 2B: Protein Purification and Quantitative Analysis
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Master advanced protein purification and analysis techniques
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
                  ? 'bg-purple-500 text-white'
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