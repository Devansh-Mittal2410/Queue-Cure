/**
 * AI Health Analysis Utility
 * Analyzes patient health data and generates insights for doctors
 */

// Symptom severity mapping
const symptomSeverity = {
  'Fever': { severity: 8, urgency: 'high', category: 'viral' },
  'Cough': { severity: 6, urgency: 'medium', category: 'respiratory' },
  'Headache': { severity: 4, urgency: 'low', category: 'general' },
  'Body Ache': { severity: 5, urgency: 'low', category: 'general' },
  'Nausea': { severity: 7, urgency: 'high', category: 'digestive' },
  'Fatigue': { severity: 4, urgency: 'low', category: 'general' },
  'Sore Throat': { severity: 6, urgency: 'medium', category: 'respiratory' },
  'Runny Nose': { severity: 3, urgency: 'low', category: 'respiratory' },
  'Chest Pain': { severity: 10, urgency: 'critical', category: 'cardiac' },
  'Dizziness': { severity: 7, urgency: 'high', category: 'neurological' },
};

/**
 * Analyze patient health data
 * @param {Object} healthData - Patient health information
 * @returns {Object} - Health analysis with risk assessment
 */
export const analyzePatientHealth = (healthData) => {
  const analysis = {
    overallRisk: 'low',
    riskScore: 0,
    symptoms: healthData.symptoms || [],
    vitals: {},
    riskFactors: [],
    recommendations: [],
    possibleConditions: [],
    urgencyLevel: 'normal',
  };

  // Analyze temperature
  if (healthData.temperature) {
    const temp = parseFloat(healthData.temperature);
    if (temp > 38.5) {
      analysis.riskFactors.push('High fever (>38.5°C)');
      analysis.riskScore += 15;
    } else if (temp > 37.5) {
      analysis.riskFactors.push('Elevated temperature (37.5-38.5°C)');
      analysis.riskScore += 8;
    }
  }

  // Analyze symptoms
  let totalSeverity = 0;
  const symptomCategories = {};

  if (Array.isArray(healthData.symptoms)) {
    healthData.symptoms.forEach(symptom => {
      const symptomInfo = symptomSeverity[symptom];
      if (symptomInfo) {
        totalSeverity += symptomInfo.severity;
        analysis.riskScore += symptomInfo.severity;

        // Track severity for urgency
        if (symptomInfo.urgency === 'critical') {
          analysis.urgencyLevel = 'critical';
        }

        // Categorize symptoms
        if (!symptomCategories[symptomInfo.category]) {
          symptomCategories[symptomInfo.category] = [];
        }
        symptomCategories[symptomInfo.category].push(symptom);
      }
    });
  }

  // Analyze pain level
  if (healthData.painLevel) {
    const pain = parseInt(healthData.painLevel);
    if (pain > 7) {
      analysis.riskFactors.push(`High pain level (${pain}/10)`);
      analysis.riskScore += 10;
    } else if (pain > 4) {
      analysis.riskFactors.push(`Moderate pain (${pain}/10)`);
      analysis.riskScore += 5;
    }
  }

  // Analyze blood pressure
  if (healthData.bloodPressure) {
    const bp = healthData.bloodPressure.split('/');
    const systolic = parseInt(bp[0]);
    const diastolic = parseInt(bp[1]);

    if (systolic > 140 || diastolic > 90) {
      analysis.riskFactors.push('High blood pressure');
      analysis.riskScore += 12;
    } else if (systolic < 90 || diastolic < 60) {
      analysis.riskFactors.push('Low blood pressure');
      analysis.riskScore += 10;
    }
  }

  // Analyze blood sugar
  if (healthData.bloodSugar) {
    const sugar = parseInt(healthData.bloodSugar);
    if (sugar > 200) {
      analysis.riskFactors.push('High blood sugar (>200 mg/dL)');
      analysis.riskScore += 14;
    } else if (sugar < 70) {
      analysis.riskFactors.push('Low blood sugar (<70 mg/dL)');
      analysis.riskScore += 12;
    }
  }

  // Check for allergies
  if (healthData.allergies && healthData.allergies.trim()) {
    analysis.riskFactors.push(`Known allergies: ${healthData.allergies}`);
  }

  // Check for current medications
  if (healthData.medications && healthData.medications.trim()) {
    analysis.vitals.currentMedications = healthData.medications;
  }

  // Determine possible conditions based on symptom combinations
  analysis.possibleConditions = getPossibleConditions(healthData.symptoms, healthData.temperature);

  // Determine overall risk level
  if (analysis.riskScore > 40 || analysis.urgencyLevel === 'critical') {
    analysis.overallRisk = 'high';
  } else if (analysis.riskScore > 20) {
    analysis.overallRisk = 'medium';
  }

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis, healthData);

  // Add doctor summary
  analysis.doctorSummary = generateDoctorSummary(analysis, healthData);

  return analysis;
};

/**
 * Predict possible conditions based on symptoms
 */
const getPossibleConditions = (symptoms = [], temperature = '') => {
  const conditions = [];
  const symptomSet = new Set(symptoms);

  // Common cold
  if (symptomSet.has('Cough') || symptomSet.has('Runny Nose') || symptomSet.has('Sore Throat')) {
    conditions.push({
      name: 'Common Cold / Upper Respiratory Infection',
      probability: 0.7,
      icon: '🤧',
    });
  }

  // Flu
  if (
    (symptomSet.has('Fever') || temperature > 38) &&
    (symptomSet.has('Body Ache') || symptomSet.has('Fatigue'))
  ) {
    conditions.push({
      name: 'Influenza (Flu)',
      probability: 0.65,
      icon: '🤒',
    });
  }

  // Gastroenteritis
  if (symptomSet.has('Nausea') && symptomSet.has('Body Ache')) {
    conditions.push({
      name: 'Gastroenteritis',
      probability: 0.6,
      icon: '🤢',
    });
  }

  // Migraine/Headache
  if (symptomSet.has('Headache') && symptomSet.has('Nausea')) {
    conditions.push({
      name: 'Migraine',
      probability: 0.5,
      icon: '🤕',
    });
  }

  // COVID-19
  if (
    (symptomSet.has('Fever') || temperature > 37.5) &&
    (symptomSet.has('Cough') || symptomSet.has('Fatigue'))
  ) {
    conditions.push({
      name: 'Possible COVID-19 (Requires Testing)',
      probability: 0.4,
      icon: '😷',
    });
  }

  // Sort by probability
  return conditions.sort((a, b) => b.probability - a.probability);
};

/**
 * Generate health recommendations
 */
const generateRecommendations = (analysis, healthData) => {
  const recommendations = [];

  // General recommendations
  recommendations.push('Stay hydrated - drink plenty of water');
  recommendations.push('Get adequate rest and sleep');
  recommendations.push('Monitor your symptoms closely');

  // Risk-specific recommendations
  if (analysis.overallRisk === 'high') {
    recommendations.push('Seek immediate medical attention if symptoms worsen');
  }

  // Symptom-specific recommendations
  if (analysis.symptoms.includes('Fever')) {
    recommendations.push('Use fever management techniques (cold compress, light clothing)');
  }

  if (analysis.symptoms.includes('Cough')) {
    recommendations.push('Use throat lozenges and avoid irritants');
  }

  if (analysis.riskFactors.some(f => f.includes('blood sugar'))) {
    recommendations.push('Monitor blood sugar levels regularly');
  }

  return recommendations;
};

/**
 * Generate detailed summary for doctor
 */
const generateDoctorSummary = (analysis, healthData) => {
  return {
    riskAssessment: `Patient presents with ${analysis.overallRisk} risk level (Score: ${analysis.riskScore}/100)`,
    keyFindings: analysis.riskFactors,
    symptoms: analysis.symptoms.length > 0
      ? `Reports ${analysis.symptoms.length} symptoms: ${analysis.symptoms.join(', ')}`
      : 'No specific symptoms reported',
    possibleDiagnosis: analysis.possibleConditions.length > 0
      ? `Likely conditions: ${analysis.possibleConditions.map(c => c.name).join(', ')}`
      : 'No clear diagnosis pattern',
    medicalHistory: {
      allergies: healthData.allergies || 'None reported',
      currentMedications: healthData.medications || 'None reported',
      pastConditions: healthData.pastConditions || 'None reported',
    },
    urgency: analysis.urgencyLevel,
    recommendations: [
      'Review AI analysis before patient consultation',
      'Focus on identified risk factors',
      'Consider symptom combinations for diagnosis',
      'Verify all vital signs during examination',
    ],
  };
};

/**
 * Format health data for display
 */
export const formatHealthDataForDisplay = (healthData) => {
  return {
    temperature: healthData.temperature ? `${healthData.temperature}°C` : 'Not provided',
    symptoms: healthData.symptoms?.length > 0
      ? healthData.symptoms.join(', ')
      : 'None reported',
    painLevel: `${healthData.painLevel}/10`,
    bloodPressure: healthData.bloodPressure || 'Not provided',
    bloodSugar: healthData.bloodSugar || 'Not provided',
    allergies: healthData.allergies || 'None',
    medications: healthData.medications || 'None',
    duration: healthData.duration || 'Not specified',
  };
};

/**
 * Get risk color for UI
 */
export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'high':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    case 'medium':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
  }
};

/**
 * Calculate estimated consultation time based on health analysis
 */
export const estimateConsultationTime = (analysis) => {
  let timeMinutes = 10; // Base time

  if (analysis.overallRisk === 'high') {
    timeMinutes += 10;
  } else if (analysis.overallRisk === 'medium') {
    timeMinutes += 5;
  }

  if (analysis.possibleConditions.length > 1) {
    timeMinutes += 5;
  }

  if (analysis.riskFactors.length > 3) {
    timeMinutes += 5;
  }

  return timeMinutes;
};
