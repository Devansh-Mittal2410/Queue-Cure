# Database Schema & Data Models

## System-Wide Data Structure

```javascript
// In-Memory State (clinic state)
{
  queue: {
    completed: number[],      // Array of completed token numbers
    current: Patient | null,  // Currently being served
    waiting: Patient[]        // Queue of waiting patients
  },
  
  consultationTime: number,   // Average consultation time in minutes
  
  stats: {
    served: number,           // Total patients served today
    avgTime: number,          // Average consultation time
    peakHour: string,         // Hour with most patients
    efficiency: number,       // Percentage (0-100)
    satisfaction: number      // Rating (0-5)
  },
  
  trackingData: {
    [token]: TrackingInfo     // Tracking data by token number
  }
}
```

## Data Models

### Patient

```javascript
{
  id: string,                // UUID - unique identifier
  token: number,             // Queue token (auto-incremented per clinic)
  name: string,              // Patient full name
  age: number,               // Patient age
  phone: string,             // Phone number for contact
  visitType: string,         // 'General Consultation' | 'Follow Up' | 
                             // 'Cold/Fever' | 'Emergency' | 'Specialist Visit'
  addedAt: Date,             // Timestamp when added to queue
  
  // Optional extended data
  email?: string,
  symptoms?: string[],
  doctorPreference?: string,
  priority?: 'normal' | 'high' | 'emergency',
  estimatedDuration?: number // Doctor's estimate in minutes
}
```

### Tracking Info

```javascript
{
  token: number,                    // Patient token number
  name: string,                     // Patient name
  visitType: string,                // Type of visit
  status: 'waiting' | 'almost-turn' | 'now-calling',
  patientsAhead: number,            // Number of patients ahead
  currentToken: number,             // Current patient being served
  totalPatients: number,            // Total in queue
  waitTime: number,                 // Estimated wait in minutes
  
  // Tracking metadata
  trackingStartedAt: Date,
  lastUpdatedAt: Date
}
```

### Queue State

```javascript
{
  completed: [
    { token: 21, completedAt: Date },
    { token: 22, completedAt: Date },
    { token: 23, completedAt: Date },
    ...
  ],
  
  current: {
    // Patient object
    id: 'uuid-xxx',
    token: 24,
    name: 'John Doe',
    age: 35,
    phone: '9876543210',
    visitType: 'General Consultation',
    addedAt: Date,
    startedAt: Date,
    estimatedEndTime: Date
  },
  
  waiting: [
    {
      id: 'uuid-yyy',
      token: 25,
      name: 'Jane Smith',
      age: 28,
      phone: '9876543211',
      visitType: 'Follow Up',
      addedAt: Date,
      estimatedWaitTime: 12 // minutes
    },
    {
      id: 'uuid-zzz',
      token: 26,
      name: 'Bob Wilson',
      age: 45,
      phone: '9876543212',
      visitType: 'Cold/Fever',
      addedAt: Date,
      estimatedWaitTime: 24 // minutes
    }
  ]
}
```

### Analytics

```javascript
{
  served: 45,                    // Patients served today
  avgTime: 12.5,                 // Average time per patient
  peakHour: '11:00 AM',          // Busiest hour
  efficiency: 85,                // Percentage
  satisfaction: 4.5,             // Out of 5 stars
  
  queueTrend: [
    { time: '9:00 AM', count: 5 },
    { time: '10:00 AM', count: 12 },
    { time: '11:00 AM', count: 18 },
    { time: '12:00 PM', count: 14 },
    { time: '1:00 PM', count: 8 }
  ],
  
  visitTypeBreakdown: {
    'General Consultation': 15,
    'Follow Up': 12,
    'Cold/Fever': 10,
    'Emergency': 5,
    'Specialist Visit': 3
  },
  
  ageDistribution: {
    '0-18': 5,
    '18-30': 12,
    '30-50': 18,
    '50-65': 7,
    '65+': 3
  }
}
```

### Doctor Status

```javascript
{
  status: 'available' | 'in-consultation' | 'on-break' | 'offline',
  lastUpdatedAt: Date,
  currentPatientId?: string,
  consultationStartedAt?: Date,
  estimatedEndTime?: Date
}
```

## Data Flow Relationships

```
┌─────────────────────────────────────┐
│  RECEPTIONIST ADDS PATIENT          │
│  (Patient submitted)                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  GENERATE TOKEN                     │
│  token = queue.completed.length +   │
│          (queue.current ? 1 : 0) +  │
│          queue.waiting.length + 1   │
└────────────┬────────────────────────┘
             │
             ├──────────────────┬──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
    ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐
    │  PATIENT OBJECT  │ │ TRACKING INFO  │ │ QUEUE STATE    │
    │  (Stored)        │ │ (Calculated)   │ │ (Updated)      │
    │                  │ │                │ │                │
    │ • id: uuid       │ │ • token        │ │ • Add to       │
    │ • token: 25      │ │ • status:      │ │   waiting      │
    │ • name: John     │ │   'waiting'    │ │ • Recalculate  │
    │ • age: 35        │ │ • patientsAhead│ │   wait times   │
    │ • visitType      │ │ • waitTime     │ │                │
    └──────────────────┘ └────────────────┘ └────────────────┘
             │                  │                  │
             └──────────────────┴──────────────────┘
                        │
                        ▼
         ┌────────────────────────────┐
         │  BROADCAST queueUpdated    │
         │  All connected clients     │
         │  receive update            │
         └────────────┬───────────────┘
                      │
        ┌─────────────┼─────────────────┐
        │             │                 │
        ▼             ▼                 ▼
   Receptionist  Waiting Room    Patient Tracking
   Dashboard     Display (TV)    (Mobile)
```

## Wait Time Calculation Formula

```javascript
waitTime = patientsAhead × avgDurationForVisitType

// Predefined duration ranges by visit type:
const durations = {
  'Cold/Fever': { min: 5, max: 7 },           // avg: 6
  'Follow Up': { min: 4, max: 6 },            // avg: 5
  'General Consultation': { min: 10, max: 15 }, // avg: 12.5
  'Specialist Visit': { min: 15, max: 20 },   // avg: 17.5
  'Emergency': { min: 20, max: 30 }           // avg: 25
}

// Example:
// Patient #3 in queue for "General Consultation"
// waitTime = 3 × 12.5 = 37.5 minutes ≈ 38 minutes
```

## State Transitions

### Queue States

```
WAITING ──[Call Next]──> NOW BEING SERVED ──[Patient Complete]──> COMPLETED
   │                                               │
   │         [Queue Updated]                       │
   └──────────────────────┘                        │
                          [Recalculate all wait times]
                                                   │
                          [Status: Almost Your Turn]
```

### Patient Status States

```
Patient Added
    │
    ▼
'waiting'          (Patient in queue)
    │
    │ [When just one patient ahead]
    ▼
'almost-turn'      (Next in line)
    │
    │ [Call Next clicked]
    ▼
'now-calling'      (Patient called, announcement made)
    │
    │ [Patient leaves]
    ▼
(Removed from tracking)
```

## Schema for Persistence (When Adding Database)

### MySQL Example

```sql
-- Patients Table
CREATE TABLE patients (
  id VARCHAR(36) PRIMARY KEY,
  clinic_id VARCHAR(36) NOT NULL,
  token INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  visit_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in-service', 'completed'
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  consultation_duration INT, -- in minutes
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX (clinic_id, token),
  INDEX (added_at)
);

-- Queue History (for analytics)
CREATE TABLE queue_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  token INT NOT NULL,
  visit_type VARCHAR(50) NOT NULL,
  time_in_queue INT, -- minutes
  estimated_wait INT, -- minutes
  actual_wait INT, -- minutes (NULL until completed)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX (clinic_id, timestamp)
);

-- Clinics Table (for multi-clinic support)
CREATE TABLE clinics (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Status Log
CREATE TABLE doctor_status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(36) NOT NULL,
  doctor_id VARCHAR(36),
  status VARCHAR(20), -- 'available', 'in-consultation'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX (clinic_id, timestamp)
);
```

## Data Persistence Strategy

### MVP (Current)
- All data in-memory
- Lost on server restart
- Fine for demo/hackathon

### Production Phase 1
- Add MySQL/PostgreSQL
- Persist patient records
- Keep analytics history

### Production Phase 2
- Redis caching layer
- Message queue (RabbitMQ)
- Archive old data
- Multi-clinic support

## Performance Considerations

```
Current Limits (In-Memory):
- Supports: ~1000 concurrent queue operations/day
- Peak concurrent connections: 20-30 websocket clients
- Data structure access: O(1) for current, O(n) for queue operations

Optimization Points:
1. Queue access is O(n) - consider using priority queue
2. Tracking recalculation happens for all patients - could cache
3. No persistence - data lost on restart
4. Single clinic - no multi-clinic support
```

## Testing Data Models

```javascript
// Sample complete clinic state for testing
const testClinicState = {
  queue: {
    completed: [1, 2, 3, 4],
    current: {
      id: 'uuid-1',
      token: 5,
      name: 'Rajesh Kumar',
      age: 45,
      phone: '98765432100',
      visitType: 'General Consultation',
      addedAt: new Date('2024-01-15T09:00:00')
    },
    waiting: [
      {
        id: 'uuid-2',
        token: 6,
        name: 'Priya Sharma',
        age: 28,
        phone: '98765432101',
        visitType: 'Follow Up',
        addedAt: new Date('2024-01-15T09:15:00')
      },
      {
        id: 'uuid-3',
        token: 7,
        name: 'Amit Patel',
        age: 35,
        phone: '98765432102',
        visitType: 'Cold/Fever',
        addedAt: new Date('2024-01-15T09:20:00')
      }
    ]
  },
  consultationTime: 12,
  stats: {
    served: 4,
    avgTime: 12,
    peakHour: '11:00 AM',
    efficiency: 85,
    satisfaction: 4.5
  },
  trackingData: {
    6: {
      token: 6,
      name: 'Priya Sharma',
      visitType: 'Follow Up',
      status: 'almost-turn',
      patientsAhead: 0,
      currentToken: 5,
      totalPatients: 2,
      waitTime: 5
    },
    7: {
      token: 7,
      name: 'Amit Patel',
      visitType: 'Cold/Fever',
      status: 'waiting',
      patientsAhead: 1,
      currentToken: 5,
      totalPatients: 2,
      waitTime: 11
    }
  }
};
```

---

**Queue Cure Database Schema & Data Models**
Designed for real-time operations with scalability path to production.
