import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Thermometer } from 'lucide-react';
import { AccordionSection } from '../../../components/shared/AccordionSection';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Learn12: React.FC = () => {
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
            Experiment 1.2: PCR Amplification
          </h1>
          <p className="text-lg text-gray-600">
            Explore PCR principles and analyze results via gel electrophoresis
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={0} />
        <SubPageNavigation experimentId="1-2" currentPage="learn" steps={steps} />

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Learning Phase</h2>
          
          <AccordionSection title="PCR Principles" icon={<Zap className="h-5 w-5" />} defaultOpen>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                PCR (Polymerase Chain Reaction) is a technique used to amplify specific DNA sequences through repeated cycles of:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">1. Denaturation (95°C)</h4>
                  <p className="text-red-700 text-sm">Double-stranded DNA separates into single strands</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">2. Annealing (55°C)</h4>
                  <p className="text-blue-700 text-sm">Primers bind to complementary sequences</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">3. Extension (72°C)</h4>
                  <p className="text-green-700 text-sm">DNA polymerase synthesizes new DNA strands</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-semibold text-secondary-800 mb-2">Exponential Amplification:</h4>
                <p className="text-secondary-700">After n cycles: 2ⁿ copies of target sequence</p>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="PCR Components" icon={<Thermometer className="h-5 w-5" />}>
            <div className="prose max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Essential Components:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Template DNA:</strong> Contains target sequence</li>
                    <li><strong>Primers:</strong> Short DNA sequences that define amplification region</li>
                    <li><strong>DNA Polymerase:</strong> Enzyme that synthesizes new DNA</li>
                    <li><strong>dNTPs:</strong> Building blocks for DNA synthesis</li>
                    <li><strong>Buffer:</strong> Maintains optimal reaction conditions</li>
                    <li><strong>MgCl₂:</strong> Cofactor for polymerase activity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Quality Controls:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Positive Control:</strong> Known template that should amplify</li>
                    <li><strong>Negative Control:</strong> No template (blank)</li>
                    <li><strong>NTC:</strong> No Template Control</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      </motion.div>
    </div>
  );
};