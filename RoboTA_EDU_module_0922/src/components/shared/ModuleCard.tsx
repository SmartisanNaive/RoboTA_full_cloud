import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, DivideIcon as LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string;
  objectives?: string[];
  index?: number;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  path,
  icon: Icon,
  color,
  objectives = [],
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Link to={path}>
        <motion.div 
          className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full border border-gray-100"
          whileHover={{ scale: 1.03, y: -8 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`h-40 bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-20 w-20 text-white drop-shadow-lg" />
            </motion.div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
          </div>
          
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                {title.includes('Module') ? title.split(':')[0] : 'Module'}
              </span>
              <motion.div
                className="group-hover:translate-x-1 transition-transform duration-300"
              >
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
              </motion.div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight">
              {title.includes(':') ? title.split(':')[1].trim() : title}
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed flex-grow text-sm">
              {description}
            </p>
            
            {objectives.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                  Key Features
                </h4>
                {objectives.slice(0, 3).map((objective, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center space-x-3 group/item"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full group-hover/item:scale-125 transition-transform"></div>
                    <span className="text-sm text-gray-600 group-hover/item:text-gray-800 transition-colors">{objective}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};