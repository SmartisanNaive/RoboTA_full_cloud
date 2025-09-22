import React from 'react';
import { motion } from 'framer-motion';

interface WellPlateProps {
  wells: Array<{
    id: string;
    row: number;
    col: number;
    content?: string;
    color?: string;
    opacity?: number;
  }>;
  onWellClick?: (wellId: string) => void;
}

export const WellPlate: React.FC<WellPlateProps> = ({ wells, onWellClick }) => {
  const rows = 8;
  const cols = 12;
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">96-Well Plate</h3>
      
      <div className="inline-block bg-gray-100 p-4 rounded-lg">
        {/* Column headers */}
        <div className="flex mb-2">
          <div className="w-8"></div>
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex mb-1">
            {/* Row label */}
            <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
              {rowLabels[rowIndex]}
            </div>
            
            {/* Wells */}
            {Array.from({ length: cols }, (_, colIndex) => {
              const well = wells.find(w => w.row === rowIndex && w.col === colIndex);
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 rounded-full border-2 border-gray-300 m-0.5 cursor-pointer transition-all duration-200 ${
                    well?.color || 'bg-white'
                  }`}
                  style={{ 
                    opacity: well?.opacity || 1,
                    backgroundColor: well?.color || '#ffffff'
                  }}
                  onClick={() => well && onWellClick && onWellClick(well.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={well?.content || `${rowLabels[rowIndex]}${colIndex + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};