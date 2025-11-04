# havn - Campus Study Spot Finder

> **A dynamic, real-time study space discovery and social coordination platform for university students**

## 🎯 Vision

havn solves the perennial problem of finding available study spaces on campus. Unlike static room-booking systems, havn creates a dynamic, real-time ecosystem where any suitable study location can be discovered, tracked, and coordinated with friends.

**Initial Target**: University of Washington (Seattle)  
**Tech Stack**: Go + React Native (Expo) + Supabase (PostgreSQL + PostGIS)

---

## 📚 Documentation

All comprehensive planning and technical documentation is in the `/docs` folder:

### **Core Documentation**

1. **[Project Scope](docs/projectscope.md)** - Complete vision, market analysis, features, monetization
   - Executive summary
   - Market opportunity & competition
   - User personas
   - Complete feature set (MVP → Year 5)
   - Technical architecture overview
   - Go-to-market strategy
   - Success metrics & KPIs

2. **[MVP Roadmap](docs/mvp.md)** - 10-12 week development plan
   - MVP feature set (what to build, what to skip)
   - Week-by-week timeline optimized for Cursor AI
   - Development priorities
   - Success checklist
   - Post-MVP roadmap

3. **[Technical Design](docs/design.md)** - Complete technical architecture
   - Full tech stack with specific versions
   - Database schema (PostgreSQL + PostGIS)
   - API specification (all endpoints)
   - Frontend architecture (React Native + Expo)
   - Real-time architecture (Supabase Realtime)
   - Data flow diagrams (ASCII)
   - Performance & scalability strategies

4. **[Setup & Tools](docs/setup-tools.md)** - Required tools, MCPs, CLIs
   - Available MCPs in Cursor (Supabase, Browser, Templation)
   - Required CLIs (Expo, Railway, Supabase)
   - Environment setup guide
   - Pre-development checklist
   - Verification tests
   - Troubleshooting guide

---

## 🚀 Quick Start

### Prerequisites

Ensure you have installed all tools from [setup-tools.md](docs/setup-tools.md):

**Required**:
- Node.js 18+
- Go 1.21+
- Expo CLI & EAS CLI
- Railway CLI
- Xcode (macOS) or Android Studio
- Expo Go app on phone

**Accounts**:
- Supabase account (database & auth)
- Railway account (backend hosting)
- Expo account (mobile builds)
- GitHub account (version control)

### Development Workflow

1. **Read the Docs First**
   ```bash
   # Start here:
   docs/mvp.md          # What to build first
   docs/design.md       # How to build it
   docs/setup-tools.md  # Tools you need
   ```

2. **Initialize Projects** (Week 1)
   ```bash
   # Backend (Golang)
   gh repo create havn-backend --private --clone
   cd havn-backend
   go mod init github.com/yourusername/havn-backend
   # See docs/setup-tools.md for full setup
   
   # Frontend (React Native + Expo)
   gh repo create havn-mobile --private --clone
   cd havn-mobile
   npx create-expo-app@latest . --template blank-typescript
   # See docs/setup-tools.md for dependencies
   ```

3. **Set Up Supabase** (Week 1)
   ```bash
   # Option A: Use Cursor AI with Supabase MCP
   # Ask: "Create a new Supabase project with PostGIS for havn"
   
   # Option B: Use Supabase dashboard
   # Go to supabase.com/dashboard → New Project
   # Enable PostGIS extension
   ```

4. **Create Database Schema** (Week 2)
   ```bash
   # Use Cursor with Supabase MCP:
   # "Create the database schema from docs/design.md"
   
   # Or use Supabase SQL editor to paste schema
   # See docs/design.md for complete SQL
   ```

5. **Start Development** (Week 3+)
   ```bash
   # Follow week-by-week plan in docs/mvp.md
   # Use Cursor AI for rapid development
   # Reference docs/design.md for implementation details
   ```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│  Mobile App (React Native + Expo)                  │
│  - Map view with study spots                       │
│  - Real-time occupancy updates                     │
│  - Friend system & spot-saving                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────▼────────────────────────────────┐
│  Backend API (Golang on Railway)                   │
│  - REST endpoints                                   │
│  - WebSocket for real-time (optional)              │
│  - Business logic & validation                      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│  Supabase (All-in-One Backend)                     │
│  - PostgreSQL 15 + PostGIS 3.3                     │
│  - Realtime (Postgres CDC)                         │
│  - Auth (JWT)                                       │
│  - Storage (photos)                                 │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Core Features (MVP)

### For Students
✅ **Dynamic Spot Discovery**: Find study spots on an interactive map with real-time availability  
✅ **Occupancy Tracking**: See how crowded spots are before you go (🟢 🟡 🔴)  
✅ **Friend Coordination**: See where friends are studying, request spot saves  
✅ **Smart Filters**: Filter by distance, noise level, amenities, availability  
✅ **Push Notifications**: Get alerted when friends save spots or send requests  

### Technical Highlights
✅ **PostGIS Geospatial Queries**: Efficient proximity search (`ST_DWithin`, `ST_Distance`)  
✅ **Real-time Updates**: Supabase Realtime for occupancy changes (< 1 second latency)  
✅ **Cross-Platform**: Single React Native codebase for iOS + Android  
✅ **Location Services**: Geofencing for automatic check-ins  
✅ **Scalable Architecture**: Handles 10k+ MAU on free/low-cost tiers  

---

## 📊 Success Metrics (Target)

**MVP Launch (Month 3)**:
- 500 registered users (5% of UW)
- 200 DAU (40% retention)
- 50 verified study spots
- < 2% crash rate

**Product-Market Fit (Month 6)**:
- 3,000 MAU
- 1,000 DAU
- 150+ spots
- NPS score > 40

**Growth (Month 12)**:
- 10,000 MAU (full UW saturation)
- 300+ spots
- 500+ active friend connections

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Mobile** | React Native + Expo SDK 50 | Cross-platform, fast iteration, OTA updates |
| **Backend** | Golang 1.21 + Gin | Performance, concurrency, type safety |
| **Database** | Supabase (PostgreSQL 15 + PostGIS 3.3) | Geospatial queries, realtime, auth, storage |
| **Hosting** | Railway (backend), Expo EAS (mobile) | Easy deployment, CI/CD |
| **Maps** | Mapbox via react-native-maps | Custom markers, geofencing |
| **State** | Zustand | Simple, no boilerplate |
| **UI** | NativeWind (Tailwind for RN) | Minimalist, utility-first |

---

## 🎨 Design Philosophy

**Minimalist & Modern**:
- Clean, white space
- 2-3 colors max (inspired by Apple, Stripe)
- Utility-first styling (NativeWind)
- Focus on content, not chrome

**Mobile-First**:
- Touch-optimized (44px min targets)
- Gesture-driven navigation
- Fast load times (< 2 seconds)
- Offline-capable (cached data)

**Accessibility**:
- VoiceOver/TalkBack support
- WCAG AA color contrast
- Screen reader-friendly labels

---

## 📅 Development Timeline

**10-12 weeks to MVP launch**, optimized for Cursor AI-assisted development:

| Weeks | Phase | Focus |
|-------|-------|-------|
| 1-2 | Foundation | Setup, database schema, project structure |
| 3-4 | Discovery | Map integration, spot listing, filters |
| 5-6 | Occupancy | Check-in/out, real-time updates |
| 7-8 | Social | Friends, spot-saving requests |
| 9-10 | Polish | UI/UX, testing, bug fixes |
| 11-12 | Launch | App Store submission, marketing, iteration |

See [mvp.md](docs/mvp.md) for detailed week-by-week breakdown.

---

## 🤖 Cursor AI Optimization

This project is designed to maximize Cursor AI's capabilities:

### Leveraging MCPs
- **Supabase MCP**: Create tables, run queries, apply migrations, generate types
- **Browser MCP**: Test APIs, verify deployments, capture screenshots
- **Templation MCP**: Research similar apps, bootstrap components

### Effective Prompts
```
✅ "Create the spots table with PostGIS geometry column as specified in docs/design.md"
✅ "Implement the check-in API endpoint with geofence validation"
✅ "Build the map view screen with real-time occupancy markers"
✅ "Deploy the Golang backend to Railway"
```

### What Cursor Handles
- Boilerplate code (database schemas, API endpoints, UI components)
- Integration code (connecting services)
- Bug fixes (async issues, API errors)
- Refactoring (code cleanup, adding types)

### What You Handle
- UX decisions (user flow, interactions)
- Design (work with designer, Cursor implements)
- Architecture decisions (caching, scaling)
- Business logic edge cases
- Testing strategy

---

## 🔒 Security & Privacy

**Location Privacy**:
- Only tracked when app is active and on campus
- Aggregated for occupancy (individual locations not shown)
- 30-day auto-deletion
- Opt-out available

**Data Protection**:
- HTTPS only (TLS 1.3)
- JWT-based auth (Supabase)
- Row-level security (RLS) policies
- GDPR & FERPA compliant

**User Control**:
- 3 privacy modes: Everyone, Friends Only, No One
- Ghost mode for using app without sharing location
- Account deletion removes all personal data

---

## 💰 Monetization (Future)

**Phase 1 (Year 1)**: Free for all (focus on growth)  
**Phase 2 (Year 2)**: Freemium model
- Free tier: Core features (80%)
- Premium tier: $4.99/month (predictions, analytics, ad-free)
- Target: 5-10% conversion

**Phase 3 (Year 2-3)**: B2B partnerships
- University partnerships ($10-50k/year per campus)
- Cafe/venue partnerships ($100-500/month)

---

## 🌍 Expansion Plan

**Phase 1**: University of Washington (Seattle) only  
**Phase 2**: Expand to 4-5 large universities (UCLA, UC Berkeley, UMich)  
**Phase 3**: National rollout (25+ universities)  
**Phase 4**: Off-campus spots (cafes, co-working spaces)

---

## 📈 Competitive Advantage

| Solution | Limitation | havn's Edge |
|----------|-----------|-------------|
| Google Maps | No real-time occupancy | ✅ Crowd-sourced live data |
| LibCal/Room Booking | Static, formal spaces only | ✅ Dynamic, informal spots |
| Facebook Groups | Manual coordination | ✅ Automated spot-saving |
| Discord | No location integration | ✅ Location-first social |

**White Space**: No existing solution combines real-time occupancy + social coordination + dynamic spot discovery

---

## 🙏 Contributing

This is currently a solo project (Harry Pall + Cursor AI). If you're interested in contributing or have feedback:

- **Email**: [your email]
- **Twitter**: [@yourusername]
- **GitHub**: Issues welcome!

---

## 📄 License

Proprietary (for now). Open-sourcing certain components (e.g., PostGIS utilities) post-launch.

---

## 🎯 Next Steps

1. **Read**: `docs/mvp.md` (what to build)
2. **Setup**: `docs/setup-tools.md` (install tools)
3. **Design**: `docs/design.md` (how to build)
4. **Scope**: `docs/projectscope.md` (full vision)
5. **Build**: Start Week 1 with Cursor AI!

---

**Built with ❤️ at UW by Harry Pall + Cursor AI**

*havn: find your place to study*


