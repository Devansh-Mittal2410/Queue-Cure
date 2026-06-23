# Queue Cure '26 - Modern Smart Clinic Queue Management System

A production-ready full-stack real-time web application that solves patient waiting problems in Indian clinics using modern healthcare SaaS UI/UX.

## 🎯 Problem Statement

Most Indian clinics still use paper tokens and manual queue management, resulting in:
- No patient visibility into queue position
- Manual queue management prone to errors
- Doctors have no operational dashboard
- Inefficient resource utilization
- Poor patient experience

## ✨ Solution

Queue Cure provides a complete digital queue management system with:
- **Real-time updates** via Socket.IO
- **Multiple interfaces**: Receptionist Dashboard, Waiting Room Display, Patient Tracking, Doctor Analytics
- **AI-powered wait time estimation** based on consultation type
- **Voice announcements** and notifications
- **QR code patient tracking**
- **Beautiful, professional healthcare UI** with Framer Motion animations

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Socket.IO Client
- Vite (bundler)

**Backend:**
- Node.js
- Express.js
- Socket.IO
- In-memory storage (MVP)

**Real-time Communication:**
- Socket.IO for bidirectional real-time updates

## 📁 Project Structure

```
Queue_Hackathon/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── StatCard.jsx    # Animated statistics card
│   │   │   ├── QueuePipeline.jsx
│   │   │   ├── AddPatientForm.jsx
│   │   │   ├── CallNextButton.jsx
│   │   │   ├── ConsultationTimeControl.jsx
│   │   │   ├── WaitingRoomDisplay.jsx
│   │   │   ├── PatientTrackingScreen.jsx
│   │   │   └── DoctorAnalyticsPanel.jsx
│   │   ├── pages/              # Full-page components
│   │   │   ├── ReceptionistDashboard.jsx
│   │   │   ├── WaitingRoomPage.jsx
│   │   │   ├── PatientTrackingPage.jsx
│   │   │   └── DoctorAnalyticsPage.jsx
│   │   ├── utils/
│   │   │   ├── socket.js       # Socket.IO client setup
│   │   │   └── healthcare.js   # Healthcare utilities & AI estimation
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── backend/                     # Node.js + Express server
│   ├── server.js               # Main server file with Socket.IO
│   └── package.json
│
└── docs/                        # Documentation
    ├── SOCKET_EVENTS.md        # Socket event flow
    └── DATABASE_SCHEMA.md      # Data structure
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Windows/Mac/Linux

### Installation

#### 1. Clone/Setup Project

```bash
cd Queue_Hackathon
```

#### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

#### 3. Setup Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🎮 Using the Application

### Receptionist Dashboard (`http://localhost:3000`)

The main interface for clinic staff:

1. **Add New Patient**
   - Enter patient name, age, phone
   - Select visit type (General, Follow-up, Cold/Fever, Emergency, Specialist)
   - Patient automatically gets a token

2. **Live Queue Board**
   - Completed patients list
   - Currently serving (highlighted card)
   - Waiting patients queue

3. **Call Next Patient**
   - Large primary action button
   - Automatically announces patient
   - Updates all connected displays

4. **Consultation Time Control**
   - Set average consultation time (5, 10, 15, 20 mins)
   - Used for wait time calculations

5. **Quick Links**
   - Open Waiting Room Display (TV screen)
   - View Doctor Analytics Dashboard

### Waiting Room Display (`http://localhost:3000/waiting-room`)

Full-screen TV display for waiting room:

- **Now Serving Section**: Large animated token number
- **Waiting List**: Next 6 patients
- **Queue Metrics**: Current queue length, estimated wait time
- **Doctor Status**: Available/In Consultation
- **Sound/Mute Control**: Top right corner

### Patient Tracking (`http://localhost:3000/track?token=XX`)

Real-time mobile tracking screen:

- Your token number
- Current token being served
- Patients ahead in queue
- Estimated wait time (AI-calculated)
- Progress bar visualization
- QR code for sharing link

### Doctor Analytics (`http://localhost:3000/doctor-analytics`)

Real-time performance dashboard:

- Patients served today
- Average consultation time
- Peak rush hour
- Current queue length
- Queue length trend chart
- Daily efficiency metrics

## 🔌 Real-Time Socket Events

### Client → Server Events

```javascript
// Add new patient
socket.emit('addPatient', {
  name: 'John Doe',
  age: 35,
  phone: '9876543210',
  visitType: 'General Consultation'
});

// Call next patient
socket.emit('callNext', { consultationTime: 10 });

// Update consultation time
socket.emit('consultationTimeChanged', { time: 15 });

// Patient starts tracking
socket.emit('patientTracking', { token: 45, clinicId: 'clinic-001' });

// Request analytics
socket.emit('getAnalytics', {});

// Update doctor status
socket.emit('updateDoctorStatus', { status: 'available' }); // or 'in-consultation'
```

### Server → Client Events (Broadcasts)

```javascript
// Queue updated
socket.on('queueUpdated', (data) => {
  // { waiting: [], current: {}, completed: [] }
});

// Patient called
socket.on('tokenCalled', (data) => {
  // { token: 45 } - triggers announcement
});

// Tracking updated
socket.on('trackingUpdated', (data) => {
  // { [token]: { status, patientsAhead, waitTime, ... } }
});

// Analytics updated
socket.on('analyticsUpdated', (data) => {
  // { served, avgTime, peakHour, queueLength, ... }
});

// Doctor status changed
socket.on('doctorStatusUpdated', (data) => {
  // { status: 'available' | 'in-consultation' }
});
```

## 🤖 AI Wait Time Estimation

Wait times are calculated based on visit type and patients ahead:

```javascript
Consultation Durations:
- Cold/Fever: 5-7 minutes (avg 6 min)
- Follow-up: 4-6 minutes (avg 5 min)  
- General Consultation: 10-15 minutes (avg 12.5 min)
- Specialist Visit: 15-20 minutes (avg 17.5 min)
- Emergency: 20-30 minutes (avg 25 min)

Wait Time = (Patients Ahead) × (Avg Duration for Visit Type)
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue (`#0ea5e9`)
- **Secondary**: Teal (`#14b8a6`)
- **Accents**: Various gradient colors for different sections

### Animations (Framer Motion)
- ✨ Smooth card transitions
- 📊 Counter animations for statistics
- 🎯 Queue movement animations
- 📈 Progress bar animations
- 🎉 Success notifications
- 🔄 Continuous pulse for current patient

### Responsive Design
- Mobile-friendly patient tracking
- Desktop-optimized dashboards
- TV-display compatible waiting room
- Touch-friendly buttons

## 🔊 Features

### Voice Announcements
When a patient is called:
```
"Token 45, please proceed to the consultation room."
```

Browser speech synthesis automatically announces to waiting room.

### Sound Notifications
- Beep sound when token is called
- Can be muted in waiting room display

### QR Code Generation
Each patient receives a scannable QR code linking to:
```
http://localhost:3000/track?token=45&clinic=clinic-001
```

## 🗄️ Data Models

### Patient
```javascript
{
  id: 'uuid',
  token: 45,
  name: 'John Doe',
  age: 35,
  phone: '9876543210',
  visitType: 'General Consultation',
  addedAt: Date
}
```

### Queue State
```javascript
{
  completed: [21, 22, 23],      // Past tokens
  current: { /* patient data */ },  // Currently being served
  waiting: [ /* patient array */ ]  // Waiting queue
}
```

### Tracking Data
```javascript
{
  token: 45,
  name: 'John Doe',
  visitType: 'General Consultation',
  status: 'waiting' | 'almost-turn' | 'now-calling',
  patientsAhead: 3,
  currentToken: 44,
  totalPatients: 8,
  waitTime: 37  // in minutes
}
```

## 📊 API Endpoints

### REST API

```bash
# Health check
GET /api/health

# Get current queue state
GET /api/queue

# Get statistics
GET /api/stats

# Reset queue (for testing)
POST /api/reset
```

## 🚢 Deployment

### Deploy Frontend (Vercel, Netlify, GitHub Pages)

```bash
cd frontend
npm run build
# Upload dist/ folder to hosting service
```

### Deploy Backend (Heroku, Railway, AWS, DigitalOcean)

```bash
cd backend
# Add .env file
PORT=5000

# Deploy with your preferred service
git push heroku main
```

### Production Checklist

- [ ] Update Socket.IO CORS origins for production domain
- [ ] Enable HTTPS for all connections
- [ ] Add authentication to protect endpoints
- [ ] Implement database (MySQL/PostgreSQL) for persistence
- [ ] Add logging and monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Add input validation and sanitization
- [ ] Setup CI/CD pipeline

## 🔒 Security (TODO for Production)

1. **Authentication**: Add JWT-based authentication
2. **Authorization**: Role-based access control
3. **Input Validation**: Sanitize all inputs
4. **Rate Limiting**: Prevent abuse
5. **HTTPS**: Use SSL certificates
6. **CORS**: Configure properly for production domain
7. **Data Encryption**: Encrypt sensitive patient data

## 📈 Future Enhancements

- [ ] Dark mode toggle
- [ ] Emergency priority patients (jump queue)
- [ ] Multi-clinic support
- [ ] Doctor management
- [ ] Appointment scheduling
- [ ] SMS notifications to patients
- [ ] Analytics dashboard for clinic owners
- [ ] Patient feedback system
- [ ] Integration with clinic management systems
- [ ] Mobile app (React Native)

## 🧪 Testing

### Manual Testing Checklist

```
Receptionist Dashboard:
- [ ] Add patient - token generated
- [ ] Call next - queue updates
- [ ] Change consultation time - stats update
- [ ] All animations smooth

Waiting Room Display:
- [ ] Large token number visible
- [ ] Token updates on call next
- [ ] Audio announcement plays
- [ ] Stats update in real-time

Patient Tracking:
- [ ] QR code displays
- [ ] Real-time position updates
- [ ] Wait time calculates correctly
- [ ] Status changes appropriately

Doctor Analytics:
- [ ] Stats display correctly
- [ ] Chart updates
- [ ] Efficiency metrics show
```

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

## 🤝 Contributing

This is a hackathon project. Feel free to extend and improve!

## 📄 License

MIT License - Use freely for commercial and personal projects

## 📞 Support

For issues or questions, check:
1. Browser console for errors
2. Backend terminal for logs
3. Socket.IO network tab in DevTools

## 🎉 Features Summary

| Feature | Status |
|---------|--------|
| Real-time Queue Management | ✅ |
| Receptionist Dashboard | ✅ |
| Waiting Room Display | ✅ |
| Patient Tracking | ✅ |
| Doctor Analytics | ✅ |
| Voice Announcements | ✅ |
| QR Code Generation | ✅ |
| AI Wait Time Estimation | ✅ |
| Socket.IO Real-time Sync | ✅ |
| Beautiful UI/Animations | ✅ |
| Responsive Design | ✅ |
| Dark Mode | 📋 |
| Multiple Clinics | 📋 |
| Database Integration | 📋 |
| Authentication | 📋 |

---

**Built for Queue Cure '26 Hackathon**
Empowering Indian clinics with modern queue management technology.
