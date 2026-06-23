import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Volume2 } from 'lucide-react';

const WaitingRoomDisplay = ({ currentPatient, nextPatients, queueLength, doctorStatus, onToggleMute }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (currentPatient) {
      setKey((prev) => prev + 1);
    }
  }, [currentPatient?.token]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute?.(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-600 flex flex-col justify-between p-8 overflow-hidden">
      {/* Mute Button - Top Right */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleMute}
        className="fixed top-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all z-50"
      >
        <Volume2 className={`w-6 h-6 ${isMuted ? 'opacity-50' : ''}`} />
      </motion.button>

      <div className="flex flex-col items-center justify-center flex-1">
        {/* Now Serving Section */}
        <motion.div
          key={key}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              NOW SERVING
            </div>
            {currentPatient ? (
              <div className="text-9xl font-black text-white drop-shadow-lg tracking-tighter">
                {currentPatient.token}
              </div>
            ) : (
              <div className="text-8xl font-black text-white/50 drop-shadow-lg">--</div>
            )}
          </motion.div>

          {currentPatient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-2xl text-white/90 font-semibold"
            >
              {currentPatient.name} • {currentPatient.visitType}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer Section */}
      <div className="space-y-6">
        {/* Doctor Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Doctor Status:</span>
          </div>
          <motion.span
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`font-bold text-lg ${
              doctorStatus === 'available' ? 'text-green-300' : 'text-amber-300'
            }`}
          >
            {doctorStatus === 'available' ? '● Available' : '● In Consultation'}
          </motion.span>
        </motion.div>

        {/* Up Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 text-lg">WAITING</h3>
          <div className="grid grid-cols-6 gap-3">
            {nextPatients.slice(0, 6).map((token, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-center"
              >
                <div className="text-white font-bold text-2xl">{token}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        >
          <div className="text-center">
            <div className="text-white/70 text-sm font-medium mb-1">Queue Length</div>
            <div className="text-white text-3xl font-bold">{queueLength}</div>
          </div>
          <div className="text-center border-l border-r border-white/20">
            <div className="text-white/70 text-sm font-medium mb-1">Est. Wait Time</div>
            <div className="text-white text-3xl font-bold">
              {Math.round((queueLength - 1) * 12)} min
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70 text-sm font-medium mb-1">Status</div>
            <div className="text-white text-2xl font-bold">
              {currentPatient ? 'Serving' : 'Idle'}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WaitingRoomDisplay;
