import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Zap, Droplets, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const experiments = [
    {
      id: '1.1',
      title: 'Fluorescent Standard Curve',
      description: 'Learn about serial dilutions and standard curves through interactive simulations.',
      path: '/experiment-1-1/learn',
      icon: Activity,
      color: 'from-primary-500 to-primary-600',
      objectives: ['Serial dilution principles', 'Standard curve analysis', 'Linear regression calculation']
    },
    {
      id: '1.2',
      title: 'PCR Amplification',
      description: 'Explore PCR principles and analyze results via gel electrophoresis.',
      path: '/experiment-1-2/learn',
      icon: Zap,
      color: 'from-secondary-500 to-secondary-600',
      objectives: ['PCR component functions', 'Temperature cycling', 'Gel electrophoresis analysis']
    },
    {
      id: '1.3',
      title: 'DNA Purification & Quantification',
      description: 'Master magnetic bead purification and DNA quantification techniques.',
      path: '/experiment-1-3/learn',
      icon: Droplets,
      color: 'from-accent-500 to-accent-600',
      objectives: ['Magnetic bead purification', 'Spectrophotometry', 'DNA quality assessment']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
          Module1:Standard Curve, PCR, DNA Purification
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Interactive learning modules for molecular biology experiments. 
          Follow the guided workflow: <span className="font-semibold text-primary-600">Learn → Set Up → Simulate → Experiment → Analyze</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiments.map((experiment, index) => {
          const Icon = experiment.icon;
          return (
            <motion.div
              key={experiment.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={experiment.path}>
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`h-32 bg-gradient-to-br ${experiment.color} flex items-center justify-center`}>
                    <Icon className="h-16 w-16 text-white" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Experiment {experiment.id}
                      </span>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {experiment.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {experiment.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives:</h4>
                      {experiment.objectives.map((objective, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};