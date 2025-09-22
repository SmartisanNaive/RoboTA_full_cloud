import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Upload } from 'lucide-react';

interface NotificationCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  children
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      className={`p-6 rounded-xl border ${getColors()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm mb-4">{message}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedTypes = ".csv,.xlsx,.txt",
  maxSize = 10
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop your file here, or click to browse
      </p>
      <input
        type="file"
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors"
      >
        Select File
      </label>
      <p className="text-xs text-gray-500 mt-2">
        Accepted formats: {acceptedTypes} (max {maxSize}MB)
      </p>
    </motion.div>
  );
};