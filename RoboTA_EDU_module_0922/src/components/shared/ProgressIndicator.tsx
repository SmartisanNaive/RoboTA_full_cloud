import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white p-8 rounded-lg shadow-lg mb-8 border border-blue-100/50">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                    : index === currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200/50'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: index === currentStep ? 1.1 : 1,
                  boxShadow: index === currentStep 
                    ? '0 8px 16px rgba(33, 150, 243, 0.3)' 
                    : '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: index <= currentStep ? 1.15 : 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                {index < currentStep ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </motion.div>
              
              <motion.span 
                className={`text-sm mt-3 font-medium transition-all duration-300 text-center min-w-[80px] ${
                  index === currentStep 
                    ? 'text-blue-700 font-semibold' 
                    : index < currentStep
                    ? 'text-green-700 font-medium'
                    : 'text-gray-600'
                }`}
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.7,
                  y: index === currentStep ? -2 : 0
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </motion.span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 relative">
                <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-500 ${
                      index < currentStep 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : 'bg-gray-200'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: index < currentStep ? '100%' : '0%',
                      boxShadow: index < currentStep 
                        ? '0 2px 4px rgba(34, 197, 94, 0.3)' 
                        : 'none'
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Summary */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].charAt(0).toUpperCase() + steps[currentStep].slice(1)} Phase
          </span>
        </div>
      </motion.div>
    </div>
  );
};