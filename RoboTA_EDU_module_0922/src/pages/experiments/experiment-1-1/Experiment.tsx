import React from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Experiment11: React.FC = () => {
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
            Experiment 1.1: Fluorescent Standard Curve
          </h1>
          <p className="text-lg text-gray-600">
            Monitor the actual experimental execution
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={3} />
        <SubPageNavigation experimentId="1-1" currentPage="experiment" steps={steps} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔬 Experiment Phase</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Experiment Feed</h3>
              <div className="bg-gray-900 rounded-lg p-8 mb-4">
                <div className="text-green-400 font-mono text-sm">
                  <div className="mb-2">[14:32:15] Robot initialized successfully</div>
                  <div className="mb-2">[14:32:18] Loading 96-well plate...</div>
                  <div className="mb-2">[14:32:25] Preparing serial dilutions...</div>
                  <div className="mb-2">[14:32:45] Adding fluorescent dye...</div>
                  <div className="mb-2">[14:33:12] Measuring fluorescence...</div>
                  <div className="text-yellow-400">[14:33:45] Experiment completed successfully</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Experiment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="text-green-600 font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900">1m 30s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samples:</span>
                    <span className="text-gray-900">24 wells</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Quality Control</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">All wells filled correctly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">No contamination detected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Temperature stable</span>
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