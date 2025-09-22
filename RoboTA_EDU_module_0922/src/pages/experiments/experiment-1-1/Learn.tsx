import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Calculator } from 'lucide-react';
import { AccordionSection } from '../../../components/shared/AccordionSection';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';

export const Learn11: React.FC = () => {
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
            Experiment 1.1: Fluorescent Standard Curve
          </h1>
          <p className="text-lg text-gray-600">
            Learn about serial dilutions and standard curves through interactive simulations
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={0} />
        <SubPageNavigation experimentId="1-1" currentPage="learn" steps={steps} />

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Learning Phase</h2>
          
          <AccordionSection title="What is Fluorescence?" icon={<Activity className="h-5 w-5" />} defaultOpen>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Fluorescence is the emission of light by a substance that has absorbed light or other electromagnetic radiation. 
                In molecular biology, fluorescent markers are used to quantify DNA, RNA, and proteins because the intensity 
                of fluorescence is directly proportional to the concentration of the fluorescent molecule.
              </p>
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-primary-800 mb-2">Key Principles:</h4>
                <ul className="text-primary-700 space-y-1">
                  <li>• Fluorescence intensity ∝ Concentration</li>
                  <li>• Requires specific excitation wavelength</li>
                  <li>• Emits light at longer wavelength</li>
                </ul>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Why Use a Standard Curve?" icon={<BarChart3 className="h-5 w-5" />}>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                A standard curve is a graph that shows the relationship between concentration and signal intensity. 
                It allows us to determine unknown concentrations by comparing their fluorescence to known standards.
              </p>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-semibold text-secondary-800 mb-2">Benefits:</h4>
                <ul className="text-secondary-700 space-y-1">
                  <li>• Quantitative measurements</li>
                  <li>• Quality control</li>
                  <li>• Compensation for instrument variations</li>
                </ul>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Serial Dilution Mathematics" icon={<Calculator className="h-5 w-5" />}>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Serial dilutions create a series of decreasing concentrations by repeatedly diluting a stock solution 
                by a constant factor. The formula for concentration at each step is:
              </p>
              <div className="mt-4 p-4 bg-accent-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-mono bg-white p-3 rounded border">
                    C<sub>n</sub> = C<sub>0</sub> / D<sup>n</sup>
                  </div>
                  <p className="text-sm text-accent-700 mt-2">
                    Where C₀ = initial concentration, D = dilution factor, n = step number
                  </p>
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      </motion.div>
    </div>
  );
};