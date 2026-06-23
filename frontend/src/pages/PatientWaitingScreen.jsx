import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, AlertCircle, Activity } from 'lucide-react';
import { initializeSocket, offEvent, onEvent } from '../utils/socket';

const PatientWaitingScreen = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [trackingData, setTrackingData] = useState({
    token: parseInt(token),
    patientsAhead: 0,
    currentToken: 0,
    totalPatients: 0,
    estimatedWaitTime: 0,
    status: 'waiting',
  });

  const [healthStatus, setHealthStatus] = useState({
    status: 'healthy', // healthy, warning, urgent
    riskFactors: [],
    recommendations: [],
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const socket = initializeSocket();
    const parsedToken = parseInt(token, 10);

    if (!parsedToken) {
      return;
    }

    socket.emit('patientTracking', { token: parsedToken });

    // Listen for tracking updates
    const handleTrackingData = (data) => {
      if (data?.token === parsedToken) {
        setTrackingData(data);
      }
    };

    const handleTrackingUpdated = (data) => {
      const patientTracking = Array.isArray(data)
        ? data.find((item) => item.token === parsedToken)
        : data;

      if (patientTracking?.token === parsedToken) {
        setTrackingData(patientTracking);
      }
    };

    const handleTokenCalled = (data) => {
      if (data.token === parsedToken) {
        setTrackingData((prev) => ({
          ...prev,
          token: parsedToken,
          currentToken: parsedToken,
          patientsAhead: 0,
          estimatedWaitTime: 0,
          status: 'serving',
        }));
      }
    };

    const handlePatientNotification = (data) => {
      if (data.token !== parsedToken || !('Notification' in window)) {
        return;
      }

      if (Notification.permission === 'granted') {
        new Notification('Queue Cure', { body: data.message });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Queue Cure', { body: data.message });
          }
        });
      }
    };

    onEvent('trackingData', handleTrackingData);
    onEvent('trackingUpdated', handleTrackingUpdated);
    onEvent('tokenCalled', handleTokenCalled);
    onEvent('patientNotification', handlePatientNotification);

    return () => {
      offEvent('trackingData', handleTrackingData);
      offEvent('trackingUpdated', handleTrackingUpdated);
      offEvent('tokenCalled', handleTokenCalled);
      offEvent('patientNotification', handlePatientNotification);
    };
  }, [token]);

  // Simulate elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    // Simulate AI health analysis based on wait time (worse as they wait)
    const totalWaitSeconds = Math.max((trackingData.estimatedWaitTime || 0) * 60, 1);
    const waitPercentage = Math.min((elapsedTime / totalWaitSeconds) * 100, 100);

    if (waitPercentage < 50) {
      return {
        status: 'healthy',
        riskFactors: ['Stable vital signs'],
        recommendations: ['Drink water', 'Relax and breathe'],
      };
    } else if (waitPercentage < 80) {
      return {
        status: 'warning',
        riskFactors: ['Extended wait time', 'Fatigue risk'],
        recommendations: ['Take breaks', 'Stay hydrated', 'Sit comfortably'],
      };
    } else {
      return {
        status: 'urgent',
        riskFactors: ['High fatigue risk', 'Dehydration risk'],
        recommendations: ['Seek staff assistance if needed', 'Drink water immediately'],
      };
    }
  };

  useEffect(() => {
    setHealthStatus(getHealthStatus());
  }, [elapsedTime, trackingData.estimatedWaitTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return 'from-green-500 to-emerald-500';
      case 'warning':
        return 'from-yellow-500 to-amber-500';
      case 'urgent':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getStatusText = () => {
    switch (trackingData.status) {
      case 'now-calling':
      case 'serving':
        return '🔔 DOCTOR IS CALLING YOU!';
      case 'completed':
        return 'Consultation completed';
      default:
        return `Position in Queue: #${trackingData.patientsAhead + 1}`;
    }
  };

  const queueProgress = trackingData.totalPatients
    ? Math.min(((trackingData.totalPatients - trackingData.patientsAhead) / trackingData.totalPatients) * 100, 100)
    : trackingData.status === 'serving' || trackingData.status === 'completed'
      ? 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Token Display */}
        {(trackingData.status === 'now-calling' || trackingData.status === 'serving') && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mb-8 p-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-2xl text-white text-center"
          >
            <p className="text-2xl font-bold mb-4">⚠️ YOUR TOKEN IS BEING CALLED!</p>
            <p className="text-5xl font-bold">#{trackingData.token}</p>
            <p className="text-lg mt-4">Please go to the consultation room immediately</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Queue Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Queue Position */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full mb-4">
                  <Heart className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium mb-2">{getStatusText()}</p>
                <p className="text-6xl font-bold text-blue-600">#{trackingData.token}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Patients Ahead</p>
                  <p className="text-3xl font-bold text-blue-600">{trackingData.patientsAhead}</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Total Waiting</p>
                  <p className="text-3xl font-bold text-teal-600">{trackingData.totalPatients}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Est. Wait Time</p>
                  <p className="text-3xl font-bold text-purple-600">{trackingData.estimatedWaitTime}m</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Queue Progress</p>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${queueProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Time Elapsed */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Time Spent Waiting</h3>
              </div>
              <p className="text-4xl font-bold text-blue-600">{formatTime(elapsedTime)}</p>
              <p className="text-sm text-gray-600 mt-2">
                {trackingData.estimatedWaitTime > 0
                  ? `Est. ${trackingData.estimatedWaitTime - Math.ceil(elapsedTime / 60)} mins remaining`
                  : 'Almost your turn!'}
              </p>
            </div>
          </motion.div>

          {/* Right Column - Health Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Health Status Card */}
            <div className={`bg-gradient-to-br ${getStatusColor()} rounded-xl shadow-lg text-white p-8`}>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6" />
                <h3 className="text-lg font-bold">Your Health Status</h3>
              </div>

              <div className="text-center mb-6">
                <p className="text-4xl font-bold capitalize mb-2">
                  {healthStatus.status === 'healthy' ? '✓' : healthStatus.status === 'warning' ? '⚠' : '⚠️'}
                </p>
                <p className="text-lg font-semibold capitalize">{healthStatus.status}</p>
              </div>

              {healthStatus.riskFactors.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm opacity-90 mb-2">Observations:</p>
                  <ul className="space-y-1 text-sm">
                    {healthStatus.riskFactors.map((factor, idx) => (
                      <li key={idx} className="opacity-90">• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Health Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {healthStatus.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Doctor Info */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Your Info</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Token:</span> #{trackingData.token}</p>
                <p><span className="font-semibold">Status:</span> <span className="capitalize">{trackingData.status}</span></p>
                <p className="text-xs text-gray-600 mt-4">
                  Your health analysis helps your doctor provide better care. All information is secure.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-600"
        >
          <p>📱 Keep this screen open to receive notifications when it's your turn</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientWaitingScreen;
