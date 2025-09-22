import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';
import { SimulationButton } from '../../../components/shared/SimulationButton';

export const Simulate12: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Experiment 1.2: PCR Amplification
          </h1>
          <p className="text-lg text-gray-600">
            Watch the thermocycler run your PCR program
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={2} />
        <SubPageNavigation experimentId="1-2" currentPage="simulate" steps={steps} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🧪 Simulation Phase</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <SimulationButton 
                onSimulate={handleSimulation}
                isRunning={isSimulating}
              />
              
              {isSimulating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Timer className="h-6 w-6 text-secondary-600 animate-pulse" />
                      <span className="text-lg font-medium">Thermocycler running PCR program...</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-secondary-500 to-primary-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Estimated time: 2 hours</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};