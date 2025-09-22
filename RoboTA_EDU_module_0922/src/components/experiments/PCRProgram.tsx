import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Timer, RotateCcw } from 'lucide-react';

interface PCRProgramProps {
  program: string;
}

export const PCRProgram: React.FC<PCRProgramProps> = ({ program }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const programs = {
    standard: {
      name: 'Standard PCR',
      steps: [
        { name: 'Initial Denaturation', temp: 95, time: 300, color: '#ef4444' },
        { name: 'Denaturation', temp: 95, time: 30, color: '#ef4444', cycles: 35 },
        { name: 'Annealing', temp: 55, time: 30, color: '#3b82f6', cycles: 35 },
        { name: 'Extension', temp: 72, time: 60, color: '#10b981', cycles: 35 },
        { name: 'Final Extension', temp: 72, time: 600, color: '#10b981' }
      ]
    },
    touchdown: {
      name: 'Touchdown PCR',
      steps: [
        { name: 'Initial Denaturation', temp: 95, time: 300, color: '#ef4444' },
        { name: 'Denaturation', temp: 95, time: 30, color: '#ef4444', cycles: 40 },
        { name: 'Annealing (Touchdown)', temp: 65, time: 30, color: '#3b82f6', cycles: 40 },
        { name: 'Extension', temp: 72, time: 60, color: '#10b981', cycles: 40 },
        { name: 'Final Extension', temp: 72, time: 600, color: '#10b981' }
      ]
    },
    'long-range': {
      name: 'Long-range PCR',
      steps: [
        { name: 'Initial Denaturation', temp: 95, time: 300, color: '#ef4444' },
        { name: 'Denaturation', temp: 95, time: 45, color: '#ef4444', cycles: 30 },
        { name: 'Annealing', temp: 60, time: 45, color: '#3b82f6', cycles: 30 },
        { name: 'Extension', temp: 72, time: 180, color: '#10b981', cycles: 30 },
        { name: 'Final Extension', temp: 72, time: 600, color: '#10b981' }
      ]
    }
  };

  const currentProgram = programs[program as keyof typeof programs];

  const startAnimation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= currentProgram.steps.length - 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{currentProgram.name}</h3>
        <button
          onClick={startAnimation}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-secondary-500 text-white hover:bg-secondary-600'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isRunning ? 'Running...' : 'Preview'}</span>
        </button>
      </div>

      {/* Temperature Graph */}
      <div className="mb-6">
        <div className="h-48 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-center">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              {/* Temperature line */}
              <motion.path
                d="M 20 130 L 80 20 L 120 80 L 160 20 L 200 80 L 240 20 L 280 80 L 320 20 L 380 20"
                stroke="#8b5cf6"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isRunning ? 1 : 0 }}
                transition={{ duration: 5, ease: "easeInOut" }}
              />
              
              {/* Current step indicator */}
              {isRunning && (
                <motion.circle
                  cx={20 + (currentStep * 60)}
                  cy={currentProgram.steps[currentStep]?.temp === 95 ? 20 : 
                      currentProgram.steps[currentStep]?.temp === 72 ? 20 : 80}
                  r="6"
                  fill="#f59e0b"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Step Details */}
      <div className="space-y-3">
        {currentProgram.steps.map((step, index) => (
          <motion.div
            key={index}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              isRunning && index === currentStep
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 bg-gray-50'
            }`}
            animate={{
              scale: isRunning && index === currentStep ? 1.02 : 1,
              backgroundColor: isRunning && index === currentStep ? '#fefce8' : '#f9fafb'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                <span className="font-medium text-gray-900">{step.name}</span>
                {step.cycles && (
                  <span className="text-sm text-gray-600">({step.cycles} cycles)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Thermometer className="h-4 w-4" />
                  <span>{step.temp}°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Timer className="h-4 w-4" />
                  <span>{step.time < 60 ? `${step.time}s` : `${Math.floor(step.time / 60)}m`}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <div className="text-sm text-primary-700">
          <strong>Total time:</strong> ~{Math.floor(
            currentProgram.steps.reduce((total, step) => {
              const stepTime = step.cycles ? step.time * step.cycles : step.time;
              return total + stepTime;
            }, 0) / 60
          )} minutes
        </div>
      </div>
    </div>
  );
};