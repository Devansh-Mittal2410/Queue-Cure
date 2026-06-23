import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  Zap,
  Monitor,
  BarChart3,
  QrCode,
  LogOut,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import QueuePipeline from '../components/QueuePipeline';
import CallNextButton from '../components/CallNextButton';
import ConsultationTimeControl from '../components/ConsultationTimeControl';
import { initializeSocket, emitEvent, offEvent, onEvent } from '../utils/socket';
import { announceToken, playNotificationSound } from '../utils/healthcare';
import { getDoctorSession, logoutDoctor } from '../utils/auth';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getDoctorSession());
  const [queueData, setQueueData] = useState({
    waiting: [],
    current: null,
    completed: [],
    patientsServedToday: 0,
    avgConsultationTime: 10,
  });

  const [consultationTime, setConsultationTime] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    waiting: 0,
    served: 0,
    avgTime: 10,
    currentToken: null,
  });

  useEffect(() => {
    if (!session?.token) {
      navigate('/doctor-login');
      return;
    }

    const socket = initializeSocket();
    const doctorId = session.doctor?.id;

    // Listen for queue updates
    const handleQueueUpdated = (data) => {
      const filteredData = {
        waiting: (data.waiting || []).filter((patient) => patient.doctorId === doctorId),
        current: data.current?.doctorId === doctorId ? data.current : null,
        completed: (data.completed || []).filter((patient) => patient.doctorId === doctorId),
      };
      setQueueData(filteredData);
      updateStats(filteredData);
    };

    const handleTokenCalled = (data) => {
      playNotificationSound();
      announceToken(data.token);
    };

    onEvent('queueUpdated', handleQueueUpdated);
    onEvent('tokenCalled', handleTokenCalled);

    return () => {
      offEvent('queueUpdated', handleQueueUpdated);
      offEvent('tokenCalled', handleTokenCalled);
    };
  }, [navigate, session?.token, session?.doctor?.id]);

  const updateStats = (data) => {
    setStats({
      waiting: data.waiting.length,
      served: data.completed.length,
      avgTime: consultationTime,
      currentToken: data.current?.token,
    });
  };

  const handleCallNext = () => {
    setIsLoading(true);
    emitEvent('callNext', {
      consultationTime,
      authToken: session.token,
    });
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleTimeChange = (time) => {
    setConsultationTime(time);
    emitEvent('consultationTimeChanged', { time });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                Queue Cure - Doctor Queue
              </h1>
              <p className="text-gray-600 mt-2">
                {session?.doctor?.name ? `Logged in as Dr. ${session.doctor.name}` : 'Real-time clinic queue management system'}
              </p>
            </div>
            <button
              onClick={async () => {
                await logoutDoctor();
                setSession(null);
                navigate('/doctor-login');
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Patients Waiting"
            value={stats.waiting}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Patients Served Today"
            value={stats.served}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            label="Avg. Consultation Time"
            value={`${stats.avgTime}m`}
            icon={Clock}
            color="teal"
          />
          <StatCard
            label="Current Token"
            value={stats.currentToken || '--'}
            icon={Zap}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Add Patient & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <ConsultationTimeControl
              currentTime={consultationTime}
              onTimeChange={handleTimeChange}
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 text-center"
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Patient Self Registration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Patients register from their own portal and are assigned to your queue.
              </p>
              <a
                href="/patient"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Open Patient Portal
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center"
            >
              <Monitor className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Waiting Room Display</h3>
              <p className="text-sm text-gray-600 mb-4">
                Full-screen display for the waiting room TV
              </p>
              <a
                href="/waiting-room"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Open Display
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center"
            >
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Doctor Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Real-time doctor dashboard and analytics
              </p>
              <a
                href="/doctor-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                View Analytics
              </a>
            </motion.div>
          </motion.div>

          {/* Center Column - Queue Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Live Queue Board</h2>
            <QueuePipeline
              completed={queueData.completed}
              current={queueData.current}
              waiting={queueData.waiting}
            />

            {/* Call Next Button */}
            <div className="mt-8">
              <CallNextButton
                onClick={handleCallNext}
                isLoading={isLoading}
                disabled={!queueData.waiting.length && !queueData.current}
                nextPatient={queueData.waiting[0]}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer - Generate Tracking Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Patient QR Tracking</h3>
          </div>
          <p className="text-sm text-gray-700">
            Patients can open the tracking page, enter their token number, and follow real-time queue position,
            estimated wait time, and current token number.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
