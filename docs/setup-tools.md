# havn - Required Tools, MCPs & Setup Guide

## Overview

This document lists all tools, MCPs (Model Context Protocols), and CLIs you should install **before starting development** to maximize Cursor AI's capabilities and streamline the development workflow.

---

## Available MCPs in Cursor

Cursor already has several MCPs available that can significantly accelerate development:

### 1. ✅ **Supabase MCP** (Built-in to Cursor)

**What it does**:
- List Supabase organizations and projects
- Execute SQL queries directly from Cursor
- Apply database migrations
- Generate TypeScript types from database schema
- Manage tables, extensions, and Edge Functions
- Get project costs and create branches
- View logs and advisors (security/performance)

**Why you need it**:
This is **critical** for havn development. The entire database setup, schema creation, and PostGIS queries can be managed through Cursor using this MCP.

**Setup**:
Already available! Just ensure you're logged into Supabase through Cursor.

**Usage Examples**:
```
You: "Create the spots table with PostGIS geometry column"
Cursor: Uses mcp_supabase_apply_migration to create table

You: "Show all study spots within 1km of coordinates 47.6565, -122.3079"
Cursor: Uses mcp_supabase_execute_sql with ST_DWithin query

You: "Generate TypeScript types from my database"
Cursor: Uses mcp_supabase_generate_typescript_types

You: "Deploy edge function for auto-expiring spot save requests"
Cursor: Uses mcp_supabase_deploy_edge_function
```

---

### 2. ✅ **Browser MCP** (Built-in to Cursor)

**What it does**:
- Navigate to URLs
- Take screenshots
- Capture accessibility snapshots
- Click, type, and interact with web pages
- Inspect network requests and console logs

**Why you need it**:
- Test your deployed backend API endpoints
- Verify Supabase dashboard changes
- Test the Expo web version of your app
- Debug live sites (UW campus map, competitor apps)

**Usage Examples**:
```
You: "Navigate to my Railway deployment and check if the API is responding"
Cursor: Uses browser_navigate + browser_snapshot

You: "Take a screenshot of the Supabase dashboard showing my tables"
Cursor: Uses browser_take_screenshot
```

---

### 3. ❓ **Templation MCP** (Built-in to Cursor)

**What it does**:
- Search for high-quality GitHub repositories
- Convert repos into personalized templates
- Create project templates with setup instructions

**Why you might need it**:
While we're building from scratch, you could use this to:
- Find inspiration from similar apps (campus navigation, study apps)
- Bootstrap certain components (auth flows, map implementations)
- Study well-structured React Native + Expo projects

**Usage Examples**:
```
You: "Search for React Native map apps with real-time updates"
Cursor: Uses mcp_templation_search_exemplar

You: "Convert this Expo boilerplate into a template for havn"
Cursor: Uses mcp_templation_template_converter
```

**Recommendation**: Optional for havn, but useful for research.

---

## Required CLIs & Tools

### Core Development Tools

#### 1. **Node.js & npm** (Required for Frontend)
```bash
# Install Node.js 18+ (LTS)
# macOS:
brew install node

# Verify:
node --version  # Should be v18+ or v20+
npm --version   # Should be 9+ or 10+
```

---

#### 2. **Go** (Required for Backend)
```bash
# Install Go 1.21+
# macOS:
brew install go

# Verify:
go version  # Should be 1.21 or higher

# Set up Go workspace (if not already)
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

---

#### 3. **Expo CLI & EAS CLI** (Required for Frontend)
```bash
# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (for builds and deployments)
npm install -g eas-cli

# Verify:
expo --version
eas --version

# Login to Expo
expo login
eas login  # Use same credentials
```

**Why**: Build, run, and deploy React Native app

---

#### 4. **Railway CLI** (Required for Backend Deployment)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Verify:
railway --version

# Login
railway login

# Link to project (after creating Railway project)
railway link
```

**Why**: Deploy Golang backend, view logs, manage environment variables

**Alternative**: Use Railway web dashboard (but CLI is faster)

---

#### 5. **Supabase CLI** (Optional but Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Verify:
supabase --version

# Login
supabase login

# Link to project
supabase link --project-ref <your-project-ref>
```

**Why**: 
- Run local Supabase instance for development
- Apply migrations from CLI
- Generate types locally
- Better than always using web dashboard

**Note**: Since you have Supabase MCP in Cursor, this is optional, but useful for local development.

---

### Mobile Development Tools

#### 6. **Xcode** (Required for iOS Development)
```bash
# Install from Mac App Store
# Or via command line:
xcode-select --install
```

**Why**: Build and test iOS app

**Size**: ~15GB (be prepared!)

---

#### 7. **Android Studio** (Required for Android Development)
```bash
# Download from: https://developer.android.com/studio
# Follow installation wizard
# Install Android SDK, Android Emulator
```

**Why**: Build and test Android app

**Size**: ~3-5GB

**Note**: You can skip this initially and use Expo Go app on your Android phone for testing.

---

#### 8. **Expo Go App** (Required for Testing)
```
# Install on your iPhone or Android phone
iOS: App Store → Search "Expo Go"
Android: Google Play Store → Search "Expo Go"
```

**Why**: Test app instantly without building native binaries

**Usage**:
```bash
# Start dev server
npm start

# Scan QR code with Expo Go app → Instant testing!
```

---

### Database & Geospatial Tools

#### 9. **PostgreSQL Client** (Optional but Useful)
```bash
# macOS:
brew install postgresql

# This installs psql CLI
psql --version
```

**Why**: 
- Connect to Supabase database directly
- Run ad-hoc SQL queries
- Debug PostGIS queries

**Usage**:
```bash
# Connect to Supabase
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

**Alternative**: Use Supabase web SQL editor or Cursor's Supabase MCP

---

#### 10. **Database GUI** (Optional, Pick One)

**Option A: DBeaver** (Free, Cross-platform)
```bash
# macOS:
brew install --cask dbeaver-community
```

**Option B: TablePlus** (Paid, macOS only, Beautiful UI)
```bash
# Download from: https://tableplus.com
```

**Option C: pgAdmin** (Free, Official Postgres GUI)
```bash
brew install --cask pgadmin4
```

**Why**: 
- Visualize database schema
- Browse tables (especially geospatial data)
- Run complex queries with autocomplete

**Recommendation**: DBeaver (free, great PostGIS support)

---

#### 11. **QGIS** (Optional, for Geospatial Visualization)
```bash
# macOS:
brew install --cask qgis
```

**Why**: 
- Visualize PostGIS geometries on a map
- Debug location queries
- Create geofences visually

**Recommendation**: Only install if you're having trouble with PostGIS queries. Not needed for MVP.

---

### API Testing & Development Tools

#### 12. **Postman or Insomnia** (Recommended)

**Postman** (More features, heavier):
```bash
# macOS:
brew install --cask postman
```

**Insomnia** (Lighter, cleaner):
```bash
brew install --cask insomnia
```

**Why**: 
- Test API endpoints
- Save request collections
- Environment variables for dev/prod

**Usage**:
```
Create request: POST http://localhost:8080/api/v1/occupancy/checkin
Headers: Authorization: Bearer <JWT>
Body: { "spot_id": "...", "latitude": 47.6565, "longitude": -122.3079 }
```

---

#### 13. **cURL** (Already on macOS)
```bash
# Verify:
curl --version
```

**Why**: Quick API testing from terminal

**Usage**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uw.edu","password":"test123"}'
```

---

### Version Control & Collaboration

#### 14. **Git** (Already on macOS)
```bash
# Verify:
git --version

# Configure (if not already):
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

#### 15. **GitHub CLI** (Optional)
```bash
# macOS:
brew install gh

# Login:
gh auth login
```

**Why**: Create repos, PRs, issues from CLI

**Usage**:
```bash
gh repo create havn-mobile --private
gh pr create --title "Add friend system"
```

---

### Monitoring & Debugging Tools

#### 16. **React Native Debugger** (Optional)
```bash
# macOS:
brew install --cask react-native-debugger
```

**Why**: 
- Inspect React components
- View Redux/Zustand state
- Monitor network requests
- Debug JS code

**Alternative**: Use Expo Dev Tools (built-in)

---

#### 17. **Flipper** (Optional, Advanced)
```bash
# Download from: https://fbflipper.com
```

**Why**: 
- Deep native debugging
- View SQLite databases
- Inspect network traffic
- React DevTools integration

**Recommendation**: Skip for MVP, add later if needed

---

## Recommended VS Code Extensions (If not using Cursor)

If you're using Cursor, many of these are built-in. But for completeness:

- **Go** (golang.go) - Go language support
- **Prettier** (esbenp.prettier-vscode) - Code formatting
- **ESLint** (dbaeumer.vscode-eslint) - JavaScript linting
- **Tailwind CSS IntelliSense** - NativeWind autocomplete
- **React Native Tools** - RN debugging

---

## Environment Variables Setup

Create `.env` files for both backend and frontend:

### Backend (.env)
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ... (admin operations)
SUPABASE_JWT_SECRET=your-secret

# Server
PORT=8080
ENV=development

# External Services
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
```

### Frontend (.env)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend API
EXPO_PUBLIC_API_URL=http://localhost:8080

# Mapbox
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

**Security**: Never commit `.env` files! Add to `.gitignore`

---

## Pre-Development Checklist

Before starting Week 1 of MVP development, ensure you have:

### ✅ Must Have
- [ ] Node.js 18+ installed
- [ ] Go 1.21+ installed
- [ ] Expo CLI installed (`expo --version`)
- [ ] EAS CLI installed (`eas --version`)
- [ ] Railway CLI installed (`railway --version`)
- [ ] Xcode installed (macOS)
- [ ] Android Studio installed (or Expo Go app on phone)
- [ ] Expo Go app on your phone
- [ ] Cursor logged into Supabase (for MCP access)
- [ ] Supabase account created (supabase.com/dashboard)
- [ ] Railway account created (railway.app)
- [ ] Expo account created (expo.dev)
- [ ] Git configured with GitHub
- [ ] Postman or Insomnia installed

### ✅ Nice to Have
- [ ] Supabase CLI installed
- [ ] PostgreSQL client (psql)
- [ ] Database GUI (DBeaver, TablePlus, or pgAdmin)
- [ ] GitHub CLI (gh)

### ✅ Optional (Can add later)
- [ ] QGIS (geospatial visualization)
- [ ] React Native Debugger
- [ ] Flipper

---

## Project Initialization Commands

Once all tools are installed, run these to start:

### 1. Create GitHub Repo
```bash
gh repo create havn-backend --private --clone
cd havn-backend

gh repo create havn-mobile --private --clone
cd havn-mobile
```

### 2. Initialize Backend (Golang)
```bash
cd havn-backend
go mod init github.com/yourusername/havn-backend

# Install dependencies
go get github.com/gin-gonic/gin
go get github.com/jackc/pgx/v5
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/golang-jwt/jwt/v5
go get github.com/rs/zerolog
go get github.com/joho/godotenv

# Create project structure
mkdir -p cmd/api
mkdir -p internal/{handlers,services,models,middleware}
mkdir -p pkg/{database,auth}
touch cmd/api/main.go
touch .env .gitignore README.md
```

### 3. Initialize Frontend (React Native + Expo)
```bash
cd havn-mobile
npx create-expo-app@latest . --template blank-typescript

# Install dependencies
npm install nativewind tailwindcss
npm install zustand
npm install @tanstack/react-query
npm install @supabase/supabase-js
npm install react-native-maps
npm install expo-location expo-notifications
npm install @react-native-async-storage/async-storage
npm install react-hook-form zod
npm install date-fns

# Dev dependencies
npm install -D @types/react @types/react-native

# Initialize EAS
eas init

# Create project structure
mkdir -p app components lib hooks stores types constants
touch .env .gitignore README.md
```

### 4. Initialize Supabase Project
```bash
# Option A: Use Cursor AI with Supabase MCP
# Just ask: "Create a new Supabase project named havn-db with PostGIS"

# Option B: Use Supabase CLI
supabase init
supabase start  # Starts local instance

# Option C: Use Supabase web dashboard
# Go to supabase.com/dashboard → New Project
```

### 5. Initialize Railway Project
```bash
cd havn-backend
railway init
railway link
# Add environment variables via dashboard: railway.app/project/...
```

---

## Verification Tests

Run these to ensure everything works:

### Test 1: Backend Hello World
```go
// cmd/api/main.go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "pong"})
    })
    r.Run(":8080")
}
```

```bash
go run cmd/api/main.go
# Open browser: http://localhost:8080/ping
# Should see: {"message":"pong"}
```

---

### Test 2: Frontend Hello World
```bash
cd havn-mobile
npx expo start

# Scan QR code with Expo Go app
# Should see: Blank white screen with "Open up App.tsx to start working"
```

---

### Test 3: Supabase Connection (Backend)
```go
package main

import (
    "fmt"
    "os"
    "github.com/joho/godotenv"
    "github.com/jackc/pgx/v5"
)

func main() {
    godotenv.Load()
    
    connString := os.Getenv("SUPABASE_DB_URL")
    conn, err := pgx.Connect(context.Background(), connString)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Unable to connect: %v\n", err)
        os.Exit(1)
    }
    defer conn.Close(context.Background())
    
    var version string
    err = conn.QueryRow(context.Background(), "SELECT version()").Scan(&version)
    if err != nil {
        fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
        os.Exit(1)
    }
    
    fmt.Println("PostgreSQL version:", version)
}
```

---

### Test 4: Supabase Connection (Frontend)
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test:
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection test:', data, error);
```

---

## Cursor AI Optimization Tips

To get the most out of Cursor with these tools:

### 1. **Use MCPs Actively**
```
❌ Bad: "Show me how to create a Supabase table"
✅ Good: "Create a Supabase table called 'spots' with these columns: ..." (Cursor will use MCP)

❌ Bad: "How do I deploy to Railway?"
✅ Good: "Deploy my Go app to Railway" (Cursor may guide CLI usage)
```

---

### 2. **Reference Design Docs**
```
✅ "Implement the check-in API endpoint as specified in docs/design.md"
✅ "Create the database schema from docs/design.md using Supabase MCP"
```

---

### 3. **Batch Related Tasks**
```
✅ "Set up the Golang project structure, install dependencies, and create the main.go file with a health check endpoint"
```

---

### 4. **Ask for Explanations**
```
✅ "Explain how the PostGIS ST_DWithin query works in our spots endpoint"
✅ "Why did you choose Zustand over Redux for state management?"
```

---

### 5. **Request Testing**
```
✅ "Write unit tests for the OccupancyService.CheckIn function"
✅ "Test the /api/v1/spots endpoint with Postman" (Cursor can generate request)
```

---

## Troubleshooting Common Issues

### Issue 1: Expo Won't Start
```bash
# Clear cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 2: Go Dependencies Not Found
```bash
# Re-download modules
go mod tidy
go mod download
```

---

### Issue 3: Supabase Connection Failed
```bash
# Verify connection string
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Check Supabase project is active (not paused)
```

---

### Issue 4: Railway Deployment Failed
```bash
# Check logs
railway logs

# Redeploy
railway up --detach
```

---

## Cost Breakdown (Free Tiers)

All services have generous free tiers for MVP:

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|----------------------|
| **Supabase** | 500MB DB, 1GB storage, 50k MAU | $25/month (Pro plan) |
| **Railway** | $5 credit/month (hobby) | $0.01/GB + $0.01/vCPU-min |
| **Expo** | Unlimited builds, OTA updates | $29/month (Production plan) |
| **Mapbox** | 50k free map loads/month | $0.50 per 1k loads |
| **Expo Push** | Unlimited notifications | Free forever |

**Total MVP Cost**: $0-$10/month (well within free tiers for <1000 users)

---

## Next Steps

1. ✅ Install all "Must Have" tools
2. ✅ Create accounts (Supabase, Railway, Expo)
3. ✅ Initialize projects (backend, frontend, database)
4. ✅ Run verification tests
5. ✅ Start Week 1 of `mvp.md`

---

## Quick Reference: Essential Commands

```bash
# Frontend
npx expo start              # Start dev server
npx expo start --clear      # Clear cache
eas build --platform ios    # Build iOS
eas submit                  # Submit to App Store
eas update                  # OTA update

# Backend
go run cmd/api/main.go      # Run locally
go build -o main .          # Build binary
railway up                  # Deploy to Railway
railway logs                # View logs

# Database
supabase db push            # Push migrations
supabase db pull            # Pull schema
supabase gen types typescript # Generate types

# Git
git add .
git commit -m "message"
git push origin main
```

---

**You're all set!** With these tools installed and configured, Cursor AI can help you build havn efficiently. Start with Week 1 of `mvp.md` and let Cursor handle the boilerplate while you focus on product decisions.


