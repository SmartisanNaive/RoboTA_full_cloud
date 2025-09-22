import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Edit3, Save, Play, Loader2, BarChart3, Zap } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Analyze13: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [concentration, setConcentration] = useState(37.0);
  const [ratio260_280, setRatio260_280] = useState(1.86);
  const [ratio260_230, setRatio260_230] = useState(2.10);
  const [isEditingConcentration, setIsEditingConcentration] = useState(false);
  const [isEditingRatio280, setIsEditingRatio280] = useState(false);
  const [isEditingRatio230, setIsEditingRatio230] = useState(false);
  const [isLoadingGel, setIsLoadingGel] = useState(false);
  const [showGelResults, setShowGelResults] = useState(false);

  const handleLoadGelResults = () => {
    setIsLoadingGel(true);
    setTimeout(() => {
      setIsLoadingGel(false);
      setShowGelResults(true);
    }, 10000);
  };

  const exportResults = () => {
    const results = {
      experiment: 'DNA Purification & Quantification Analysis',
      date: new Date().toISOString().split('T')[0],
      dna_concentration: `${concentration} μg/mL`,
      a260_a280_ratio: ratio260_280,
      a260_a230_ratio: ratio260_230,
      total_yield: `${(concentration * 50 / 1000).toFixed(1)} μg`,
      gel_analysis: {
        size_selection_effective: true,
        bead_ratio_optimization: 'Shows different fragment recovery',
        conclusion: 'Purification successful with size selection'
      }
    };

    const csvContent = "data:text/csv;charset=utf-8," +
      "Parameter,Value\n" +
      `Experiment,${results.experiment}\n` +
      `Date,${results.date}\n` +
      `DNA Concentration,${results.dna_concentration}\n` +
      `A260/A280 Ratio,${results.a260_a280_ratio}\n` +
      `A260/A230 Ratio,${results.a260_a230_ratio}\n` +
      `Total Yield,${results.total_yield}\n` +
      `Size Selection,${results.gel_analysis.size_selection_effective ? 'Yes' : 'No'}\n` +
      `Bead Ratio Effect,${results.gel_analysis.bead_ratio_optimization}\n` +
      `Conclusion,${results.gel_analysis.conclusion}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dna_purification_analysis_${results.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 shadow-xl border border-blue-100"
      >
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Experiment 1.3: DNA Purification & Quantification
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Comprehensive analysis of your purified DNA quality, quantity, and size selection results
              </p>
            </div>
          </div>
        </div>

        <ProgressIndicator steps={steps} currentStep={4} />
        <SubPageNavigation experimentId="1-3" currentPage="analyze" steps={steps} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">📊 Comprehensive Analysis Results</h2>
            </div>
            <motion.button
              onClick={exportResults}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-5 w-5" />
              <span>Export Complete Results</span>
            </motion.button>
          </div>

          {/* Enhanced DNA Quantification Results */}
          <motion.div 
            className="mb-8 bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              🧬 Spectrophotometer Analysis Results
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* NanoDrop Display */}
              <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm shadow-lg">
                <div className="text-center mb-4 text-green-300 text-lg font-bold">NanoDrop 2000c</div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-green-400">A260: 0.740</div>
                      <div className="text-green-400">A280: 0.398</div>
                      <div className="text-green-400">A230: 0.352</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-green-400">260/280: {ratio260_280}</div>
                      <div className="text-green-400">260/230: {ratio260_230}</div>
                      <div className="text-green-400">Conc: {concentration} μg/mL</div>
                    </div>
                  </div>
                </div>
                
                {/* Spectral Curve */}
                <div className="mt-6 h-24 bg-gray-800 rounded-lg p-3">
                  <svg viewBox="0 0 300 80" className="w-full h-full">
                    <motion.path
                      d="M 20 60 Q 80 50 120 15 Q 160 25 200 45 Q 240 55 280 60"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2 }}
                    />
                    <circle cx="120" cy="15" r="3" fill="#ef4444" />
                    <circle cx="160" cy="25" r="3" fill="#f59e0b" />
                    <text x="120" y="12" textAnchor="middle" className="text-xs fill-red-400">260</text>
                    <text x="160" y="22" textAnchor="middle" className="text-xs fill-yellow-400">280</text>
                  </svg>
                </div>
              </div>

              {/* Quantification Summary */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">📊 Quantification Summary</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Concentration</span>
                        <button
                          onClick={() => setIsEditingConcentration(!isEditingConcentration)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {isEditingConcentration ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </button>
                      </div>
                      {isEditingConcentration ? (
                        <input
                          type="number"
                          value={concentration}
                          onChange={(e) => setConcentration(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-bold text-lg"
                          step="0.1"
                        />
                      ) : (
                        <div className="text-3xl font-bold text-blue-700">{concentration}</div>
                      )}
                      <div className="text-sm text-blue-600 font-medium">μg/mL</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-sm font-medium text-purple-700 mb-2">Total Yield</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {(concentration * 50 / 1000).toFixed(1)}
                      </div>
                      <div className="text-sm text-purple-600 font-medium">μg</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p><strong>Volume:</strong> 50 μL</p>
                    <p><strong>Bead Ratio:</strong> 1.8x</p>
                    <p><strong>Method:</strong> Magnetic bead purification</p>
                  </div>
                </div>

                {/* Purity Assessment */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">🔬 Purity Assessment</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div>
                        <div className="font-semibold text-green-900">A260/A280 Ratio</div>
                        <div className="text-sm text-green-700">Protein contamination check</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditingRatio280 ? (
                          <input
                            type="number"
                            value={ratio260_280}
                            onChange={(e) => setRatio260_280(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-green-300 rounded focus:ring-2 focus:ring-green-500 text-center font-bold"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-green-700">{ratio260_280}</div>
                        )}
                        <button
                          onClick={() => setIsEditingRatio280(!isEditingRatio280)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          {isEditingRatio280 ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div>
                        <div className="font-semibold text-blue-900">A260/A230 Ratio</div>
                        <div className="text-sm text-blue-700">Salt/organic contamination check</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditingRatio230 ? (
                          <input
                            type="number"
                            value={ratio260_230}
                            onChange={(e) => setRatio260_230(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 text-center font-bold"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-blue-700">{ratio260_230}</div>
                        )}
                        <button
                          onClick={() => setIsEditingRatio230(!isEditingRatio230)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {isEditingRatio230 ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-semibold ${
                        (ratio260_280 >= 1.7 && ratio260_280 <= 2.0) && (ratio260_230 >= 1.8 && ratio260_230 <= 2.2) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <span>
                          {(ratio260_280 >= 1.7 && ratio260_280 <= 2.0) && (ratio260_230 >= 1.8 && ratio260_230 <= 2.2) 
                            ? '✅ Excellent Purity' 
                            : '⚠️ Good Purity'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Gel Electrophoresis Results */}
          <motion.div 
            className="mb-8 bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl shadow-lg border border-purple-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-900 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                ⚡ Size Selection Analysis - Gel Electrophoresis
              </h3>
              {!showGelResults && !isLoadingGel && (
                <motion.button
                  onClick={handleLoadGelResults}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-5 w-5" />
                  <span>Load Gel Analysis Results</span>
                </motion.button>
              )}
            </div>
            
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-900 mb-2">🧪 Experiment Overview</h4>
              <p className="text-yellow-800 font-medium">
                <strong>Bead Ratio Optimization:</strong> Testing different SPRI bead ratios (3x to 0.4x) for size-selective DNA purification
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Higher ratios (3x-1x) recover smaller fragments, while lower ratios (0.8x-0.4x) selectively purify larger DNA fragments.
              </p>
            </div>

            {/* Loading State */}
            {isLoadingGel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                    <span className="text-xl font-semibold text-gray-700">Processing gel electrophoresis analysis...</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-4 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Analyzing band patterns and size distribution...</p>
                </div>
              </motion.div>
            )}

            {/* Enhanced Gel Results */}
            <AnimatePresence>
              {showGelResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Gel Image */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-lg">
                      <img 
                        src="/image copy copy copy.png" 
                        alt="Size Selection Gel Electrophoresis Results" 
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 font-medium">
                        Gel electrophoresis showing size-selective purification with different bead ratios
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Analysis Panel */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">🔍 Band Pattern Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 font-medium">High ratios (3x-1.5x): Complete fragment recovery</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 font-medium">Medium ratios (1x-0.8x): Selective recovery</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 font-medium">Low ratios (0.7x-0.4x): Large fragment enrichment</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3 text-lg">✅ Results Summary</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <p>✓ Size selection successfully demonstrated</p>
                        <p>✓ Bead ratio optimization effective</p>
                        <p>✓ Clear size-dependent recovery patterns</p>
                        <p>✓ Larger fragments enriched at lower ratios</p>
                        <p><strong>Conclusion:</strong> SPRI bead purification with size selection successful</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">📚 Interpretation Guide</h4>
                      <div className="space-y-3 text-sm text-blue-800">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold">1. How does bead ratio affect recovery?</p>
                          <p>Higher ratios bind more fragments; lower ratios are size-selective.</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold">2. What causes the size selection effect?</p>
                          <p>Competition between DNA fragments for limited bead binding sites.</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold">3. Practical applications?</p>
                          <p>Library preparation, fragment size selection, cleanup protocols.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};