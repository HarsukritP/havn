# havn MVP - Development Roadmap

## MVP Philosophy

**Goal**: Ship a functional, delightful MVP in **10-12 weeks** that solves the core problem: *"Help UW students find available study spots and coordinate with friends in real-time."*

**What to Build**: The minimum feature set that validates our core hypothesis  
**What NOT to Build**: Everything else (reviews, analytics, predictions, gamification)

**Success Criteria**:
- 500 registered users within 30 days of launch
- 200 DAU (40% daily active ratio)
- 50+ study spots with real-time occupancy data
- 10+ spot save requests per day
- < 2% crash rate
- App Store rating > 4.0 stars

---

## MVP Feature Set (What to Build)

### ✅ Core Features (Must-Have)

#### 1. User Authentication & Onboarding
**What**:
- Email/password sign up and login
- Google OAuth (for UW students with @uw.edu email)
- Profile setup (name, grad year, major, avatar upload)
- Location permissions request
- Simple 3-screen onboarding tutorial

**Why**: Necessary for personalization, social features, and privacy

**Complexity**: 🟢 Low (Supabase Auth handles most of this)

---

#### 2. Study Spot Discovery & Map View
**What**:
- Interactive map (Mapbox) showing UW campus
- Markers for study spots (color-coded by occupancy)
  - 🟢 Green: Low occupancy (0-33%)
  - 🟡 Yellow: Medium occupancy (34-66%)
  - 🔴 Red: High occupancy (67-100%)
- List view toggle (alternative to map)
- Basic filters:
  - Distance from me (500m, 1km, 2km, All)
  - Spot type (Library, Cafe, Lounge, Outdoor, All)
  - Availability (Available only / All)

**Why**: Core value prop - finding spots at a glance

**Complexity**: 🟡 Medium (map integration, geospatial queries)

**Key Technical Requirements**:
- PostGIS queries: `ST_DWithin` for proximity filtering
- Efficient marker clustering for 50+ spots
- Real-time marker updates via Supabase Realtime

---

#### 3. Study Spot Details
**What**:
- Spot name, address, building
- Current occupancy count + percentage
- Estimated capacity
- Amenities (icons):
  - 🔌 Power outlets
  - 📶 WiFi quality
  - 🔇 Noise level (Quiet/Moderate/Loud)
  - ☕ Food/drink nearby
  - 🚪 24/7 access
- Hours of operation
- Distance from current location
- "Navigate" button (opens Apple/Google Maps)
- "Check In Here" button (mark yourself as present)

**Why**: Users need details to decide if a spot fits their needs

**Complexity**: 🟢 Low (simple CRUD + UI)

---

#### 4. Real-Time Occupancy Tracking
**What**:
- Automatic check-in when user arrives at spot (geofence-based)
- Manual check-in option (in case location is imprecise)
- Auto check-out after 4 hours OR when user leaves geofence
- Manual check-out button
- Background location tracking (only when app is active, not always-on)
- Occupancy count updates every 30 seconds via Supabase Realtime

**Why**: The secret sauce - dynamic occupancy data

**Complexity**: 🔴 High (location tracking, battery optimization, real-time sync)

**Technical Approach**:
```
User Location → Geofence Detection → API: POST /occupancy/checkin
→ PostgreSQL: Insert occupancy_log, Update spot.current_occupancy
→ Supabase Realtime: Broadcast to all subscribed clients
→ Mobile UI: Update marker colors
```

**Key Considerations**:
- Battery efficiency: Update location every 5 minutes (not every second)
- Privacy: Only track when on campus, not off-campus
- Fallback: If geofence fails, use manual check-in

---

#### 5. Friend System
**What**:
- Search for friends by username or email
- Send friend request
- Accept/decline friend requests
- View friends list
- See friends' current study locations (if they're checked in)
- Friends appear on map as special markers (different icon)

**Why**: Enables social coordination (core differentiator)

**Complexity**: 🟡 Medium (standard social graph implementation)

**Constraints**:
- Users must be mutual friends to see each other's locations
- Max 200 friends per user (for MVP)
- No groups or study circles (save for post-MVP)

---

#### 6. Spot Saving Requests
**What**:
- "Request Spot Save" button on spot details page
- Select friend(s) nearby (within 2km of that spot)
- Add optional message ("Can you save a seat? Arriving in 15 min")
- Friend receives push notification
- Friend can Accept, Decline, or Ignore
- Requester sees status (Pending, Accepted, Declined)
- Request expires after 30 minutes

**Why**: THE unique feature that differentiates us from Google Maps

**Complexity**: 🟡 Medium (notification system, state management)

**User Flow**:
```
User A: "I want to study at Odegaard"
User A: Sees Friend B is nearby
User A: Taps "Request Spot Save" → Select Friend B → "Can you grab a seat?"
Friend B: Gets push notification
Friend B: Taps notification → Opens request → "Accept"
User A: Gets notification "Friend B accepted! Spot saved at Odegaard 4th Floor"
```

---

#### 7. Push Notifications
**What** (MVP scope only):
- Friend request received
- Friend request accepted
- Spot save request received
- Spot save request accepted/declined
- Friend checked in nearby (if user has app open)

**Why**: Drive engagement, enable async coordination

**Complexity**: 🟢 Low (Expo Push Notifications handles this)

**Tech**: Expo Push Notification service (free tier: unlimited notifications)

---

#### 8. Basic Profile & Settings
**What**:
- View own profile (name, avatar, university, grad year, major)
- Edit profile (name, avatar only for MVP)
- Settings:
  - Notification preferences (on/off for each type)
  - Location sharing (Friends / No One)
  - Auto check-out time (2 hours / 4 hours / 6 hours)
  - Privacy policy, Terms of Service links
  - Log out
  - Delete account

**Why**: User control and legal compliance

**Complexity**: 🟢 Low

---

### ❌ Features to SKIP for MVP (Post-MVP)

Do NOT build these initially:

- ❌ Spot reviews & ratings (Phase 2)
- ❌ Spot photos (crowdsourced) (Phase 2)
- ❌ Study groups (Phase 2)
- ❌ Analytics dashboard (Phase 3)
- ❌ Occupancy predictions (Phase 3)
- ❌ Historical occupancy data view (Phase 3)
- ❌ Calendar integration (Phase 3)
- ❌ Chat/messaging system (Phase 2)
- ❌ Study streaks / gamification (Phase 2)
- ❌ Discovery feed (Phase 2)
- ❌ Admin panel (build ad-hoc SQL scripts for now)
- ❌ Spot creation by users (seed spots manually)
- ❌ Off-campus spots (UW campus only)
- ❌ Multiple universities (UW only)

**Why Skip?**: These are nice-to-haves that don't validate core hypothesis. Build them after getting user feedback.

---

## Development Timeline (Optimized for Cursor AI)

**Total Duration**: 10-12 weeks  
**Team**: You + Cursor AI + 1 Contract Designer (UI/UX)  
**Work Cadence**: 20-30 hours/week

### Week 1-2: Foundation & Setup

#### Week 1: Project Initialization
- [x] Create project structure
- [ ] Set up Supabase project
  - Create database
  - Enable PostGIS extension
  - Set up authentication (email + Google OAuth)
- [ ] Set up Railway project for Golang backend
  - Create new Railway app
  - Link GitHub repo (for CI/CD)
  - Set environment variables
- [ ] Initialize React Native (Expo) project
  - `npx create-expo-app havn --template`
  - Install core dependencies (see design.md)
  - Set up Expo EAS for builds
- [ ] Design system foundations
  - Color palette (minimalist: 2-3 colors max)
  - Typography (1-2 fonts)
  - Spacing system (8px grid)
  - Component library structure (buttons, cards, inputs)

**Deliverable**: Running "Hello World" app on iOS/Android simulator, connected to Supabase, basic Golang API responding

---

#### Week 2: Database Schema & Core Backend
- [ ] Design database schema (see design.md for full schema)
  - Users table with Supabase Auth integration
  - Spots table with PostGIS geometry column
  - Friendships table
  - Occupancy_logs table
  - Spot_save_requests table
- [ ] Seed initial data
  - 30-50 UW study spots (manually research and add)
  - Coordinates, amenities, hours, capacity
- [ ] Backend API skeleton (Golang)
  - Project structure (handlers, services, models)
  - Supabase client initialization
  - JWT auth middleware
  - Health check endpoint
  - CORS configuration
- [ ] Core API endpoints (stubbed)
  - `GET /api/v1/spots` (list spots)
  - `GET /api/v1/spots/:id` (spot details)
  - `POST /api/v1/occupancy/checkin`
  - `POST /api/v1/occupancy/checkout`

**Deliverable**: Database schema deployed, 50 spots seeded, basic API returning data

---

### Week 3-4: Map & Spot Discovery

#### Week 3: Map Integration
- [ ] Mapbox integration (React Native Maps)
  - Display UW campus map (center: 47.6553° N, 122.3035° W)
  - User's current location (blue dot)
  - Request location permissions (foreground only)
- [ ] Spot markers
  - Custom marker components (colored by occupancy)
  - Marker clustering (for 50+ spots)
  - Tap marker → bottom sheet with spot summary
- [ ] Filters UI
  - Distance filter (bottom sheet)
  - Spot type filter (chips)
  - Apply filters → re-query API
- [ ] API implementation
  - `GET /api/v1/spots?lat=X&lon=Y&radius=1000&type=library`
  - PostGIS query: `ST_DWithin` for proximity
  - Return spots sorted by distance
  - Include current_occupancy in response

**Deliverable**: Interactive map with 50 spots, filtering works, occupancy colors displayed

---

#### Week 4: Spot Details & List View
- [ ] Spot details screen
  - Full spot information
  - Occupancy chart (simple bar: 15/50 students)
  - Amenity icons
  - "Navigate" button (deep link to Apple/Google Maps)
  - "Check In Here" button
- [ ] List view (alternative to map)
  - Sorted by distance
  - Card-based UI
  - Same filters as map view
  - Tap card → spot details
- [ ] Polish animations
  - Map marker animations (smooth color transitions)
  - Bottom sheet slide-up
  - Loading skeletons

**Deliverable**: Full spot discovery flow works end-to-end

---

### Week 5-6: Occupancy Tracking & Real-Time

#### Week 5: Check-In/Check-Out
- [ ] Location services
  - Background location permissions (iOS: "While Using App")
  - Geofence setup (100m radius around each spot)
  - Location updates every 5 minutes (when app active)
- [ ] Check-in flow
  - Auto-detect when user enters spot geofence
  - Show notification: "Check in to Odegaard 4th Floor?"
  - Tap notification → confirm check-in
  - Manual check-in button on spot details
  - API: `POST /api/v1/occupancy/checkin`
- [ ] Check-out flow
  - Auto check-out after 4 hours (default)
  - Auto check-out when leaving geofence (after 15 min)
  - Manual check-out button in app
  - API: `POST /api/v1/occupancy/checkout`
- [ ] Backend logic
  - Insert into occupancy_logs table
  - Update spots.current_occupancy (increment/decrement)
  - Validate: User can only be checked in to 1 spot at a time
  - Handle edge cases (app killed, no internet, etc.)

**Deliverable**: Users can check in/out, occupancy count updates in database

---

#### Week 6: Real-Time Updates
- [ ] Supabase Realtime setup
  - Enable Realtime for `spots` table
  - Create publication for `current_occupancy` column changes
  - Set up RLS policies (users can read all spots)
- [ ] Frontend subscriptions
  - Subscribe to spots table changes
  - On update → re-render map markers (color change)
  - Debounce updates (max 1 update per 30 seconds per spot)
- [ ] Backend optimization
  - Batch occupancy updates (don't spam database)
  - Use PostgreSQL trigger to auto-update current_occupancy
  - Add index on spots(current_occupancy)
- [ ] Testing
  - Simulate multiple users checking in
  - Verify map updates in real-time
  - Test with poor network conditions

**Deliverable**: Real-time occupancy updates working smoothly, battery impact minimal

---

### Week 7-8: Social Features

#### Week 7: Friend System
- [ ] Friend search
  - Search bar (by username or email)
  - Debounced API call: `GET /api/v1/users/search?q=alex`
  - Show results (avatar, name, university)
- [ ] Friend requests
  - "Add Friend" button on user profile
  - API: `POST /api/v1/friends/request`
  - Request appears in recipient's "Requests" tab
  - Accept/Decline buttons
  - API: `POST /api/v1/friends/accept` or `/decline`
- [ ] Friends list
  - Show all accepted friends
  - Avatar, name, status (Currently Studying at X / Not Studying)
  - Tap friend → view their profile + current location (if checked in)
- [ ] Friend locations on map
  - Special marker for friends (different icon, e.g., star)
  - Only show friends currently checked in
  - Tap friend marker → "Message Friend" or "Request Spot Save"

**Deliverable**: Full friend system working, friends visible on map

---

#### Week 8: Spot Saving Requests
- [ ] Request flow
  - "Request Spot Save" button on spot details
  - Select friend(s) from list (filtered: within 2km of spot)
  - Add optional message (text input)
  - API: `POST /api/v1/spot-saves/request`
- [ ] Receiving requests
  - Push notification: "Alex asked you to save a spot at Odegaard!"
  - Tap notification → opens request details
  - Accept / Decline buttons
  - API: `POST /api/v1/spot-saves/respond`
- [ ] Request status
  - Requester sees pending/accepted/declined status
  - Request expires after 30 minutes (background job)
  - Expired requests removed from UI
- [ ] Notifications setup (Expo Push)
  - Request Expo push token on app launch
  - Store token in users table
  - Backend sends notification via Expo API on request/response
- [ ] Backend implementation
  - spot_save_requests table CRUD
  - Expiry logic (PostgreSQL scheduled job or Supabase function)
  - Push notification service (Golang http client → Expo API)

**Deliverable**: Spot saving fully functional, push notifications work

---

### Week 9-10: Polish, Testing & Launch Prep

#### Week 9: UI/UX Polish
- [ ] Design refinement
  - Work with contract designer on final UI pass
  - Consistent spacing, typography, colors
  - Empty states (no spots nearby, no friends yet)
  - Error states (network error, location denied)
  - Loading states (skeletons, spinners)
- [ ] Animations
  - Smooth transitions between screens
  - Micro-interactions (button presses, swipes)
  - Map animations (zoom, pan)
- [ ] Accessibility
  - Screen reader support (iOS VoiceOver, Android TalkBack)
  - Sufficient color contrast (WCAG AA)
  - Touch targets min 44x44px
- [ ] Onboarding flow
  - 3-screen tutorial (swipe through)
  - Screen 1: "Find study spots in real-time"
  - Screen 2: "See where your friends are studying"
  - Screen 3: "Request spot saves from nearby friends"
  - Skip button for returning users

**Deliverable**: App looks professional and polished, onboarding complete

---

#### Week 10: Testing & Bug Fixes
- [ ] Testing strategy
  - Manual testing on iOS (iPhone 12+, iOS 17+)
  - Manual testing on Android (Pixel, Samsung, Android 13+)
  - Edge cases:
    - No internet connection
    - Location services disabled
    - Killed app (test background behavior)
    - Multiple check-ins
    - Expired spot save requests
- [ ] Performance optimization
  - Reduce app bundle size (remove unused deps)
  - Optimize images (compress spot photos)
  - Lazy load screens (React Navigation)
  - Profile app performance (React Native Debugger)
- [ ] Beta testing
  - Recruit 20 UW students for beta (friends, Reddit, flyers)
  - Use TestFlight (iOS) and Google Play Internal Testing (Android)
  - Collect feedback via Google Form
  - Fix critical bugs
- [ ] Analytics setup
  - Expo Analytics (free, basic)
  - Track key events:
    - User sign up
    - Spot viewed
    - Check-in
    - Friend request sent
    - Spot save request sent
  - No PII tracking (privacy-first)

**Deliverable**: Stable, tested app ready for public launch

---

### Week 11-12: Launch & Iteration

#### Week 11: App Store Submission
- [ ] App Store assets
  - iOS: Screenshots (6.5" and 5.5" iPhone), app icon, privacy policy URL
  - Android: Screenshots, feature graphic, app icon
  - App descriptions (compelling copy)
  - Keywords for ASO (App Store Optimization)
- [ ] Legal pages
  - Privacy Policy (use template, customize for location data)
  - Terms of Service
  - Host on simple static site (Vercel/Netlify)
- [ ] Submit to App Store
  - iOS: Submit via App Store Connect (review: 1-3 days)
  - Android: Submit via Google Play Console (review: 1-2 days)
- [ ] Pre-launch marketing
  - Instagram page (@havnapp) + 5-10 posts
  - TikTok teaser video
  - Reddit post on r/udub (UW subreddit)
  - Flyers at UW (Odegaard, HUB, cafes)

**Deliverable**: App live on App Store and Google Play

---

#### Week 12: Launch & Monitor
- [ ] Launch day
  - Post on Instagram, TikTok, Reddit
  - Email waitlist (if you built one)
  - Monitor crash reports (Sentry or Expo Crashlytics)
  - Monitor server errors (Railway logs)
  - Respond to user feedback (reviews, DMs)
- [ ] Metrics monitoring
  - Daily signups
  - DAU/MAU
  - Check-ins per day
  - Spot save requests per day
  - Crash rate
- [ ] Rapid iteration
  - Fix critical bugs within 24 hours (OTA update via Expo)
  - Collect feature requests (Trello board or Notion)
  - Prioritize based on user feedback
- [ ] User interviews
  - Talk to 10-15 active users (Zoom, 20 min each)
  - Understand: What do they love? What's confusing? What's missing?
  - Use insights for post-MVP roadmap

**Deliverable**: Launched app, initial users onboarded, feedback collected

---

## Technical Priorities for Cursor AI Development

### What Cursor AI Excels At (Focus Here)
✅ **Boilerplate code**: Database schemas, API endpoints, CRUD operations  
✅ **Integration code**: Connecting React Native → Golang API → Supabase  
✅ **UI components**: Building React Native screens with modern libraries  
✅ **Bug fixes**: Debugging common errors (async issues, API errors)  
✅ **Refactoring**: Cleaning up code, adding types, improving structure  

### What Needs Human Attention (You)
⚠️ **UX decisions**: How should the friend request flow feel?  
⚠️ **Design**: Visual polish (work with designer, then Cursor implements)  
⚠️ **Architecture decisions**: Monolith vs microservices, caching strategy  
⚠️ **Business logic edge cases**: What if user checks in twice?  
⚠️ **Testing strategy**: What to test, how to test  

### Cursor-Optimized Development Workflow

1. **Define Feature Clearly** (You → Cursor)
   - Write detailed prompt: "Build friend request system with..."
   - Include acceptance criteria: "User should see notification when..."
   - Reference design.md for tech stack specifics

2. **Generate Code** (Cursor)
   - Cursor generates backend API, frontend UI, database migrations
   - Uses Supabase MCP for database operations (via tool)
   - Uses Railway CLI for deployment

3. **Review & Test** (You)
   - Read generated code (don't blindly accept)
   - Test manually on device/simulator
   - Identify bugs or improvements

4. **Iterate** (You → Cursor)
   - "Fix: Notification not appearing on Android"
   - "Refactor: Extract MapMarker into separate component"
   - "Optimize: Reduce API calls on map pan"

5. **Deploy** (Automated via Railway CI/CD)
   - Push to GitHub → Railway auto-deploys
   - Expo OTA update for frontend (instant push)

---

## MVP Success Checklist

Before launching, ensure:

### Functionality
- [ ] Users can sign up and log in
- [ ] Map displays 50+ study spots with correct locations
- [ ] Occupancy data is accurate (verified by manual testing)
- [ ] Check-in/check-out works reliably
- [ ] Real-time updates work (test with 2+ devices)
- [ ] Users can add friends and see friend requests
- [ ] Friend locations appear on map
- [ ] Spot save requests work end-to-end
- [ ] Push notifications arrive within 5 seconds

### Performance
- [ ] App launches in < 3 seconds (cold start)
- [ ] Map loads in < 2 seconds
- [ ] No crashes during 30-minute test session
- [ ] Battery drain < 10% per hour (with active usage)
- [ ] App bundle size < 50MB

### UX/UI
- [ ] Onboarding is clear and takes < 2 minutes
- [ ] All screens are accessible (VoiceOver compatible)
- [ ] Empty states are helpful ("No friends yet. Add your first friend!")
- [ ] Error messages are clear ("Location access required to find spots")
- [ ] Loading states prevent user confusion

### Legal/Compliance
- [ ] Privacy Policy published and linked in app
- [ ] Terms of Service published and linked in app
- [ ] Location permission request includes clear explanation
- [ ] User can delete their account and data

### Marketing
- [ ] App Store screenshots look compelling
- [ ] App description is clear and benefit-focused
- [ ] Keywords optimized for "study spot", "university", "UW"
- [ ] Instagram/TikTok content ready for launch

---

## Post-MVP Roadmap (Quick Reference)

### Month 4-6: Social & Engagement
- Spot reviews and ratings
- User-uploaded spot photos
- Study groups (persistent groups of 3-10 people)
- Check-in history ("You've studied 20 hours this week!")

### Month 7-9: Intelligence
- Occupancy predictions (ML model)
- "Best spot for you right now" recommendations
- Historical occupancy charts
- Personal analytics dashboard

### Month 10-12: Growth
- Expand to 2-3 more universities
- University partnerships (official library data)
- Premium tier launch ($4.99/month)
- Student ambassador program

---

## Key Metrics to Track (Dashboard)

Build a simple admin dashboard (Week 11-12) to monitor:

- **User Growth**: Daily signups, total users
- **Engagement**: DAU, WAU, MAU, retention (D1, D7, D30)
- **Core Actions**: Check-ins/day, spot saves/day, friend requests/day
- **Technical Health**: Crash rate, API latency (p95), error rate
- **Business**: Referrals, app store ratings, NPS (survey)

Use tools:
- **Expo Analytics** (free, built-in)
- **PostHog** (free tier: 1M events/month) for product analytics
- **Sentry** (free tier: 5k errors/month) for crash reporting

---

## When to Pivot or Iterate

### Signals You Should Pivot:
- ❌ < 100 signups after 1 month of launch (low demand)
- ❌ < 10% of users check in more than once (low retention)
- ❌ < 1 spot save request per 100 DAU (feature not used)
- ❌ Users complain about same thing repeatedly

### Signals You Should Double Down:
- ✅ Organic growth (users inviting friends without prompting)
- ✅ High retention (60%+ weekly retention)
- ✅ Users asking for more features (shows engagement)
- ✅ Spot saves heavily used (validates unique value prop)

---

## Resources & Learning

### For You (Developer)
- **React Native**: Official docs (https://reactnative.dev)
- **Expo**: Expo docs (https://docs.expo.dev)
- **Golang**: Go by Example (https://gobyexample.com)
- **PostGIS**: PostGIS in Action (book) or https://postgis.net/workshops/
- **Supabase**: Supabase docs (https://supabase.com/docs)

### For Users (Launch Resources)
- **ASO**: The App Store Optimization Guide (Sensor Tower)
- **Growth**: Cold Start Problem by Andrew Chen (book)
- **User Research**: The Mom Test by Rob Fitzpatrick (book)

---

## Summary: What to Build First

**Week 1-2**: Setup (Supabase, Railway, Expo project)  
**Week 3-4**: Map + Spot Discovery  
**Week 5-6**: Occupancy Tracking + Real-time  
**Week 7-8**: Friends + Spot Saving  
**Week 9-10**: Polish + Testing  
**Week 11-12**: Launch + Iterate  

**Total MVP Features**: 8 core features (see checklist above)  
**What NOT to Build**: Everything in projectscope.md that's marked Phase 2+

**Remember**: Ship fast, learn fast, iterate fast. The MVP doesn't need to be perfect—it needs to validate the hypothesis that students want this.

---

**Next**: See `design.md` for complete technical architecture, API specs, database schema, and UI component library.


