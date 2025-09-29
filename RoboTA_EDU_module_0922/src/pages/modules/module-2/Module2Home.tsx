import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Droplets, FlaskRound } from 'lucide-react';
import { ModulePageHeader } from '../../../components/shared/ModulePageHeader';
import { ModuleCard } from '../../../components/shared/ModuleCard';

export const Module2Home: React.FC = () => {
  const subModules = [
    {
      title: '2A: Cell-free Gene Expression',
      description: 'Explore protein synthesis in controlled cell-free systems with real-time monitoring and optimization.',
      path: '/module/2/expression',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      objectives: ['Cell-free transcription/translation', 'Protein expression optimization', 'Real-time fluorescence monitoring']
    },
    {
      title: '2B: Protein Purification and Quantitative Analysis',
      description: 'Master advanced protein purification techniques and comprehensive quantitative analysis methods.',
      path: '/module/2/purification',
      icon: Droplets,
      color: 'from-purple-500 to-purple-600',
      objectives: ['Affinity chromatography', 'Protein quantification', 'Activity assays & characterization']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Unified Module Header */}
        <ModulePageHeader
          icon={Zap}
          title="Module 2 · Cell-free Gene Expression and Analysis"
          subtitle="Laboratory automation fundamentals for expression, purification, and assay workflows"
          gradientFrom="from-secondary-600"
          gradientTo="to-purple-600"
          iconGradientFrom="from-secondary-500"
          iconGradientTo="to-secondary-600"
          accentDotColor="bg-yellow-400"
        />

        <motion.p
          className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        >
          Dive deep into protein synthesis and purification using cutting-edge cell-free systems. Learn to express,
          purify, and analyze proteins with precision and efficiency.
        </motion.p>

        {/* Enhanced Learning Objectives */}
        <motion.div 
          className="bg-gradient-to-br from-secondary-50 via-purple-50 to-blue-50 rounded-3xl p-10 mb-16 border border-secondary-200 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-3xl font-bold text-secondary-900 mb-8 text-center flex items-center justify-center">
            <FlaskRound className="h-8 w-8 mr-3" />
            🎯 Module Learning Objectives
          </h3>
          
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-secondary-800 mb-6 text-lg flex items-center">
                <div className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></div>
                Core Concepts
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Cell-free transcription and translation mechanisms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Protein folding and post-translational modifications</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Chromatographic separation principles</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h4 className="font-bold text-purple-800 mb-6 text-lg flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                Technical Skills
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Protein expression optimization strategies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Advanced purification technique selection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Quantitative protein analysis methods</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Sub-module Selection */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {subModules.map((subModule, index) => (
            <ModuleCard
              key={index}
              title={subModule.title}
              description={subModule.description}
              path={subModule.path}
              icon={subModule.icon}
              color={subModule.color}
              objectives={subModule.objectives}
              index={index}
            />
          ))}
        </div>

        {/* Enhanced Module Overview */}
        <motion.div 
          className="bg-white rounded-3xl p-10 shadow-xl border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔬 Experimental Workflow Overview
          </h3>
          
          <div className="grid md:grid-cols-5 gap-6">
            {['Learn', 'Setup', 'Simulate', 'Experiment', 'Analyze'].map((step, index) => (
              <motion.div
                key={step}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">{step}</h4>
                <div className="w-8 h-1 bg-gradient-to-r from-secondary-400 to-purple-400 rounded-full mx-auto"></div>
              </motion.div>
            ))}
          </div>
          
          <motion.p 
            className="text-center text-gray-600 mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            Each sub-module follows the same comprehensive 5-step workflow for consistent learning experience
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
