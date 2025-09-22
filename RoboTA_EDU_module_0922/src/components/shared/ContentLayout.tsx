import React from 'react';
import { motion } from 'framer-motion';

interface ContentLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({
  title,
  subtitle,
  children,
  className = ""
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 leading-relaxed">{subtitle}</p>
        )}
      </div>
      
      <div className="prose max-w-none">
        {children}
      </div>
    </motion.div>
  );
};