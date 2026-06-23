import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';

const PatientTrackingScreen = ({ token, trackingData, trackingUrl }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'amber';
      case 'almost-turn':
        return 'blue';
      case 'now-calling':
      case 'serving':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(trackingData?.status || 'waiting');
  const colorMap = {
    amber: 'from-amber-50 to-orange-50 border-amber-200',
    blue: 'from-blue-50 to-cyan-50 border-blue-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    gray: 'from-gray-50 to-gray-100 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md bg-gradient-to-br ${colorMap[statusColor]} border-2 rounded-2xl shadow-2xl p-8`}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Queue Cure</h1>
          <p className="text-sm text-gray-600">Real-time Patient Tracking</p>
        </motion.div>

        {/* Your Token */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-gray-200"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Your Token Number
          </p>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-5xl font-black text-blue-600 text-center"
          >
            #{token}
          </motion.div>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            {trackingData?.status === 'now-calling' || trackingData?.status === 'serving' ? (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </motion.div>
                <span className="font-bold text-green-700">Now Being Called!</span>
              </>
            ) : trackingData?.status === 'completed' ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-gray-600" />
                <span className="font-bold text-gray-700">Consultation Completed</span>
              </>
            ) : trackingData?.status === 'almost-turn' ? (
              <>
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-blue-700">Almost Your Turn</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <span className="font-bold text-amber-700">Waiting...</span>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Token</span>
              <span className="font-bold text-lg text-gray-900">#{trackingData?.currentToken || '-'}</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${trackingData?.totalPatients
                    ? Math.min(((trackingData.totalPatients - trackingData.patientsAhead) / trackingData.totalPatients) * 100, 100)
                    : trackingData?.status === 'serving' || trackingData?.status === 'completed'
                      ? 100
                      : 0}%`,
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Patients ahead: {trackingData?.patientsAhead || 0}</span>
              <span>Total: {trackingData?.totalPatients || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Estimated Wait Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 mb-6 shadow-md"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Estimated Wait Time
          </p>
          <motion.div
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl font-bold text-teal-600"
          >
            {trackingData?.estimatedWaitTime || 0} min
          </motion.div>
          <p className="text-xs text-gray-500 mt-2">{trackingData?.visitType}</p>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-4 flex justify-center mb-6"
        >
          <QRCode value={trackingUrl || 'http://queuecure.local'} size={120} level="H" />
        </motion.div>

        {/* Info */}
        <p className="text-xs text-gray-600 text-center">
          Keep this screen open to receive real-time updates about your position in the queue.
        </p>
      </motion.div>
    </div>
  );
};

export default PatientTrackingScreen;
