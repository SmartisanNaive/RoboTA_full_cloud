import React from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Experiment12: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];

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
            Monitor the PCR amplification process
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={3} />
        <SubPageNavigation experimentId="1-2" currentPage="experiment" steps={steps} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔬 Experiment Phase</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PCR Thermocycler Status</h3>
              <div className="bg-gray-900 rounded-lg p-8 mb-4">
                <div className="text-green-400 font-mono text-sm">
                  <div className="mb-2">[15:45:12] PCR program initiated</div>
                  <div className="mb-2">[15:45:15] Initial denaturation: 95°C</div>
                  <div className="mb-2">[15:50:15] Cycle 1/35: Denaturation</div>
                  <div className="mb-2">[15:50:45] Cycle 1/35: Annealing at 55°C</div>
                  <div className="mb-2">[15:51:15] Cycle 1/35: Extension at 72°C</div>
                  <div className="text-yellow-400">[17:45:30] PCR amplification completed</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thermocycler Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Cycle:</span>
                    <span className="text-green-600 font-medium">35/35</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="text-gray-900">4°C (Hold)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Runtime:</span>
                    <span className="text-gray-900">2h 18m</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Quality Metrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Temperature accuracy: ±0.1°C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Ramp rate optimal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">All cycles completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};