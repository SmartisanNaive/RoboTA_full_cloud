import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface SubPageNavigationProps {
  experimentId: string;
  currentPage: string;
  steps: string[];
}

export const SubPageNavigation: React.FC<SubPageNavigationProps> = ({ 
  experimentId, 
  currentPage, 
  steps 
}) => {
  const currentIndex = steps.indexOf(currentPage);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </motion.button>
        </Link>
        
        {prevStep && (
          <Link to={`/experiment-${experimentId}/${prevStep}`}>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </motion.button>
          </Link>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {currentPage}
        </h2>
        <p className="text-sm text-gray-600">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>

      <div>
        {nextStep && (
          <Link to={`/experiment-${experimentId}/${nextStep}`}>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </Link>
        )}
      </div>
    </div>
  );
};