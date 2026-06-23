import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ==================== MONGOOSE SCHEMAS ====================

// Patient Schema
const patientSchema = new mongoose.Schema({
  token: { type: Number, required: true },
  id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  visitType: { type: String, required: true },
  doctorId: { type: String, default: null },
  doctorName: { type: String, default: null },
  addedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  consultationTime: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed'],
    default: 'waiting',
  },
  notificationSentAt: { type: Date, default: null },
});

// Clinic State Schema
const clinicStateSchema = new mongoose.Schema({
  clinicId: { type: String, default: 'default', unique: true },
  currentPatientId: { type: String, default: null },
  consultationTime: { type: Number, default: 10 },
  servedToday: { type: Number, default: 0 },
  avgConsultationTime: { type: Number, default: 10 },
  lastUpdated: { type: Date, default: Date.now },
  stats: {
    efficiency: { type: Number, default: 85 },
    satisfaction: { type: Number, default: 4.5 },
    peakHour: { type: String, default: '11:00 AM' },
  },
});

// Tracking Data Schema
const trackingSchema = new mongoose.Schema({
  token: { type: Number, required: true, unique: true },
  patientId: { type: String, required: true },
  patientsAhead: { type: Number, default: 0 },
  currentToken: { type: Number, default: 0 },
  totalPatients: { type: Number, default: 0 },
  estimatedWaitTime: { type: Number, default: 0 },
  visitType: { type: String, default: 'General Consultation' },
  doctorId: { type: String, default: null },
  status: { type: String, default: 'waiting' },
  notificationSentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Models
const Patient = mongoose.model('Patient', patientSchema);
const ClinicState = mongoose.model('ClinicState', clinicStateSchema);
const Tracking = mongoose.model('Tracking', trackingSchema);

const doctorSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  specialty: { type: String, default: 'General Consultation' },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const doctorSessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  doctorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const Doctor = mongoose.model('Doctor', doctorSchema);
const DoctorSession = mongoose.model('DoctorSession', doctorSessionSchema);

// ==================== UTILITY FUNCTIONS ====================

// Initialize or get clinic state
const getClinicState = async () => {
  let state = await ClinicState.findOne({ clinicId: 'default' });
  if (!state) {
    state = new ClinicState({ clinicId: 'default' });
    await state.save();
  }
  return state;
};

// Generate next token
const generateToken = async () => {
  const patients = await Patient.find();
  return patients.length + 1;
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex'),
});

const verifyPassword = (password, salt, expectedHash) => {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
};

const createDoctorSession = async (doctorId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await DoctorSession.create({ token, doctorId, expiresAt });
  return token;
};

const getDoctorByAuthToken = async (authToken) => {
  if (!authToken) {
    return null;
  }

  const session = await DoctorSession.findOne({
    token: authToken,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  return Doctor.findOne({ id: session.doctorId });
};

const getRequestDoctor = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return getDoctorByAuthToken(token);
};

const publicDoctor = (doctor) => ({
  id: doctor.id,
  name: doctor.name,
  email: doctor.email,
  specialty: doctor.specialty,
});

// Calculate wait times
const estimateWaitTime = (visitType, patientsAhead) => {
  const durations = {
    'Cold/Fever': { min: 5, max: 7 },
    'Follow Up': { min: 4, max: 6 },
    'General Consultation': { min: 10, max: 15 },
    'Specialist Visit': { min: 15, max: 20 },
    'Emergency': { min: 20, max: 30 },
  };

  const duration = durations[visitType] || durations['General Consultation'];
  const avgDuration = (duration.min + duration.max) / 2;
  return Math.round(patientsAhead * avgDuration);
};

const mapPatientForQueue = (patient) => ({
  id: patient.id,
  token: patient.token,
  name: patient.name,
  visitType: patient.visitType,
  age: patient.age,
  doctorId: patient.doctorId,
  doctorName: patient.doctorName,
});

const sendPatientNotification = async (patient) => {
  const message = `Queue Cure: Token #${patient.token} is now being called. Please proceed to the consultation room.`;

  if (!patient.phone) {
    return { sent: false, reason: 'missing-phone' };
  }

  if (
    process.env.ENABLE_SMS_NOTIFICATIONS === 'true' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const body = new URLSearchParams({
      To: patient.phone,
      From: process.env.TWILIO_PHONE_NUMBER,
      Body: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio SMS failed: ${response.status} ${errorText}`);
    }

    return { sent: true, provider: 'twilio' };
  }

  console.log(`[notification:dry-run] ${patient.phone} -> ${message}`);
  return { sent: false, reason: 'sms-not-configured' };
};

const notifyPatientIfReady = async (patient) => {
  if (!patient || patient.notificationSentAt) {
    return;
  }

  try {
    const result = await sendPatientNotification(patient);
    const sentAt = new Date();

    patient.notificationSentAt = sentAt;
    await patient.save();

    await Tracking.findOneAndUpdate(
      { token: patient.token },
      { notificationSentAt: sentAt, updatedAt: sentAt }
    );

    io.emit('patientNotification', {
      token: patient.token,
      phone: patient.phone,
      message: `Token #${patient.token} is now being called.`,
      sent: result.sent,
      provider: result.provider || 'dry-run',
    });
  } catch (error) {
    console.error('Patient notification error:', error.message);
  }
};

// Broadcast queue update
const broadcastQueueUpdate = async () => {
  try {
    const waiting = await Patient.find({ status: 'waiting' }).sort({ addedAt: 1 });
    const currentPatients = await Patient.find({ status: 'serving' });
    const current = currentPatients[0] || null;
    const completed = await Patient.find({ status: 'completed' }).sort({ completedAt: -1 });
    const currentByDoctor = currentPatients.reduce((acc, patient) => {
      acc[patient.doctorId || 'unassigned'] = patient;
      return acc;
    }, {});
    const waitingByDoctor = waiting.reduce((acc, patient) => {
      const key = patient.doctorId || 'unassigned';
      acc[key] = acc[key] || [];
      acc[key].push(patient);
      return acc;
    }, {});

    io.emit('queueUpdated', {
      waiting: waiting.map(mapPatientForQueue),
      current: current ? mapPatientForQueue(current) : null,
      currentPatients: currentPatients.map(mapPatientForQueue),
      completed: completed.map(p => ({
        id: p.id,
        token: p.token,
        name: p.name,
        doctorId: p.doctorId,
        doctorName: p.doctorName,
        consultationTime: p.consultationTime,
      })),
    });

    const now = new Date();

    await Promise.all(waiting.map((patient, idx) => (
      (() => {
        const doctorKey = patient.doctorId || 'unassigned';
        const doctorWaiting = waitingByDoctor[doctorKey] || [];
        const doctorIndex = doctorWaiting.findIndex((item) => item.id === patient.id);
        const doctorCurrent = currentByDoctor[doctorKey];

        return Tracking.findOneAndUpdate(
          { token: patient.token },
          {
            patientsAhead: Math.max(doctorIndex, 0),
            patientId: patient.id,
            currentToken: doctorCurrent?.token || 0,
            totalPatients: doctorWaiting.length + (doctorCurrent ? 1 : 0),
            estimatedWaitTime: estimateWaitTime(patient.visitType, Math.max(doctorIndex, 0)),
            visitType: patient.visitType,
            doctorId: patient.doctorId,
            status: doctorIndex === 0 && !doctorCurrent ? 'almost-turn' : 'waiting',
            updatedAt: now,
          },
          { upsert: true }
        );
      })()
    )));

    await Promise.all(currentPatients.map(async (currentPatient) => {
      await Tracking.findOneAndUpdate(
        { token: currentPatient.token },
        {
          patientsAhead: 0,
          patientId: currentPatient.id,
          currentToken: currentPatient.token,
          totalPatients: (waitingByDoctor[currentPatient.doctorId || 'unassigned']?.length || 0) + 1,
          estimatedWaitTime: 0,
          visitType: currentPatient.visitType,
          doctorId: currentPatient.doctorId,
          status: 'serving',
          updatedAt: new Date(),
        },
        { upsert: true }
      );

      await notifyPatientIfReady(currentPatient);
    }));

    await Promise.all(completed.map((patient) => (
      Tracking.findOneAndUpdate(
        { token: patient.token },
        {
          patientsAhead: 0,
          patientId: patient.id,
          currentToken: currentByDoctor[patient.doctorId || 'unassigned']?.token || 0,
          totalPatients: (waitingByDoctor[patient.doctorId || 'unassigned']?.length || 0) + (currentByDoctor[patient.doctorId || 'unassigned'] ? 1 : 0),
          estimatedWaitTime: 0,
          visitType: patient.visitType,
          doctorId: patient.doctorId,
          status: 'completed',
          updatedAt: now,
        },
        { upsert: true }
      )
    )));

    // Emit tracking updates
    const trackingData = await Tracking.find();
    io.emit('trackingUpdated', trackingData);
  } catch (error) {
    console.error('Broadcast error:', error);
  }
};

// ==================== EXPRESS ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running with MongoDB' });
});

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors.map(publicDoctor));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Doctor account already exists' });
    }

    const { salt, hash } = hashPassword(password);
    const doctor = await Doctor.create({
      name,
      email,
      specialty: specialty || 'General Consultation',
      passwordSalt: salt,
      passwordHash: hash,
    });
    const token = await createDoctorSession(doctor.id);

    res.status(201).json({ token, doctor: publicDoctor(doctor) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email: email?.toLowerCase().trim() });

    if (!doctor || !verifyPassword(password || '', doctor.passwordSalt, doctor.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = await createDoctorSession(doctor.id);
    res.json({ token, doctor: publicDoctor(doctor) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const doctor = await getRequestDoctor(req);
    if (!doctor) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({ doctor: publicDoctor(doctor) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      await DoctorSession.deleteOne({ token });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get queue state
app.get('/api/queue', async (req, res) => {
  try {
    const waiting = await Patient.find({ status: 'waiting' }).sort({ addedAt: 1 });
    const current = await Patient.findOne({ status: 'serving' });
    const completed = await Patient.find({ status: 'completed' });

    res.json({
      waiting,
      current,
      completed,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const state = await getClinicState();
    const served = await Patient.countDocuments({ status: 'completed' });

    res.json({
      served,
      avgConsultationTime: state.avgConsultationTime,
      efficiency: state.stats.efficiency,
      satisfaction: state.stats.satisfaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset clinic (for testing)
app.post('/api/reset', async (req, res) => {
  try {
    await Patient.deleteMany({});
    await Tracking.deleteMany({});
    await ClinicState.updateOne({ clinicId: 'default' }, {
      currentPatientId: null,
      servedToday: 0,
      consultationTime: 10,
      lastUpdated: new Date(),
    });

    broadcastQueueUpdate();
    res.json({ message: 'Clinic reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOCKET.IO EVENT HANDLERS ====================

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Send initial state
  (async () => {
    try {
      const waiting = await Patient.find({ status: 'waiting' }).sort({ addedAt: 1 });
      const current = await Patient.findOne({ status: 'serving' });
      const completed = await Patient.find({ status: 'completed' });

      socket.emit('queueUpdated', {
        waiting: waiting.map(mapPatientForQueue),
        current: current ? mapPatientForQueue(current) : null,
        currentPatients: current ? [mapPatientForQueue(current)] : [],
        completed: completed.map(p => ({
          id: p.id,
          token: p.token,
          name: p.name,
          doctorId: p.doctorId,
          doctorName: p.doctorName,
          consultationTime: p.consultationTime,
        })),
      });
    } catch (error) {
      console.error('Initial state error:', error);
    }
  })();

  // Add patient event
  socket.on('addPatient', async (patientData, callback) => {
    try {
      const token = await generateToken();
      const assignedDoctor = patientData.doctorId
        ? await Doctor.findOne({ id: patientData.doctorId })
        : null;

      const newPatient = new Patient({
        token,
        name: patientData.name,
        age: patientData.age,
        phone: patientData.phone,
        visitType: patientData.visitType,
        doctorId: assignedDoctor?.id || null,
        doctorName: assignedDoctor?.name || null,
        status: 'waiting',
      });

      await newPatient.save();

      // Create tracking record
      const tracking = new Tracking({
        token,
        patientId: newPatient.id,
        patientsAhead: 0,
        estimatedWaitTime: 0,
        visitType: newPatient.visitType,
        doctorId: newPatient.doctorId,
        status: 'waiting',
      });

      await tracking.save();

      await broadcastQueueUpdate();
      socket.emit('patientAdded', {
        success: true,
        token,
        patientId: newPatient.id,
        trackingUrl: `/patient-waiting?token=${token}`,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          token,
          patientId: newPatient.id,
          trackingUrl: `/patient-waiting?token=${token}`,
        });
      }

      console.log(`Patient added: ${newPatient.name} (Token: ${token})`);
    } catch (error) {
      console.error('Add patient error:', error);
      socket.emit('error', { message: 'Failed to add patient' });
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Failed to add patient' });
      }
    }
  });

  // Call next patient event
  socket.on('callNext', async (data) => {
    try {
      const doctor = await getDoctorByAuthToken(data.authToken);
      if (!doctor) {
        socket.emit('error', { message: 'Doctor login required to call patients' });
        return;
      }

      // Mark current as completed if exists
      const currentPatient = await Patient.findOne({ status: 'serving', doctorId: doctor.id });
      if (currentPatient) {
        currentPatient.status = 'completed';
        currentPatient.completedAt = new Date();
        currentPatient.consultationTime = data.consultationTime || 10;
        await currentPatient.save();
      }

      // Move next from waiting to serving
      const nextPatient = await Patient.findOne({ status: 'waiting', doctorId: doctor.id }).sort({ addedAt: 1 });
      if (nextPatient) {
        nextPatient.status = 'serving';
        await nextPatient.save();

        // Update tracking
        await Tracking.findOneAndUpdate(
          { token: nextPatient.token },
          { status: 'serving', updatedAt: new Date() }
        );

        // Emit token called event
        io.emit('tokenCalled', {
          token: nextPatient.token,
          name: nextPatient.name,
          visitType: nextPatient.visitType,
        });

        console.log(`Token called: ${nextPatient.token}`);
      }

      await broadcastQueueUpdate();
    } catch (error) {
      console.error('Call next error:', error);
      socket.emit('error', { message: 'Failed to call next patient' });
    }
  });

  // Consultation time change event
  socket.on('consultationTimeChanged', async (data) => {
    try {
      const state = await getClinicState();
      state.consultationTime = data.time;
      state.lastUpdated = new Date();
      await state.save();

      io.emit('consultationTimeUpdated', { time: data.time });
      console.log(`Consultation time updated: ${data.time} minutes`);
    } catch (error) {
      console.error('Consultation time error:', error);
    }
  });

  // Patient tracking event
  socket.on('patientTracking', async (data) => {
    try {
      const tracking = await Tracking.findOne({ token: Number(data.token) });
      if (tracking) {
        socket.emit('trackingData', tracking);
      }
    } catch (error) {
      console.error('Patient tracking error:', error);
    }
  });

  // Get analytics event
  socket.on('getAnalytics', async (data) => {
    try {
      const doctor = await getDoctorByAuthToken(data?.authToken);
      if (!doctor) {
        socket.emit('error', { message: 'Doctor login required for analytics' });
        return;
      }

      const state = await getClinicState();
      const completed = await Patient.countDocuments({ status: 'completed', doctorId: doctor.id });
      const waiting = await Patient.countDocuments({ status: 'waiting', doctorId: doctor.id });

      const completedPatients = await Patient.find({ status: 'completed', doctorId: doctor.id });
      const avgTime = completedPatients.length > 0
        ? completedPatients.reduce((sum, p) => sum + (p.consultationTime || 0), 0) / completedPatients.length
        : 0;

      socket.emit('analyticsData', {
        doctorId: doctor.id,
        patientsServedToday: completed,
        patientsWaiting: waiting,
        avgConsultationTime: Math.round(avgTime * 10) / 10,
        efficiency: state.stats.efficiency,
        satisfaction: state.stats.satisfaction,
        peakHour: state.stats.peakHour,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  });

  // Doctor status update event
  socket.on('updateDoctorStatus', async (data) => {
    try {
      io.emit('doctorStatusUpdated', { status: data.status });
      console.log(`Doctor status: ${data.status}`);
    } catch (error) {
      console.error('Doctor status error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== DATABASE CONNECTION & SERVER START ====================

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-cure';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('Make sure MongoDB is running or check your MONGODB_URI in .env');
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📊 Using MongoDB database`);
    console.log(`🔗 Connect frontend to: http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
