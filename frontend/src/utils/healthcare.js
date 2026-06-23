// AI-powered wait time estimation based on visit type
const consultationDurations = {
  'Cold/Fever': { min: 5, max: 7 },
  'Follow Up': { min: 4, max: 6 },
  'General Consultation': { min: 10, max: 15 },
  'Specialist Visit': { min: 15, max: 20 },
  'Emergency': { min: 20, max: 30 },
};

export const estimateWaitTime = (visitType, patientsAhead) => {
  const duration = consultationDurations[visitType] || consultationDurations['General Consultation'];
  const avgDuration = (duration.min + duration.max) / 2;
  return Math.round(patientsAhead * avgDuration);
};

export const getConsultationDuration = (visitType) => {
  return consultationDurations[visitType] || consultationDurations['General Consultation'];
};

export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const generateToken = (queueLength) => {
  // In a real system, this would be auto-incrementing from DB
  return queueLength + 1;
};

export const generateTrackingUrl = (token, clinicId = 'clinic-001') => {
  return `${window.location.origin}/track?token=${token}&clinic=${clinicId}`;
};

export const generateQRValue = (trackingUrl) => {
  return trackingUrl;
};

export const announceToken = (token) => {
  const text = `Token ${token}, please proceed to the consultation room.`;
  
  // Check if browser supports speech synthesis
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.cancel(); // Cancel any previous speech
    speechSynthesis.speak(utterance);
  }
};

export const playNotificationSound = () => {
  // Create a simple beep using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};
