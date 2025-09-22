import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';
import { WellPlate } from '../../../components/shared/WellPlate';

interface ExperimentParams {
  startConcentration: number;
  dilutionFactor: number;
  numberOfPoints: number;
  replicates: number;
}

export const Setup11: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [params, setParams] = useState<ExperimentParams>({
    startConcentration: 1000,
    dilutionFactor: 2,
    numberOfPoints: 8,
    replicates: 3
  });

  const generateWells = () => {
    const wells = [];
    const concentrations = [];
    
    // Calculate concentrations for serial dilution
    for (let i = 0; i < params.numberOfPoints; i++) {
      concentrations.push(params.startConcentration / Math.pow(params.dilutionFactor, i));
    }
    
    // Generate wells
    for (let point = 0; point < params.numberOfPoints; point++) {
      for (let rep = 0; rep < params.replicates; rep++) {
        const intensity = Math.min(255, concentrations[point] / 4);
        wells.push({
          id: `well-${point}-${rep}`,
          row: point,
          col: rep,
          content: `${concentrations[point].toFixed(1)} ng/μL`,
          color: `rgba(59, 130, 246, ${intensity / 255})`,
          opacity: 1
        });
      }
    }
    
    return wells;
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
            Configure your experimental parameters
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={1} />
        <SubPageNavigation experimentId="1-1" currentPage="setup" steps={steps} />

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚙️ Setup Phase</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiment Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Concentration (ng/μL)
                  </label>
                  <input
                    type="number"
                    value={params.startConcentration}
                    onChange={(e) => setParams({...params, startConcentration: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dilution Factor
                  </label>
                  <select
                    value={params.dilutionFactor}
                    onChange={(e) => setParams({...params, dilutionFactor: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={2}>2-fold (1:2)</option>
                    <option value={5}>5-fold (1:5)</option>
                    <option value={10}>10-fold (1:10)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Points
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="8"
                    value={params.numberOfPoints}
                    onChange={(e) => setParams({...params, numberOfPoints: Number(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{params.numberOfPoints} points</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replicates
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="4"
                    value={params.replicates}
                    onChange={(e) => setParams({...params, replicates: Number(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{params.replicates} replicates</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">👁️ Live Preview</h2>
            <WellPlate wells={generateWells()} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};