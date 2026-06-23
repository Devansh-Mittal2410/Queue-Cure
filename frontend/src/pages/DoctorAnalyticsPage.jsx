import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ArrowLeft, LogOut } from 'lucide-react';
import DoctorAnalyticsPanel from '../components/DoctorAnalyticsPanel';
import { initializeSocket, offEvent, onEvent } from '../utils/socket';
import { getDoctorSession, logoutDoctor } from '../utils/auth';

const DoctorAnalyticsPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getDoctorSession());
  const [analytics, setAnalytics] = useState({
    served: 0,
    avgTime: 0,
    peakHour: '11:00 AM',
    queueLength: 0,
    efficiency: 85,
    satisfaction: 4.5,
    queueTrend: [],
  });

  useEffect(() => {
    if (!session?.token) {
      navigate('/doctor-login');
      return;
    }

    const socket = initializeSocket();

    const handleAnalytics = (data) => {
      setAnalytics((prev) => ({
        ...prev,
        served: data.patientsServedToday ?? data.served ?? prev.served,
        avgTime: data.avgConsultationTime ?? data.avgTime ?? prev.avgTime,
        queueLength: data.patientsWaiting ?? data.queueLength ?? prev.queueLength,
        efficiency: data.efficiency ?? prev.efficiency,
        satisfaction: data.satisfaction ?? prev.satisfaction,
        peakHour: data.peakHour ?? prev.peakHour,
      }));
    };

    const handleQueueUpdate = (data) => {
      const doctorId = session.doctor?.id;
      const waiting = doctorId
        ? (data.waiting || []).filter((patient) => patient.doctorId === doctorId)
        : data.waiting || [];
      const completed = doctorId
        ? (data.completed || []).filter((patient) => patient.doctorId === doctorId)
        : data.completed || [];
      setAnalytics((prev) => ({
        ...prev,
        queueLength: waiting.length,
        served: completed.length || prev.served,
      }));
    };

    onEvent('analyticsData', handleAnalytics);
    onEvent('analyticsUpdated', handleAnalytics);
    onEvent('queueUpdated', handleQueueUpdate);

    // Request initial analytics
    socket.emit('getAnalytics', { authToken: session.token });

    return () => {
      offEvent('analyticsData', handleAnalytics);
      offEvent('analyticsUpdated', handleAnalytics);
      offEvent('queueUpdated', handleQueueUpdate);
    };
  }, [navigate, session?.token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Queue
            </a>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                Doctor Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                {session?.doctor?.name ? `Dr. ${session.doctor.name}` : 'Real-time performance and queue insights'}
              </p>
            </div>
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
        </motion.div>

        {/* Analytics Panel */}
        <DoctorAnalyticsPanel analytics={analytics} />
      </div>
    </div>
  );
};

export default DoctorAnalyticsPage;
