import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Edit3, Save, Play, Loader2 } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Analyze12: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [concentration, setConcentration] = useState(55.2);
  const [ratio260_280, setRatio260_280] = useState(1.85);
  const [isEditingConcentration, setIsEditingConcentration] = useState(false);
  const [isEditingRatio, setIsEditingRatio] = useState(false);
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
      experiment: 'PCR Amplification Analysis',
      date: new Date().toISOString().split('T')[0],
      dna_concentration: `${concentration} ng/μL`,
      a260_a280_ratio: ratio260_280,
      expected_product_size: '10000 bp',
      gel_analysis: {
        target_band_present: true,
        positive_control: 'Shows amplification',
        negative_control: 'Clean (no contamination)',
        conclusion: 'PCR amplification successful'
      }
    };

    const csvContent = "data:text/csv;charset=utf-8," +
      "Parameter,Value\n" +
      `Experiment,${results.experiment}\n` +
      `Date,${results.date}\n` +
      `DNA Concentration,${results.dna_concentration}\n` +
      `A260/A280 Ratio,${results.a260_a280_ratio}\n` +
      `Expected Product Size,${results.expected_product_size}\n` +
      `Target Band Present,${results.gel_analysis.target_band_present ? 'Yes' : 'No'}\n` +
      `Positive Control,${results.gel_analysis.positive_control}\n` +
      `Negative Control,${results.gel_analysis.negative_control}\n` +
      `Conclusion,${results.gel_analysis.conclusion}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pcr_analysis_results_${results.date}.csv`);
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
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Experiment 1.2: PCR Amplification
          </h1>
          <p className="text-lg text-gray-600">
            Analyze your PCR results using gel electrophoresis and DNA quantification
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={4} />
        <SubPageNavigation experimentId="1-2" currentPage="analyze" steps={steps} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">📊 Analysis Phase</h2>
            <motion.button
              onClick={exportResults}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              <span>Export Results</span>
            </motion.button>
          </div>

          {/* DNA Concentration Results */}
          <motion.div 
            className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-blue-900 mb-4">🧬 DNA Concentration Results</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">DNA Concentration</h4>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.1"
                  />
                ) : (
                  <div className="text-2xl font-bold text-blue-700">{concentration} ng/μL</div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  ng/μL (nanograms per microliter) is the standard unit for DNA concentration measurement.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">A260/A280 Ratio</h4>
                  <button
                    onClick={() => setIsEditingRatio(!isEditingRatio)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isEditingRatio ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  </button>
                </div>
                {isEditingRatio ? (
                  <input
                    type="number"
                    value={ratio260_280}
                    onChange={(e) => setRatio260_280(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                ) : (
                  <div className="text-2xl font-bold text-green-700">{ratio260_280}</div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  A ratio close to 1.8 indicates good DNA purity with minimal protein contamination.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-2">Quality Assessment</h4>
                <div className={`text-lg font-semibold ${
                  ratio260_280 >= 1.7 && ratio260_280 <= 2.0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {ratio260_280 >= 1.7 && ratio260_280 <= 2.0 ? 'High Purity' : 'Moderate Purity'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on spectrophotometric analysis of nucleic acid purity.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">Understanding the Measurements:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>ng/μL:</strong> Concentration unit measuring nanograms of DNA per microliter of solution</li>
                <li>• <strong>A260/A280 ratio:</strong> Purity indicator comparing DNA absorption (260nm) to protein absorption (280nm)</li>
                <li>• <strong>Optimal range:</strong> Pure DNA typically shows A260/A280 ratios between 1.7-2.0</li>
              </ul>
            </div>
          </motion.div>

          {/* Gel Electrophoresis Results */}
          <motion.div 
            className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">⚡ Gel Electrophoresis Results</h3>
              {!showGelResults && !isLoadingGel && (
                <motion.button
                  onClick={handleLoadGelResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-4 w-4" />
                  <span>Load Gel Results</span>
                </motion.button>
              )}
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                <strong>Expected Product Size:</strong> 10,000 bp (base pairs)
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                This large PCR product requires careful gel conditions and longer run times for proper separation.
              </p>
            </div>

            {/* Loading State */}
            {isLoadingGel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-gray-100 p-8 rounded-lg">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="text-lg font-medium text-gray-700">Loading gel electrophoresis results...</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">Processing gel image and analyzing bands...</p>
                </div>
              </motion.div>
            )}

            {/* Gel Results */}
            <AnimatePresence>
              {showGelResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Gel Image - Updated with new image */}
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-4 relative overflow-hidden">
                      <img 
                        src="/image copy.png" 
                        alt="Gel Electrophoresis Results" 
                        className="w-full h-auto rounded"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Gel electrophoresis showing PCR amplification results
                      </p>
                    </div>
                  </div>

                  {/* Analysis Panel */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Band Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Target band present at ~10,000 bp</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Positive control shows expected amplification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-700">Negative control is clean (no visible bands)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Results Summary</h4>
                      <div className="space-y-1 text-sm text-green-800">
                        <p>✓ Target band present at expected size (10,000 bp)</p>
                        <p>✓ Positive control confirms PCR functionality</p>
                        <p>✓ Negative control rules out contamination</p>
                        <p><strong>Conclusion:</strong> PCR amplification successful</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Interpretation Questions</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>1. What is the size of your PCR product?</strong></p>
                        <p>Compare the sample band to the DNA ladder bands.</p>
                        
                        <p><strong>2. Why is the negative control important?</strong></p>
                        <p>It ensures no contamination occurred during PCR setup.</p>
                        
                        <p><strong>3. What would multiple bands indicate?</strong></p>
                        <p>Non-specific amplification or primer dimers.</p>
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