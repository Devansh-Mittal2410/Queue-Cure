import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const ConsultationTimeControl = ({ currentTime, onTimeChange, isLoading }) => {
  const times = [5, 10, 15, 20];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-gray-900">Avg. Consultation Time</h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {times.map((time) => (
          <motion.button
            key={time}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTimeChange(time)}
            disabled={isLoading}
            className={`py-3 rounded-lg font-semibold transition-all ${
              currentTime === time
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {time}m
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ConsultationTimeControl;
