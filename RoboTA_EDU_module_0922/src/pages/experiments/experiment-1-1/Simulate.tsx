import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';
import { SimulationButton } from '../../../components/shared/SimulationButton';

export const Simulate11: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 3000);
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
            Experiment 1.1: Fluorescent Standard Curve
          </h1>
          <p className="text-lg text-gray-600">
            Watch the robotic system prepare your serial dilutions
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={2} />
        <SubPageNavigation experimentId="1-1" currentPage="simulate" steps={steps} />

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
                      <Beaker className="h-6 w-6 text-primary-600 animate-pulse" />
                      <span className="text-lg font-medium">Robot is preparing serial dilutions...</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3 }}
                      />
                    </div>
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