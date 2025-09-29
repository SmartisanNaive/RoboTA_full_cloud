import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ModulePageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  gradientFrom?: string
  gradientTo?: string
  iconGradientFrom?: string
  iconGradientTo?: string
  accentDotColor?: string
}

export const ModulePageHeader: React.FC<ModulePageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-purple-600',
  iconGradientFrom = 'from-blue-500',
  iconGradientTo = 'to-purple-500',
  accentDotColor = 'bg-yellow-400',
}) => {
  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="inline-flex items-center space-x-6 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
      >
        <motion.div
          className="relative"
          initial={{ rotate: -4 }}
          animate={{ rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}
        >
          <div
            className={`w-20 h-20 bg-gradient-to-br ${iconGradientFrom} ${iconGradientTo} rounded-3xl flex items-center justify-center shadow-xl`}
          >
            <Icon className="h-10 w-10 text-white" />
          </div>
          <motion.div
            className={`absolute -top-2 -right-2 w-6 h-6 ${accentDotColor} rounded-full`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.35 }}
          />
        </motion.div>
        <div className="text-left">
          <h1
            className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
          >
            {title}
          </h1>
          <p className="text-xl text-gray-600 mt-2">{subtitle}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
