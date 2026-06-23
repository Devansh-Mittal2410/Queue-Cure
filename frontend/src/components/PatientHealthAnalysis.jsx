import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Heart, Zap, TrendingUp } from 'lucide-react';
import { getRiskColor, formatHealthDataForDisplay } from '../utils/aiHealth';

const PatientHealthAnalysis = ({ patient, analysis }) => {
  if (!patient || !analysis) {
    return <div className="text-gray-500">No patient data available</div>;
  }

  const riskColor = getRiskColor(analysis.overallRisk);

  return (
    <div className="space-y-6">
      {/* Risk Assessment Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${riskColor.bg} border-2 ${riskColor.border} rounded-xl p-6`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">OVERALL HEALTH RISK</p>
            <p className={`text-3xl font-bold ${riskColor.text} capitalize`}>
              {analysis.overallRisk}
            </p>
            <p className="text-sm mt-2">Risk Score: {analysis.riskScore}/100</p>
          </div>
          <div className="text-4xl">
            {analysis.overallRisk === 'high' && '⚠️'}
            {analysis.overallRisk === 'medium' && '⚠'}
            {analysis.overallRisk === 'low' && '✓'}
          </div>
        </div>
      </motion.div>

      {/* Key Findings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Key Findings
        </h3>

        {analysis.riskFactors.length > 0 ? (
          <div className="space-y-2">
            {analysis.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <Zap className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-800">{factor}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No significant risk factors identified</p>
        )}
      </motion.div>

      {/* Symptoms */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4">Reported Symptoms</h3>

        {analysis.symptoms.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {analysis.symptoms.map((symptom, idx) => (
              <div key={idx} className="px-3 py-2 bg-blue-50 rounded-lg text-sm font-medium text-blue-800">
                {symptom}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No symptoms reported</p>
        )}
      </motion.div>

      {/* Possible Conditions */}
      {analysis.possibleConditions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            AI Analysis: Possible Conditions
          </h3>

          <div className="space-y-3">
            {analysis.possibleConditions.map((condition, idx) => (
              <div key={idx} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{condition.icon}</span>
                    <p className="font-semibold text-gray-900">{condition.name}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round(condition.probability * 100)}% match
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${condition.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
            💡 These are AI-assisted suggestions. Use clinical judgment and perform proper examinations for accurate diagnosis.
          </p>
        </motion.div>
      )}

      {/* Vital Signs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Vital Signs & Health Data
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(formatHealthDataForDisplay(patient.healthData || {})).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-sm font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Medical History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4">Medical History</h3>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Allergies</p>
            <p className="text-sm text-gray-700">
              {analysis.doctorSummary?.medicalHistory?.allergies || 'None'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Current Medications</p>
            <p className="text-sm text-gray-700">
              {analysis.doctorSummary?.medicalHistory?.currentMedications || 'None'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Past Conditions</p>
            <p className="text-sm text-gray-700">
              {analysis.doctorSummary?.medicalHistory?.pastConditions || 'None'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Doctor Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4">✓ Recommendations Before Consultation</h3>

        <ul className="space-y-2">
          {analysis.doctorSummary?.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
              <span className="font-bold text-green-600 mt-0.5">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default PatientHealthAnalysis;
