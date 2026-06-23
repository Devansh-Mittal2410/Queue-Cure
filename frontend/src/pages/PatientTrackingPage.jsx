import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PatientTrackingScreen from '../components/PatientTrackingScreen';
import { initializeSocket, offEvent, onEvent } from '../utils/socket';

const PatientTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [trackingUrl, setTrackingUrl] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  const token = searchParams.get('token');
  const clinicId = searchParams.get('clinic') || 'clinic-001';

  useEffect(() => {
    const socket = initializeSocket();
    const parsedToken = parseInt(token, 10);

    // Set the tracking URL
    setTrackingUrl(`${window.location.href}`);

    if (token) {
      // Emit that patient is now tracking
      socket.emit('patientTracking', { token: parsedToken, clinicId });

      // Listen for updates
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

      // Listen for when token is called
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
    }
  }, [token, clinicId]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 px-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(event) => {
            event.preventDefault();
            if (tokenInput.trim()) {
              navigate(`/patient-tracking?token=${encodeURIComponent(tokenInput.trim())}`);
            }
          }}
          className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl backdrop-blur"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg">
            <Search className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-950">Track your token</h1>
          <p className="mt-2 text-slate-600">
            Enter the token number you received after registration.
          </p>
          <input
            type="number"
            min="1"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Token number"
            className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white shadow-lg"
          >
            Track Token
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <PatientTrackingScreen
      token={token}
      trackingData={trackingData}
      trackingUrl={trackingUrl}
    />
  );
};

export default PatientTrackingPage;
