import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import WaitingRoomPage from './pages/WaitingRoomPage';
import PatientTrackingPage from './pages/PatientTrackingPage';
import DoctorAnalyticsPage from './pages/DoctorAnalyticsPage';
import PatientLandingPage from './pages/PatientLandingPage';
import PatientQuestionnaire from './pages/PatientQuestionnaire';
import PatientWaitingScreen from './pages/PatientWaitingScreen';
import DoctorAuthPage from './pages/DoctorAuthPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Receptionist/Doctor Views */}
        <Route path="/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/track" element={<PatientTrackingPage />} />
        <Route path="/patient-tracking" element={<PatientTrackingPage />} />
        <Route path="/doctor-login" element={<DoctorAuthPage />} />
        <Route path="/doctor-analytics" element={<DoctorAnalyticsPage />} />

        {/* Patient Views */}
        <Route path="/patient" element={<PatientLandingPage />} />
        <Route path="/patient-questionnaire" element={<PatientQuestionnaire />} />
        <Route path="/patient-waiting" element={<PatientWaitingScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
