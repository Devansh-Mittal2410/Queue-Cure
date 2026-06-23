# Socket.IO Event Flow Diagram

## Real-Time Communication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUEUE CURE REALTIME SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  RECEPTIONIST        │
│  DASHBOARD           │
│  (Port 3000)         │
├──────────────────────┤
│ • Add Patient        │
│ • Call Next          │
│ • Set Time           │
│ • View Queue         │
└──────────┬───────────┘
           │
           │ Socket.IO
           │ (Port 5000)
           │
      ┌────▼──────────────────────────────────────┐
      │                                            │
      │     EXPRESS + SOCKET.IO SERVER             │
      │     (Node.js Backend)                      │
      │                                            │
      │  • Queue State Management                  │
      │  • Real-time Broadcasting                  │
      │  • Patient Tracking                        │
      │  • Analytics Calculation                   │
      │                                            │
      └────┬──────────────────────────────────────┘
           │
    ┌──────┴──────┬─────────────┬──────────────┐
    │             │             │              │
    ▼             ▼             ▼              ▼

┌────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐
│ WAITING    │ │ PATIENT    │ │ DOCTOR   │ │ MOBILE      │
│ ROOM TV    │ │ TRACKING   │ │ ANALYTICS│ │ TRACKING   │
│            │ │            │ │          │ │            │
│ Socket.IO  │ │ Socket.IO  │ │ Socket.IO│ │ Socket.IO  │
│ Client     │ │ Client     │ │ Client   │ │ Client     │
└────────────┘ └────────────┘ └──────────┘ └──────────────┘

```

## Event Flow Diagram

### 1. ADD PATIENT FLOW

```
Receptionist Dashboard                     Backend Server
        │                                        │
        │  emit('addPatient', {data})           │
        ├───────────────────────────────────────>│
        │                                   generate token
        │                            add to queue.waiting
        │                            create tracking data
        │                                        │
        │       broadcast('queueUpdated')    │
        │<───────────────────────────────────┤
        │                                        │
Waiting Room Display                       Backend
        │<────── broadcast('queueUpdated')      │
        │                                        │
Patient Tracking Page                      Backend
        │<────── broadcast('trackingUpdated')   │
        │                                        │
Doctor Analytics                           Backend
        │<────── broadcast('analyticsUpdated')  │
```

### 2. CALL NEXT FLOW

```
Receptionist Dashboard                     Backend Server
        │                                        │
        │  emit('callNext', {time})             │
        ├───────────────────────────────────────>│
        │                          move current to completed
        │                          shift next from waiting
        │                          set as current
        │                                        │
        │       broadcast('tokenCalled')         │
        │<───────────────────────────────────────┤
        │       broadcast('queueUpdated')        │
        │<───────────────────────────────────────┤
        │       broadcast('trackingUpdated')     │
        │<───────────────────────────────────────┤
        │                                        │
Waiting Room TV ◄────────────────────────────────┤
        │ • Token number updates                 │
        │ • Play sound/announcement              │
        │ • Display next waiting patients        │
        │                                        │
Patient Tracking (new current patient) ◄───────┤
        │ • Status → 'now-calling'               │
        │ • Pulse animation                      │
        │ • Play notification                    │
```

### 3. PATIENT POSITION UPDATE FLOW

```
When ANY queue change occurs:

Backend                              All Connected Clients
   │                                        │
   │ Recalculate all tracking               │
   │ for each waiting patient:              │
   │   - patientsAhead = index              │
   │   - estimateWaitTime()                 │
   │   - status = 'waiting'                 │
   │                                        │
   │   if patientsAhead === 0:              │
   │      status = 'almost-turn'            │
   │                                        │
   │   if patientsAhead < 0:                │
   │      status = 'now-calling'            │
   │                                        │
   └────► broadcast('trackingUpdated') ────>│
           All patient tracking screens
           update with new values
```

### 4. CONSULTATION TIME UPDATE

```
Receptionist Dashboard                     Backend Server
        │                                        │
        │ emit('consultationTimeChanged')       │
        ├───────────────────────────────────────>│
        │                          update avgTime
        │                          recalculate wait times
        │                                        │
        │ broadcast('consultationTimeUpdated')   │
        │<───────────────────────────────────────┤
        │ broadcast('analyticsUpdated')          │
        │<───────────────────────────────────────┤
        │ broadcast('trackingUpdated')           │
        │<───────────────────────────────────────┤
        │                                        │
All Dashboards ◄────────────────────────────────┤
   Update their wait time calculations
```

## Event Details

### CLIENT → SERVER (Emit)

```javascript
// 1. addPatient
{
  name: string,
  age: number,
  phone: string,
  visitType: 'General Consultation' | 'Follow Up' | 'Cold/Fever' | 'Emergency' | 'Specialist Visit',
  timestamp: Date
}

// 2. callNext
{
  consultationTime: number (in minutes)
}

// 3. consultationTimeChanged
{
  time: number (5, 10, 15, or 20)
}

// 4. patientTracking
{
  token: number,
  clinicId: string
}

// 5. getAnalytics
{}

// 6. updateDoctorStatus
{
  status: 'available' | 'in-consultation'
}
```

### SERVER → CLIENT (Broadcast)

```javascript
// 1. queueUpdated (Broadcast to all)
{
  waiting: [
    {
      id: string,
      token: number,
      name: string,
      age: number,
      phone: string,
      visitType: string,
      addedAt: Date
    },
    ...
  ],
  current: {
    id: string,
    token: number,
    name: string,
    age: number,
    phone: string,
    visitType: string,
    addedAt: Date
  } | null,
  completed: [45, 44, 43, ...] // Token numbers
}

// 2. tokenCalled (Broadcast to all)
{
  token: number
}

// 3. trackingUpdated (Broadcast to all)
{
  [token]: {
    token: number,
    name: string,
    visitType: string,
    status: 'waiting' | 'almost-turn' | 'now-calling',
    patientsAhead: number,
    currentToken: number,
    totalPatients: number,
    waitTime: number (in minutes)
  },
  ...
}

// 4. analyticsUpdated (Broadcast to all)
{
  served: number,
  avgTime: number,
  peakHour: string,
  queueLength: number,
  efficiency: number,
  satisfaction: number,
  queueTrend: [
    { time: string, count: number },
    ...
  ]
}

// 5. consultationTimeUpdated (Broadcast to all)
{
  time: number
}

// 6. doctorStatusUpdated (Broadcast to all)
{
  status: 'available' | 'in-consultation'
}
```

## Latency Optimization

```
Typical Event Flow Timeline:

T+0ms    → User clicks "Call Next" on Receptionist Dashboard
T+10ms   → Socket emits event to server
T+20ms   → Server processes queue update
T+25ms   → Server broadcasts to all clients (~30 connections)
T+35ms   → Waiting Room Display receives update
T+40ms   → Patient Tracking Screen receives update
T+45ms   → Doctor Analytics receives update
T+50ms   → Animation frame renders updates to all UIs

Total Latency: ~50ms (imperceptible to users)
```

## Connection States

```
┌─────────────┐
│ CONNECTING  │  websocket handshake
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONNECTED   │  socket.id assigned, ready for events
└──────┬──────┘
       │ emit/on events active
       │
       ├─────────► RECONNECTING ──────► CONNECTED (auto)
       │           (connection lost)
       │
       ▼
┌─────────────┐
│ DISCONNECTED│  user closed tab or connection failed
└─────────────┘
```

## Message Ordering

Socket.IO guarantees:
1. **Ordered delivery** - Messages arrive in order sent
2. **Reliability** - Failed messages are retried
3. **Acknowledgment** - Sender can confirm receipt

```
Queue consistency maintained by:
- Sequential event processing
- Timestamp validation
- Conflict resolution via server state of truth
```

## Scalability Notes

For production with many clinics:

```
Current Architecture (Single Clinic MVP):
- 1 clinicState object
- All sockets in same namespace
- Broadcast to all = all clients notified

Production Architecture (Multiple Clinics):
- Multiple clinicState objects (one per clinic)
- Socket namespaces per clinic: /clinic/:id
- Broadcasts scoped to clinic namespace
- Horizontal scaling with Redis pub/sub
```

---

**Socket Event Architecture for Queue Cure System**
All events are bidirectional, real-time, and optimized for <100ms latency.
