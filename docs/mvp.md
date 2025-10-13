# SpotSave MVP - Development Roadmap

## MVP Philosophy

**Core Principle:** Ship the minimum feature set that proves the core value proposition—helping students find study spots faster than wandering campus.

**What Makes a Good MVP:**
- ✅ Solves the primary pain point (finding available spots)
- ✅ Demonstrates the core innovation (crowdsourced real-time data)
- ✅ Creates a feedback loop (gamification incentivizes contributions)
- ✅ Can be built in 4 weeks with 1-2 developers
- ✅ Testable with 50-100 beta users

**What We're NOT Building (Yet):**
- Spot-saving marketplace (social coordination)
- Study matching (proximity-based)
- ML predictions (requires historical data)
- Premium features (monetization)
- Multi-campus support (scale later)

**Success Criteria for MVP Launch:**
1. 500+ registered users within first 2 weeks
2. 100+ daily active users by week 4
3. 1,000+ check-ins per week (proves crowdsourcing works)
4. 80%+ data accuracy (verified via manual spot-checks)
5. <5% crash rate (app stability)

---

## Week-by-Week Development Roadmap

### **Week 1: Backend Foundation**

**Goal:** Production-ready API with auth and core endpoints

**Day 1-2: Project Setup**
- Initialize Go module with Gin framework
- Set up PostgreSQL with PostGIS extension
- Set up Redis for caching and sessions
- Docker Compose for local development
- Project structure:
  ```
  backend/
  ├── cmd/
  │   └── server/
  │       └── main.go
  ├── internal/
  │   ├── handlers/     # HTTP request handlers
  │   ├── services/     # Business logic
  │   ├── models/       # Database models
  │   ├── middleware/   # Auth, logging, CORS
  │   └── database/     # DB connection, migrations
  ├── migrations/       # SQL migration files
  ├── config/           # Configuration management
  └── Dockerfile
  ```
- Environment variables setup (`.env.example`)
- Logging infrastructure (structured JSON logs)

**Day 3-4: Database Schema & Migrations**
- Create all database tables (see schema below)
- Seed initial data (20-30 campus study spots)
- Write migration files (up/down)
- Geospatial indexes for location queries
- Test migrations (up, down, up again)

**Day 5-7: Authentication System**
- POST `/api/auth/register` - Create user account
- POST `/api/auth/login` - JWT token generation
- POST `/api/auth/logout` - Token blacklist (Redis)
- Middleware for JWT validation
- Password hashing (bcrypt)
- Email verification (optional for MVP, send email but don't require click)
- Rate limiting (10 requests/min per IP for auth endpoints)

**Deliverables:**
- Running backend server on `localhost:8080`
- PostgreSQL database with seed data
- Working authentication flow
- Postman collection with example requests
- Health check endpoint (`GET /api/health`)

---

### **Week 2: Frontend Foundation**

**Goal:** React Native app with navigation, API integration, and map view

**Day 1-2: React Native Setup**
- Initialize React Native project (TypeScript template)
- Set up React Navigation (bottom tabs + stack)
- Configure TypeScript strict mode
- Set up ESLint + Prettier
- Folder structure:
  ```
  mobile/
  ├── src/
  │   ├── screens/
  │   │   ├── MapScreen.tsx
  │   │   ├── ListScreen.tsx
  │   │   ├── ProfileScreen.tsx
  │   │   └── auth/
  │   │       ├── LoginScreen.tsx
  │   │       └── RegisterScreen.tsx
  │   ├── components/
  │   │   ├── SpotMarker.tsx
  │   │   ├── SpotCard.tsx
  │   │   └── CheckInModal.tsx
  │   ├── services/
  │   │   ├── api.ts         # Axios instance with interceptors
  │   │   ├── auth.ts        # Auth API calls
  │   │   ├── spots.ts       # Spot API calls
  │   │   └── websocket.ts   # WebSocket client
  │   ├── types/             # TypeScript interfaces
  │   ├── store/             # Zustand stores
  │   ├── utils/             # Helpers, formatters
  │   └── constants/         # Colors, config
  ├── App.tsx
  └── package.json
  ```
- Environment variables (API base URL)

**Day 3-4: API Layer & Authentication UI**
- Axios setup with auth interceptors
- AsyncStorage for JWT persistence
- Login/Register screens (simple forms)
- Auth context/store (Zustand)
- Auto-login on app launch (check stored token)
- Loading states and error handling

**Day 5-7: Map View Implementation**
- Install `react-native-maps`
- MapScreen with user location
- Fetch spots from API (`GET /api/spots`)
- Display spots as map markers
- Color-code markers by availability (green/yellow/red)
- Tap marker to show spot name in callout
- "My Location" button (re-center map)
- Pull-to-refresh to reload spot data

**Deliverables:**
- Functional login/register flow
- Map view displaying seeded study spots
- User location indicator
- Color-coded availability markers
- Build running on iOS simulator and/or Android emulator

---

### **Week 3: User System & Data Quality**

**Goal:** Complete check-in flow, gamification, and data confidence system

**Day 1-2: Backend - Spot Updates & Geofencing**
- POST `/api/spots/:id/update` - Submit availability update
- Geofencing validation (must be within 100m of spot)
- Update confidence scoring algorithm
- Store update history in `spot_updates` table
- Calculate and cache current availability in Redis
- Return updated spot data with confidence score

**Day 3-4: Frontend - Check-In Flow**
- Bottom sheet modal for check-ins
- Number picker for "How many seats available?"
- Noise level selector (Quiet, Moderate, Loud)
- Submit button with loading state
- Geolocation permission request
- Geofence validation (show error if too far away)
- Optimistic UI update (instantly show new availability)
- Success animation (+5 points!)

**Day 5-6: Gamification System**
- User points calculation (5 per check-in, +2 accuracy bonus)
- Streak tracking (consecutive days with check-ins)
- Profile screen showing:
  - Total points
  - Current streak
  - Total check-ins this week
  - Contribution rank (top 10%, top 25%, etc.)
- Update points in real-time after check-in

**Day 7: Spot Detail Screen**
- Full-screen spot detail view (tap on marker or list item)
- Show:
  - Spot name, address
  - Current availability (8/20 seats)
  - Last updated timestamp ("5 min ago")
  - Confidence indicator (high/medium/low)
  - Amenities (WiFi, outlets, printer icons)
  - "Update Availability" button
- Navigate back to map

**Deliverables:**
- Working check-in flow (submit updates from mobile app)
- Points and streaks visible on profile
- Spot detail screen with all key info
- Geofencing preventing remote updates
- Confidence scoring displayed to users

---

### **Week 4: Polish, Testing & Launch Prep**

**Goal:** Production-ready app with smooth UX, performance optimizations, and beta testing

**Day 1-2: UX Improvements**
- Loading skeletons (instead of blank screens)
- Empty states ("No spots nearby - try zooming out")
- Error states (network error, geolocation disabled)
- Offline mode (show cached data with warning banner)
- Toast notifications (success, error feedback)
- Smooth animations (modal slide-up, marker bounce)
- Pull-to-refresh on map and list views

**Day 3: Performance Optimization**
- Marker clustering (50+ markers → clusters when zoomed out)
- Lazy loading spot images
- React Query caching (5-minute stale time for spots)
- Reduce API calls (only fetch when viewport changes significantly)
- Optimize map re-renders (memo components)
- Image compression for spot photos

**Day 4: Backend - WebSocket Real-Time Updates**
- WebSocket endpoint `/ws` with JWT authentication
- Redis pub/sub for horizontal scaling
- Broadcast spot updates to connected clients viewing that area
- Geohash-based rooms (only send updates for visible region)
- Frontend: WebSocket client with auto-reconnect
- Update markers in real-time without refresh

**Day 5: List View Screen**
- Alternative to map (some users prefer lists)
- Show spots sorted by distance (nearest first)
- Filter by availability (only show available spots)
- Sort by distance, capacity, or recency of update
- Pull-to-refresh
- Tap to navigate to Spot Detail

**Day 6: Testing & Bug Fixes**
- Manual QA testing (full user flows)
- Test on physical devices (iOS + Android)
- Fix any crashes, layout issues
- Test edge cases (no internet, location disabled, empty data)
- Load testing (backend handles 100 concurrent WebSocket connections)

**Day 7: Beta Launch Prep**
- Deploy backend to staging (Fly.io or AWS)
- TestFlight build (iOS) and/or APK (Android)
- Onboarding for 10-20 beta testers
- In-app feedback form (simple email mailto link)
- Analytics setup (Mixpanel basic events: signup, login, check-in, spot_view)
- Sentry error tracking enabled

**Deliverables:**
- Production-ready mobile app (iOS + Android builds)
- Backend deployed to staging environment
- WebSocket real-time updates working
- List view alternative to map
- Beta test with 10-20 users
- Feedback collection mechanism

---

## Detailed Database Schema

### Table: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    
    -- Gamification
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_check_in_date DATE,
    reputation_score DECIMAL(5,2) DEFAULT 50.0, -- 0-100 scale
    
    -- Metadata
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT points_positive CHECK (total_points >= 0),
    CONSTRAINT reputation_range CHECK (reputation_score >= 0 AND reputation_score <= 100)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### Table: `study_spots`

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE study_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(300),
    
    -- Geospatial
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS type
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    
    -- Capacity
    total_capacity INTEGER NOT NULL,
    current_available INTEGER, -- cached value, updated frequently
    
    -- Amenities (booleans)
    has_wifi BOOLEAN DEFAULT TRUE,
    has_outlets BOOLEAN DEFAULT TRUE,
    has_printer BOOLEAN DEFAULT FALSE,
    is_quiet_zone BOOLEAN DEFAULT FALSE,
    is_outdoor BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update_at TIMESTAMP, -- last time someone updated availability
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT capacity_positive CHECK (total_capacity > 0),
    CONSTRAINT available_valid CHECK (current_available IS NULL OR (current_available >= 0 AND current_available <= total_capacity))
);

-- Geospatial index (critical for performance)
CREATE INDEX idx_spots_location ON study_spots USING GIST(location);

-- Other indexes
CREATE INDEX idx_spots_active ON study_spots(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_spots_updated ON study_spots(last_update_at DESC);
```

### Table: `spot_updates`

```sql
CREATE TABLE spot_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES study_spots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Update data
    seats_available INTEGER NOT NULL,
    noise_level VARCHAR(20), -- 'quiet', 'moderate', 'loud'
    photo_url VARCHAR(500), -- S3 URL if user uploaded photo
    
    -- Location verification
    user_latitude DECIMAL(10, 7) NOT NULL,
    user_longitude DECIMAL(10, 7) NOT NULL,
    distance_from_spot DECIMAL(10, 2), -- meters, calculated on server
    
    -- Quality metrics
    confidence_score DECIMAL(5, 2), -- 0-100, calculated based on recency and reputation
    is_accurate BOOLEAN, -- determined later by comparing with subsequent updates
    accuracy_verified_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT seats_non_negative CHECK (seats_available >= 0),
    CONSTRAINT valid_noise_level CHECK (noise_level IN ('quiet', 'moderate', 'loud') OR noise_level IS NULL)
);

-- Indexes for common queries
CREATE INDEX idx_updates_spot_id ON spot_updates(spot_id, created_at DESC);
CREATE INDEX idx_updates_user_id ON spot_updates(user_id, created_at DESC);
CREATE INDEX idx_updates_created_at ON spot_updates(created_at DESC);
```

### Table: `spot_reservations` (Phase 2 - Spot-Saving Feature)

```sql
CREATE TABLE spot_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES study_spots(id) ON DELETE CASCADE,
    
    -- Parties involved
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- person who needs a seat
    saver_id UUID REFERENCES users(id) ON DELETE SET NULL, -- person who accepted the request
    
    -- Request details
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- 15 minutes from request
    estimated_arrival_minutes INTEGER NOT NULL, -- "I'll be there in 10 min"
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, expired, fulfilled
    responded_at TIMESTAMP,
    fulfilled_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'fulfilled')),
    CONSTRAINT arrival_time_valid CHECK (estimated_arrival_minutes > 0 AND estimated_arrival_minutes <= 20)
);

-- Indexes
CREATE INDEX idx_reservations_spot_status ON spot_reservations(spot_id, status, created_at DESC);
CREATE INDEX idx_reservations_requester ON spot_reservations(requester_id, created_at DESC);
CREATE INDEX idx_reservations_saver ON spot_reservations(saver_id, created_at DESC);
CREATE INDEX idx_reservations_expires ON spot_reservations(expires_at) WHERE status = 'pending';
```

### Table: `achievements` (Gamification - Optional for MVP)

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    points_required INTEGER,
    badge_tier VARCHAR(20), -- bronze, silver, gold, platinum
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements ON user_achievements(user_id, unlocked_at DESC);
```

---

## Core API Endpoints

### Base URL
- **Development:** `http://localhost:8080/api`
- **Staging:** `https://staging.spotsave.app/api`
- **Production:** `https://api.spotsave.app/api`

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

---

### Authentication Endpoints

#### **POST /api/auth/register**

Create a new user account.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "SecureP@ss123",
  "full_name": "Jane Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 0,
      "current_streak": 0,
      "reputation_score": 50.0,
      "created_at": "2025-10-13T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Account created successfully"
}
```

**Errors:**
- `400` - Validation error (email format, weak password)
- `409` - Email already exists

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecureP@ss123",
    "full_name": "Jane Doe"
  }'
```

---

#### **POST /api/auth/login**

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 125,
      "current_streak": 3,
      "reputation_score": 68.5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Missing email or password

---

#### **POST /api/auth/logout**

Invalidate JWT token (add to Redis blacklist).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Study Spot Endpoints

#### **GET /api/spots**

Retrieve all study spots (or filter by geospatial bounds).

**Query Parameters:**
- `lat` (optional): Latitude for center of search
- `lng` (optional): Longitude for center of search
- `radius` (optional): Radius in meters (default: 5000, max: 10000)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Main Library - 2nd Floor",
        "description": "Quiet study area with individual desks",
        "address": "100 University Ave",
        "latitude": 37.8719,
        "longitude": -122.2585,
        "total_capacity": 50,
        "current_available": 12,
        "availability_status": "available", // available, low, full
        "confidence_score": 85.5,
        "last_update_at": "2025-10-13T10:25:00Z",
        "amenities": {
          "wifi": true,
          "outlets": true,
          "printer": true,
          "quiet_zone": true,
          "outdoor": false
        },
        "distance_meters": 450 // only if lat/lng provided
      },
      // ... more spots
    ],
    "count": 24
  }
}
```

**Example:**
```bash
curl "http://localhost:8080/api/spots?lat=37.8719&lng=-122.2585&radius=1000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### **GET /api/spots/nearby**

Optimized endpoint for "spots near me" (mobile-friendly).

**Query Parameters:**
- `lat` (required): User's latitude
- `lng` (required): User's longitude
- `radius` (optional): Radius in meters (default: 500)
- `limit` (optional): Max results (default: 20)

**Response:** Same format as `GET /api/spots`

---

#### **GET /api/spots/:id**

Get detailed information about a specific spot.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Main Library - 2nd Floor",
      "description": "Quiet study area with individual desks",
      "address": "100 University Ave",
      "latitude": 37.8719,
      "longitude": -122.2585,
      "total_capacity": 50,
      "current_available": 12,
      "availability_status": "available",
      "confidence_score": 85.5,
      "last_update_at": "2025-10-13T10:25:00Z",
      "amenities": {
        "wifi": true,
        "outlets": true,
        "printer": true,
        "quiet_zone": true,
        "outdoor": false
      },
      "recent_updates": [
        {
          "seats_available": 12,
          "noise_level": "quiet",
          "updated_at": "2025-10-13T10:25:00Z",
          "updated_by": "Anonymous" // don't expose user identity
        },
        {
          "seats_available": 15,
          "noise_level": "quiet",
          "updated_at": "2025-10-13T10:05:00Z",
          "updated_by": "Anonymous"
        }
      ]
    }
  }
}
```

**Errors:**
- `404` - Spot not found

---

#### **POST /api/spots/:id/update**

Submit an availability update for a spot.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "seats_available": 12,
  "noise_level": "quiet", // optional: quiet, moderate, loud
  "photo_url": "https://s3.../photo.jpg", // optional
  "user_latitude": 37.8720,
  "user_longitude": -122.2586
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "update": {
      "id": "update-uuid",
      "spot_id": "123e4567-e89b-12d3-a456-426614174000",
      "seats_available": 12,
      "confidence_score": 95.0,
      "created_at": "2025-10-13T10:30:00Z"
    },
    "points_earned": 5,
    "user_total_points": 130,
    "streak_updated": true,
    "current_streak": 4
  },
  "message": "Thanks for helping the community! +5 points"
}
```

**Errors:**
- `400` - Validation error (seats_available > capacity)
- `403` - Too far from location (must be within 100m)
- `429` - Rate limit exceeded (max 1 update per 5 min per spot)

**Business Logic:**
1. Validate user is within 100m of spot (geofencing)
2. Calculate distance from spot
3. Insert update into `spot_updates` table
4. Calculate confidence score (based on recency, user reputation)
5. Update `study_spots.current_available` and `last_update_at`
6. Invalidate Redis cache for this spot
7. Award points to user (5 base + 2 accuracy bonus if applicable)
8. Update user streak if new day
9. Broadcast update via WebSocket to connected clients

---

### User Endpoints

#### **GET /api/users/me**

Get current user's profile and stats.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 130,
      "current_streak": 4,
      "reputation_score": 72.5,
      "email_verified": false,
      "created_at": "2025-10-01T08:00:00Z"
    },
    "stats": {
      "total_check_ins": 26,
      "check_ins_this_week": 8,
      "rank": "Top 15%",
      "achievements_unlocked": 3
    }
  }
}
```

---

#### **GET /api/users/leaderboard**

Get top users by points (weekly or all-time).

**Query Parameters:**
- `period` (optional): `weekly` or `all_time` (default: `weekly`)
- `limit` (optional): Number of users (default: 10, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "user-uuid",
        "full_name": "John S.", // partial name for privacy
        "points": 450,
        "check_ins": 90
      },
      // ... more users
    ],
    "your_rank": 23,
    "period": "weekly"
  }
}
```

---

## WebSocket Implementation

### Connection

**URL:** `ws://localhost:8080/ws` or `wss://api.spotsave.app/ws`

**Authentication:**
- Send JWT token in first message after connection
- Server validates token and associates connection with user
- If invalid, server closes connection with error code

**Connection Flow:**
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};
```

### Message Types

#### Client → Server: Authentication

```json
{
  "type": "auth",
  "token": "JWT_TOKEN"
}
```

**Server Response:**
```json
{
  "type": "auth_success",
  "user_id": "user-uuid"
}
```
or
```json
{
  "type": "auth_error",
  "error": "Invalid token"
}
```

---

#### Client → Server: Subscribe to Region

Subscribe to updates for spots in a specific geographic region.

```json
{
  "type": "subscribe",
  "bounds": {
    "north": 37.8750,
    "south": 37.8690,
    "east": -122.2550,
    "west": -122.2620
  }
}
```

**Server Response:**
```json
{
  "type": "subscribed",
  "region": "geohash_abc123"
}
```

---

#### Server → Client: Spot Update

When someone updates a spot's availability, broadcast to all subscribed clients.

```json
{
  "type": "spot_update",
  "data": {
    "spot_id": "123e4567-e89b-12d3-a456-426614174000",
    "current_available": 12,
    "availability_status": "available",
    "confidence_score": 95.0,
    "last_update_at": "2025-10-13T10:30:00Z"
  }
}
```

---

#### Client → Server: Ping (Heartbeat)

Keep connection alive.

```json
{
  "type": "ping"
}
```

**Server Response:**
```json
{
  "type": "pong"
}
```

---

### Redis Pub/Sub Architecture

**Why:** Horizontal scaling - multiple backend instances can broadcast to all connected clients.

**Implementation:**
1. Client connects to WebSocket on Server A
2. Client subscribes to region `geohash_abc123`
3. Server A subscribes to Redis channel `spot_updates:geohash_abc123`
4. User submits update via REST API, handled by Server B
5. Server B publishes message to Redis: `PUBLISH spot_updates:geohash_abc123 {update_data}`
6. Server A receives message from Redis, broadcasts to all WebSocket clients in that region

**Redis Channels:**
- `spot_updates:geohash_abc123` - Updates for specific region
- `global_events` - System-wide announcements (maintenance, etc.)

---

## React Native Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── MapScreen.tsx              # Main map view
│   │   ├── SpotDetailScreen.tsx       # Full spot details
│   │   ├── ListScreen.tsx             # List view alternative
│   │   ├── ProfileScreen.tsx          # User profile and stats
│   │   └── LeaderboardScreen.tsx      # Top contributors
│   │
│   ├── components/
│   │   ├── SpotMarker.tsx             # Custom map marker
│   │   ├── SpotCard.tsx               # Card for list view
│   │   ├── CheckInModal.tsx           # Bottom sheet for updates
│   │   ├── LoadingSpinner.tsx         # Loading indicator
│   │   ├── EmptyState.tsx             # No data placeholder
│   │   ├── ErrorBoundary.tsx          # Error handling
│   │   └── PointsBadge.tsx            # Points display
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios instance with interceptors
│   │   ├── auth.ts                    # Auth API calls
│   │   ├── spots.ts                   # Spot API calls
│   │   ├── users.ts                   # User API calls
│   │   └── websocket.ts               # WebSocket client singleton
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth state and actions
│   │   ├── useSpots.ts                # Fetch and cache spots (React Query)
│   │   ├── useLocation.ts             # User location tracking
│   │   └── useWebSocket.ts            # WebSocket connection
│   │
│   ├── store/
│   │   ├── authStore.ts               # Zustand: auth state
│   │   ├── uiStore.ts                 # Zustand: UI state (modals, etc.)
│   │   └── spotStore.ts               # Zustand: local spot state (optional)
│   │
│   ├── types/
│   │   ├── api.ts                     # API response types
│   │   ├── spot.ts                    # Spot entity types
│   │   ├── user.ts                    # User entity types
│   │   └── navigation.ts              # Navigation types
│   │
│   ├── utils/
│   │   ├── formatters.ts              # Date, number formatting
│   │   ├── validators.ts              # Input validation
│   │   ├── geolocation.ts             # Distance calculations
│   │   └── constants.ts               # App constants
│   │
│   ├── constants/
│   │   ├── colors.ts                  # Color palette
│   │   ├── config.ts                  # API URLs, keys
│   │   └── styles.ts                  # Shared styles
│   │
│   └── navigation/
│       ├── AppNavigator.tsx           # Root navigator
│       ├── AuthNavigator.tsx          # Auth stack
│       └── MainNavigator.tsx          # Main bottom tabs
│
├── App.tsx                            # App entry point
├── app.json                           # React Native config
├── package.json
├── tsconfig.json
└── .env.example                       # Environment variables
```

### Key Patterns

**1. API Service Layer:**
```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// Request interceptor: Add JWT to headers
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      AsyncStorage.removeItem('jwt_token');
      // Navigate to login
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

**2. React Query for Data Fetching:**
```typescript
// src/hooks/useSpots.ts
import { useQuery } from '@tanstack/react-query';
import { getSpots } from '../services/spots';

export const useSpots = (lat?: number, lng?: number, radius?: number) => {
  return useQuery({
    queryKey: ['spots', lat, lng, radius],
    queryFn: () => getSpots({ lat, lng, radius }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
```

**3. Zustand for Auth State:**
```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (user, token) => {
    await AsyncStorage.setItem('jwt_token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('jwt_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  loadToken: async () => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      // Optionally validate token or fetch user
      set({ token, isAuthenticated: true });
    }
  },
}));
```

---

## Gamification System

### Point Distribution

**Actions that Earn Points:**
- Check-in (update availability): **5 points**
- Accuracy bonus (if update matches consensus): **+2 points**
- Daily streak maintained: **+10 points** (awarded at midnight)
- Spot-save fulfilled (Phase 2): **+15 points**
- Photo upload: **+3 points**

**Point Penalties:**
- Inaccurate update (flagged by multiple users): **-10 points**
- Repeated violations: **-50 points** + temp suspension

### Reputation Score (0-100)

**Formula:**
```
reputation = base(50) + accuracy_bonus + consistency_bonus - penalty
```

- **Accuracy Bonus:** +30 points max (based on % of accurate updates)
- **Consistency Bonus:** +20 points max (based on streak and frequency)
- **Penalty:** -10 to -50 (based on violations)

**Reputation Tiers:**
- 0-30: New User (limited features)
- 31-50: Regular User
- 51-70: Trusted Contributor (can save spots)
- 71-85: Super Helper (priority support)
- 86-100: Campus Legend (exclusive perks)

### Achievements (Badges)

**Early MVP Achievements:**
1. **First Check-In** - Submit your first update (unlock: immediate)
2. **Week Warrior** - 7-day streak (unlock: 7 consecutive days)
3. **Century Club** - 100 total points (unlock: reach 100 points)
4. **Explorer** - Check in at 10 different spots (unlock: 10 unique spots)

**Post-MVP Achievements:**
5. **Night Owl** - Check in between 10pm-6am 5 times
6. **Social Butterfly** - Successfully save spots for 10 friends
7. **Accurate Amy** - 95%+ accuracy rate over 50 updates
8. **Campus Legend** - Reach reputation score 90+

### Leaderboard

**Weekly Leaderboard:**
- Resets every Monday at midnight
- Top 10 users by points earned that week
- Display: Rank, partial name ("John S."), points, check-ins

**All-Time Leaderboard:**
- Top 100 users by total points
- Display: Rank, partial name, total points, reputation score

---

## MVP Launch Checklist

### Must-Haves (Cannot launch without)

- [ ] User registration and login working
- [ ] Map view displaying all seeded spots
- [ ] Color-coded markers (green/yellow/red)
- [ ] Spot detail screen with current availability
- [ ] Check-in flow with geofencing
- [ ] Points awarded for check-ins
- [ ] Profile showing total points and streak
- [ ] API responds in <200ms median
- [ ] App doesn't crash (tested on iOS + Android)
- [ ] Backend deployed to staging/production
- [ ] Database backups configured
- [ ] Error tracking (Sentry) enabled
- [ ] Basic analytics (Mixpanel) tracking events
- [ ] 20+ spots seeded in database
- [ ] Privacy policy and terms of service pages

### Nice-to-Haves (Can ship without, add in v1.1)

- [ ] WebSocket real-time updates
- [ ] List view alternative to map
- [ ] Noise level indicator
- [ ] Photo upload for spots
- [ ] Email verification
- [ ] Password reset flow
- [ ] Push notifications
- [ ] Dark mode
- [ ] Leaderboard screen
- [ ] Achievement badges
- [ ] Favorite spots
- [ ] Report incorrect data

### Testing Checklist

- [ ] Happy path: Register → Login → View Map → Check-In → See Points
- [ ] Edge case: No internet (show cached data)
- [ ] Edge case: Location disabled (prompt user to enable)
- [ ] Edge case: Too far from spot (show geofence error)
- [ ] Edge case: Rapid check-ins (rate limiting works)
- [ ] Security: Invalid JWT rejected
- [ ] Security: SQL injection attempts fail
- [ ] Load test: 100 concurrent WebSocket connections
- [ ] Load test: 1000 API requests/minute

---

## Success Criteria

### Technical Metrics

**Performance:**
- API response time: p50 <100ms, p95 <200ms, p99 <500ms
- Map render time: <1 second for 50 markers
- WebSocket latency: <100ms for updates
- App launch time: <3 seconds cold start
- Crash rate: <1% of sessions

**Reliability:**
- Uptime: 99.5%+ (max 3.6 hours downtime/month)
- Data accuracy: 80%+ (verified via spot-checks)
- WebSocket connection success rate: 95%+

### User Metrics

**Acquisition:**
- Week 1: 100 signups
- Week 2: 250 cumulative signups
- Week 3: 400 cumulative signups
- Week 4: 500+ cumulative signups

**Activation:**
- 70%+ of signups complete at least 1 check-in
- 50%+ of signups check in within first 24 hours

**Engagement:**
- DAU: 100+ by week 4
- Avg check-ins per DAU: 2+
- Session length: 2-5 minutes median

**Retention:**
- D1 retention: 60%+
- D7 retention: 30%+
- D30 retention: 20%+

**Referral:**
- Viral coefficient: 0.3+ (each user invites 0.3 friends on average)

---

## What Can Wait Until v2

**Features explicitly NOT in MVP:**

1. **Spot-Saving Marketplace:** Complex social feature requiring critical mass of users
2. **Study Matching:** Needs privacy considerations and matching algorithm
3. **ML Predictions:** Requires 4-8 weeks of historical data first
4. **Multi-University Support:** Launch at single campus, prove model works
5. **In-App Chat:** Not a messaging app; coordination via spot-saving is sufficient
6. **Analytics Dashboard:** Build internal admin tools after user-facing features
7. **Premium Subscriptions:** Monetization comes after proving free tier works
8. **Admin Panel:** Manual database operations acceptable for first 500 users
9. **Advanced Filtering:** Simple "show available only" filter sufficient for MVP
10. **Campus Partnerships:** Focus on organic user growth before B2B

**Rationale:** Ship the minimum product that proves the core hypothesis—students will use an app to find study spots faster than wandering campus. Everything else can be validated post-launch.

---

## Development Workflow

### Daily Standup (Async)

Each developer posts in Slack/Discord:
1. What I shipped yesterday
2. What I'm working on today
3. Any blockers

### Weekly Review (Friday EOD)

- Demo completed features
- Review metrics (signups, DAU, check-ins, crash rate)
- Prioritize next week's tasks
- Retrospective: What went well, what to improve

### Definition of Done

A feature is "done" when:
- [ ] Code written and tested locally
- [ ] No linter errors
- [ ] TypeScript types defined (no `any`)
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] API endpoint documented (Postman collection updated)
- [ ] Merged to `develop` branch
- [ ] Deployed to staging
- [ ] Manually tested on staging
- [ ] QA approved (if applicable)

### Git Workflow

**Branches:**
- `main` - Production
- `develop` - Staging
- `feature/feature-name` - Feature branches

**Commit Message Format:**
```
type: Short description

Longer description if needed.

- Bullet points for details
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

**Example:**
```
feat: Add check-in modal with geofencing

- Implemented bottom sheet modal for updating availability
- Added geofence validation (must be within 100m)
- Integrated number picker for seats available
- Display success message with points earned
```

---

**Last Updated:** October 13, 2025  
**Version:** 1.0 (Pre-Development)  
**Status:** Documentation Phase

