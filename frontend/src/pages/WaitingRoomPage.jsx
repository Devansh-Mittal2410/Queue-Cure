import React, { useEffect, useState } from 'react';
import WaitingRoomDisplay from '../components/WaitingRoomDisplay';
import { initializeSocket, onEvent } from '../utils/socket';
import { announceToken, playNotificationSound } from '../utils/healthcare';

const WaitingRoomPage = () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatients, setNextPatients] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [doctorStatus, setDoctorStatus] = useState('available');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const socket = initializeSocket();

    onEvent('queueUpdated', (data) => {
      setCurrentPatient(data.current);
      setNextPatients(data.waiting.map((p) => p.token));
      setQueueLength(data.waiting.length);
    });

    onEvent('tokenCalled', (data) => {
      if (!isMuted) {
        announceToken(data.token);
        playNotificationSound();
      }
    });

    onEvent('doctorStatusUpdated', (data) => {
      setDoctorStatus(data.status);
    });

    return () => {
      // Cleanup
    };
  }, [isMuted]);

  const handleToggleMute = (muted) => {
    setIsMuted(muted);
  };

  return (
    <WaitingRoomDisplay
      currentPatient={currentPatient}
      nextPatients={nextPatients}
      queueLength={queueLength}
      doctorStatus={doctorStatus}
      onToggleMute={handleToggleMute}
    />
  );
};

export default WaitingRoomPage;
