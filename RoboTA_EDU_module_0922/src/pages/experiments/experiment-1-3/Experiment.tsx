import React from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Experiment13: React.FC = () => {
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
            Experiment 1.3: DNA Purification & Quantification
          </h1>
          <p className="text-lg text-gray-600">
            Monitor the purification process
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={3} />
        <SubPageNavigation experimentId="1-3" currentPage="experiment" steps={steps} />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔬 Experiment Phase</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purification Robot Status</h3>
              <div className="bg-gray-900 rounded-lg p-8 mb-4">
                <div className="text-green-400 font-mono text-sm">
                  <div className="mb-2">[16:20:05] Magnetic bead purification started</div>
                  <div className="mb-2">[16:20:10] Adding binding buffer...</div>
                  <div className="mb-2">[16:22:15] Magnetic separation in progress</div>
                  <div className="mb-2">[16:23:30] Ethanol wash cycle 1/2</div>
                  <div className="mb-2">[16:24:45] Ethanol wash cycle 2/2</div>
                  <div className="mb-2">[16:26:00] Eluting DNA...</div>
                  <div className="text-yellow-400">[16:27:15] Purification completed successfully</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Purification Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="text-green-600 font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900">7m 10s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samples:</span>
                    <span className="text-gray-900">8 tubes</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Quality Control</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Magnetic separation complete</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Wash cycles successful</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">DNA elution confirmed</span>
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