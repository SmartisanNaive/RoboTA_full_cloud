import React from 'react';
import { motion } from 'framer-motion';
import { Magnet } from 'lucide-react';

interface PurificationAnimationProps {
  beadRatio: number;
}

export const PurificationAnimation: React.FC<PurificationAnimationProps> = ({ beadRatio }) => {
  const beadIntensity = Math.min(beadRatio / 2, 1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Purification Process</h3>
      
      <div className="space-y-6">
        {/* Step 1: Binding */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</div>
            Binding
          </h4>
          <div className="relative h-24 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-2">
                {/* DNA strands */}
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-8 bg-green-500 rounded"
                    animate={{
                      y: [0, -5, 0],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
                {/* Magnetic beads */}
                {Array.from({ length: Math.floor(beadRatio * 4) }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-amber-600 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-blue-700">
              DNA + Beads + Binding Buffer
            </div>
          </div>
        </div>

        {/* Step 2: Magnetic Separation */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">2</div>
            Magnetic Separation
          </h4>
          <div className="relative h-24 bg-gradient-to-r from-gray-100 to-red-100 rounded-lg overflow-hidden">
            <div className="absolute right-2 top-0 h-full flex items-center">
              <Magnet className="h-8 w-8 text-red-600" />
            </div>
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="flex flex-col space-y-1">
                {/* Bead-DNA complexes attracted to magnet */}
                {Array.from({ length: Math.floor(beadRatio * 3) }, (_, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-1"
                    animate={{
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  >
                    <div className="w-1 h-4 bg-green-500 rounded" />
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-700">
              Beads + DNA → Magnet
            </div>
          </div>
        </div>

        {/* Step 3: Washing */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">3</div>
            Washing
          </h4>
          <div className="relative h-24 bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg overflow-hidden">
            {/* Wash drops */}
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{ left: `${20 + i * 10}%`, top: 0 }}
                animate={{
                  y: [0, 80, 0],
                  opacity: [1, 0.3, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
            <div className="absolute bottom-2 left-2 text-xs text-purple-700">
              Ethanol Wash Cycles
            </div>
          </div>
        </div>

        {/* Step 4: Elution */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">4</div>
            Elution
          </h4>
          <div className="relative h-24 bg-gradient-to-b from-green-100 to-green-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Pure DNA */}
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-12 bg-green-600 rounded mx-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-green-700">
              Pure DNA in Elution Buffer
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Current settings:</strong> {beadRatio}x bead ratio - 
          {beadRatio >= 1.8 ? ' High purity mode' : 
           beadRatio >= 1.0 ? ' Standard purification' : 
           ' Size selection mode'}
        </p>
      </div>
    </div>
  );
};