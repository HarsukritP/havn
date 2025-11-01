# Railway Deployment Guide for Havn

Complete step-by-step guide to deploy Havn backend to Railway.

---

## Part 1: Railway Project Setup (5 minutes)

### 1. Sign Up for Railway

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You'll get $5 free credit (no credit card required initially)

### 2. Create New Project

1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your `havn` repository
4. Railway will detect your backend automatically

### 3. Configure Build Settings

1. Click on your backend service
2. Go to "Settings" tab
3. Set "Root Directory": `backend`
4. Set "Build Command": (leave empty, Docker handles this)
5. Set "Start Command": (leave empty, Docker handles this)

---

## Part 2: PostgreSQL + PostGIS Setup (5 minutes)

### 1. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will provision a PostgreSQL 15 instance

### 2. Enable PostGIS Extension

**Option A: Using Railway Query Tab**

1. Click on your PostgreSQL service
2. Go to "Data" tab
3. Click "Query" button
4. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_Version();
```

**Option B: Using psql (if you have it locally)**

```bash
# Get connection string from Railway
railway variables

# Connect with psql
psql postgresql://postgres:PASSWORD@HOST:PORT/railway

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

---

## Part 3: Environment Variables Setup (5 minutes)

### 1. Automatic Variables

Railway automatically provides these (no action needed):
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `DATABASE_URL`

### 2. Add Custom Variables

In your backend service → "Variables" tab, add:

```bash
# JWT Secret (CRITICAL - Generate a strong secret!)
JWT_SECRET=<paste output from: openssl rand -base64 64>

# JWT Expiry
JWT_EXPIRY_HOURS=168

# Server Configuration
PORT=8080
GIN_MODE=release

# Database SSL (Railway requires SSL)
DB_SSL_MODE=require

# Environment
ENV=production
```

### 3. Generate JWT Secret

On your terminal:
```bash
# Generate a strong secret
openssl rand -base64 64

# Copy the output and paste it as JWT_SECRET in Railway
```

---

## Part 4: Run Database Migrations (5 minutes)

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
cd backend
railway run -- make migrate-up

# Or directly:
railway run -- ./migrate -path ./migrations -database "$DATABASE_URL" up
```

### Option B: Manual via Railway Query Tab

1. Go to PostgreSQL service → "Data" tab → "Query"
2. Copy and paste each migration file in order:
   - `000_enable_postgis.up.sql`
   - `001_create_users.up.sql`
   - `002_create_study_spots.up.sql`
   - `003_create_spot_updates.up.sql`

---

## Part 5: Seed Initial Data (5 minutes)

### 1. Customize Seed Data

Edit `backend/seeds/001_example_university_spots.sql`:

1. Replace coordinates with your university locations
2. Update names and descriptions
3. Adjust amenities for each spot

**How to get coordinates:**
1. Open Google Maps
2. Right-click on your library/study spot
3. Click the coordinates (e.g., "37.8719, -122.2585")
4. Coordinates are automatically copied!

### 2. Run Seed Script

**Option A: Railway CLI**
```bash
cd backend
railway run psql < seeds/001_example_university_spots.sql
```

**Option B: Railway Query Tab**
```sql
-- Copy and paste content from seeds/001_example_university_spots.sql
-- in PostgreSQL → Data → Query tab
```

### 3. Verify Data

```sql
SELECT name, address, ST_AsText(location::geometry) 
FROM study_spots;

-- Should show your spots with coordinates
```

---

## Part 6: Deploy Backend (Automatic!)

### Railway Auto-Deploys on Git Push

```bash
# Make any changes
git add -A
git commit -m "feat: Add Railway configuration"
git push origin main

# Railway automatically detects the push and deploys!
```

### Monitor Deployment

1. Go to Railway dashboard
2. Click on your backend service
3. View "Deployments" tab
4. Click on latest deployment to see build logs

### Check Build Logs

Watch for:
- ✅ "Dockerfile detected"
- ✅ "Building image"
- ✅ "Build successful"
- ✅ "Deployment live"

---

## Part 7: Get Your Backend URL & Test (5 minutes)

### 1. Generate Public URL

1. Go to backend service → "Settings" tab
2. Scroll to "Networking" section
3. Click "Generate Domain"
4. Copy the URL (e.g., `https://havn-production.up.railway.app`)

### 2. Test Health Endpoint

```bash
curl https://YOUR_RAILWAY_URL.up.railway.app/health

# Should return:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-01T..."
}
```

### 3. Test Spots API

```bash
# Get all spots
curl https://YOUR_RAILWAY_URL.up.railway.app/api/spots

# Get nearby spots (replace with your coordinates)
curl "https://YOUR_RAILWAY_URL.up.railway.app/api/spots/nearby?lat=37.8719&lng=-122.2585&radius=1000"
```

---

## Part 8: Update Mobile App (2 minutes)

### 1. Update API URL

Edit `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:8080/api'  // Local development
  : 'https://YOUR_RAILWAY_URL.up.railway.app/api';  // Production Railway URL
```

### 2. Test on Phone

```bash
cd mobile
npm start

# Scan QR code on phone
# Try to register and login!
```

---

## Part 9: Optional - Add Redis (If Needed Later)

### 1. Add Redis Service

1. In Railway project, click "+ New"
2. Select "Database" → "Redis"
3. Railway provisions Redis automatically

### 2. Add Redis Variables

Railway provides:
- `REDIS_URL`
- `REDISHOST`
- `REDISPORT`
- `REDISPASSWORD`

### 3. Update Backend Code

Your Go backend can now use Redis for:
- Session storage
- Rate limiting
- WebSocket pub/sub

---

## Cost Breakdown (Updated 2024)

### Railway Hobby Plan

**Free Tier:**
- $5 free credit per month
- 500 hours execution time (free)
- After free hours: $0.000231/minute

**PostgreSQL:**
- $5/month for 8GB storage
- Includes PostGIS

**Estimated Monthly Cost:**
- Small app (< 500 hrs): **$5/month** (just database)
- Medium app (1000 hrs): **$12/month**
- Heavy app (2000 hrs): **$26/month**

**Pro Tips to Save Money:**
- Use sleep on inactivity (free tier)
- Only run in production, not dev (use local Docker)
- Monitor usage in Railway dashboard

---

## Troubleshooting

### Build Fails

**Error: "Dockerfile not found"**
```bash
# Make sure railway.json is in backend/
# And Dockerfile is in backend/
```

**Error: "Go build failed"**
```bash
# Check backend/Dockerfile
# Ensure go.mod and go.sum are committed
git add backend/go.mod backend/go.sum
git commit -m "Add Go modules"
git push
```

### Database Connection Fails

**Error: "Could not connect to database"**
```sql
-- Verify PostgreSQL is running
-- Check Variables tab for DATABASE_URL
-- Ensure DB_SSL_MODE=require (Railway requires SSL)
```

**Error: "PostGIS functions not found"**
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Migrations Don't Run

**Missing golang-migrate**

Use Railway CLI:
```bash
railway run -- go run migrate/migrate.go up
```

Or manually copy SQL in Query tab.

### API Returns 404

**Check deployment logs:**
1. Backend service → "Deployments"
2. Click latest deployment
3. View "Deploy Logs"
4. Look for errors

**Common issues:**
- Environment variables not set
- Database not seeded
- Migrations not run

---

## Monitoring & Logs

### View Application Logs

1. Backend service → "Deployments"
2. Click active deployment
3. View real-time logs

### View Database Logs

1. PostgreSQL service → "Deployments"  
2. View connection and query logs

### Set Up Alerts

1. Backend service → "Settings"
2. Enable "Crash Detection"
3. Add email for notifications

---

## Production Checklist

Before going live:

- [ ] PostGIS extension enabled
- [ ] All migrations run successfully
- [ ] Database seeded with initial spots
- [ ] JWT_SECRET is strong and secure (64+ chars)
- [ ] Environment variables set correctly
- [ ] SSL enabled (DB_SSL_MODE=require)
- [ ] Health endpoint returns 200
- [ ] API endpoints tested with curl
- [ ] Mobile app connects successfully
- [ ] Domain generated and saved
- [ ] Logs are clean (no errors)
- [ ] Railway billing set up
- [ ] Backups enabled (Railway auto-backups)

---

## Useful Railway Commands

```bash
# Login
railway login

# Link project
railway link

# View variables
railway variables

# Run command in Railway environment
railway run -- <command>

# Open Railway dashboard
railway open

# View logs
railway logs

# Connect to PostgreSQL
railway connect postgres
```

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Enable PostGIS
3. ✅ Run migrations
4. ✅ Seed database
5. ✅ Test API endpoints
6. ✅ Update mobile app URL
7. ✅ Test complete flow on phone
8. 🚀 **You're live!**

---

## Support

**Railway Docs:** https://docs.railway.app
**Railway Discord:** https://discord.gg/railway
**Railway Status:** https://status.railway.app

**Havn Issues:** Open an issue in your GitHub repo

---

**You're ready to deploy! 🚀**

