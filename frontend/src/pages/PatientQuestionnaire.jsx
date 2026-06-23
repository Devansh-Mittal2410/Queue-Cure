import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2, Loader } from 'lucide-react';
import { initializeSocket } from '../utils/socket';
import { fetchDoctors } from '../utils/auth';

const PatientQuestionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorLoadError, setDoctorLoadError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    visitType: 'General Consultation',
    // Health questions
    temperature: '',
    symptoms: [],
    duration: '',
    medications: '',
    allergies: '',
    pastConditions: '',
    painLevel: 5,
    bloodPressure: '',
    bloodSugar: '',
    additionalNotes: '',
    doctorId: '',
  });

  useEffect(() => {
    fetchDoctors()
      .then((data) => {
        setDoctors(data);
        if (data.length) {
          setFormData((prev) => ({ ...prev, doctorId: prev.doctorId || data[0].id }));
        }
      })
      .catch((error) => setDoctorLoadError(error.message));
  }, []);

  const symptoms = [
    'Fever', 'Cough', 'Headache', 'Body Ache', 'Nausea',
    'Fatigue', 'Sore Throat', 'Runny Nose', 'Chest Pain', 'Dizziness'
  ];

  const visitTypes = [
    'Cold/Fever',
    'Follow Up',
    'General Consultation',
    'Specialist Visit',
    'Emergency',
  ];

  // Step 1: Basic Info
  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Patient Information</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={formData.visitType}
          onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {visitTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={formData.doctorId}
          onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>
            {doctorLoadError ? 'Unable to load doctors' : 'Select Doctor'}
          </option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.name} - {doctor.specialty}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );

  // Step 2: Current Symptoms
  const renderSymptoms = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Current Symptoms</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°C)
          </label>
          <input
            type="number"
            placeholder="e.g., 98.6"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Symptoms (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {symptoms.map(symptom => (
              <button
                key={symptom}
                onClick={() => {
                  const updated = formData.symptoms.includes(symptom)
                    ? formData.symptoms.filter(s => s !== symptom)
                    : [...formData.symptoms, symptom];
                  setFormData({ ...formData, symptoms: updated });
                }}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  formData.symptoms.includes(symptom)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How long have you had these symptoms?
          </label>
          <input
            type="text"
            placeholder="e.g., 2 days"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pain Level: {formData.painLevel}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.painLevel}
            onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </motion.div>
  );

  // Step 3: Medical History
  const renderMedicalHistory = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Medications (if any)
          </label>
          <textarea
            placeholder="List any medications you're currently taking..."
            value={formData.medications}
            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies
          </label>
          <input
            type="text"
            placeholder="Any known allergies?"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Past Medical Conditions
          </label>
          <textarea
            placeholder="Any chronic conditions or past surgeries?"
            value={formData.pastConditions}
            onChange={(e) => setFormData({ ...formData, pastConditions: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Pressure (if known)
          </label>
          <input
            type="text"
            placeholder="e.g., 120/80"
            value={formData.bloodPressure}
            onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Sugar (if known)
          </label>
          <input
            type="text"
            placeholder="e.g., 100 mg/dL"
            value={formData.bloodSugar}
            onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </motion.div>
  );

  // Step 4: Additional Notes
  const renderAdditionalNotes = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Additional Notes</h2>

      <textarea
        placeholder="Anything else you'd like the doctor to know?"
        value={formData.additionalNotes}
        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
      />
    </motion.div>
  );

  // Step 5: Success
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="inline-block p-4 bg-green-100 rounded-full">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900">Welcome to Queue Cure!</h2>

      <div className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-400 rounded-xl p-8">
        <p className="text-gray-600 mb-4">Your Token Number:</p>
        <p className="text-5xl font-bold text-blue-600 mb-4">#{token}</p>
        <p className="text-gray-600">Your health analysis is being prepared for your doctor.</p>
      </div>

      <p className="text-gray-600">
        Your AI health analysis will help your doctor provide better care. Please proceed to the waiting room.
      </p>

      <button
        onClick={() => navigate(`/patient-waiting?token=${token}`)}
        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
      >
        Go to Waiting Room
      </button>
    </motion.div>
  );

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const socket = initializeSocket();

      socket.emit('addPatient', {
        name: formData.name,
        age: parseInt(formData.age),
        phone: formData.phone,
        visitType: formData.visitType,
        doctorId: formData.doctorId,
        healthData: {
          temperature: formData.temperature,
          symptoms: formData.symptoms,
          duration: formData.duration,
          painLevel: formData.painLevel,
          medications: formData.medications,
          allergies: formData.allergies,
          pastConditions: formData.pastConditions,
          bloodPressure: formData.bloodPressure,
          bloodSugar: formData.bloodSugar,
          additionalNotes: formData.additionalNotes,
        },
        timestamp: new Date(),
      }, (response) => {
        if (response?.success) {
          setToken(response.token);
          setStep(4);
        } else {
          alert(response?.message || 'Unable to create your token. Please try again.');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
    }
  };

  const steps = ['Info', 'Symptoms', 'History', 'Notes'];
  const stepComponents = [
    renderBasicInfo,
    renderSymptoms,
    renderMedicalHistory,
    renderAdditionalNotes,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        {step < 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">Health Questionnaire</h1>
            </div>
            <p className="text-gray-600">Step {step + 1} of {steps.length}</p>
          </motion.div>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {steps.map((stepName, idx) => (
                <div key={idx} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      idx <= step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1 text-center">{stepName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          {step === 4 ? renderSuccess() : stepComponents[step]()}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex gap-4">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all"
            >
              ← Previous
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit & Get Token'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQuestionnaire;
