import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface SpectrophotometerResultsProps {
  beadRatio: number;
  elutionVolume: number;
}

export const SpectrophotometerResults: React.FC<SpectrophotometerResultsProps> = ({ 
  beadRatio, 
  elutionVolume 
}) => {
  // Simulate realistic results based on parameters
  const generateResults = () => {
    const baseA260 = 0.5 + (beadRatio - 1) * 0.3;
    const baseA280 = baseA260 / 1.8 + (Math.random() - 0.5) * 0.05;
    const baseA230 = baseA260 / 2.1 + (Math.random() - 0.5) * 0.1;
    
    const concentration = baseA260 * 50; // μg/mL
    const totalYield = (concentration * elutionVolume) / 1000; // μg
    
    return {
      A260: baseA260,
      A280: baseA280,
      A230: baseA230,
      concentration,
      totalYield,
      ratio260_280: baseA260 / baseA280,
      ratio260_230: baseA260 / baseA230
    };
  };

  const results = generateResults();

  const getPurityAssessment = (ratio260_280: number, ratio260_230: number) => {
    const proteinPurity = ratio260_280 >= 1.7 && ratio260_280 <= 2.0;
    const saltPurity = ratio260_230 >= 1.8 && ratio260_230 <= 2.2;
    
    if (proteinPurity && saltPurity) return { status: 'excellent', color: 'green', message: 'Excellent purity' };
    if (proteinPurity || saltPurity) return { status: 'good', color: 'yellow', message: 'Good purity' };
    return { status: 'poor', color: 'red', message: 'Purification needed' };
  };

  const purityAssessment = getPurityAssessment(results.ratio260_280, results.ratio260_230);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Spectrophotometer Display */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spectrophotometer Results</h3>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
          <div className="text-center mb-2 text-green-300">NanoDrop 2000c</div>
          <div className="border-t border-gray-700 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div>A260: {results.A260.toFixed(3)}</div>
                <div>A280: {results.A280.toFixed(3)}</div>
                <div>A230: {results.A230.toFixed(3)}</div>
              </div>
              <div>
                <div>260/280: {results.ratio260_280.toFixed(2)}</div>
                <div>260/230: {results.ratio260_230.toFixed(2)}</div>
                <div>Conc: {results.concentration.toFixed(1)} μg/mL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Spectral Curve Visualization */}
        <div className="h-32 bg-gray-50 rounded-lg p-4 mb-4">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            {/* Absorption curve */}
            <motion.path
              d="M 20 80 Q 80 70 120 20 Q 160 30 200 60 Q 240 70 280 80"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            {/* Peak markers */}
            <circle cx="120" cy="20" r="3" fill="#ef4444" />
            <circle cx="160" cy="30" r="3" fill="#f59e0b" />
            <text x="120" y="15" textAnchor="middle" className="text-xs fill-red-600">260</text>
            <text x="160" y="25" textAnchor="middle" className="text-xs fill-yellow-600">280</text>
          </svg>
        </div>

        <div className="text-center">
          <motion.div
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              purityAssessment.status === 'excellent' ? 'bg-green-100 text-green-800' :
              purityAssessment.status === 'good' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {purityAssessment.status === 'excellent' ? <CheckCircle className="h-4 w-4" /> :
             purityAssessment.status === 'good' ? <TrendingUp className="h-4 w-4" /> :
             <AlertCircle className="h-4 w-4" />}
            <span className="font-medium">{purityAssessment.message}</span>
          </motion.div>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="space-y-6">
        {/* Quantification Results */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Quantification Summary</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {results.concentration.toFixed(1)}
              </div>
              <div className="text-sm text-primary-700">μg/mL</div>
              <div className="text-xs text-gray-600">Concentration</div>
            </div>
            
            <div className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600">
                {results.totalYield.toFixed(1)}
              </div>
              <div className="text-sm text-secondary-700">μg</div>
              <div className="text-xs text-gray-600">Total Yield</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Volume:</strong> {elutionVolume} μL</p>
            <p><strong>Bead Ratio:</strong> {beadRatio}x</p>
          </div>
        </div>

        {/* Purity Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-4">Purity Assessment</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">A260/A280 Ratio</div>
                <div className="text-sm text-gray-600">Protein contamination check</div>
              </div>
              <div className={`text-lg font-bold ${
                results.ratio260_280 >= 1.7 && results.ratio260_280 <= 2.0 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {results.ratio260_280.toFixed(2)}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">A260/A230 Ratio</div>
                <div className="text-sm text-gray-600">Salt/organic contamination check</div>
              </div>
              <div className={`text-lg font-bold ${
                results.ratio260_230 >= 1.8 && results.ratio260_230 <= 2.2 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {results.ratio260_230.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation Questions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4">Analysis Questions</h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-blue-800">1. Calculate the total DNA yield:</p>
              <p className="text-blue-700">
                Yield = Concentration × Volume = {results.concentration.toFixed(1)} μg/mL × {elutionVolume} μL = {results.totalYield.toFixed(1)} μg
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-800">2. Assess DNA purity:</p>
              <p className="text-blue-700">
                A260/A280 = {results.ratio260_280.toFixed(2)} ({results.ratio260_280 >= 1.7 && results.ratio260_280 <= 2.0 ? 'Good' : 'Needs improvement'})
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-800">3. How would changing bead ratio affect results?</p>
              <p className="text-blue-700">
                Higher ratios increase purity but may reduce yield of larger fragments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};