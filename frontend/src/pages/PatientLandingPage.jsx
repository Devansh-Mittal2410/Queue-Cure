import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, BarChart3, QrCode, Clock } from 'lucide-react';

const PatientLandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Health Analysis',
      description: 'AI-powered health questionnaire while you wait',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'See your position in queue and estimated wait time',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: QrCode,
      title: 'Easy Check-in',
      description: 'Get your token and start the process instantly',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Smart Analysis',
      description: 'Your health data helps doctors diagnose faster',
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Queue Cure Patient Portal</h1>
          </div>
          <p className="text-lg text-blue-100">
            Smart clinic queue management with AI health analysis
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Check-in Button */}
            <button
              onClick={() => navigate('/patient-questionnaire')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-xl mb-2">📋</div>
              New Patient Check-in
            </button>

            {/* Track Status Button */}
            <button
              onClick={() => navigate('/patient-tracking')}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-xl mb-2">📍</div>
              Track My Status
            </button>
          </div>

          <p className="text-gray-600 text-sm">
            Already have a token? Go to "Track My Status" to see your position in queue
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-teal-50 border border-teal-200 rounded-xl p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">1.</span>
              <span>Complete the health questionnaire on check-in</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">2.</span>
              <span>AI analyzes your health data in real-time</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">3.</span>
              <span>Doctor gets your health summary before checkup</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">4.</span>
              <span>Faster diagnosis and better care</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientLandingPage;
