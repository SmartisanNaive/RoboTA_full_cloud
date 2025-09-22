import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Calculator, FlaskRound } from 'lucide-react';
import { ModuleCard } from '../components/shared/ModuleCard';

export const PlatformHome: React.FC = () => {
  const modules = [
    {
      title: 'Module 1: Standard Curve, PCR, DNA Purification',
      description: 'Master fundamental molecular biology techniques through interactive experiments and real-time analysis.',
      path: '/module/1',
      icon: Activity,
      color: 'from-primary-500 to-primary-600',
      objectives: ['Serial dilution & standard curves', 'PCR amplification & analysis', 'DNA purification & quantification']
    },
    {
      title: 'Module 2: Cell-free Gene Expression and Analysis',
      description: 'Explore protein synthesis and purification in controlled cell-free systems with advanced analytics.',
      path: '/module/2',
      icon: Zap,
      color: 'from-secondary-500 to-secondary-600',
      objectives: ['Cell-free protein expression', 'Protein purification techniques', 'Quantitative protein analysis']
    },
    {
      title: 'Module 3: Computational Modeling and System Verification',
      description: 'Build intuitive understanding of biological systems through interactive mathematical modeling.',
      path: '/module/3',
      icon: Calculator,
      color: 'from-accent-500 to-accent-600',
      objectives: ['ODE modeling & simulation', 'Parameter sensitivity analysis', 'System behavior exploration']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Hero Banner with Robotic Laboratory Background */}
      <motion.div 
        className="relative mb-16 rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 via-secondary-600/85 to-accent-600/90"></div>
        <div 
          className="relative h-96 bg-cover bg-center flex items-center justify-center"
          style={{ 
            backgroundImage: 'url("/image copy copy copy copy.png")',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="text-center text-white px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center mb-6"
            >
              <div className="relative">
                <FlaskRound className="h-20 w-20 mr-6 drop-shadow-lg" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
                  SynbioCloudLab
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mt-2 mx-auto"></div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Next-Generation Cloud Platform for Synthetic Biology Education
              <br />
              <span className="text-lg text-blue-200">Powered by Robotic Automation & AI-Driven Analytics</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 text-sm md:text-base"
            >
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                🧬 Molecular Biology
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                🤖 Robotic Automation
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                📊 Real-time Analytics
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                🔬 Interactive Learning
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Platform Overview */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
          Comprehensive Learning Modules
        </h2>
        <p className="text-xl text-gray-600 max-w-5xl mx-auto leading-relaxed">
          Experience hands-on synthetic biology through our integrated platform combining 
          <span className="font-semibold text-primary-600 mx-1">robotic automation</span>, 
          <span className="font-semibold text-secondary-600 mx-1">real-time monitoring</span>, and 
          <span className="font-semibold text-accent-600 mx-1">computational modeling</span>
        </p>
        
        <motion.div 
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100 px-8 py-4 rounded-full border border-primary-200">
            <p className="text-gray-700 font-medium">
              🎯 <span className="font-bold">Learn</span> → 
              ⚙️ <span className="font-bold">Setup</span> → 
              🧪 <span className="font-bold">Simulate</span> → 
              🔬 <span className="font-bold">Experiment</span> → 
              📊 <span className="font-bold">Analyze</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Module Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {modules.map((module, index) => (
          <ModuleCard
            key={index}
            title={module.title}
            description={module.description}
            path={module.path}
            icon={module.icon}
            color={module.color}
            objectives={module.objectives}
            index={index}
          />
        ))}
      </div>

      {/* Enhanced Platform Features */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-3xl p-10 shadow-xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-900">
          🚀 Advanced Platform Capabilities
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div 
            className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🤖</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Robotic Automation</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Opentrons Flex integration for precise, reproducible experiments with real-time monitoring</p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Real-time Analytics</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Live data visualization, interactive analysis tools, and AI-powered insights</p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🧮</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Computational Models</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Interactive ODE modeling, parameter exploration, and system behavior prediction</p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🎓</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Guided Learning</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Step-by-step workflows with educational content and adaptive learning paths</p>
          </motion.div>
        </div>

        {/* Additional Stats Section */}
        <motion.div 
          className="mt-12 grid md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
            <div className="text-2xl font-bold">15+</div>
            <div className="text-sm opacity-90">Experiments</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-90">Learning Modules</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm opacity-90">Cloud Access</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
            <div className="text-2xl font-bold">AI</div>
            <div className="text-sm opacity-90">Powered</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};