# Havn - Project Scope & Vision

## Project Overview

Havn is a mobile-first platform that solves the chronic problem of study space discovery on college campuses. Every day, thousands of students waste 15-30 minutes wandering from building to building looking for available study spots. This inefficiency leads to frustration, wasted time between classes, and ultimately, students giving up and studying alone in their dorm rooms—missing valuable collaborative learning opportunities.

Havn transforms this chaotic process into a seamless experience by providing real-time, crowdsourced availability data for every study spot on campus. Students can open the app, see a live map of all locations color-coded by availability, and make informed decisions about where to go. The platform incentivizes accurate data through gamification, turning every user into a contributor who earns reputation points for timely updates.

The killer feature—spot-saving—creates powerful network effects. Students already at a location can "save" a seat for friends arriving in 10-15 minutes, solving both the finding-a-spot problem and the studying-alone problem simultaneously. This peer-to-peer reservation system transforms Havn from a passive information tool into an active social coordination platform.

## Core Problem & Solution

### The Problem

**Primary Pain Points:**
- **Time Waste:** Students spend 15-30 minutes wandering campus looking for open study spots, especially during midterms and finals
- **Information Asymmetry:** No way to know if a library/study lounge is full without physically walking there
- **Isolation:** Students who can't find group study spots default to studying alone in dorms, reducing learning effectiveness
- **Coordination Failure:** Friends trying to meet up for study sessions play "text tennis" ("anyone at main library?" "is there space?" "how full is it?")
- **Peak Hour Chaos:** During 12-2pm and 6-8pm, all prime study spots fill up, but students don't know about quieter alternatives

**Current Workarounds (All Inadequate):**
- Group chats with "anyone at the library?" messages (slow, unreliable)
- Walking to multiple locations hoping to get lucky (inefficient)
- Arriving 30+ minutes early to guarantee a seat (time waste)
- Giving up and studying in dorm rooms (suboptimal environment)

### The Solution

**Core Value Proposition:** Know exactly where to go, every time.

**Three Pillars:**

1. **Live Availability Map**
   - Visual dashboard showing all campus study spots
   - Color-coded markers: Green (available), Yellow (low availability), Red (full)
   - Real-time updates from student check-ins
   - Geospatial search: "Show me available spots within 5-minute walk"

2. **Crowdsourced Data Engine**
   - Students update availability when arriving/leaving locations
   - Simple interface: "How many seats available?" with number picker
   - Gamification: Earn points for accurate, timely updates
   - Reputation system: Trusted contributors unlock premium features
   - Confidence scoring: Recent updates weighted higher, outliers flagged

3. **Spot-Saving Marketplace**
   - Students at a location can "save" seats for friends arriving soon (10-15 min window)
   - Request system: "I'm 8 minutes away, can you save me a seat?"
   - Accept/decline with automatic timeout
   - Creates network effects: Both parties need the app

**Why This Wins:**
- **Speed:** See availability in 3 seconds vs. 20+ minutes of wandering
- **Accuracy:** Crowdsourced data is fresher than any centralized system could achieve
- **Community:** Transforms individual frustration into collective action
- **Network Effects:** Spot-saving feature drives viral growth (you need friends to use it)

## Target Users

### Primary Demographic
- **Age:** 18-24 (traditional undergrad)
- **Education:** College/university students
- **Location:** Initially single campus (10,000-50,000 students), expand to multi-campus
- **Tech Savvy:** High smartphone usage, comfortable with location-based apps
- **Study Habits:** 15-25 hours/week outside classroom, prefer collaborative learning

### User Personas

**Persona 1: "Social Sarah" (Heavy User)**
- Junior, Psychology major
- Studies 20+ hours/week, mostly in groups
- Uses group chats to coordinate study sessions
- Pain point: "My friends and I waste so much time trying to find a spot together"
- Usage pattern: Checks app 3-5 times/day, updates availability frequently, saves spots for friends
- Motivation: Social + efficiency

**Persona 2: "Efficient Eric" (Power User)**
- Sophomore, Engineering major
- Studies alone but wants optimal environment
- Highly values time management
- Pain point: "I have 2 hours between classes and can't afford to waste 30 min finding a spot"
- Usage pattern: Checks app before leaving current location, contributes data for points
- Motivation: Efficiency + gamification

**Persona 3: "Anxious Amy" (Casual User)**
- Freshman, undecided major
- New to campus, doesn't know all study spots yet
- Experiences anxiety about finding seating during peak hours
- Pain point: "I don't know where to go and always end up in my loud dorm"
- Usage pattern: Opens app during peak hours, discovers new locations, occasional updates
- Motivation: Discovery + stress reduction

### User Needs
- **Speed:** Must be faster than walking to check in person (<10 seconds to find nearby spots)
- **Reliability:** Data must be accurate (>80% accuracy) or users abandon the app
- **Discovery:** Help users find study spots they didn't know existed
- **Social Coordination:** Enable meeting up with friends without endless texting
- **Incentive:** Reward contribution (points, achievements, premium access)
- **Privacy:** Location data only when app is in use, no tracking

## Technical Stack

### Backend Technology

**Core Framework: Go 1.21+**
- **Why Go:** High concurrency for WebSocket connections, excellent performance, simple deployment (single binary), strong typing
- **Framework:** Gin Web Framework v1.9+ (lightweight, fast routing, middleware support)
- **Standards:** Context-based request handling, structured logging, explicit error handling

**Database: PostgreSQL 15+ with PostGIS**
- **Why PostgreSQL:** Robust relational model, excellent geospatial support via PostGIS extension, ACID compliance
- **PostGIS Extension:** Enables efficient geospatial queries (find spots within radius)
- **Connection Pooling:** pgx driver for high-performance connection pooling
- **Migrations:** golang-migrate for version-controlled schema changes

**Cache Layer: Redis 7+**
- **Use Cases:**
  - Session storage (JWT blacklist for logout)
  - Real-time data cache (spot availability, reduce DB load)
  - WebSocket pub/sub (broadcast updates to connected clients)
  - Rate limiting (track API call counts per user)
- **Persistence:** AOF enabled for durability

**Real-Time: WebSockets (gorilla/websocket)**
- **Why WebSockets:** Bi-directional real-time updates for map markers
- **Architecture:** Redis pub/sub for horizontal scaling across multiple server instances
- **Fallback:** Long polling for clients that don't support WebSockets

**Additional Backend Libraries:**
- `golang-jwt/jwt` v5 - JWT authentication
- `google/uuid` - UUID generation for entities
- `lib/pq` or `pgx` - PostgreSQL driver
- `go-redis/redis` v9 - Redis client
- `validator/v10` - Request validation
- `viper` - Configuration management
- `logrus` or `zap` - Structured logging

### Frontend Technology

**Framework: React Native 0.73+**
- **Why React Native:** Cross-platform (iOS + Android), large ecosystem, faster iteration than native development
- **Language:** TypeScript 5+ (strict mode enabled)
- **Node Version:** 18+ LTS

**UI Component Library: Gluestack UI v2**
- **Why Gluestack:** Production-grade components with shadcn/ui-level polish for React Native
- **Features:** Accessible, customizable design tokens, TypeScript-first
- **Alternative:** NativeBase v3 with custom theme (if Gluestack unavailable)
- **Icons:** Lucide React Native (consistent with Gluestack)

**Navigation: React Navigation 6**
- **Bottom Tabs:** Main navigation (Map, List, Update, Profile)
- **Stack Navigator:** Nested screens (Spot Detail, Settings, etc.)
- **Deep Linking:** Support for spot URLs (havn://spots/123)
- **Shared Element Transitions:** Hero animations between screens

**State Management:**
- **React Query v5:** Server state (API data, caching, optimistic updates)
- **Zustand:** Client state (user preferences, UI state)
- **AsyncStorage:** Persistent local storage

**Maps: react-native-maps**
- **Why:** Native map performance, custom markers, clustering support
- **Platforms:** Apple Maps (iOS), Google Maps (Android)
- **Features:** Custom markers, user location, geofencing

**Animations & Interactions:**
- **react-native-reanimated v3:** 60fps animations, runs on UI thread
- **react-native-gesture-handler v2:** Native gesture recognition (swipe, long press, pan)
- **expo-haptics:** Tactile feedback for button presses, success/error states
- **Use Cases:** 
  - Smooth page transitions
  - Micro-interactions (button press scaling, card expansion)
  - Skeleton loaders with shimmer effects
  - Pull-to-refresh animations
  - Modal slide-up/slide-down with spring physics

**API Layer:**
- **Axios:** HTTP client with interceptors (auth, error handling)
- **WebSocket:** Native WebSocket API with reconnection logic

**Additional Frontend Libraries:**
- `@gluestack-ui/themed` - UI component library
- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack navigator with native performance
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `axios` - HTTP client
- `react-native-maps` - Map component
- `react-native-reanimated` - Smooth animations (60fps)
- `react-native-gesture-handler` - Native gestures
- `expo-haptics` - Haptic feedback
- `react-native-geolocation-service` - Location services
- `react-native-push-notification` - Push notifications
- `react-native-image-picker` - Photo uploads
- `react-native-fast-image` - Optimized image loading
- `date-fns` - Date formatting
- `lucide-react-native` - Icon library

### Infrastructure & DevOps

**Containerization: Docker**
- Multi-stage builds for minimal image size
- docker-compose for local development (backend, PostgreSQL, Redis)
- Health checks for all services

**Deployment: AWS or Fly.io**
- **Option 1 - AWS:**
  - ECS (Fargate) for container orchestration
  - RDS PostgreSQL with PostGIS
  - ElastiCache Redis
  - ALB for load balancing
  - S3 for image storage (spot photos)
  - CloudFront CDN
  - Route 53 DNS

- **Option 2 - Fly.io (Recommended for MVP):**
  - Simpler, cheaper for initial launch
  - Built-in PostgreSQL (managed)
  - Built-in Redis (managed)
  - Global edge network
  - Easy scaling

**Push Notifications: Firebase Cloud Messaging**
- Cross-platform (iOS + Android)
- Free tier sufficient for MVP
- Use cases: Spot-save requests, achievement unlocks, low reputation warnings

**Monitoring & Analytics:**
- **Sentry:** Error tracking and crash reporting (frontend + backend)
- **Mixpanel:** User analytics (feature usage, retention, funnels)
- **LogDNA or CloudWatch:** Centralized logging
- **Uptime Robot:** Endpoint monitoring

**CI/CD:**
- GitHub Actions for automated testing and deployment
- Automated testing on PR
- Deploy to staging on merge to `develop`
- Deploy to production on merge to `main`

### Development Tools
- **API Testing:** Postman/Insomnia collections
- **Database Management:** TablePlus or pgAdmin
- **Redis CLI:** Redis Desktop Manager
- **React Native Debugging:** Flipper
- **Version Control:** Git + GitHub
- **Code Quality:** golangci-lint (Go), ESLint + Prettier (TypeScript)

## Key Features (Priority Order for MVP)

### Phase 1: Core Platform (Weeks 1-4) - MVP LAUNCH

**Must-Have Features:**

1. **User Authentication**
   - Email + password registration/login
   - .edu email verification (optional but recommended)
   - JWT-based authentication
   - Password reset via email

2. **Live Map View**
   - Display all campus study spots as map markers
   - Color-coded by availability (green/yellow/red)
   - User's current location indicator
   - Tap marker to see spot details
   - Cluster markers when zoomed out (performance optimization)

3. **Spot Discovery**
   - Pre-seeded database of campus study locations (libraries, lounges, cafes, outdoor spaces)
   - Each spot has: name, address, capacity, amenities (WiFi, outlets, noise level)
   - "Nearby" filter (show spots within X meters)
   - List view alternative to map

4. **Spot Detail Screen**
   - Current availability (seats available out of total)
   - Last update timestamp ("Updated 5 min ago")
   - Confidence score indicator
   - Amenities icons (WiFi, outlets, printer, quiet zone)
   - Photo gallery (user-submitted)
   - Historical occupancy chart (simple bar chart by hour)

5. **Check-In/Update System**
   - Simple modal: "How many seats available?" with number picker
   - Optional: Noise level (Quiet, Moderate, Loud)
   - Optional: Photo upload
   - Geofencing: Must be within 100m of location to update
   - Success feedback: "+5 points! Thanks for helping the community"

6. **Basic Gamification**
   - Points for check-ins (5 points each)
   - Accuracy bonus (if your update aligns with others: +2 points)
   - Daily streak counter
   - Display total points and current streak on profile

**Nice-to-Have (If Time Permits):**
- Push notifications for updates to favorited spots
- "Favorite" spots for quick access
- Report incorrect spot information
- Dark mode

### Phase 2: Social Features (Weeks 5-6) - POST-MVP

7. **Spot-Saving Marketplace**
   - "Save a Seat" button for users currently at a location
   - Request flow: "I'm 8 min away, can someone save me a seat?"
   - Push notification to users at that location
   - Accept/decline system with 2-minute response window
   - Automatic timeout if no response
   - Track successful saves (social proof)

8. **Reputation System**
   - User reputation score (0-100)
   - Based on: check-in accuracy, streak, successful spot-saves
   - Display badges (Trusted Contributor, Super Helper, etc.)
   - Leaderboard (weekly, all-time)
   - Reputation gates: Must have 50+ rep to save spots for others

### Phase 3: Smart Features (Weeks 7-8)

9. **Proximity Study Matching**
   - "Study with someone" toggle
   - Match users at the same location studying similar subjects
   - Opt-in only, privacy-first
   - Simple profile: name, major, currently studying (optional)

10. **Session Tracking**
    - Auto-detect when user stays at location 30+ minutes
    - Prompt to "Check out" when leaving (update availability)
    - Track study hours per week (personal stats)

### Phase 4: Growth & Monetization (Weeks 9-12)

11. **Predictive ML**
    - Historical data analysis: "Library is usually 90% full at 2pm on Tuesdays"
    - "Best time to go" suggestions
    - Notification: "Your favorite spot is emptying out"

12. **Analytics Dashboard**
    - Personal stats: Total hours studied, favorite spots, contribution rank
    - Campus-wide insights: Busiest locations, peak hours

13. **Premium Features ($4.99/month)**
    - Priority spot-save requests (jump the queue)
    - Advanced filtering (show only quiet spots with outlets)
    - Ad-free experience
    - Historical data access (see last week's patterns)

14. **Campus Partnerships**
    - Admin dashboard for campus facilities
    - Official spot data integration
    - Branded locations
    - Revenue share: $500-2000/month per campus

## Success Metrics

### MVP Success Criteria (Week 4)
- **User Acquisition:** 500+ registered users (5% of 10,000 campus population)
- **Daily Active Users (DAU):** 100+ (20% of registered base)
- **Engagement:** 1,000+ check-ins per week (10 check-ins per DAU)
- **Data Quality:** 80%+ accuracy rate (verify via spot-checks)
- **Retention:** 30% D7 retention (30% of users return after 7 days)
- **Performance:** 95%+ uptime, <2s app launch time, <200ms API response

### Scale Success Criteria (Month 3-6)
- **User Base:** 5,000+ users (50% campus penetration)
- **DAU:** 1,000+ (20% active daily)
- **Weekly Spot-Saves:** 50+ successful saves per day (social feature adoption)
- **Data Accuracy:** 90%+ (mature data with trusted contributors)
- **Revenue:** $2,000+ MRR (400 premium subscribers @ $4.99)
- **NPS Score:** 40+ (users recommend to friends)

### Key Performance Indicators (KPIs)
- **Acquisition:** New signups per day, .edu verification rate
- **Activation:** % users who check-in at least once
- **Engagement:** Check-ins per user per week, time spent in app
- **Retention:** D1, D7, D30 retention rates
- **Referral:** Viral coefficient (how many friends each user invites)
- **Revenue:** Premium conversion rate, campus partnership contracts
- **Data Quality:** Accuracy rate, average update freshness, contributor reputation distribution

## Technical Challenges & Solutions

### Challenge 1: Real-Time Data Accuracy
**Problem:** Crowdsourced data can be stale or malicious. If students see "5 seats available" but arrive to find the spot full, they'll abandon the app.

**Solutions:**
- **Confidence Scoring:** Weight recent updates higher, flag outliers
  - Updates <5 min old: 100% confidence
  - 5-15 min: 80% confidence
  - 15-30 min: 60% confidence
  - 30-60 min: 40% confidence
  - 60+ min: 20% confidence (show "Data may be outdated" warning)
- **Multi-Source Validation:** If 3+ users report similar availability within 10 min, boost confidence
- **Geofencing Enforcement:** Must be within 100m of location to submit update (prevent remote trolling)
- **Reputation Weighting:** Trusted contributors (high reputation) updates weighted 1.5x
- **Outlier Detection:** Flag updates that deviate significantly from recent pattern (e.g., "0 seats" when last 5 updates were "15+ seats")

### Challenge 2: Battery Drain
**Problem:** Continuous GPS tracking kills phone batteries, leading to app uninstalls.

**Solutions:**
- **Geofencing Instead of Continuous GPS:** Only track location when app is open or user is near a study spot
- **Background Location Minimization:** Don't require "always allow" location permission
- **Smart Polling:** Only fetch updates when map viewport changes
- **Local Caching:** Cache spot data and map tiles, reduce network requests
- **Efficient Map Rendering:** Cluster markers when zoomed out (50+ markers → 5 clusters)

### Challenge 3: Cold Start Problem
**Problem:** No data on day 1 = no value = no users = no data (vicious cycle).

**Solutions:**
- **Pre-Seed Popular Locations:** Manually add 20-30 major study spots with estimated capacity before launch
- **Incentivize Early Adopters:** "Beta user" badge + 100 bonus points for first 100 users
- **Manual Seeding Week:** Development team + beta testers perform 100+ check-ins during week 1
- **Campus Partnerships:** Work with library staff to provide official hourly occupancy data for first 2 weeks
- **Launch Strategy:** Pilot with single student organization (e.g., CS club) to create initial data density

### Challenge 4: Trust & Safety
**Problem:** Malicious users could spam fake updates, troll, or harass.

**Solutions:**
- **Email Verification:** Require .edu email verification (can be optional but incentivized)
- **Rate Limiting:** Max 1 update per location per 5 minutes per user
- **Reputation System:** Low-reputation users' updates weighted lower
- **Report System:** Users can report incorrect data; flagged users investigated
- **Moderation Tools:** Admin dashboard to ban users, delete updates, lock locations
- **Graduated Penalties:** First offense: warning, second: temp ban, third: permanent ban

### Challenge 5: Scaling WebSockets
**Problem:** Thousands of concurrent WebSocket connections can overwhelm a single server.

**Solutions:**
- **Redis Pub/Sub:** Use Redis as message broker; servers subscribe to channels, broadcast to connected clients
- **Horizontal Scaling:** Deploy multiple backend instances behind load balancer
- **Room-Based Broadcasting:** Only send updates to users viewing that specific area (geohashing)
- **Connection Pooling:** Reuse Redis connections, implement connection limits
- **Graceful Degradation:** Fall back to HTTP polling if WebSocket fails

### Challenge 6: Privacy Concerns
**Problem:** Students may worry about location tracking, data sharing.

**Solutions:**
- **Transparent Privacy Policy:** Clear explanation of data usage (only when app open, never sold)
- **Minimal Data Collection:** Don't store location history, only current session
- **Anonymous Updates:** Check-ins don't expose user identity to other users
- **Opt-In Social Features:** Spot-saving and study matching require explicit opt-in
- **Data Deletion:** Users can delete account and all associated data anytime

## Development Principles

### 1. Mobile-First Design
- Design for thumb-reach zones (bottom 2/3 of screen for primary actions)
- Fast interactions (tap, swipe, no multi-step flows)
- Offline-capable (show cached data when no connection)
- Minimal text entry (pickers, toggles, sliders instead of keyboards)

### 2. Speed is a Feature
- App launch: <3 seconds
- Map render: <1 second for 50+ markers
- API responses: <200ms median
- WebSocket latency: <100ms
- Perceived performance: Optimistic updates, skeleton screens

### 3. Data-Driven Iteration
- Ship fast, measure everything
- Weekly review of metrics (DAU, retention, check-ins)
- A/B test major UI changes
- User feedback loop (in-app survey after 10 check-ins)

### 4. Privacy-Conscious
- Collect minimum data necessary
- Transparent about location usage
- No selling data to third parties
- GDPR/CCPA compliant (right to deletion)

### 5. Community-Driven
- Users are contributors, not just consumers
- Celebrate contributions (badges, leaderboards)
- Respond to feedback quickly
- Build trust through consistency

### 6. Scalable Architecture
- Design for 10x growth from day 1
- Database indexes on all queries
- Caching layer for hot data
- Horizontal scaling strategy

## Non-Goals (Out of Scope)

**Explicitly NOT building (at least for MVP):**

1. **Messaging/Chat:** Not a social network; coordination happens via spot-saving, not DMs
2. **Payment Processing:** Free app for MVP; premium subscriptions come later
3. **Course Integration:** No course schedules, study groups by course, etc. (too complex)
4. **Social Feed:** No posts, comments, likes (not Instagram for studying)
5. **AI Tutoring:** No study help, Q&A, or educational content
6. **Calendar Integration:** No syncing with Google Calendar, iCal
7. **Multi-University:** Launch at single campus, expand later
8. **Desktop App:** Mobile-only for MVP
9. **Smart Watch:** No WatchOS/WearOS apps
10. **Voice Interface:** No Siri/Alexa integration

**Rationale:** Maintain ruthless focus on core value prop (finding study spots). Every feature not listed above dilutes that focus and delays launch.

## Tech Debt to Avoid

**Mistakes We Won't Make:**

1. **Missing Database Indexes:** Index all foreign keys, geospatial columns, commonly queried fields from day 1
2. **Hardcoded Image URLs:** Use S3/CloudFront from start, not local file paths
3. **Polling Instead of WebSockets:** Real-time updates via WebSockets, not expensive polling
4. **No Input Validation:** Validate all inputs (backend + frontend), prevent injection attacks
5. **Hardcoded Configuration:** Environment-based config (dev/staging/prod) from day 1
6. **No Error Tracking:** Sentry integration from first deploy
7. **Ignoring Migrations:** All schema changes via versioned migrations, no manual ALTER TABLE
8. **Inconsistent API Responses:** Standardized response format `{success: bool, data: {}, error: string}`
9. **No Rate Limiting:** Prevent abuse with Redis-based rate limiting from day 1
10. **Poor TypeScript Discipline:** Strict mode enabled, no `any` types, comprehensive interfaces

## Deployment Strategy

### Local Development
- Docker Compose with PostgreSQL + Redis + Backend
- React Native on physical device or simulator
- Hot reload for rapid iteration
- Ngrok for webhook testing (push notifications)

### Staging Environment
- Fly.io or AWS ECS staging cluster
- Separate database (production-like data, not real users)
- Automatic deployment on merge to `develop` branch
- Used for QA testing, beta user testing

### Production Environment
- Fly.io or AWS ECS production cluster
- Production database with daily backups
- CDN for static assets
- Deployment on merge to `main` branch (after staging validation)
- Blue-green deployment for zero-downtime updates
- Rollback plan (revert to previous Docker image)

### Monitoring & Alerts
- Sentry for crash reporting
- Uptime monitoring (alerts on >1 min downtime)
- Database connection pool monitoring
- API response time tracking (alert if p95 >500ms)
- Daily metric reports (DAU, check-ins, errors)

---

**Last Updated:** October 13, 2025  
**Version:** 1.0 (Pre-Development)  
**Status:** Documentation Phase

