# Getting Started with Queue Cure

Quick start guide to get the system running in 5 minutes!

## Prerequisites

- **Node.js** 16+ (download from https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** (for cloning, optional)

## Installation (5 minutes)

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd Queue_Hackathon

# Install all dependencies at once
npm run install-all

# OR manually:
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Start Backend

```bash
# Terminal 1
cd backend
npm run dev
```

You should see:
```
🏥 Queue Cure Backend running on http://localhost:5000
📡 Socket.IO listening on ws://localhost:5000
```

### Step 3: Start Frontend

```bash
# Terminal 2
cd frontend
npm run dev
```

You should see:
```
VITE v4.3.9 ready in 234 ms

➜  Local:   http://localhost:3000/
```

### Step 4: Open Application

Go to http://localhost:3000 in your browser

## First Use

### Add Your First Patient

1. Fill in patient details:
   - Name: "Raj Kumar"
   - Age: "35"
   - Phone: "9876543210"
   - Visit Type: "General Consultation"

2. Click "Add Patient" → Token #1 assigned

3. Open **Waiting Room Display** in new tab (or visit http://localhost:3000/waiting-room)

4. Click **Call Next Patient** on dashboard

5. Watch the magic happen:
   - ✨ Token appears on waiting room screen
   - 🔊 Voice announcement plays
   - 📱 Patient tracking updates
   - 📊 Analytics update

## Features to Try

### 1. Real-Time Queue Management

```bash
# Add multiple patients
- Patient 2: "Priya Sharma" - Follow Up
- Patient 3: "Amit Patel" - Cold/Fever
- Patient 4: "Neha Singh" - Emergency
```

Click "Call Next" and watch the queue flow in real-time across all screens!

### 2. Waiting Room Display

Open in fullscreen for clinic TV:
- Visit http://localhost:3000/waiting-room
- Press F11 for fullscreen
- Mute button in top right

### 3. Patient Tracking

After adding a patient, get their tracking link:
```
http://localhost:3000/track?token=1
```

Share this link or QR code with patients - they see real-time position!

### 4. Doctor Analytics

View performance dashboard:
```
http://localhost:3000/doctor-analytics
```

See:
- Patients served today
- Average consultation time
- Queue trends
- Efficiency metrics

### 5. Adjust Settings

Change average consultation time:
- 5 mins (for quick check-ups)
- 10 mins (default)
- 15 mins (longer consultations)
- 20 mins (complex cases)

Wait times automatically recalculate!

## Understanding the Data Flow

```
1. Receptionist adds patient
   ↓
2. Backend generates token + calculates wait time
   ↓
3. Socket.IO broadcasts queueUpdated
   ↓
4. All screens update instantly:
   - Dashboard: queue updates
   - TV: nothing changes (waiting)
   - Patient tracking: wait time updates
   - Analytics: queue length changes
   ↓
5. Receptionist clicks "Call Next"
   ↓
6. Backend moves current → completed, waiting[0] → current
   ↓
7. Socket.IO broadcasts:
   - queueUpdated (queue changed)
   - tokenCalled (triggers announcement)
   - trackingUpdated (new wait times)
   ↓
8. All screens update with new state
```

## Useful URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Receptionist Dashboard |
| http://localhost:3000/waiting-room | Waiting Room TV Display |
| http://localhost:3000/doctor-analytics | Doctor Analytics |
| http://localhost:3000/track?token=1 | Patient Tracking |
| http://localhost:5000/api/health | Backend Health Check |
| http://localhost:5000/api/queue | Current Queue State |

## API Endpoints

### Check Backend is Running
```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","message":"Queue Cure backend is running"}
```

### Get Current Queue
```bash
curl http://localhost:5000/api/queue
```

### Get Statistics
```bash
curl http://localhost:5000/api/stats
```

### Reset Queue (for testing)
```bash
curl -X POST http://localhost:5000/api/reset
```

## Stop the Application

```bash
# Terminal 1 (Backend)
Ctrl + C

# Terminal 2 (Frontend)
Ctrl + C
```

## Troubleshooting

### Port Already in Use

If you see "Port 5000 already in use":
```bash
# Kill the process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Socket Connection Issues

1. Check browser console (F12)
2. Check if backend is running on port 5000
3. Verify firewall allows localhost:5000
4. Restart both services

### Animations Not Smooth

- Try a modern browser (Chrome, Edge, Firefox)
- Check if hardware acceleration is enabled
- Close other heavy applications

## Next Steps

### Development

1. Explore the codebase in `src/` folders
2. Read [docs/SOCKET_EVENTS.md](../docs/SOCKET_EVENTS.md) for real-time architecture
3. Read [docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for data structure
4. Modify components to test hot-reload

### Production

1. Follow [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
2. Deploy to Vercel (frontend) + Railway (backend)
3. Get your production URLs
4. Update Socket.IO connections

### Advanced Features

- Add dark mode
- Implement authentication
- Add database persistence
- Support multiple clinics
- Mobile app (React Native)

## Understanding the Architecture

### Frontend Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Full-page components
├── utils/           # Utility functions
│   ├── socket.js    # Socket.IO setup
│   └── healthcare.js # AI calculations
└── App.jsx          # Main router
```

### Backend Structure

```
backend/
└── server.js        # Express + Socket.IO server
    ├── Routes
    ├── Socket Events
    ├── In-memory Database
    └── Error Handling
```

### Real-Time Communication

- **Technology**: Socket.IO
- **Transport**: WebSocket (HTTP fallback)
- **Architecture**: Pub/Sub broadcasting
- **Latency**: <100ms typically

## Key Concepts

### Tokens
- Auto-incrementing numbers (1, 2, 3...)
- Assigned when patient added
- Announced when called
- Removed when completed

### Queue States
- **Completed**: Patients served today
- **Current**: Patient being served (highlighted)
- **Waiting**: Patients in line

### Wait Time Calculation
```
Wait Time = Patients Ahead × Avg Duration for Visit Type

Example:
Patient has 3 people ahead
Visit type = "General Consultation" (avg 12.5 min)
Wait time = 3 × 12.5 = 37.5 minutes
```

### Visit Types
- **General Consultation**: 10-15 mins
- **Follow Up**: 4-6 mins
- **Cold/Fever**: 5-7 mins
- **Emergency**: 20-30 mins
- **Specialist Visit**: 15-20 mins

## Testing Checklist

- [ ] Add a patient - token appears
- [ ] Call next - current patient displayed
- [ ] Queue updates on all screens
- [ ] Voice announcement plays
- [ ] Wait time calculates correctly
- [ ] Patient tracking shows position
- [ ] Analytics update
- [ ] Animations are smooth
- [ ] Responsive on mobile

## Common Tasks

### Test with Multiple Patients
```bash
# Add 5 patients quickly
# Then call next several times
# Watch queue flow through the system
```

### Monitor Real-Time Events
```bash
# Open browser DevTools (F12)
# Go to Network tab
# Filter: WS (WebSocket)
# See real-time messages
```

### Check Server Logs
```bash
# Backend terminal shows all events:
# New user connected: socket-id
# Patient added: token
# Queue updated
# Patient called: token-number
```

## System Requirements

| Component | Requirement |
|-----------|------------|
| CPU | 2+ cores |
| RAM | 512 MB+ |
| Storage | 500 MB+ |
| Network | Broadband for best experience |
| Browser | Modern (Chrome 80+, Firefox 75+, Safari 13+) |

## Performance Notes

- Supports ~20-30 concurrent users in MVP
- <100ms update latency
- Smooth 60fps animations on modern browsers
- ~50MB RAM usage for backend
- ~100MB RAM usage for frontend

## Getting Help

1. **Check Logs**: Backend terminal + Browser console
2. **Read Docs**: README.md, SOCKET_EVENTS.md, DATABASE_SCHEMA.md
3. **Test Endpoints**: Use `curl` to test REST API
4. **Monitor Network**: F12 DevTools → Network tab
5. **Inspect Data**: DevTools → Application → Local Storage/Cookies

## Success Indicators

✅ You're successful when:
- Backend starts without errors
- Frontend loads without console errors
- Patients can be added
- Call Next works and announces token
- All 3 screens update simultaneously
- Queue flows smoothly

## Ready?

```bash
npm run dev
```

Visit http://localhost:3000 and start managing queues! 🎉

---

**Queue Cure Getting Started Guide**
From zero to queue management in 5 minutes!
