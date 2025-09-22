import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

interface PurificationParams {
  beadRatio: number;
  elutionVolume: number;
}

export const Setup13: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [params, setParams] = useState<PurificationParams>({
    beadRatio: 1.8,
    elutionVolume: 50
  });

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
            Configure your purification parameters and understand the process
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={1} />
        <SubPageNavigation experimentId="1-3" currentPage="setup" steps={steps} />

        {/* Setup Phase - Full Width */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">⚙️ Setup Phase</h2>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Purification Parameters</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bead Ratio (bead volume : sample volume)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={params.beadRatio}
                    onChange={(e) => setParams({...params, beadRatio: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0.5x</span>
                    <span className="font-semibold text-lg text-primary-600">{params.beadRatio}x</span>
                    <span>2.5x</span>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    params.beadRatio >= 1.8 ? 'bg-green-50 text-green-800 border border-green-200' :
                    params.beadRatio >= 1.0 ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}>
                    {params.beadRatio >= 1.8 ? '🎯 High purity mode - Includes small fragments' :
                     params.beadRatio >= 1.0 ? '⚖️ Balanced recovery and purity' :
                     '📏 Size selection mode - Larger fragments only'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Elution Volume (μL)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={params.elutionVolume}
                    onChange={(e) => setParams({...params, elutionVolume: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>20 μL</span>
                    <span className="font-semibold text-lg text-secondary-600">{params.elutionVolume} μL</span>
                    <span>100 μL</span>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    params.elutionVolume <= 30 ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                    params.elutionVolume >= 70 ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {params.elutionVolume <= 30 ? '🔬 High concentration, lower total yield' :
                     params.elutionVolume >= 70 ? '📊 High total yield, lower concentration' :
                     '⚖️ Balanced concentration and total yield'}
                  </div>
                </div>
              </div>

              {/* Parameter Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">📋 Experiment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Bead Ratio:</span>
                    <span className="text-primary-600 font-bold">{params.beadRatio}x</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Elution Volume:</span>
                    <span className="text-secondary-600 font-bold">{params.elutionVolume} μL</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Expected Yield:</span>
                    <span className="text-green-600 font-bold">
                      {params.elutionVolume >= 70 ? 'High' : params.elutionVolume <= 30 ? 'Low' : 'Medium'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700 font-medium">Purity Level:</span>
                    <span className="text-blue-600 font-bold">
                      {params.beadRatio >= 1.8 ? 'High' : params.beadRatio >= 1.0 ? 'Medium' : 'Selective'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live Preview Section - Below Setup */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">👁️ Live Preview</h2>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Magnetic Bead Purification Process
            </h3>
            
            {/* Purification Process Image */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 max-w-4xl">
                <img
                  src="/magnetic-bead-purification.png"
                  alt="Magnetic Bead Purification Process" 
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Process Description */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <motion.div 
                className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">1</div>
                <h4 className="font-semibold text-blue-900 mb-1">Binding</h4>
                <p className="text-xs text-blue-700">DNA binds to SPRI beads in high-salt buffer</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">2</div>
                <h4 className="font-semibold text-yellow-900 mb-1">Separation</h4>
                <p className="text-xs text-yellow-700">Magnetic field attracts bead-DNA complexes</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">3</div>
                <h4 className="font-semibold text-purple-900 mb-1">Washing</h4>
                <p className="text-xs text-purple-700">Ethanol washes remove impurities</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">4</div>
                <h4 className="font-semibold text-green-900 mb-1">Elution</h4>
                <p className="text-xs text-green-700">Pure DNA released in low-salt buffer</p>
              </motion.div>
            </div>

            {/* Current Settings Display */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
              <p className="text-center font-medium text-gray-800">
                <span className="text-primary-600">Current Settings:</span> {params.beadRatio}x bead ratio, {params.elutionVolume}μL elution volume
                <span className="ml-2 text-secondary-600">
                  → {params.beadRatio >= 1.8 ? 'High purity mode' : 
                      params.beadRatio >= 1.0 ? 'Standard purification' : 
                      'Size selection mode'}
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};