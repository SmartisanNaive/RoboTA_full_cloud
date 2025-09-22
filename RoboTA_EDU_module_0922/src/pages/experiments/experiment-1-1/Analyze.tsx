import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calculator, Edit3, Save, X, TrendingUp } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';
import { StandardCurveChart } from '../../../components/experiments/StandardCurveChart';

interface DataPoint {
  concentration: number;
  fluorescence: number;
}

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
}

export const Analyze11: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [isCalculating, setIsCalculating] = useState(false);
  const [showRegression, setShowRegression] = useState(false);
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Initialize with default data
  const [data, setData] = useState<DataPoint[]>([
    { concentration: 1000, fluorescence: 850 },
    { concentration: 500, fluorescence: 425 },
    { concentration: 250, fluorescence: 212 },
    { concentration: 125, fluorescence: 106 },
    { concentration: 62.5, fluorescence: 53 },
    { concentration: 31.25, fluorescence: 27 },
    { concentration: 15.625, fluorescence: 13 },
    { concentration: 7.8125, fluorescence: 7 }
  ]);

  const calculateRegression = useCallback(() => {
    setIsCalculating(true);
    
    // Simulate 5-second calculation delay
    setTimeout(() => {
      const n = data.length;
      const sumX = data.reduce((sum, p) => sum + p.concentration, 0);
      const sumY = data.reduce((sum, p) => sum + p.fluorescence, 0);
      const sumXY = data.reduce((sum, p) => sum + p.concentration * p.fluorescence, 0);
      const sumXX = data.reduce((sum, p) => sum + p.concentration * p.concentration, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate R²
      const meanY = sumY / n;
      const ssRes = data.reduce((sum, p) => {
        const predicted = slope * p.concentration + intercept;
        return sum + Math.pow(p.fluorescence - predicted, 2);
      }, 0);
      const ssTot = data.reduce((sum, p) => sum + Math.pow(p.fluorescence - meanY, 2), 0);
      const rSquared = 1 - (ssRes / ssTot);

      const result: RegressionResult = {
        slope,
        intercept,
        rSquared,
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(2)}`
      };

      setRegressionResult(result);
      setShowRegression(true);
      setIsCalculating(false);
    }, 5000);
  }, [data]);

  const handleCellEdit = (index: number, field: 'concentration' | 'fluorescence', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: numValue };
      setData(newData);
      // Reset regression when data changes
      setShowRegression(false);
      setRegressionResult(null);
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Concentration (ng/μL),Fluorescence\n";
    
    // Add data points
    data.forEach(point => {
      csvContent += `${point.concentration},${point.fluorescence}\n`;
    });
    
    // Add regression results if available
    if (regressionResult) {
      csvContent += "\nRegression Analysis\n";
      csvContent += `Equation,${regressionResult.equation}\n`;
      csvContent += `Slope,${regressionResult.slope.toFixed(6)}\n`;
      csvContent += `Intercept,${regressionResult.intercept.toFixed(4)}\n`;
      csvContent += `R-squared,${regressionResult.rSquared.toFixed(6)}\n`;
      csvContent += `Correlation,${regressionResult.rSquared > 0.95 ? 'Excellent' : regressionResult.rSquared > 0.90 ? 'Good' : 'Fair'}\n`;
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `experiment_1-1_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addDataPoint = () => {
    setData([...data, { concentration: 0, fluorescence: 0 }]);
  };

  const removeDataPoint = (index: number) => {
    if (data.length > 2) {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
      setShowRegression(false);
      setRegressionResult(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Experiment 1.1: Fluorescent Standard Curve
          </h1>
          <p className="text-lg text-gray-600">
            Analyze your experimental results with interactive data analysis
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={4} />
        <SubPageNavigation experimentId="1-1" currentPage="analyze" steps={steps} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">📊 Analysis Phase</h2>
            <div className="flex space-x-3">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isEditing 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                <span>{isEditing ? 'Done Editing' : 'Edit Data'}</span>
              </motion.button>
              
              <motion.button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </motion.button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Results Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Interactive Results Table</h3>
                {isEditing && (
                  <button
                    onClick={addDataPoint}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    + Add Point
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Concentration (ng/μL)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Fluorescence</th>
                      {isEditing && <th className="text-left p-3 font-semibold text-gray-700">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {data.map((row, index) => (
                        <motion.tr 
                          key={index} 
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.concentration}
                                onChange={(e) => handleCellEdit(index, 'concentration', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.001"
                              />
                            ) : (
                              <span className="font-medium">{row.concentration.toFixed(3)}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={row.fluorescence}
                                onChange={(e) => handleCellEdit(index, 'fluorescence', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.1"
                              />
                            ) : (
                              <span>{row.fluorescence.toFixed(1)}</span>
                            )}
                          </td>
                          {isEditing && (
                            <td className="p-3">
                              <button
                                onClick={() => removeDataPoint(index)}
                                disabled={data.length <= 2}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-center">
                <motion.button
                  onClick={calculateRegression}
                  disabled={isCalculating || data.length < 2}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    isCalculating 
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={!isCalculating ? { scale: 1.05 } : {}}
                  whileTap={!isCalculating ? { scale: 0.95 } : {}}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      <span>Calculate Linear Regression</span>
                    </>
                  )}
                </motion.button>
                
                {isCalculating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center justify-center space-x-2 text-blue-700">
                      <TrendingUp className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-medium">Processing regression analysis...</span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Enhanced Standard Curve Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <StandardCurveChart 
                data={data} 
                showRegression={showRegression}
                regressionResult={regressionResult}
              />
              
              {/* Regression Results Panel */}
              <AnimatePresence>
                {regressionResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                  >
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Regression Analysis Results
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Equation:</span>
                        <div className="font-mono text-green-700 bg-white px-2 py-1 rounded mt-1">
                          {regressionResult.equation}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">R²:</span>
                        <div className="font-mono text-green-700 bg-white px-2 py-1 rounded mt-1">
                          {regressionResult.rSquared.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Slope:</span>
                        <div className="font-mono text-green-700 bg-white px-2 py-1 rounded mt-1">
                          {regressionResult.slope.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Correlation:</span>
                        <div className={`font-semibold px-2 py-1 rounded mt-1 ${
                          regressionResult.rSquared > 0.95 ? 'text-green-700 bg-green-100' :
                          regressionResult.rSquared > 0.90 ? 'text-yellow-700 bg-yellow-100' :
                          'text-red-700 bg-red-100'
                        }`}>
                          {regressionResult.rSquared > 0.95 ? 'Excellent' : 
                           regressionResult.rSquared > 0.90 ? 'Good' : 'Fair'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Analysis Questions */}
          <motion.div 
            className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold text-blue-900 mb-4 text-lg">📝 Analysis Questions</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-blue-800 mb-2">1. Evaluate your standard curve quality:</p>
                  <p className="text-blue-700">
                    {regressionResult ? (
                      `Your R² value of ${regressionResult.rSquared.toFixed(4)} indicates ${
                        regressionResult.rSquared > 0.95 ? 'excellent linearity' : 
                        regressionResult.rSquared > 0.90 ? 'good linearity' : 'poor linearity'
                      }.`
                    ) : (
                      'Calculate the regression to assess curve quality.'
                    )}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-blue-800 mb-2">2. Interpret the slope:</p>
                  <p className="text-blue-700">
                    {regressionResult ? (
                      `The slope of ${regressionResult.slope.toFixed(4)} represents the fluorescence response per ng/μL of DNA.`
                    ) : (
                      'The slope indicates the sensitivity of your assay.'
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-blue-800 mb-2">3. Dynamic range assessment:</p>
                  <p className="text-blue-700">
                    Your curve spans from {Math.min(...data.map(d => d.concentration)).toFixed(3)} to {Math.max(...data.map(d => d.concentration)).toFixed(1)} ng/μL, 
                    providing a {(Math.max(...data.map(d => d.concentration)) / Math.min(...data.map(d => d.concentration))).toFixed(0)}-fold dynamic range.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-blue-800 mb-2">4. Practical applications:</p>
                  <p className="text-blue-700">
                    This standard curve can be used to quantify unknown DNA samples within the established concentration range.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};