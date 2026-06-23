import React from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';

const CallNextButton = ({ onClick, isLoading, disabled, nextPatient }) => {
  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
      >
        <Play className="w-6 h-6" />
        {isLoading ? 'Calling...' : 'Call Next Patient'}
      </motion.button>

      {nextPatient && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
        >
          <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Next Patient</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Token #{nextPatient.token} - {nextPatient.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">{nextPatient.visitType}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CallNextButton;
