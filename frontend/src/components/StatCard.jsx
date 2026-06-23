import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, trend, color = 'blue' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const timeout = setTimeout(() => setDisplayValue(value), 100);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    teal: 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colorClasses[color]} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {Icon && <Icon className="w-5 h-5 opacity-50" />}
      </div>
      <div className="flex items-baseline gap-2">
        <motion.div
          key={displayValue}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold"
        >
          {typeof value === 'number' ? displayValue : value}
        </motion.div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
