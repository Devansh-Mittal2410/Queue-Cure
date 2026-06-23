# Quick Reference Guide

## Project Structure at a Glance

```
Queue_Hackathon/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node.js server
│   ├── server.js            # Main server file
│   └── package.json
│
├── docs/                     # Documentation
│   ├── GETTING_STARTED.md   # 5-min quick start
│   ├── SOCKET_EVENTS.md     # Real-time architecture
│   ├── DATABASE_SCHEMA.md   # Data structure
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── ENV_CONFIG.md        # Environment setup
│
└── README.md                 # Main documentation
```

## Quick Commands

### Installation

```bash
# Install all dependencies
npm run install-all

# Or manually
cd backend && npm install
cd ../frontend && npm install
```

### Development

```bash
# Start both servers
npm run dev

# Or separately
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2
```

### Production

```bash
# Build both
npm run build

# Build separately
npm run build:backend
npm run build:frontend

# Start backend
npm start
```

## Important URLs

| Usage | URL |
|-------|-----|
| App Access | http://localhost:3000 |
| Waiting Room | http://localhost:3000/waiting-room |
| Doctor Analytics | http://localhost:3000/doctor-analytics |
| Patient Tracking | http://localhost:3000/track?token=1 |
| Backend Health | http://localhost:5000/api/health |
| Backend Queue | http://localhost:5000/api/queue |

## Key Components

### Frontend

| Component | Purpose |
|-----------|---------|
| `StatCard.jsx` | Animated statistics display |
| `QueuePipeline.jsx` | Queue visualization |
| `AddPatientForm.jsx` | Patient entry form |
| `CallNextButton.jsx` | Call next action |
| `WaitingRoomDisplay.jsx` | TV screen display |
| `PatientTrackingScreen.jsx` | Mobile tracking |
| `DoctorAnalyticsPanel.jsx` | Analytics dashboard |

### Backend

```javascript
// Main Socket.IO Events
io.on('connection')
- addPatient
- callNext
- consultationTimeChanged
- patientTracking
- getAnalytics
- updateDoctorStatus

// REST API
GET /api/health          # Check if running
GET /api/queue           # Get current queue
GET /api/stats           # Get statistics
POST /api/reset          # Reset queue
```

## Socket.IO Event Cheat Sheet

### Emit (Client → Server)

```javascript
socket.emit('addPatient', {
  name, age, phone, visitType
});

socket.emit('callNext', { consultationTime });

socket.emit('consultationTimeChanged', { time });

socket.emit('patientTracking', { token, clinicId });

socket.emit('getAnalytics', {});

socket.emit('updateDoctorStatus', { status });
```

### Listen (Server → Client)

```javascript
socket.on('queueUpdated', (data) => {
  // { waiting, current, completed }
});

socket.on('tokenCalled', (data) => {
  // { token }
});

socket.on('trackingUpdated', (data) => {
  // { [token]: trackingInfo }
});

socket.on('analyticsUpdated', (data) => {
  // { served, avgTime, peakHour, ... }
});
```

## Wait Time Calculation

```
Wait Time = Patients Ahead × Duration for Visit Type

Durations (average):
- Cold/Fever: 6 min
- Follow Up: 5 min
- General: 12.5 min
- Specialist: 17.5 min
- Emergency: 25 min
```

## Patient Status Workflow

```
Added → Waiting → Almost Your Turn → Now Calling → Completed
```

## Features at a Glance

- ✅ Real-time queue management
- ✅ Receptionist dashboard
- ✅ Waiting room TV display
- ✅ Patient tracking with QR codes
- ✅ Doctor analytics
- ✅ Voice announcements
- ✅ AI wait time estimation
- ✅ Socket.IO sync
- ✅ Beautiful animations
- ✅ Responsive design

## File Locations (Key Files)

| What | Where |
|------|-------|
| Socket setup | `frontend/src/utils/socket.js` |
| Healthcare utils | `frontend/src/utils/healthcare.js` |
| Router config | `frontend/src/App.jsx` |
| Backend server | `backend/server.js` |
| Styling | `frontend/tailwind.config.js` |
| API config | `frontend/vite.config.js` |

## Debugging Tips

```bash
# Backend logs
# Check Terminal 1 for npm run dev output

# Frontend logs
# Check browser console (F12)

# Socket.IO events
# Open DevTools → Network → WS (WebSocket)

# Check API
curl http://localhost:5000/api/health

# Test patient add
curl -X POST http://localhost:5000/api/patients
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `lsof -i :5000` then `kill -9 <PID>` |
| CORS error | Check `CORS_ORIGIN` in backend |
| Module not found | `rm node_modules && npm install` |
| Socket not connecting | Verify backend is running |
| Animations laggy | Check browser/GPU support |
| No voice announcement | Check browser audio permissions |

## Deployment Quick Links

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway or Heroku
- See [docs/DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps

## Performance Notes

- Typical latency: <100ms
- Max concurrent users: ~30 (MVP)
- CPU usage: ~50% on single core
- Memory usage: ~100MB

## Tech Stack Summary

```
Frontend: React + Vite + Tailwind + Framer Motion + Socket.IO
Backend: Express + Socket.IO + Node.js
Database: In-memory (MVP) → MySQL (production)
Hosting: Vercel (frontend) + Railway/Heroku (backend)
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Version Info

- React: 18.2.0
- Vite: 4.3.9
- Tailwind CSS: 3.3.2
- Framer Motion: 10.16.4
- Socket.IO: 4.5.4
- Express: 4.18.2
- Node.js: 16+

## Useful npm Scripts

```bash
# From root directory
npm run install-all      # Install all dependencies
npm run dev             # Start all servers
npm run build           # Build all projects

# From backend/
npm run dev             # Development mode
npm start              # Production mode

# From frontend/
npm run dev            # Development mode
npm run build          # Build for production
npm run preview        # Preview production build
```

## Color Scheme

- **Primary Blue**: `#0ea5e9`
- **Secondary Teal**: `#14b8a6`
- **Success Green**: `#10b981`
- **Warning Amber**: `#f59e0b`
- **Error Red**: `#ef4444`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Getting Help

1. Check [GETTING_STARTED.md](GETTING_STARTED.md)
2. See [docs/](docs/) for detailed docs
3. Check browser console (F12)
4. Check backend terminal logs
5. Test endpoints with curl

---

**Queue Cure Quick Reference**
Everything you need in one place!
