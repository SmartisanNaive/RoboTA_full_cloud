import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { SubPageNavigation } from '../../../components/shared/SubPageNavigation';
import { PCRProgram } from '../../../components/experiments/PCRProgram';

interface PCRParams {
  template: string;
  primerPair: string;
  program: string;
}

export const Setup12: React.FC = () => {
  const steps = ['learn', 'setup', 'simulate', 'experiment', 'analyze'];
  const [params, setParams] = useState<PCRParams>({
    template: 'genomic-dna',
    primerPair: 'gene-specific',
    program: 'standard'
  });

  const templates = [
    { value: 'genomic-dna', label: 'Genomic DNA (1 ng/μL)' },
    { value: 'plasmid-dna', label: 'Plasmid DNA (10 ng/μL)' },
    { value: 'cdna', label: 'cDNA (5 ng/μL)' }
  ];

  const primers = [
    { value: 'gene-specific', label: 'Gene-specific primers (500 bp product)' },
    { value: 'universal', label: 'Universal primers (200 bp product)' },
    { value: 'nested', label: 'Nested primers (300 bp product)' }
  ];

  const programs = [
    { value: 'standard', label: 'Standard PCR (35 cycles)' },
    { value: 'touchdown', label: 'Touchdown PCR (40 cycles)' },
    { value: 'long-range', label: 'Long-range PCR (30 cycles)' }
  ];

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
            Configure your PCR parameters
          </p>
        </div>

        <ProgressIndicator steps={steps} currentStep={1} />
        <SubPageNavigation experimentId="1-2" currentPage="setup" steps={steps} />

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚙️ Setup Phase</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PCR Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNA Template
                  </label>
                  <select
                    value={params.template}
                    onChange={(e) => setParams({...params, template: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {templates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Pair
                  </label>
                  <select
                    value={params.primerPair}
                    onChange={(e) => setParams({...params, primerPair: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {primers.map(primer => (
                      <option key={primer.value} value={primer.value}>
                        {primer.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PCR Program
                  </label>
                  <select
                    value={params.program}
                    onChange={(e) => setParams({...params, program: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {programs.map(program => (
                      <option key={program.value} value={program.value}>
                        {program.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">👁️ Live Preview</h2>
            <PCRProgram program={params.program} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};