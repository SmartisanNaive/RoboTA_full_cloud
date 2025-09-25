import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ModuleHeroHeaderProps {
  icon: LucideIcon;
  iconGradient: string;
  title: string;
  titleGradient: string;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  children?: React.ReactNode;
}

export const ModuleHeroHeader: React.FC<ModuleHeroHeaderProps> = ({
  icon: Icon,
  iconGradient,
  title,
  titleGradient,
  subtitle,
  align = 'left',
  children,
}) => {
  const isCenter = align === 'center';
  const textAlignment = isCenter ? 'text-center' : 'text-left';
  const containerAlignment = isCenter ? 'justify-center' : '';

  return (
    <motion.div
      className={`mb-12 ${isCenter ? 'text-center' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`flex ${containerAlignment} items-center space-x-4 mb-4`}>
        <div
          className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="h-7 w-7 md:h-9 md:w-9 text-white" />
        </div>
        <div className={`${textAlignment}`}>
          <h1
            className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg text-gray-600 mt-2 ${textAlignment}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className={`mt-4 text-base md:text-lg text-gray-600 ${textAlignment}`}>
          {children}
        </div>
      )}
    </motion.div>
  );
};
