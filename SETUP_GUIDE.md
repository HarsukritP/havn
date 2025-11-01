# Havn - Complete Setup Guide

This guide will help you set up:
1. ✅ Expo development environment (test on your phone)
2. ✅ Railway backend deployment (PostgreSQL + PostGIS + Go API)
3. ✅ Database seeding with university location data

---

## Part 1: Expo Mobile App Setup (5 minutes)

### Prerequisites
- Node.js 18+ installed
- iPhone or Android device
- Same WiFi network for computer and phone

### Steps

#### 1. Install Expo CLI & Dependencies

```bash
cd mobile

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli
```

#### 2. Start Expo Development Server

```bash
# Start Expo
npm start

# Or with specific options
npx expo start --tunnel  # Use if on different networks
```

#### 3. Install Expo Go on Your Phone

- **iOS:** Download "Expo Go" from App Store
- **Android:** Download "Expo Go" from Google Play Store

#### 4. Scan QR Code

**iPhone:** Open Camera app → Scan QR code in terminal → Opens in Expo Go

**Android:** Open Expo Go app → Scan QR code in terminal

#### 5. Test the App

You should see the Havn login screen! 🎉

**Troubleshooting:**
- If connection fails, use tunnel mode: `npx expo start --tunnel`
- Make sure phone and computer are on same WiFi
- Check firewall isn't blocking port 19000

---

## Part 2: Railway Backend Deployment (15 minutes)

### Prerequisites
- GitHub account (already set up)
- Railway account (sign up at railway.app)

### Steps

#### 1. Sign Up for Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Link your `havn` repository

#### 2. Create New Project

```bash
# In Railway Dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your "havn" repository
4. Select the "backend" directory as root
```

#### 3. Add PostgreSQL + PostGIS

```bash
# In Railway project:
1. Click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will provision the database automatically
```

#### 4. Enable PostGIS Extension

```bash
# In Railway PostgreSQL settings:
1. Click on your PostgreSQL service
2. Go to "Data" tab
3. Click "Connect" → Copy connection URL
4. Use any PostgreSQL client or Railway's Query tab
5. Run this SQL command:

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# Verify
SELECT PostGIS_Version();
```

#### 5. Configure Backend Environment Variables

In Railway, go to your backend service → Variables tab:

```bash
# Database (Railway provides these automatically)
DATABASE_URL=${PGDATABASE_URL}  # Railway magic variable

# Or manually:
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
DB_NAME=${PGDATABASE}
DB_SSL_MODE=require

# Redis (optional - add Redis service if needed)
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret (Generate strong secret!)
JWT_SECRET=<generate with: openssl rand -base64 64>
JWT_EXPIRY_HOURS=168

# Server
PORT=8080
GIN_MODE=release

# Environment
ENV=production
```

#### 6. Deploy Backend

Railway will automatically deploy when you push to GitHub!

```bash
# Deploy is automatic, but to trigger manually:
git push origin main
```

#### 7. Get Your Backend URL

```bash
# In Railway backend service:
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Copy the URL (e.g., https://havn-backend.up.railway.app)
```

#### 8. Update Mobile App API URL

```typescript
// mobile/src/services/api.ts
const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:8080/api'  // For local testing
  : 'https://YOUR_RAILWAY_DOMAIN.up.railway.app/api';  // Your Railway URL
```

---

## Part 3: Database Setup & PostGIS Configuration (10 minutes)

### 1. Update Migrations for PostGIS

Create a new migration to enable PostGIS:

```bash
cd backend

# Create migration file
touch migrations/000_enable_postgis.up.sql
touch migrations/000_enable_postgis.down.sql
```

Add to `migrations/000_enable_postgis.up.sql`:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_Version();
```

Add to `migrations/000_enable_postgis.down.sql`:

```sql
DROP EXTENSION IF EXISTS postgis_topology;
DROP EXTENSION IF EXISTS postgis;
```

### 2. Update Study Spots Table for Geospatial Queries

Update `migrations/002_create_study_spots.up.sql`:

```sql
CREATE TABLE IF NOT EXISTS study_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    
    -- PostGIS geometry column (Point type with SRID 4326 = WGS84)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    
    -- Traditional lat/lng for convenience
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    total_capacity INTEGER NOT NULL,
    current_available INTEGER,
    availability_status VARCHAR(20) DEFAULT 'unknown',
    confidence_score DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Amenities
    amenities JSONB DEFAULT '{"wifi": false, "outlets": false, "printer": false, "quiet_zone": false, "outdoor": false}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update_at TIMESTAMP WITH TIME ZONE
);

-- Create spatial index for fast geospatial queries
CREATE INDEX idx_study_spots_location ON study_spots USING GIST(location);

-- Create regular indexes
CREATE INDEX idx_study_spots_availability ON study_spots(availability_status);
CREATE INDEX idx_study_spots_updated ON study_spots(updated_at DESC);

-- Create function to keep location and lat/lng in sync
CREATE OR REPLACE FUNCTION sync_location_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If lat/lng changed, update location
    IF NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    
    -- If location changed, update lat/lng
    IF NEW.location IS DISTINCT FROM OLD.location THEN
        NEW.latitude = ST_Y(NEW.location::geometry);
        NEW.longitude = ST_X(NEW.location::geometry);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_study_spots_location
    BEFORE UPDATE ON study_spots
    FOR EACH ROW
    EXECUTE FUNCTION sync_location_fields();
```

### 3. Run Migrations on Railway

```bash
# Option 1: Use Railway CLI
railway login
railway link  # Link to your project
railway run -- make migrate-up

# Option 2: Manually via Railway Query tab
# Copy and paste SQL from migration files
```

---

## Part 4: Getting University Location Data (Seeding Database)

### Option 1: Manual Entry (Quick Start)

Create a seed file: `backend/seeds/initial_spots.sql`

```sql
-- Example: University of California, Berkeley spots
INSERT INTO study_spots (
    name, 
    description, 
    address, 
    latitude, 
    longitude,
    location,
    total_capacity, 
    current_available,
    availability_status,
    amenities
) VALUES
-- Main Library
(
    'Doe Memorial Library',
    'Main campus library with quiet study areas and group rooms',
    '2150 Doe Library, Berkeley, CA 94720',
    37.8727,
    -122.2595,
    ST_SetSRID(ST_MakePoint(-122.2595, 37.8727), 4326)::geography,
    200,
    NULL,
    'unknown',
    '{"wifi": true, "outlets": true, "printer": true, "quiet_zone": true, "outdoor": false}'::jsonb
),

-- Moffitt Library
(
    'Moffitt Library',
    'Underground library with 24-hour study room',
    '350 Moffitt Library, Berkeley, CA 94720',
    37.8726,
    -122.2607,
    ST_SetSRID(ST_MakePoint(-122.2607, 37.8726), 4326)::geography,
    400,
    NULL,
    'unknown',
    '{"wifi": true, "outlets": true, "printer": true, "quiet_zone": false, "outdoor": false}'::jsonb
),

-- Student Union
(
    'MLK Student Union',
    'Central campus hub with cafe and lounge seating',
    '2495 Bancroft Way, Berkeley, CA 94720',
    37.8693,
    -122.2598,
    ST_SetSRID(ST_MakePoint(-122.2598, 37.8693), 4326)::geography,
    150,
    NULL,
    'unknown',
    '{"wifi": true, "outlets": true, "printer": false, "quiet_zone": false, "outdoor": false}'::jsonb
),

-- Add more spots for your university...
;

-- Verify data
SELECT 
    name, 
    address,
    ST_AsText(location::geometry) as location_wkt,
    latitude,
    longitude
FROM study_spots;
```

### Option 2: Use Google Places API (Automated)

Create a data collection script: `backend/scripts/seed_from_google.go`

```go
package main

import (
    "context"
    "fmt"
    "googlemaps.github.io/maps"
    "os"
)

func main() {
    c, err := maps.NewClient(maps.WithAPIKey(os.Getenv("GOOGLE_PLACES_API_KEY")))
    if err != nil {
        panic(err)
    }

    // Search for study spots near university
    req := &maps.NearbySearchRequest{
        Location: &maps.LatLng{
            Lat: 37.8719,  // UC Berkeley
            Lng: -122.2585,
        },
        Radius: 2000,  // 2km radius
        Type:   maps.PlaceTypeLibrary,
    }

    resp, err := c.NearbySearch(context.Background(), req)
    if err != nil {
        panic(err)
    }

    // Print results as SQL INSERT statements
    for _, place := range resp.Results {
        fmt.Printf(`
INSERT INTO study_spots (name, address, latitude, longitude, location, total_capacity, amenities)
VALUES ('%s', '%s', %f, %f, ST_SetSRID(ST_MakePoint(%f, %f), 4326)::geography, 100, 
        '{"wifi": true, "outlets": true, "printer": false, "quiet_zone": false, "outdoor": false}'::jsonb);
        `,
            place.Name,
            place.FormattedAddress,
            place.Geometry.Location.Lat,
            place.Geometry.Location.Lng,
            place.Geometry.Location.Lng,
            place.Geometry.Location.Lat,
        )
    }
}
```

### Option 3: OpenStreetMap Data (Free)

```bash
# Install osmium tool
brew install osmium-tool  # macOS
# or apt-get install osmium-tool  # Linux

# Download your area (e.g., Berkeley)
wget https://download.geofabrik.de/north-america/us/california-latest.osm.pbf

# Extract buildings with "library" or "study" tags
osmium tags-filter california-latest.osm.pbf \
    amenity=library \
    building=university \
    -o campus-buildings.osm.pbf

# Convert to GeoJSON
osmium export campus-buildings.osm.pbf -o campus-buildings.geojson

# Then parse and insert into database
```

### Option 4: Crowdsource (MVP Approach)

**Best for MVP:** Let early users add spots!

1. Create an admin panel or simple form
2. Students submit their favorite spots
3. You review and approve
4. Community-driven from day one

---

## Part 5: Testing the Complete Setup

### 1. Test Backend API

```bash
# Get your Railway backend URL
curl https://your-app.up.railway.app/health

# Should return:
{"status": "ok", "timestamp": "..."}
```

### 2. Test Database Connection

```bash
# Test nearby spots query
curl https://your-app.up.railway.app/api/spots/nearby?lat=37.8719&lng=-122.2585&radius=1000
```

### 3. Test Mobile App

1. Update `mobile/src/services/api.ts` with Railway URL
2. Run `npm start` in mobile directory
3. Scan QR code on phone
4. Try to register/login
5. View map with spots

---

## Quick Start Commands

```bash
# 1. Set up mobile app
cd mobile
npm install
npm start
# Scan QR code on phone

# 2. Deploy to Railway
git add -A
git commit -m "feat: Add Railway configuration"
git push origin main
# Railway auto-deploys!

# 3. Run migrations on Railway
railway link
railway run -- make migrate-up

# 4. Seed database
railway run psql < backend/seeds/initial_spots.sql

# 5. Test!
curl https://your-app.up.railway.app/api/spots
```

---

## Cost Estimates

**Railway (Hobby Plan):**
- PostgreSQL: $5/month
- Backend: $5/month (500 hours free, then $0.000231/min)
- **Total: ~$10-15/month**

**Expo:**
- Development: **FREE**
- Publishing: **FREE**
- EAS Build: $29/month (optional, only for native builds)

**Google Places API** (if using):
- First 30,000 requests/month: **FREE**
- After that: $0.017 per request

---

## Next Steps

1. ✅ Run `npm start` in mobile directory
2. ✅ Test app on your phone
3. ✅ Sign up for Railway
4. ✅ Deploy backend
5. ✅ Seed database with your university spots
6. ✅ Update mobile app with Railway URL
7. ✅ Test complete flow!

---

## Troubleshooting

**Expo won't connect:**
- Use tunnel mode: `npx expo start --tunnel`
- Check both devices on same WiFi
- Disable VPN

**Railway deployment fails:**
- Check build logs in Railway dashboard
- Ensure `Dockerfile` is correct
- Verify environment variables are set

**PostGIS errors:**
- Make sure extension is enabled: `CREATE EXTENSION postgis;`
- Check SRID is 4326 for all geometry
- Use `::geography` for distance queries

**No spots showing on map:**
- Check backend logs for errors
- Verify database has seed data
- Test API endpoint with curl
- Check mobile app has correct API URL

---

Need help? Check:
- Railway Docs: https://docs.railway.app
- Expo Docs: https://docs.expo.dev
- PostGIS Docs: https://postgis.net/docs

**You're all set! 🚀**

