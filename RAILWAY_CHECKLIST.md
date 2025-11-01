# Railway Setup Checklist ✅

Quick reference for deploying to Railway.

---

## 1. PostgreSQL Service - Variables

✅ **No action needed!** Railway auto-provides:
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `DATABASE_URL`

### Enable PostGIS:

PostgreSQL service → Data → Query → Run:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
SELECT PostGIS_Version();
```

---

## 2. Backend Service - Variables

### Step 1: Generate JWT Secret

```bash
openssl rand -base64 64
```

### Step 2: Add These Variables

In Backend Service → Variables tab:

```bash
# CRITICAL - Use the output from above command
JWT_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE

# Database connection (Railway magic variable)
DATABASE_URL=${{ Postgres.DATABASE_URL }}

# Server config
JWT_EXPIRY_HOURS=168
PORT=8080
GIN_MODE=release
DB_SSL_MODE=require
ENV=production
```

**Important:** For `DATABASE_URL`, type exactly:
```
${{ Postgres.DATABASE_URL }}
```
Railway will automatically replace this with your PostgreSQL connection string!

---

## 3. Run Migrations

### Option A: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link
railway login
railway link

# Run migrations
cd backend
railway run -- make migrate-up
```

### Option B: Manual (PostgreSQL Query Tab)

Copy and paste each file in order:
1. `backend/migrations/000_enable_postgis.up.sql`
2. `backend/migrations/001_create_users.up.sql`
3. `backend/migrations/002_create_study_spots.up.sql`
4. `backend/migrations/003_create_spot_updates.up.sql`

---

## 4. Seed Database

Edit `backend/seeds/001_example_university_spots.sql` with your university locations, then:

```bash
railway run psql < backend/seeds/001_example_university_spots.sql
```

Or paste SQL in PostgreSQL → Query tab.

---

## 5. Generate Backend Domain

Backend Service → Settings → Networking → "Generate Domain"

Copy the URL (e.g., `https://havn-production.up.railway.app`)

---

## 6. Update Mobile App

Edit `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:8080/api'
  : 'https://YOUR_RAILWAY_URL.up.railway.app/api';  // <- Paste your Railway URL here!
```

---

## 7. Test Everything

### Test Backend:
```bash
curl https://YOUR_RAILWAY_URL.up.railway.app/health
curl https://YOUR_RAILWAY_URL.up.railway.app/api/spots
```

### Test Mobile:
```bash
cd mobile
npm start
# Scan QR code on phone
```

---

## Common Mistakes ⚠️

❌ **Don't type the actual database URL** - Use the variable: `${{ Postgres.DATABASE_URL }}`

❌ **Don't forget PostGIS** - Must enable extension before running migrations

❌ **Don't skip JWT_SECRET** - Generate a strong random secret!

❌ **Don't forget to set DB_SSL_MODE=require** - Railway requires SSL

---

## Verification Checklist

- [ ] PostgreSQL service is running
- [ ] PostGIS extension enabled (`SELECT PostGIS_Version();`)
- [ ] Backend service has all environment variables
- [ ] `DATABASE_URL=${{ Postgres.DATABASE_URL }}` is set
- [ ] JWT_SECRET is set (64+ characters)
- [ ] All migrations run successfully
- [ ] Database seeded with at least 3 spots
- [ ] Backend domain generated
- [ ] Mobile app updated with Railway URL
- [ ] Health endpoint returns 200: `/health`
- [ ] Spots endpoint returns data: `/api/spots`

---

## Need Help?

- Full guide: `RAILWAY_SETUP.md`
- Quick start: `QUICK_START.md`
- Railway Discord: https://discord.gg/railway

---

**Once all checked, you're live! 🚀**

