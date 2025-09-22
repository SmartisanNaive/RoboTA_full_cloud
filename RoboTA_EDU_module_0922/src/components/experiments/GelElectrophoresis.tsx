import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, Ruler } from 'lucide-react';

interface GelElectrophoresisProps {
  primerPair: string;
}

export const GelElectrophoresis: React.FC<GelElectrophoresisProps> = ({ primerPair }) => {
  const [selectedBand, setSelectedBand] = useState<string | null>(null);

  const getLadder = () => [
    { size: 1000, position: 20 },
    { size: 750, position: 35 },
    { size: 500, position: 55 },
    { size: 250, position: 80 },
    { size: 100, position: 95 }
  ];

  const getSampleBands = () => {
    const bands = {
      'gene-specific': [{ size: 500, position: 55, intensity: 0.8 }],
      'universal': [{ size: 200, position: 85, intensity: 0.9 }],
      'nested': [{ size: 300, position: 75, intensity: 0.7 }]
    };
    return bands[primerPair as keyof typeof bands] || [];
  };

  const ladder = getLadder();
  const sampleBands = getSampleBands();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gel Electrophoresis Results</h3>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gel Image */}
        <div className="relative">
          <div className="bg-gray-900 rounded-lg p-4 relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
            {/* Wells */}
            <div className="flex justify-center space-x-4 mb-4">
              {['Ladder', 'Sample', 'Positive', 'Negative'].map((label, index) => (
                <div key={index} className="text-center">
                  <div className="w-8 h-4 bg-gray-700 rounded-t-lg mb-1"></div>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Gel lanes */}
            <div className="flex justify-center space-x-4 h-64">
              {/* Ladder lane */}
              <div className="w-8 relative">
                {ladder.map((band, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-full h-1 bg-blue-400 cursor-pointer hover:bg-blue-300 transition-colors"
                    style={{ top: `${band.position}%` }}
                    onClick={() => setSelectedBand(`ladder-${band.size}`)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>

              {/* Sample lane */}
              <div className="w-8 relative">
                {sampleBands.map((band, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-full h-1 bg-green-400 cursor-pointer hover:bg-green-300 transition-colors"
                    style={{ top: `${band.position}%`, opacity: band.intensity }}
                    onClick={() => setSelectedBand(`sample-${band.size}`)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: band.intensity, x: 0 }}
                    transition={{ delay: 0.5 }}
                  />
                ))}
              </div>

              {/* Positive control lane */}
              <div className="w-8 relative">
                {sampleBands.map((band, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-full h-1 bg-green-400"
                    style={{ top: `${band.position}%`, opacity: 0.9 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 0.9, x: 0 }}
                    transition={{ delay: 0.7 }}
                  />
                ))}
              </div>

              {/* Negative control lane */}
              <div className="w-8 relative">
                {/* No bands - empty lane */}
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <ZoomIn className="h-4 w-4" />
              <span className="text-sm">Zoom</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Ruler className="h-4 w-4" />
              <span className="text-sm">Measure</span>
            </button>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Band Analysis</h4>
            
            {selectedBand ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Selected Band:</strong> {selectedBand.includes('ladder') ? 'DNA Ladder' : 'Sample'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Estimated Size:</strong> {selectedBand.split('-')[1]} bp
                </p>
                {selectedBand.includes('sample') && (
                  <p className="text-sm text-green-700">
                    ✓ PCR amplification successful
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Click on a band to analyze</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Interpretation Questions</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-blue-800">1. What is the size of your PCR product?</p>
                <p className="text-blue-700">Compare the sample band to the DNA ladder bands.</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">2. Why is the negative control important?</p>
                <p className="text-blue-700">It ensures no contamination occurred during PCR setup.</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">3. What would multiple bands indicate?</p>
                <p className="text-blue-700">Non-specific amplification or primer dimers.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Results Summary</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>✓ Target band present at expected size</p>
              <p>✓ Positive control shows amplification</p>
              <p>✓ Negative control is clean</p>
              <p><strong>Conclusion:</strong> PCR amplification successful</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};