import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';

const QueuePipeline = ({ completed, current, waiting }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="w-full">
      {/* Pipeline Header */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Completed Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Completed</h3>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {completed.slice(-3).map((patient) => (
              <motion.div
                key={patient.id}
                variants={item}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
              >
                <div className="text-sm font-semibold text-green-700">Token #{patient.token}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Currently Being Served */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Now Serving</h3>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {current ? (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl p-6 text-center shadow-lg">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Current
                </div>
                <div className="text-4xl font-bold text-blue-700">#{current.token}</div>
                <div className="text-sm text-blue-600 mt-2">{current.name}</div>
                <div className="text-xs text-blue-500 mt-1">{current.visitType}</div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <div className="text-sm text-gray-500">No patient currently</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Waiting Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-700">Waiting</h3>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {waiting.length}
            </span>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2 max-h-64 overflow-y-auto"
          >
            {waiting.map((patient, idx) => (
              <motion.div
                key={patient.id}
                variants={item}
                layout
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-amber-900">Token #{patient.token}</div>
                    <div className="text-xs text-amber-700 mt-0.5">{patient.name}</div>
                  </div>
                  <div className="text-xs font-semibold text-amber-600">+{idx + 1}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QueuePipeline;
