import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';

interface SimulationButtonProps {
  onSimulate: () => void;
  isRunning: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const SimulationButton: React.FC<SimulationButtonProps> = ({
  onSimulate,
  isRunning,
  disabled = false,
  children = "Run Simulation"
}) => {
  return (
    <motion.button
      onClick={onSimulate}
      disabled={disabled || isRunning}
      className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
        disabled || isRunning
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl'
      }`}
      whileHover={!disabled && !isRunning ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isRunning ? { scale: 0.95 } : {}}
    >
      {isRunning ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Play className="h-5 w-5" />
      )}
      <span>{children}</span>
    </motion.button>
  );
};