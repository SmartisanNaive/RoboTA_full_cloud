import React from 'react';
import { motion } from 'framer-motion';
import { Magnet, BarChart3 } from 'lucide-react';
import { AccordionSection } from '../../../components/shared/AccordionSection';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Learn13: React.FC = () => {
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
            Master magnetic bead purification and DNA quantification techniques
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={0} />
        <SubPageNavigation experimentId="1-3" currentPage="learn" steps={steps} />

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Learning Phase</h2>
          
          <AccordionSection title="Magnetic Bead Purification" icon={<Magnet className="h-5 w-5" />} defaultOpen>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Magnetic bead purification uses paramagnetic beads to selectively bind and purify DNA through a simple three-step process:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">1. Bind</h4>
                  <p className="text-blue-700 text-sm">DNA binds to magnetic beads in presence of binding buffer (high salt/PEG)</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">2. Wash</h4>
                  <p className="text-yellow-700 text-sm">Ethanol washes remove contaminants while DNA stays bound to beads</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">3. Elute</h4>
                  <p className="text-green-700 text-sm">Low-salt buffer releases pure DNA from beads</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-semibold text-secondary-800 mb-2">Bead Ratio Effects:</h4>
                <ul className="text-secondary-700 space-y-1">
                  <li>• <strong>High ratio ({'>'} 1.8x):</strong> Binds smaller fragments, higher purity</li>
                  <li>• <strong>Low ratio ({'<'} 1.0x):</strong> Selects larger fragments, size selection</li>
                </ul>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="DNA Quantification by Spectrophotometry" icon={<BarChart3 className="h-5 w-5" />}>
            <div className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Key Measurements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>A260:</strong> DNA/RNA absorption peak</li>
                    <li><strong>A280:</strong> Protein absorption peak</li>
                    <li><strong>A230:</strong> Salt/organic compound absorption</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <h5 className="font-semibold text-primary-800 mb-2">Concentration Formula:</h5>
                    <div className="text-center text-primary-700 font-mono">
                      [DNA] = A260 × 50 × dilution factor
                    </div>
                    <p className="text-xs text-primary-600 mt-1 text-center">
                      (50 μg/mL is the extinction coefficient for dsDNA)
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Purity Assessment:</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800">A260/A280 Ratio</h5>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Pure DNA: ~1.8</li>
                        <li>• Protein contamination: {'<'}1.6</li>
                        <li>• RNA contamination: {'>'}2.0</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-800">A260/A230 Ratio</h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Pure DNA: 2.0-2.2</li>
                        <li>• Salt contamination: {'<'}1.5</li>
                        <li>• Organic contamination: {'<'}1.8</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      </motion.div>
    </div>
  );
};