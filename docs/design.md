# havn - Technical Design & Architecture

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Specification](#api-specification)
5. [Frontend Architecture](#frontend-architecture)
6. [Real-Time Architecture](#real-time-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Deployment & DevOps](#deployment--devops)
9. [Performance & Scalability](#performance--scalability)
10. [Development Workflow](#development-workflow)

---

## Technology Stack

### Backend Stack

#### Primary Language: Go 1.21+
```yaml
Framework: Gin (v1.9+)
  - Lightweight, fast HTTP framework
  - Middleware support (auth, logging, CORS)
  - JSON validation built-in
  
Database Driver: pgx (v5.5+)
  - Pure Go PostgreSQL driver
  - Best performance for Postgres
  - Connection pooling built-in
  
ORM (Optional): GORM (v1.25+) or SQLc
  - GORM for rapid dev (but can be slow)
  - SQLc for production (generates type-safe code from SQL)
  - Recommend: Start with GORM, migrate to SQLc if needed
  
Geospatial: pgx + PostGIS
  - No special library needed
  - Use raw SQL for PostGIS queries
  - Example: ST_DWithin, ST_Distance
  
WebSockets: gorilla/websocket (v1.5+)
  - De facto standard for Go WebSockets
  - Fallback: Use Supabase Realtime primarily
  
Auth: golang-jwt/jwt (v5.0+)
  - Parse and validate Supabase JWTs
  - Custom claims support
  
Push Notifications: HTTP client → Expo Push API
  - No special library, use net/http
  
Logging: zerolog (v1.31+)
  - Fast, structured logging
  - JSON output for log aggregation
  
Testing: testify (v1.8+)
  - Assertions and mocking
```

**Key Dependencies (go.mod)**:
```go
module github.com/yourusername/havn-backend

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/jackc/pgx/v5 v5.5.0
    gorm.io/gorm v1.25.5
    gorm.io/driver/postgres v1.5.4
    github.com/golang-jwt/jwt/v5 v5.0.0
    github.com/gorilla/websocket v1.5.0
    github.com/rs/zerolog v1.31.0
    github.com/joho/godotenv v1.5.1
    github.com/stretchr/testify v1.8.4
)
```

---

### Frontend Stack

#### Framework: React Native 0.73+ with Expo SDK 50+

**Core Expo Modules**:
```json
{
  "expo": "~50.0.0",
  "expo-router": "^3.4.0",
  "expo-location": "^16.5.0",
  "expo-notifications": "^0.27.0",
  "expo-image-picker": "^14.7.0",
  "expo-secure-store": "^12.8.0",
  "expo-constants": "^15.4.0",
  "expo-splash-screen": "^0.26.0"
}
```

**Navigation**: Expo Router (File-based routing)
- Modern, Next.js-style file-based routing
- Better than React Navigation for new projects
- Deep linking built-in

**State Management**: Zustand (v4.4+)
- Simpler than Redux
- No boilerplate
- React hooks-based
- Perfect for MVP

**UI Library**: NativeWind (v4.0+)
- Tailwind CSS for React Native
- Minimalist, utility-first
- Consistent with web development
- Fast styling

**Component Library**: React Native Reusables
- Headless UI components
- Accessible by default
- Fully customizable with NativeWind

**Maps**: react-native-maps (v1.10+)
- Mapbox or Google Maps support
- Marker clustering
- Custom markers
- Geofencing support

**API Client**: Tanstack Query (React Query v5.0+)
- Data fetching, caching, synchronization
- Automatic retries
- Optimistic updates
- Replaces Redux for server state

**Forms**: React Hook Form (v7.49+)
- Performant, flexible forms
- Validation (with Zod)
- TypeScript support

**Supabase Client**: @supabase/supabase-js (v2.39+)
- Realtime subscriptions
- Auth integration
- Storage for images

**Key Dependencies (package.json)**:
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo-router": "^3.4.0",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.17.0",
    "@supabase/supabase-js": "^2.39.0",
    "react-native-maps": "^1.10.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-location": "^16.5.0",
    "expo-notifications": "^0.27.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

---

### Database: Supabase (PostgreSQL 15+ with PostGIS 3.3+)

**Why Supabase?**
- Managed PostgreSQL with PostGIS pre-installed
- Realtime built-in (Postgres Change Data Capture)
- Auth and storage included
- Free tier: 500MB DB, 1GB storage, 50k MAU
- Auto-backups, point-in-time recovery on paid plans

**Extensions Required**:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

### Hosting & Infrastructure

#### Backend Hosting: Railway
- **Pros**: Easy Go deployment, GitHub CI/CD, environment vars, logs
- **Pricing**: $5/month hobby plan → $20/month for production
- **Alternative**: Fly.io (similar pricing, better for global scale)

#### Database: Supabase
- **Pros**: All-in-one (DB, auth, realtime, storage)
- **Pricing**: Free tier sufficient for MVP → $25/month Pro plan
- **Alternative**: Neon (serverless Postgres) if you need PostGIS separately

#### File Storage: Supabase Storage
- **Use Case**: User avatars, spot photos
- **Pricing**: 1GB free, then $0.021/GB/month

#### CDN: Cloudflare (Free)
- **Use Case**: Cache static assets, DDoS protection
- **Setup**: Point Railway domain through Cloudflare

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                     │
│                                                                              │
│   ┌──────────────────┐         ┌──────────────────┐                        │
│   │   iOS App        │         │   Android App    │                        │
│   │ (React Native +  │         │ (React Native +  │                        │
│   │  Expo)           │         │  Expo)           │                        │
│   └────────┬─────────┘         └────────┬─────────┘                        │
│            │                            │                                   │
│            └────────────┬───────────────┘                                   │
│                         │ HTTPS/WSS                                          │
└─────────────────────────┼──────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                    │
│                      (Golang on Railway)                                     │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  Gin HTTP Server (Port 8080)                                         │ │
│   │                                                                      │ │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │ │
│   │  │   CORS     │→ │    Auth    │→ │ Rate Limit │→ │   Logger   │   │ │
│   │  │ Middleware │  │ Middleware │  │ Middleware │  │ Middleware │   │ │
│   │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │ │
│   │                                                                      │ │
│   │  ┌──────────────────────────────────────────────────────────────┐  │ │
│   │  │                    REST API Routes                           │  │ │
│   │  │                                                              │  │ │
│   │  │  POST   /api/v1/auth/login                                  │  │ │
│   │  │  POST   /api/v1/auth/signup                                 │  │ │
│   │  │  GET    /api/v1/spots                                       │  │ │
│   │  │  GET    /api/v1/spots/:id                                   │  │ │
│   │  │  POST   /api/v1/occupancy/checkin                           │  │ │
│   │  │  POST   /api/v1/occupancy/checkout                          │  │ │
│   │  │  GET    /api/v1/users/search                                │  │ │
│   │  │  POST   /api/v1/friends/request                             │  │ │
│   │  │  POST   /api/v1/friends/respond                             │  │ │
│   │  │  GET    /api/v1/friends                                     │  │ │
│   │  │  POST   /api/v1/spot-saves/request                          │  │ │
│   │  │  POST   /api/v1/spot-saves/respond                          │  │ │
│   │  │  GET    /api/v1/spot-saves                                  │  │ │
│   │  └──────────────────────────────────────────────────────────────┘  │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  WebSocket Server (Optional - for custom real-time needs)           │ │
│   │  /ws/occupancy → Real-time occupancy updates                        │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────┬────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER (Golang)                               │
│                                                                              │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                 │
│   │  Spot Service │  │  User Service │  │ Friend Service│                 │
│   │               │  │               │  │               │                 │
│   │ • GetSpots()  │  │ • GetUser()   │  │ • SendReq()   │                 │
│   │ • GetByID()   │  │ • Search()    │  │ • AcceptReq() │                 │
│   │ • NearbySpots│  │ • UpdateProf()│  │ • GetFriends()│                 │
│   └───────────────┘  └───────────────┘  └───────────────┘                 │
│                                                                              │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                 │
│   │Occupancy Svc  │  │ SpotSave Svc  │  │  Notif Service│                 │
│   │               │  │               │  │               │                 │
│   │ • CheckIn()   │  │ • RequestSave │  │ • SendPush()  │                 │
│   │ • CheckOut()  │  │ • Respond()   │  │ • SendEmail() │                 │
│   │ • GetCurrent()│  │ • GetRequests │  └───────────────┘                 │
│   └───────────────┘  └───────────────┘                                     │
│                                                                              │
└─────────────────────────┬────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Supabase)                                   │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  PostgreSQL 15 + PostGIS 3.3                                         │ │
│   │                                                                      │ │
│   │  Tables:                                                             │ │
│   │  • users (auth.users via Supabase Auth)                             │ │
│   │  • profiles (extends users with app-specific data)                  │ │
│   │  • spots (study locations with geometry column)                     │ │
│   │  • occupancy_logs (time-series check-in data)                       │ │
│   │  • friendships (user connections)                                   │ │
│   │  • spot_save_requests (social coordination)                         │ │
│   │  • notifications (push notification queue)                           │ │
│   │                                                                      │ │
│   │  Indexes:                                                            │ │
│   │  • spots: GIST index on location (for geospatial queries)           │ │
│   │  • occupancy_logs: B-tree on (spot_id, timestamp DESC)              │ │
│   │  • friendships: Composite index on (user_id, friend_id)             │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  Supabase Realtime (PostgreSQL CDC)                                  │ │
│   │                                                                      │ │
│   │  Channels:                                                           │ │
│   │  • spots:current_occupancy → Broadcasts when occupancy changes      │ │
│   │  • profiles:status → Broadcasts when friend checks in/out           │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  Supabase Storage                                                    │ │
│   │                                                                      │ │
│   │  Buckets:                                                            │ │
│   │  • avatars/ (user profile pictures)                                 │ │
│   │  • spot-photos/ (crowdsourced spot images)                          │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │  Supabase Auth                                                       │ │
│   │                                                                      │ │
│   │  Providers:                                                          │ │
│   │  • Email/Password                                                    │ │
│   │  • Google OAuth (for @uw.edu accounts)                              │ │
│   │                                                                      │ │
│   │  JWT Tokens: HS256 signed, 1 hour expiry                            │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────┬────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                       │
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                  │
│   │  Mapbox API  │   │ Expo Push    │   │  SendGrid    │                  │
│   │              │   │ Notifications│   │  (Email)     │                  │
│   │ • Map tiles  │   │              │   │              │                  │
│   │ • Geocoding  │   │ • Push tokens│   │ • Transact.  │                  │
│   │ • Directions │   │ • Send push  │   │ • Marketing  │                  │
│   └──────────────┘   └──────────────┘   └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Data Flow: User Checks In

```
┌─────────┐
│  User   │
│ (Alice) │
└────┬────┘
     │ 1. Enters geofence around "Odegaard 4th Floor"
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Mobile App (React Native)                                  │
│                                                             │
│  • Expo Location detects geofence entry                    │
│  • Shows notification: "Check in to Odegaard?"             │
│  • Alice taps "Check In"                                   │
│  • App calls: POST /api/v1/occupancy/checkin              │
│    Body: { spot_id: "uuid", latitude: 47.655, ...}        │
└────┬────────────────────────────────────────────────────────┘
     │ 2. HTTPS request
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Golang Backend (Railway)                                   │
│                                                             │
│  • Auth middleware validates JWT                           │
│  • OccupancyService.CheckIn(user_id, spot_id)             │
│  • Validate: User not already checked in elsewhere         │
│  • Calculate: Distance to spot (must be < 200m)           │
└────┬────────────────────────────────────────────────────────┘
     │ 3. Database writes
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL)                                      │
│                                                             │
│  BEGIN TRANSACTION;                                         │
│                                                             │
│  INSERT INTO occupancy_logs                                 │
│    (id, user_id, spot_id, status, timestamp)               │
│  VALUES                                                     │
│    ('new-uuid', 'alice-id', 'spot-id', 'checked_in', NOW());│
│                                                             │
│  UPDATE spots                                               │
│  SET current_occupancy = current_occupancy + 1             │
│  WHERE id = 'spot-id';                                     │
│                                                             │
│  COMMIT;                                                    │
└────┬────────────────────────────────────────────────────────┘
     │ 4. Trigger: spots table change
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Realtime (Change Data Capture)                    │
│                                                             │
│  • Detects UPDATE on spots table                           │
│  • Broadcasts to all clients subscribed to "spots" channel │
│  • Payload: { id: 'spot-id', current_occupancy: 16 }      │
└────┬────────────────────────────────────────────────────────┘
     │ 5. WebSocket message
     ▼
┌─────────────────────────────────────────────────────────────┐
│  All Mobile Apps (subscribed users)                         │
│                                                             │
│  • Receive real-time update                                │
│  • Update local state (Zustand store)                      │
│  • Re-render map marker (change color if threshold crossed)│
│    - Green → Yellow (occupancy crossed 33%)                │
└─────────────────────────────────────────────────────────────┘
```

**Latency Targets**:
- Step 1 → 5: < 2 seconds (end-to-end)
- Step 2 → 3: < 200ms (API response time)
- Step 4 → 5: < 500ms (Realtime broadcast)

---

### Data Flow: Spot Save Request

```
Alice (at Suzzallo Library) wants to study at Odegaard
Bob (at HUB, 500m from Odegaard) is Alice's friend

┌─────────┐                                        ┌─────────┐
│  Alice  │                                        │   Bob   │
└────┬────┘                                        └────┬────┘
     │ 1. Opens Odegaard spot details                  │
     │ 2. Taps "Request Spot Save"                     │
     │ 3. Selects Bob (shown as nearby)                │
     │ 4. Types: "Can you save a seat? 15 min away"   │
     ▼                                                 │
┌─────────────────────────────────────────┐          │
│  POST /api/v1/spot-saves/request        │          │
│  {                                       │          │
│    spot_id: "odegaard-id",              │          │
│    saver_id: "bob-id",                  │          │
│    message: "Can you save a seat?"      │          │
│  }                                       │          │
└────┬────────────────────────────────────┘          │
     │ 5. Backend processes                           │
     ▼                                                 │
┌──────────────────────────────────────────────────┐ │
│  Golang: SpotSaveService.CreateRequest()         │ │
│                                                   │ │
│  • Validate: Alice and Bob are friends           │ │
│  • Validate: Bob is within 2km of Odegaard       │ │
│  • Insert spot_save_request (status: pending)    │ │
│  • Call NotificationService.SendPush(bob_id)     │ │
└────┬─────────────────────────────────────────────┘ │
     │ 6. Push notification                           │
     ▼                                                 ▼
┌──────────────────────────────────────────────────────────────┐
│  Expo Push Notification Service                              │
│                                                              │
│  POST https://exp.host/--/api/v2/push/send                  │
│  {                                                           │
│    to: "ExponentPushToken[bob-token]",                      │
│    title: "Spot Save Request",                              │
│    body: "Alice asked you to save a spot at Odegaard",     │
│    data: { request_id: "req-uuid", type: "spot_save" }     │
│  }                                                           │
└────┬─────────────────────────────────────────────────────────┘
     │ 7. Push delivered (< 5 seconds)
     ▼
┌─────────────────────────────────────────┐
│  Bob's Phone (Notification arrives)     │
│                                          │
│  [Notification]                          │
│  Spot Save Request                       │
│  Alice asked you to save a spot...      │
│                                          │
│  Bob taps notification → App opens      │
└────┬─────────────────────────────────────┘
     │ 8. Views request details
     │ 9. Taps "Accept"
     ▼
┌─────────────────────────────────────────┐
│  POST /api/v1/spot-saves/respond        │
│  {                                       │
│    request_id: "req-uuid",              │
│    response: "accepted"                 │
│  }                                       │
└────┬────────────────────────────────────┘
     │ 10. Backend updates status
     ▼
┌──────────────────────────────────────────────────┐
│  UPDATE spot_save_requests                       │
│  SET status = 'accepted', responded_at = NOW()  │
│  WHERE id = 'req-uuid';                         │
│                                                  │
│  • Send push notification to Alice              │
│    "Bob accepted! Spot saved at Odegaard"       │
└──────────────────────────────────────────────────┘
     │ 11. Alice receives notification
     ▼
┌─────────────────────────────────────────┐
│  Alice's Phone                           │
│                                          │
│  [Notification]                          │
│  Spot Saved!                             │
│  Bob accepted! Spot saved at Odegaard   │
└──────────────────────────────────────────┘
```

---

## Database Schema

### Complete SQL Schema

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  university_id UUID, -- For multi-campus future
  graduation_year INTEGER,
  major VARCHAR(100),
  bio TEXT,
  
  -- Location sharing preferences
  location_sharing VARCHAR(20) DEFAULT 'friends' CHECK (location_sharing IN ('everyone', 'friends', 'none')),
  
  -- Current status
  current_spot_id UUID, -- NULL if not checked in
  checked_in_at TIMESTAMPTZ,
  
  -- Push notification token
  push_token TEXT,
  
  -- Preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "noise_tolerance": "moderate",
    "outlet_required": false,
    "auto_checkout_hours": 4,
    "notifications_enabled": true
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_current_spot ON profiles(current_spot_id) WHERE current_spot_id IS NOT NULL;
CREATE INDEX idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (for friend search)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- SPOTS TABLE (study locations)
-- ============================================================
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  building_name VARCHAR(200),
  floor_number VARCHAR(10), -- "4th Floor", "Ground", "Basement"
  
  -- Location (PostGIS)
  location GEOMETRY(Point, 4326) NOT NULL, -- WGS84 lat/lon
  address TEXT,
  
  -- Type and capacity
  spot_type VARCHAR(50) NOT NULL CHECK (spot_type IN ('library', 'lounge', 'cafe', 'classroom', 'outdoor', 'other')),
  capacity INTEGER DEFAULT 50, -- Estimated max capacity
  current_occupancy INTEGER DEFAULT 0, -- Real-time count
  
  -- Amenities (JSONB for flexibility)
  amenities JSONB DEFAULT '{
    "outlets": true,
    "wifi": true,
    "whiteboard": false,
    "natural_light": false,
    "food_allowed": true,
    "noise_level": "moderate",
    "accessible": true
  }'::jsonb,
  
  -- Hours (JSONB, keyed by day of week)
  hours JSONB DEFAULT '{
    "monday": ["08:00-22:00"],
    "tuesday": ["08:00-22:00"],
    "wednesday": ["08:00-22:00"],
    "thursday": ["08:00-22:00"],
    "friday": ["08:00-20:00"],
    "saturday": ["10:00-18:00"],
    "sunday": ["10:00-22:00"]
  }'::jsonb,
  
  -- Images
  photo_urls TEXT[], -- Array of URLs to spot photos
  
  -- Verification
  is_verified BOOLEAN DEFAULT false, -- Manually verified by admin
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Ratings (calculated from reviews)
  avg_rating DECIMAL(2, 1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id), -- Crowdsourced spots
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_spots_location ON spots USING GIST(location); -- Geospatial index (critical!)
CREATE INDEX idx_spots_type ON spots(spot_type);
CREATE INDEX idx_spots_occupancy ON spots(current_occupancy);
CREATE INDEX idx_spots_verified ON spots(is_verified);

-- RLS
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read spots
CREATE POLICY "Spots are viewable by everyone"
  ON spots FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update spots (for MVP)
-- (In production, add policy for user-created spots)

-- ============================================================
-- OCCUPANCY_LOGS TABLE (time-series check-in data)
-- ============================================================
CREATE TABLE occupancy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  
  -- Check-in/out
  status VARCHAR(20) NOT NULL CHECK (status IN ('checked_in', 'checked_out', 'auto_checkout')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  
  -- Location accuracy (for debugging)
  location_accuracy DECIMAL(10, 2), -- meters
  
  -- Session duration (calculated on checkout)
  session_duration INTERVAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (critical for performance!)
CREATE INDEX idx_occupancy_spot_time ON occupancy_logs(spot_id, checked_in_at DESC);
CREATE INDEX idx_occupancy_user_time ON occupancy_logs(user_id, checked_in_at DESC);
CREATE INDEX idx_occupancy_status ON occupancy_logs(status, spot_id) WHERE checked_out_at IS NULL;

-- Partial index for active check-ins only
CREATE INDEX idx_occupancy_active ON occupancy_logs(spot_id, user_id) WHERE checked_out_at IS NULL;

-- RLS
ALTER TABLE occupancy_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view own occupancy logs"
  ON occupancy_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own check-ins
CREATE POLICY "Users can check in"
  ON occupancy_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update (checkout) their own logs
CREATE POLICY "Users can check out"
  ON occupancy_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FRIENDSHIPS TABLE (social connections)
-- ============================================================
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT no_self_friend CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

-- Indexes
CREATE INDEX idx_friendships_user ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);
CREATE INDEX idx_friendships_pending ON friendships(friend_id) WHERE status = 'pending';

-- Composite index for checking if two users are friends
CREATE INDEX idx_friendships_pair ON friendships(user_id, friend_id, status);

-- RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view friendships where they're involved
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Policy: Users can create friend requests
CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update friendships where they're the recipient
CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = friend_id);

-- ============================================================
-- SPOT_SAVE_REQUESTS TABLE (social coordination)
-- ============================================================
CREATE TABLE spot_save_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  
  message TEXT, -- Optional message from requester
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes',
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_spot_saves_requester ON spot_save_requests(requester_id, status);
CREATE INDEX idx_spot_saves_saver ON spot_save_requests(saver_id, status);
CREATE INDEX idx_spot_saves_pending ON spot_save_requests(saver_id) WHERE status = 'pending';
CREATE INDEX idx_spot_saves_expires ON spot_save_requests(expires_at) WHERE status = 'pending';

-- RLS
ALTER TABLE spot_save_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view requests they're involved in
CREATE POLICY "Users can view own spot save requests"
  ON spot_save_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = saver_id);

-- Policy: Users can create requests
CREATE POLICY "Users can create spot save requests"
  ON spot_save_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Policy: Savers can respond
CREATE POLICY "Savers can respond to requests"
  ON spot_save_requests FOR UPDATE
  USING (auth.uid() = saver_id);

-- ============================================================
-- NOTIFICATIONS TABLE (push notification queue)
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'spot_save_request', 'spot_save_response', 'friend_nearby')),
  
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional payload for deep linking
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Read status (for in-app notifications)
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_pending ON notifications(status) WHERE status = 'pending';
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-expire spot save requests (run via pg_cron or external job)
CREATE OR REPLACE FUNCTION expire_spot_save_requests()
RETURNS void AS $$
BEGIN
  UPDATE spot_save_requests
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA (Initial UW Spots)
-- ============================================================

-- Sample spots (add 50+ manually for MVP)
INSERT INTO spots (name, building_name, floor_number, location, spot_type, capacity, amenities, hours) VALUES
('Odegaard Library 4th Floor', 'Odegaard Undergraduate Library', '4th Floor', ST_SetSRID(ST_MakePoint(-122.3079, 47.6565), 4326), 'library', 100, '{"outlets": true, "wifi": true, "noise_level": "quiet"}'::jsonb, '{"monday": ["08:00-22:00"]}'::jsonb),
('Suzzallo Reading Room', 'Suzzallo Library', '2nd Floor', ST_SetSRID(ST_MakePoint(-122.3084, 47.6560), 4326), 'library', 150, '{"outlets": true, "wifi": true, "noise_level": "quiet", "natural_light": true}'::jsonb, '{"monday": ["08:00-22:00"]}'::jsonb),
('HUB Commuter Lounge', 'Husky Union Building', '2nd Floor', ST_SetSRID(ST_MakePoint(-122.3054, 47.6555), 4326), 'lounge', 40, '{"outlets": true, "wifi": true, "noise_level": "moderate", "food_allowed": true}'::jsonb, '{"monday": ["06:00-02:00"]}'::jsonb);

-- Add 47 more spots for UW campus...
```

---

## API Specification

### Base URL
```
Production: https://api.havn.app
Development: http://localhost:8080
```

### Authentication
All endpoints (except `/auth/*`) require JWT in header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Spot ID is required",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

---

### Endpoints

#### Auth

##### POST /api/v1/auth/signup
Register new user (handled by Supabase, but proxied through backend for profile creation)
```json
Request:
{
  "email": "alice@uw.edu",
  "password": "SecurePassword123!",
  "username": "alice_uw",
  "full_name": "Alice Johnson",
  "graduation_year": 2026,
  "major": "Computer Science"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "alice@uw.edu",
      "username": "alice_uw"
    },
    "session": {
      "access_token": "jwt...",
      "refresh_token": "jwt...",
      "expires_at": 1705320600
    }
  }
}
```

##### POST /api/v1/auth/login
```json
Request:
{
  "email": "alice@uw.edu",
  "password": "SecurePassword123!"
}

Response: (same as signup)
```

---

#### Spots

##### GET /api/v1/spots
Get spots with filtering
```
Query Params:
- lat (required): User latitude
- lon (required): User longitude
- radius: meters (default: 2000)
- type: library|lounge|cafe|outdoor|classroom|all (default: all)
- available_only: true|false (default: false) - only spots with <67% occupancy

Response:
{
  "success": true,
  "data": {
    "spots": [
      {
        "id": "uuid",
        "name": "Odegaard Library 4th Floor",
        "building_name": "Odegaard Undergraduate Library",
        "floor_number": "4th Floor",
        "location": {
          "latitude": 47.6565,
          "longitude": -122.3079
        },
        "distance_meters": 523.4,
        "spot_type": "library",
        "capacity": 100,
        "current_occupancy": 45,
        "occupancy_percentage": 45,
        "occupancy_status": "moderate", // low|moderate|high
        "amenities": {
          "outlets": true,
          "wifi": true,
          "noise_level": "quiet"
        },
        "hours": { "monday": ["08:00-22:00"] },
        "is_open_now": true,
        "avg_rating": 4.5,
        "photo_urls": ["https://..."]
      }
    ],
    "count": 23
  }
}
```

##### GET /api/v1/spots/:id
Get single spot details (same structure as above + friends_here)

```json
{
  "data": {
    "spot": { ... },
    "friends_here": [
      {
        "user_id": "uuid",
        "username": "bob_uw",
        "full_name": "Bob Smith",
        "avatar_url": "https://...",
        "checked_in_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

#### Occupancy

##### POST /api/v1/occupancy/checkin
```json
Request:
{
  "spot_id": "uuid",
  "latitude": 47.6565,
  "longitude": -122.3079,
  "location_accuracy": 12.5 // meters
}

Response:
{
  "success": true,
  "data": {
    "occupancy_log_id": "uuid",
    "spot": {
      "id": "uuid",
      "name": "Odegaard 4th Floor",
      "current_occupancy": 46 // incremented
    },
    "checked_in_at": "2025-01-15T10:30:00Z",
    "auto_checkout_at": "2025-01-15T14:30:00Z" // 4 hours later
  }
}

Errors:
- 400: User already checked in elsewhere
- 400: Location too far from spot (> 200m)
- 404: Spot not found
```

##### POST /api/v1/occupancy/checkout
```json
Request:
{
  "spot_id": "uuid" // optional, inferred from user's current check-in
}

Response:
{
  "success": true,
  "data": {
    "spot": {
      "id": "uuid",
      "current_occupancy": 45 // decremented
    },
    "checked_out_at": "2025-01-15T11:30:00Z",
    "session_duration": "01:00:00" // 1 hour
  }
}
```

---

#### Friends

##### GET /api/v1/users/search
```
Query: ?q=alice

Response:
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "alice_uw",
        "full_name": "Alice Johnson",
        "avatar_url": "https://...",
        "university": "University of Washington",
        "graduation_year": 2026,
        "is_friend": false,
        "friend_request_status": null // or "pending"|"accepted"
      }
    ]
  }
}
```

##### POST /api/v1/friends/request
```json
Request:
{
  "friend_id": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "friendship_id": "uuid",
    "status": "pending",
    "requested_at": "2025-01-15T10:30:00Z"
  }
}
```

##### POST /api/v1/friends/respond
```json
Request:
{
  "friendship_id": "uuid",
  "response": "accepted" // or "declined"
}

Response:
{
  "success": true,
  "data": {
    "friendship_id": "uuid",
    "status": "accepted",
    "responded_at": "2025-01-15T10:35:00Z"
  }
}
```

##### GET /api/v1/friends
Get all friends (accepted only)
```json
{
  "data": {
    "friends": [
      {
        "id": "uuid",
        "username": "bob_uw",
        "full_name": "Bob Smith",
        "avatar_url": "https://...",
        "current_spot": { // null if not checked in
          "id": "uuid",
          "name": "HUB Commuter Lounge",
          "location": { "latitude": 47.6555, "longitude": -122.3054 }
        },
        "checked_in_at": "2025-01-15T09:00:00Z",
        "distance_from_me": 1234.5 // meters
      }
    ],
    "friend_requests_received": [
      {
        "friendship_id": "uuid",
        "user": { "id": "uuid", "username": "charlie_uw", ... },
        "requested_at": "2025-01-15T10:00:00Z"
      }
    ],
    "friend_requests_sent": [...]
  }
}
```

---

#### Spot Saves

##### POST /api/v1/spot-saves/request
```json
Request:
{
  "spot_id": "uuid",
  "saver_id": "uuid", // friend to save spot
  "message": "Can you save a seat? Arriving in 15 min"
}

Response:
{
  "success": true,
  "data": {
    "request_id": "uuid",
    "status": "pending",
    "expires_at": "2025-01-15T11:00:00Z"
  }
}

Errors:
- 400: Saver not a friend
- 400: Saver too far from spot (> 2km)
```

##### POST /api/v1/spot-saves/respond
```json
Request:
{
  "request_id": "uuid",
  "response": "accepted" // or "declined"
}

Response:
{
  "success": true,
  "data": {
    "request_id": "uuid",
    "status": "accepted",
    "responded_at": "2025-01-15T10:32:00Z"
  }
}
```

##### GET /api/v1/spot-saves
Get all spot save requests (sent and received)
```json
{
  "data": {
    "received": [
      {
        "id": "uuid",
        "requester": { "id": "uuid", "username": "alice_uw", ... },
        "spot": { "id": "uuid", "name": "Odegaard 4th Floor", ... },
        "message": "Can you save a seat?",
        "status": "pending",
        "requested_at": "2025-01-15T10:30:00Z",
        "expires_at": "2025-01-15T11:00:00Z"
      }
    ],
    "sent": [...]
  }
}
```

---

## Frontend Architecture

### Project Structure (Expo Router)

```
havn-mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Auth group (public routes)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/            # Tab navigation group (protected)
│   │   ├── _layout.tsx    # Tab bar layout
│   │   ├── index.tsx      # Map view (home)
│   │   ├── friends.tsx    # Friends list
│   │   └── profile.tsx    # User profile
│   ├── spot/[id].tsx      # Dynamic route: spot details
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point (redirects based on auth)
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── BottomSheet.tsx
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── SpotMarker.tsx
│   │   └── UserMarker.tsx
│   ├── spot/
│   │   ├── SpotCard.tsx
│   │   ├── SpotList.tsx
│   │   └── AmenityIcon.tsx
│   └── friend/
│       ├── FriendCard.tsx
│       └── FriendRequestCard.tsx
├── lib/                    # Core logic
│   ├── supabase.ts        # Supabase client
│   ├── api.ts             # API client (fetch wrapper)
│   └── utils.ts           # Helper functions
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useSpots.ts
│   ├── useFriends.ts
│   ├── useLocation.ts
│   └── useNotifications.ts
├── stores/                 # Zustand stores (global state)
│   ├── authStore.ts
│   ├── spotStore.ts
│   └── friendStore.ts
├── types/                  # TypeScript types
│   ├── spot.ts
│   ├── user.ts
│   └── api.ts
└── constants/              # App constants
    ├── colors.ts
    ├── spacing.ts
    └── config.ts
```

---

### State Management (Zustand Example)

```typescript
// stores/spotStore.ts
import { create } from 'zustand';

interface SpotStore {
  spots: Spot[];
  selectedSpot: Spot | null;
  filters: SpotFilters;
  
  setSpots: (spots: Spot[]) => void;
  selectSpot: (spot: Spot) => void;
  updateFilters: (filters: Partial<SpotFilters>) => void;
  
  // Real-time update
  updateSpotOccupancy: (spotId: string, occupancy: number) => void;
}

export const useSpotStore = create<SpotStore>((set) => ({
  spots: [],
  selectedSpot: null,
  filters: {
    radius: 2000,
    type: 'all',
    availableOnly: false,
  },
  
  setSpots: (spots) => set({ spots }),
  selectSpot: (spot) => set({ selectedSpot: spot }),
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  updateSpotOccupancy: (spotId, occupancy) => set((state) => ({
    spots: state.spots.map(spot =>
      spot.id === spotId ? { ...spot, current_occupancy: occupancy } : spot
    )
  })),
}));
```

---

### API Client (Tanstack Query)

```typescript
// hooks/useSpots.ts
import { useQuery } from '@tanstack/react-query';
import { useLocation } from './useLocation';
import { api } from '@/lib/api';

export function useSpots(filters: SpotFilters) {
  const { location } = useLocation();
  
  return useQuery({
    queryKey: ['spots', location, filters],
    queryFn: async () => {
      if (!location) throw new Error('Location required');
      
      const params = new URLSearchParams({
        lat: location.latitude.toString(),
        lon: location.longitude.toString(),
        radius: filters.radius.toString(),
        type: filters.type,
        available_only: filters.availableOnly.toString(),
      });
      
      const response = await api.get(`/api/v1/spots?${params}`);
      return response.data.spots as Spot[];
    },
    enabled: !!location, // Only run if location available
    staleTime: 30000, // 30 seconds (don't refetch too often)
    refetchInterval: 60000, // Refetch every minute
  });
}
```

---

### Real-Time Subscription (Supabase)

```typescript
// hooks/useRealtimeSpots.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSpotStore } from '@/stores/spotStore';

export function useRealtimeSpots() {
  const updateSpotOccupancy = useSpotStore(state => state.updateSpotOccupancy);
  
  useEffect(() => {
    // Subscribe to spots table changes
    const channel = supabase
      .channel('spots_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'spots',
          filter: 'current_occupancy=neq.null',
        },
        (payload) => {
          console.log('Spot updated:', payload.new);
          updateSpotOccupancy(
            payload.new.id,
            payload.new.current_occupancy
          );
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

---

## Real-Time Architecture

### Strategy: Hybrid Approach

1. **Supabase Realtime** (Primary): For occupancy updates
   - Pros: Built-in, no extra infrastructure
   - Cons: Limited to Postgres CDC

2. **WebSocket Fallback** (Optional): For complex real-time needs
   - Use if Supabase Realtime is insufficient
   - Golang WebSocket server on Railway

---

### Supabase Realtime Setup

1. Enable Realtime on Supabase dashboard
2. Create publication:
```sql
-- Create publication for spots table (current_occupancy only)
ALTER PUBLICATION supabase_realtime ADD TABLE spots;

-- Replication identity (required for CDC)
ALTER TABLE spots REPLICA IDENTITY FULL;
```

3. Subscribe in frontend (see code above)

---

## Authentication & Authorization

### Flow

```
User Opens App
   ↓
Check Async Storage for session
   ↓
If session exists → Validate with Supabase
   ↓
If valid → Set auth state, navigate to home
   ↓
If invalid → Navigate to login
```

### JWT Structure (Supabase)
```json
{
  "aud": "authenticated",
  "exp": 1705320600,
  "sub": "user-uuid",
  "email": "alice@uw.edu",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "username": "alice_uw"
  }
}
```

### Backend Middleware (Golang)
```go
func AuthMiddleware() gin.HandlerFunc {
  return func(c *gin.Context) {
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
      c.JSON(401, gin.H{"error": "Missing authorization header"})
      c.Abort()
      return
    }
    
    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    
    // Validate JWT with Supabase secret
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
      return []byte(os.Getenv("SUPABASE_JWT_SECRET")), nil
    })
    
    if err != nil || !token.Valid {
      c.JSON(401, gin.H{"error": "Invalid token"})
      c.Abort()
      return
    }
    
    claims := token.Claims.(jwt.MapClaims)
    c.Set("user_id", claims["sub"])
    c.Next()
  }
}
```

---

## Deployment & DevOps

### Backend Deployment (Railway)

1. **Connect GitHub repo**
2. **Railway auto-detects Golang**
3. **Set environment variables**:
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ... (for admin operations)
SUPABASE_JWT_SECRET=your-jwt-secret
PORT=8080
ENV=production
```
4. **Deploy command**: `go build -o main .`
5. **Run command**: `./main`

---

### Frontend Deployment (Expo EAS)

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Configure**: `eas build:configure`
3. **Build iOS**: `eas build --platform ios`
4. **Build Android**: `eas build --platform android`
5. **Submit to stores**: `eas submit`

**OTA Updates** (instant push without app store review):
```bash
eas update --branch production --message "Fix occupancy bug"
```

---

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - run: go test ./...
      - run: go build -o main .
      # Railway auto-deploys on push to main
```

---

## Performance & Scalability

### Database Optimization

1. **Indexes** (see schema above):
   - GIST index on `spots.location` (critical!)
   - B-tree indexes on foreign keys
   - Partial indexes for common queries

2. **Query Optimization**:
```sql
-- Efficient proximity query (uses GIST index)
SELECT * FROM spots
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-122.3079, 47.6565), 4326),
  2000 -- 2km radius
)
ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint(-122.3079, 47.6565), 4326))
LIMIT 50;
```

3. **Connection Pooling**:
```go
// Golang: pgx pool
config, _ := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
config.MaxConns = 20
config.MinConns = 5
pool, _ := pgxpool.NewWithConfig(context.Background(), config)
```

---

### Caching Strategy

1. **Client-side** (React Query):
   - Cache spots for 30 seconds
   - Cache friends for 1 minute
   - Invalidate on mutations

2. **Server-side** (Future: Redis):
   - Cache top 100 spots (hot spots)
   - TTL: 60 seconds
   - Invalidate on occupancy change

---

### Rate Limiting

```go
// Golang middleware (token bucket algorithm)
func RateLimitMiddleware(limit int, window time.Duration) gin.HandlerFunc {
  limiter := rate.NewLimiter(rate.Every(window), limit)
  
  return func(c *gin.Context) {
    if !limiter.Allow() {
      c.JSON(429, gin.H{"error": "Rate limit exceeded"})
      c.Abort()
      return
    }
    c.Next()
  }
}

// Usage: 100 requests per minute
router.Use(RateLimitMiddleware(100, time.Minute))
```

---

## Development Workflow

### Tools & MCPs to Install

#### 1. **Supabase MCP** (Available in Cursor!)
You already have access to Supabase MCP via the tools. This MCP can:
- List projects
- Execute SQL queries
- Apply migrations
- Manage database schema
- Generate TypeScript types from database

**Usage in Cursor**:
```
"Create a new Supabase table for notifications"
→ Cursor uses mcp_supabase_apply_migration
```

#### 2. **Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link # Link to your project
railway up   # Deploy
railway logs # View logs
```

#### 3. **Expo CLI**
```bash
npm install -g eas-cli
eas login
eas build:configure
```

#### 4. **PostGIS Tools**
- **QGIS** (Optional): Visualize geospatial data
- **pgAdmin** or **DBeaver**: Database GUI

#### 5. **Testing Tools**
- **Postman** or **Insomnia**: API testing
- **Expo Go** app: Test on physical device
- **iOS Simulator / Android Emulator**

---

### Recommended Workflow with Cursor AI

#### Phase 1: Setup (Week 1)
```
You: "Set up a new Supabase project with PostGIS extension"
Cursor: Uses mcp_supabase_create_project

You: "Create the database schema from design.md"
Cursor: Uses mcp_supabase_apply_migration (generates SQL from design.md)

You: "Initialize Golang project with Gin framework"
Cursor: Generates main.go, go.mod, project structure

You: "Initialize Expo project with Expo Router and NativeWind"
Cursor: Runs npx create-expo-app, sets up dependencies
```

#### Phase 2: Feature Development (Weeks 2-8)
```
You: "Build the spot discovery API endpoint with PostGIS queries"
Cursor: Generates Go code for GET /api/v1/spots with ST_DWithin

You: "Create the map view screen with react-native-maps"
Cursor: Generates app/(tabs)/index.tsx with MapView component

You: "Add real-time occupancy updates using Supabase Realtime"
Cursor: Generates useRealtimeSpots hook with subscription logic
```

#### Phase 3: Testing & Deployment (Weeks 9-10)
```
You: "Deploy backend to Railway"
Cursor: May use Railway CLI (if MCP available) or guide you through manual deploy

You: "Build iOS app with EAS"
Cursor: Generates eas.json config, provides command to run
```

---

## Summary: Tech Stack at a Glance

| Layer | Technology | Why? |
|-------|-----------|------|
| **Mobile App** | React Native + Expo SDK 50 | Cross-platform, fast dev, OTA updates |
| **Navigation** | Expo Router | File-based routing, modern |
| **State Mgmt** | Zustand | Simple, no boilerplate |
| **UI Framework** | NativeWind (Tailwind) | Minimalist, utility-first |
| **Data Fetching** | Tanstack Query | Caching, optimistic updates |
| **Maps** | react-native-maps (Mapbox) | Custom markers, geofencing |
| **Backend** | Golang 1.21 + Gin | Fast, concurrent, type-safe |
| **Database** | Supabase (Postgres 15 + PostGIS 3.3) | Geospatial, realtime, auth, storage all-in-one |
| **Hosting** | Railway (backend), Expo EAS (frontend) | Easy deploy, CI/CD |
| **Real-time** | Supabase Realtime (Postgres CDC) | Built-in, no extra infra |
| **Push Notifs** | Expo Push Notifications | Free, easy integration |
| **Auth** | Supabase Auth (JWT) | Email/password + OAuth |

---

**Next Steps**: Start with `mvp.md` Week 1 tasks. Use Supabase MCP in Cursor to set up the database first!


