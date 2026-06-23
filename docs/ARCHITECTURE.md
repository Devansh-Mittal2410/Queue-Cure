# Queue Cure - System Architecture & Design

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        QUEUE CURE SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │   USERS         │
                            ├─────────────────┤
                            │• Receptionists  │
                            │• Doctors        │
                            │• Patients       │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌─────────────────┐ ┌──────────────┐ ┌────────────────┐
        │   DASHBOARD     │ │   TV SCREEN  │ │  MOBILE APP    │
        │  (Port 3000)    │ │ (Port 3000)  │ │ (Port 3000)    │
        │                 │ │              │ │                │
        │  React App      │ │   React App  │ │   React App    │
        │  + Socket.IO    │ │  + Socket.IO │ │  + Socket.IO   │
        │  Client         │ │  Client      │ │  Client        │
        └────────┬────────┘ └──────┬───────┘ └────────┬───────┘
                 │                 │                   │
                 └─────────────────┼───────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   SOCKET.IO CONNECTION     │
                    │   (WebSocket Protocol)     │
                    │   Latency: <100ms          │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   EXPRESS + SOCKET.IO      │
                    │   SERVER (Port 5000)       │
                    │                            │
                    │   • Real-time Events       │
                    │   • Queue Management       │
                    │   • REST API               │
                    │   • Broadcasting           │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   IN-MEMORY DATABASE       │
                    │   (MVP - Future: MySQL)    │
                    │                            │
                    │   • Queue State            │
                    │   • Patient Tracking       │
                    │   • Analytics              │
                    └────────────────────────────┘
```

## Detailed Component Architecture

### Frontend Layer

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            ROUTER (React Router)                 │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │ /                  → Receptionist        │   │  │
│  │  │ /waiting-room      → Waiting Room TV     │   │  │
│  │  │ /track             → Patient Tracking    │   │  │
│  │  │ /doctor-analytics  → Doctor Dashboard    │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           COMPONENT HIERARCHY                    │  │
│  │                                                  │  │
│  │  App.jsx                                         │  │
│  │  ├── ReceptionistDashboard.jsx                  │  │
│  │  │   ├── StatCard.jsx                           │  │
│  │  │   ├── AddPatientForm.jsx                      │  │
│  │  │   ├── QueuePipeline.jsx                       │  │
│  │  │   ├── CallNextButton.jsx                      │  │
│  │  │   └── ConsultationTimeControl.jsx             │  │
│  │  ├── WaitingRoomPage.jsx                         │  │
│  │  │   └── WaitingRoomDisplay.jsx                  │  │
│  │  ├── PatientTrackingPage.jsx                     │  │
│  │  │   └── PatientTrackingScreen.jsx               │  │
│  │  └── DoctorAnalyticsPage.jsx                     │  │
│  │      └── DoctorAnalyticsPanel.jsx                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         UTILITIES & STATE MANAGEMENT             │  │
│  │                                                  │  │
│  │  utils/socket.js                                 │  │
│  │  ├── initializeSocket()                          │  │
│  │  ├── emitEvent()                                 │  │
│  │  ├── onEvent()                                   │  │
│  │  └── offEvent()                                  │  │
│  │                                                  │  │
│  │  utils/healthcare.js                             │  │
│  │  ├── estimateWaitTime()                          │  │
│  │  ├── announceToken()                             │  │
│  │  ├── playNotificationSound()                     │  │
│  │  └── generateQRValue()                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         STYLING                                 │  │
│  │                                                  │  │
│  │  • Tailwind CSS (Utility-first CSS)             │  │
│  │  • Framer Motion (Animations)                   │  │
│  │  • Custom CSS (index.css)                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Backend Layer

```
┌─────────────────────────────────────────────────────────┐
│               NODE.JS EXPRESS BACKEND                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         EXPRESS SERVER (Port 5000)               │  │
│  │                                                  │  │
│  │  app.use(cors())                                │  │
│  │  app.use(express.json())                         │  │
│  │  app.use(socket.io handler)                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         REST API ENDPOINTS                       │  │
│  │                                                  │  │
│  │  GET  /api/health                               │  │
│  │  GET  /api/queue                                │  │
│  │  GET  /api/stats                                │  │
│  │  POST /api/reset                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │     SOCKET.IO SERVER (Real-time Handler)         │  │
│  │                                                  │  │
│  │  io.on('connection')                            │  │
│  │  ├── Event: addPatient                          │  │
│  │  ├── Event: callNext                            │  │
│  │  ├── Event: consultationTimeChanged             │  │
│  │  ├── Event: patientTracking                      │  │
│  │  ├── Event: getAnalytics                         │  │
│  │  └── Event: updateDoctorStatus                   │  │
│  │                                                  │  │
│  │  Broadcasting to clients:                        │  │
│  │  ├── queueUpdated                               │  │
│  │  ├── tokenCalled                                │  │
│  │  ├── trackingUpdated                            │  │
│  │  ├── analyticsUpdated                           │  │
│  │  └── doctorStatusUpdated                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      BUSINESS LOGIC LAYER                        │  │
│  │                                                  │  │
│  │  • Queue Management                             │  │
│  │  • Token Generation                             │  │
│  │  • Wait Time Calculation                        │  │
│  │  • Tracking Data Generation                     │  │
│  │  • Analytics Computation                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      IN-MEMORY DATABASE                          │  │
│  │                                                  │  │
│  │  clinicState = {                                │  │
│  │    queue: {                                      │  │
│  │      completed: [],                              │  │
│  │      current: Patient | null,                    │  │
│  │      waiting: Patient[]                          │  │
│  │    },                                             │  │
│  │    consultationTime: number,                     │  │
│  │    stats: {...},                                │  │
│  │    trackingData: {...}                           │  │
│  │  }                                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Normal Queue Flow

```
1. Receptionist adds patient
   ↓
   socket.emit('addPatient', {name, age, phone, visitType})
   ↓
2. Backend receives and processes
   ↓
   - Generate token
   - Create patient object
   - Add to queue.waiting
   - Create tracking data
   ↓
3. Backend broadcasts update
   ↓
   io.emit('queueUpdated', {...})
   io.emit('trackingUpdated', {...})
   ↓
4. All clients receive updates
   ↓
   socket.on('queueUpdated') → render new queue
   socket.on('trackingUpdated') → update wait times
   ↓
5. UI components re-render with new data
   ↓
   Framer Motion animations trigger
   ↓
6. User sees smooth update on all screens simultaneously
```

### Patient Call Flow

```
1. Receptionist clicks "Call Next"
   ↓
   socket.emit('callNext', {consultationTime})
   ↓
2. Backend processes call
   ↓
   - Move current patient to completed[]
   - Shift next patient from waiting[]
   - Set as current
   - Update tracking data
   ↓
3. Backend triggers announcements
   ↓
   - Emit 'tokenCalled' event
   - Update patient status to 'now-calling'
   ↓
4. All clients process announcements
   ↓
   - Voice announcement plays
   - Sound notification plays
   - UI animations trigger
   ↓
5. Real-time displays update
   ↓
   - Dashboard: shows new current patient
   - TV: displays new token with animation
   - Patient Tracking: updates wait times
   - Analytics: recalculates metrics
```

## State Management Strategy

### Centralized Server State

```
┌──────────────────────────────────────┐
│    Server-Side State (clinicState)   │
│                                      │
│    • Single source of truth          │
│    • Prevents race conditions        │
│    • Clients derive UI state         │
│    • Timestamp-based conflicts       │
└──────────────┬───────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
Dashboard   TV Screen  Patient App
(Client)    (Client)   (Client)
    │          │          │
    └──────────┼──────────┘
               │
         Local React State
         (UI Re-renders)
```

### Client-Side State Management

```
Each Page Component:
├── useEffect hooks for Socket listeners
├── useState for local data
├── Event handlers for user interactions
└── Derived data computed on each render

No Redux/Context needed for MVP:
✓ Server sends complete state on each event
✓ Simple data structures
✓ No complex state transformations
✓ Each screen is independent
```

## Real-Time Communication Flow

### Connection Lifecycle

```
User Opens App
    ↓
Socket.IO initializes
    ↓
Handshake with server (handshake packet)
    ↓
Server: socket assigned + emits initial state
    ↓
socket.on('connect', ...) triggers
    ↓
Client: emit events normally now
    ↓
All communications are bidirectional & instant
    ↓
User Closes App
    ↓
socket.on('disconnect', ...)
    ↓
Server removes socket from active connections
```

### Message Flow Example

```
TIME    CLIENT                          SERVER                     OTHER CLIENTS
────    ──────                          ──────                     ─────────────

T+0ms   User clicks                     ─────
        "Call Next"

T+10ms  socket.emit('callNext') ────────> Receives event
                                        Processes queue
                                        Updates clinicState
                                        Validates changes

T+20ms                                  io.emit('queueUpdated') ───> socket.on('queueUpdated')
                                        io.emit('tokenCalled')  ───> socket.on('tokenCalled')

T+30ms                                                           All clients update
                                                                their React state

T+40ms                                                           React components
                                                                 re-render

T+50ms                                                           Browser renders
                                                                 to screen

T+60ms                                                           Animations begin
                                                                (Framer Motion)

Total Latency: ~50-60ms
User Experience: Instant update (imperceptible)
```

## Scalability Architecture

### Current MVP
```
Single Server Process
├── All clinic data in memory
├── All sockets in one namespace
├── Horizontal scaling: Not possible
├── Max concurrent: ~30 users
└── Data persistence: None
```

### Production Architecture (Phase 2)
```
┌─────────────────────────────────────┐
│     Load Balancer (nginx)           │
└────────────┬────────────────────────┘
             │
      ┌──────┼──────┐
      │      │      │
      ▼      ▼      ▼
   Server  Server  Server
   :5000   :5001   :5002
      │      │      │
      └──────┼──────┘
             │
     ┌───────▼───────┐
     │  Redis Store  │
     │  (Session)    │
     └───────┬───────┘
             │
     ┌───────▼───────┐
     │  MySQL Database
     │  (Persistent) │
     └───────────────┘
```

### Multi-Clinic Architecture
```
Route by Clinic ID
    ↓
Namespace: /clinic/:id
    ↓
Socket.io broadcasts scoped to namespace
    ↓
Each clinic has isolated state
    ↓
Shared infrastructure (database, cache)
```

## Security Architecture

```
┌─────────────────────────────────────┐
│       CLIENT REQUEST                │
└────────────┬────────────────────────┘
             │
      ┌──────▼─────────┐
      │  CORS Check    │
      │  (Whitelist    │
      │   domains)     │
      └──────┬─────────┘
             │
      ┌──────▼──────────┐
      │  Rate Limiting  │
      │  (IP based)     │
      └──────┬──────────┘
             │
      ┌──────▼──────────┐
      │ Input Validation│
      │ (Sanitize)      │
      └──────┬──────────┘
             │
      ┌──────▼──────────┐
      │  Auth Check     │
      │  (JWT - Future) │
      └──────┬──────────┘
             │
      ┌──────▼──────────┐
      │  Process Event  │
      │  & Respond      │
      └─────────────────┘
```

## Error Handling Strategy

```
Client Error
    ↓
Try-Catch in Socket Event Handler
    ↓
Log to Console
    ↓
Send Error Event to Server (Future)
    ↓
Display User-Friendly Message
    ↓
Attempt Auto-Recover

Server Error
    ↓
Try-Catch in Event Handler
    ↓
Log to File/Console
    ↓
Emit Error Event to Client
    ↓
Maintain State Consistency
    ↓
Alert User (Future: Sentry)
```

## Performance Optimization

```
Frontend:
├── Code Splitting (React Router)
├── Lazy Loading (React.lazy)
├── Memoization (React.memo)
├── Event Debouncing (Wait time updates)
└── CSS Optimizations (Tailwind PurgeCSS)

Backend:
├── Event Broadcasting (O(n) optimal)
├── In-memory Storage (O(1) access)
├── Connection Pooling (Future)
├── Caching Layer (Future: Redis)
└── Database Indexing (Future: MySQL)

Network:
├── WebSocket (Binary protocol)
├── Message Compression (Future)
├── CDN for static assets (Vercel)
└── Regional servers (Future)
```

## Monitoring & Observability

```
Current (MVP):
├── Console logs on server
├── Browser console on client
└── DevTools Network tab

Production:
├── Sentry (Error tracking)
├── DataDog (Performance monitoring)
├── CloudWatch (Infrastructure)
├── Custom analytics dashboard
└── Real-time alerts
```

## Deployment Architecture

```
┌─────────────────────────────┐
│   Git Repository (GitHub)   │
└────────────┬────────────────┘
             │
      ┌──────┼──────┐
      │      │      │
      ▼      ▼      ▼
  Vercel   Railway  Custom
 (React)  (Node)   (Self-hosted)
      │      │      │
      └──────┼──────┘
             │
  Production System
  Available at:
  - queue-cure.vercel.app (Frontend)
  - api.queue-cure.com (Backend)
```

---

**Queue Cure Architecture Overview**
Comprehensive system design for scalable healthcare queue management.
