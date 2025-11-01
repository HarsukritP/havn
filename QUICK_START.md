# 🚀 Havn - Quick Start (15 Minutes to Live!)

Get your app running on your phone and deployed to production in 15 minutes.

---

## ⚡ Step 1: Test Mobile App on Your Phone (5 min)

```bash
cd mobile
npm install
npm start
```

1. **Install Expo Go** on your phone:
   - iOS: App Store → "Expo Go"
   - Android: Google Play → "Expo Go"

2. **Scan QR Code:**
   - iPhone: Open Camera → Scan QR in terminal
   - Android: Open Expo Go → Scan QR in terminal

3. **You should see Havn login screen! 🎉**

**Troubleshooting:**
- Not connecting? Run: `npx expo start --tunnel`
- Make sure phone and computer are on same WiFi

---

## 🚂 Step 2: Deploy Backend to Railway (5 min)

### 1. Sign Up

1. Go to https://railway.app
2. Login with GitHub
3. Get $5 free credit

### 2. Create Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `havn` repository
4. Railway detects your backend automatically!

### 3. Add PostgreSQL

1. Click "+ New" → "Database" → "PostgreSQL"
2. Wait for provisioning (30 seconds)

### 4. Enable PostGIS

1. Click PostgreSQL service → "Data" tab → "Query"
2. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
SELECT PostGIS_Version();
```

### 5. Set Environment Variables

Go to backend service → "Variables" tab:

```bash
# Generate JWT secret first:
# Run in terminal: openssl rand -base64 64
# Then paste output below:

JWT_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE
JWT_EXPIRY_HOURS=168
PORT=8080
GIN_MODE=release
DB_SSL_MODE=require
ENV=production
```

### 6. Get Your URL

1. Backend service → "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy URL (e.g., `https://havn-production.up.railway.app`)

---

## 🗺️ Step 3: Add Your University Locations (5 min)

### Quick Method: Google Maps

1. Open https://maps.google.com
2. Search for your university
3. For each study spot:
   - Right-click on location
   - Click coordinates to copy
   - Add to seed file (see below)

### Edit Seed File

Open `backend/seeds/001_example_university_spots.sql` and update with your spots:

```sql
INSERT INTO study_spots (name, description, address, latitude, longitude, total_capacity, amenities)
VALUES (
    'Your Library Name',
    'Brief description',
    'Address from Google Maps',
    37.8719,   -- Paste latitude here
    -122.2585, -- Paste longitude here  
    150,       -- Estimate capacity
    '{"wifi": true, "outlets": true, "printer": true, "quiet_zone": true, "outdoor": false}'::jsonb
);
```

**Start with just 3-5 spots!** You can add more later.

### Run Migrations & Seed

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link
railway login
railway link

# Run migrations
cd backend
railway run -- make migrate-up

# Seed database
railway run psql < seeds/001_example_university_spots.sql
```

---

## 📱 Step 4: Connect Mobile App to Railway

Edit `mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_COMPUTER_IP:8080/api'  // For local testing
  : 'https://YOUR_RAILWAY_URL.up.railway.app/api';  // Your Railway URL!
```

**Replace `YOUR_RAILWAY_URL` with your actual Railway domain!**

---

## ✅ Step 5: Test Everything!

### 1. Test Backend API

```bash
curl https://YOUR_RAILWAY_URL.up.railway.app/health
# Should return: {"status":"ok"}

curl https://YOUR_RAILWAY_URL.up.railway.app/api/spots
# Should return: Your seeded spots!
```

### 2. Test Mobile App

```bash
cd mobile
npm start
```

1. Scan QR code on phone
2. Try to register a new account
3. Login
4. View map with your spots!

**🎉 Congratulations! You're live!**

---

## 📚 Detailed Guides (If You Need Them)

- **SETUP_GUIDE.md** - Complete walkthrough with all options
- **RAILWAY_SETUP.md** - Detailed Railway deployment
- **FINDING_LOCATIONS.md** - How to find more study spots
- **SECURITY.md** - Security best practices

---

## 🆘 Common Issues

### "No spots showing on map"

```bash
# Check if database has data:
railway run psql
SELECT * FROM study_spots;
```

### "Cannot connect to backend"

- Check Railway URL is correct in `mobile/src/services/api.ts`
- Verify backend is deployed in Railway dashboard
- Check environment variables are set

### "PostGIS functions not found"

```sql
-- Run in Railway PostgreSQL Query tab:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### "Expo won't connect"

```bash
# Use tunnel mode:
npx expo start --tunnel
```

---

## 📊 What You Just Built

✅ **Mobile app** running on your phone  
✅ **Backend API** deployed to Railway  
✅ **PostgreSQL + PostGIS** database with spatial queries  
✅ **Real university locations** with coordinates  
✅ **Complete authentication** system  
✅ **Map view** with study spots  

**Total time:** ~15 minutes  
**Total cost:** ~$10/month (Railway)

---

## 🚀 Next Steps

1. **Add more spots** - Use `FINDING_LOCATIONS.md` guide
2. **Invite beta testers** - Get friends to test
3. **Gather feedback** - See what works
4. **Iterate!** - Add features users want

---

## 💰 Cost Tracking

**Railway:**
- Free: $5 credit/month
- Small app: ~$10/month
- Check usage: Railway Dashboard → Usage tab

**Expo:**
- Development: FREE
- Publishing: FREE

---

## 🎓 MVP Launch Checklist

- [ ] Mobile app works on your phone
- [ ] Backend deployed to Railway
- [ ] PostGIS enabled
- [ ] 3-5 study spots added
- [ ] Can register new account
- [ ] Can login
- [ ] Map shows spots
- [ ] 5 beta testers invited
- [ ] Feedback form ready

**Ready to launch? Let's go! 🚀**

---

## Need Help?

- Check detailed guides in repo root
- Railway Discord: https://discord.gg/railway
- Expo Discord: https://discord.gg/expo

**You got this! 💪**

