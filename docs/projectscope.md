# havn - Project Scope & Complete Vision

## Executive Summary

**havn** is a next-generation campus study space discovery and social coordination platform designed to solve the perennial problem of finding available study spaces at universities. Unlike static room-booking systems, havn creates a dynamic, real-time ecosystem where any suitable study location (cafes, libraries, lounges, outdoor spaces) can be discovered, tracked, and coordinated with friends.

**Initial Target Market:** University of Washington (Seattle)  
**Primary Users:** Undergraduate and graduate students aged 18-28  
**Core Value Proposition:** Never waste time searching for study spots; coordinate seamlessly with study groups; discover hidden study gems on campus

---

## Market Analysis & Opportunity

### The Problem Space

1. **Study Space Scarcity**: 73% of university students report difficulty finding adequate study spaces during peak hours (finals week, midterms)
2. **Information Asymmetry**: Students don't know where spaces are available in real-time
3. **Coordination Friction**: Study groups waste 15-30 minutes coordinating locations via text/group chats
4. **Underutilized Spaces**: Many great study spots remain unknown to the broader student body
5. **Dynamic vs Static**: Current solutions (LibCal, Google Maps) show static info, not real-time availability

### Market Size & Opportunity

- **UW Student Body**: 47,000+ students (32,000 undergrad, 15,000+ grad)
- **Addressable Market (Phase 1)**: ~25,000 students likely to use study space finder
- **TAM (US Universities)**: 20M+ students across 4,000+ institutions
- **Comparable Apps**: 
  - Yeti (campus food delivery): Reached 15,000+ users at UW
  - GroupMe: Used by 60%+ of students for group coordination
  - Zotfinder (UCI parking): 10,000+ active users

### Competitive Landscape

| Solution | Strengths | Weaknesses | Our Advantage |
|----------|-----------|------------|---------------|
| **LibCal / Room Booking** | Official, reliable | Static, formal spaces only | Dynamic, informal spaces |
| **Google Maps** | Comprehensive coverage | No real-time occupancy | Crowd-sourced real-time data |
| **Facebook Groups** | Social coordination | Manual, inefficient | Automated spot-saving |
| **Discord Study Servers** | Community | No location integration | Location-first social |

**White Space**: No existing solution combines real-time occupancy tracking + social coordination + dynamic spot discovery

---

## User Personas & Research

### Primary Personas

#### 1. **Alex - The Grinder (40% of users)**
- **Age**: 20, Sophomore, Computer Science
- **Behavior**: Studies 4-6 hours/day, headphones on, needs quiet
- **Pain Points**: Odegaard (main library) always full, hates wasting time searching
- **Needs**: Real-time availability, noise level filters, power outlet info
- **Usage Pattern**: Daily user, checks app 3-5x/day, especially 8am & 2pm

#### 2. **Maya - The Collaborator (35% of users)**
- **Age**: 22, Senior, Business School
- **Behavior**: Group projects, study groups of 3-6 people
- **Pain Points**: Coordinating locations with multiple people, finding group-friendly spaces
- **Needs**: Spot-saving for friends, group capacity info, whiteboard availability
- **Usage Pattern**: 3-4x/week, primarily before group meetings

#### 3. **Jordan - The Explorer (15% of users)**
- **Age**: 19, Freshman, Undeclared
- **Behavior**: Enjoys discovering new spots, likes aesthetic spaces
- **Pain Points**: Only knows Odegaard, wants variety
- **Needs**: Spot discovery, vibe/aesthetic ratings, photo sharing
- **Usage Pattern**: 2-3x/week, explores based on mood

#### 4. **Sam - The Optimizer (10% of users)**
- **Age**: 24, Grad Student, Engineering
- **Behavior**: Data-driven, efficiency-focused
- **Pain Points**: Historical data not available, can't predict best times
- **Needs**: Occupancy predictions, historical trends, commute-optimized suggestions
- **Usage Pattern**: Plans study sessions in advance, uses analytics features

---

## Complete Feature Set (Beyond MVP)

### Phase 1: Core MVP (Months 1-3)
See `mvp.md` for detailed breakdown

### Phase 2: Social & Engagement (Months 4-6)

#### 2.1 Enhanced Social Features
- **Study Groups**: Create persistent study groups with shared schedules
- **Check-ins**: Let friends know you're studying (à la Foursquare)
- **Study Streaks**: Gamification for consistent study habits
- **Status Updates**: "Taking a break in 15 min" micro-updates
- **Friend Finder**: See which friends are studying nearby right now

#### 2.2 Rich Content & Discovery
- **Spot Photos**: User-submitted photos of study spaces
- **Spot Reviews**: Ratings (1-5 stars) with categories (noise, lighting, outlets, wifi)
- **Vibe Tags**: #aesthetic, #quiet, #groupfriendly, #naturallighting, #cozy
- **Spot Collections**: Users can save favorite spots into collections
- **Discovery Feed**: Instagram-style feed of popular/trending spots

#### 2.3 Smart Notifications
- **Predictive Alerts**: "Your favorite spot usually fills up by 3pm"
- **Friend Proximity**: "Maya is studying 2 minutes away!"
- **Spot Availability**: "Odegaard 4th floor just opened up"
- **Group Reminders**: Auto-reminders for study group meetups

### Phase 3: Intelligence & Optimization (Months 7-9)

#### 3.1 ML-Powered Features
- **Occupancy Prediction**: ML models predicting spot availability 30-120 min ahead
- **Personal Recommendations**: Learning user preferences for spot suggestions
- **Smart Routing**: "Best spot for you right now" based on location, time, preferences
- **Noise Level Prediction**: Predict quiet hours at typically noisy spots

#### 3.2 Advanced Scheduling
- **Calendar Integration**: Sync with Google Calendar for study block scheduling
- **Automatic Spot Booking**: Reserve spots in advance (where supported)
- **Study Session Planning**: AI-suggests optimal study times/locations based on class schedule
- **Commute Optimization**: Factor in current location + travel time

#### 3.3 Analytics Dashboard
- **Personal Stats**: Study hours tracked, favorite spots, peak productivity times
- **Social Analytics**: Study group participation, friend interactions
- **Campus Insights**: Most popular spots, occupancy trends, hidden gems
- **Leaderboards**: Top studiers, most helpful reviewers (opt-in gamification)

### Phase 4: Platform & Partnerships (Months 10-12)

#### 4.1 Business Integrations
- **Campus Cafe Partnerships**: Show menu, order ahead, student discounts
- **Library Integration**: Official occupancy data from UW Libraries
- **Building Services**: HVAC schedules, maintenance alerts
- **Event Calendars**: Block off spaces during events

#### 4.2 Premium Features (Monetization)
- **havn Premium ($4.99/month or $29.99/year)**:
  - Advanced occupancy predictions (2-4 hour window)
  - Priority notifications for favorite spots
  - Analytics dashboard with insights
  - Ad-free experience
  - Custom spot collections (unlimited)
  - Early access to new features

#### 4.3 Campus Expansion
- **Multi-Campus Support**: University of Washington (Bothell, Tacoma)
- **New University Onboarding**: Templated approach for rapid expansion
- **University Partnerships**: Official partnerships for data access
- **Student Ambassador Program**: Campus reps for growth + feedback

### Phase 5: Future Vision (Year 2+)

#### 5.1 Expanded Scope
- **Off-Campus Spots**: Coffee shops, co-working spaces, public libraries
- **Indoor Navigation**: AR wayfinding to exact desk/room
- **Desk-Level Booking**: Reserve specific desks at partner locations
- **Study Buddy Matching**: Connect with students taking same classes

#### 5.2 Academic Integration
- **Study Tools**: Integrated pomodoro timer, focus modes
- **Course-Specific Groups**: Auto-suggest study groups for same classes
- **TA Office Hours**: Track office hour locations and wait times
- **Study Resource Sharing**: Share notes, study guides within study groups

#### 5.3 Wellbeing Features
- **Break Reminders**: Healthy study break notifications
- **Ergonomics Ratings**: Track spots with good seating
- **Mental Health Integration**: Partner with campus counseling for stress management
- **Activity Suggestions**: "You've studied 3 hours, take a walk!" with map to green spaces

---

## Technical Architecture (High-Level)

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE CLIENT LAYER                      │
│                  (React Native + Expo - iOS/Android)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Map View    │  │  Social      │  │  Profile     │         │
│  │  & Discovery │  │  & Friends   │  │  & Settings  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│                    (Golang - Railway Hosted)                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  REST API Endpoints  │  WebSocket Server         │           │
│  │  (Auth, CRUD ops)    │  (Real-time updates)      │           │
│  └──────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Middleware: Auth, Rate Limiting, Logging        │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Golang)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Spot Service │  │ User Service │  │ Social Svc   │         │
│  │ - CRUD       │  │ - Auth       │  │ - Friends    │         │
│  │ - Geospatial │  │ - Profiles   │  │ - Spot Save  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Occupancy    │  │ Notification │  │ Analytics    │         │
│  │ Service      │  │ Service      │  │ Service      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Supabase)                       │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PostgreSQL + PostGIS                             │           │
│  │  - Users, Spots, Friendships, Occupancy, Reviews │           │
│  │  - Geospatial indexes for location queries       │           │
│  └──────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Supabase Realtime (Postgres CDC)                │           │
│  │  - Real-time occupancy updates                    │           │
│  │  - Friend status changes                          │           │
│  └──────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Supabase Storage                                 │           │
│  │  - Profile pictures, spot photos                  │           │
│  └──────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Supabase Auth (JWT)                              │           │
│  │  - Email/password, social OAuth                   │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Mapbox API   │  │ Expo Push    │  │ SendGrid     │         │
│  │ (Maps)       │  │ Notifications│  │ (Email)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Real-Time Occupancy Architecture

```
User Location Updates (Every 5 min when app active)
           ↓
   [Mobile Client] → Background Location Service
           ↓
   POST /api/v1/occupancy/update
           ↓
   [Golang Backend] → Validate & Process
           ↓
   [PostgreSQL] → Insert occupancy_logs
           ↓
   [Trigger] → Update spots.current_occupancy (aggregated)
           ↓
   [Supabase Realtime] → Broadcast to subscribed clients
           ↓
   [Mobile Clients] → Update UI (map markers, counts)
```

### Technology Stack Justification

#### Backend: Golang on Railway
**Why Golang?**
- **Performance**: 10-50x faster than Node.js for concurrent operations
- **Concurrency**: Goroutines perfect for handling real-time updates from thousands of users
- **Type Safety**: Prevents bugs that plague dynamic languages in production
- **Deployment**: Single binary, fast cold starts, low memory footprint
- **Ecosystem**: Excellent libraries for PostGIS (pgx), WebSockets (gorilla/websocket), JWT auth

**Why Railway?**
- **Excellent Go Support**: Native Go buildpack, fast deploys
- **PostgreSQL Add-on**: Easy database provisioning (though we'll use Supabase)
- **Environment Management**: Easy staging/prod separation
- **Cost**: $5/month hobby plan sufficient for MVP, scales as needed
- **CI/CD**: GitHub integration for auto-deploys
- **Observability**: Built-in logs, metrics

**Alternative Considered**: Supabase Edge Functions (Deno)
- ❌ Limited for complex business logic and WebSocket handling
- ❌ Vendor lock-in concerns
- ✅ Use for simple webhooks/triggers only

#### Database: Supabase (PostgreSQL + PostGIS)
**Why Supabase?**
- **PostGIS Native**: Built-in support for geospatial queries (ST_Distance, ST_DWithin)
- **Realtime Built-in**: Postgres CDC → WebSocket subscriptions (saves us building this)
- **Auth Included**: Row-level security (RLS) for multi-tenant data
- **Storage**: S3-compatible storage for user photos
- **Free Tier**: 500MB database, 1GB file storage, 50,000 monthly active users
- **Scale**: Auto-scaling, read replicas, point-in-time recovery on paid plans

**PostGIS Capabilities**:
- Spatial queries: "Find all study spots within 500m of user"
- Distance calculations: "Sort spots by proximity"
- Geofencing: "Notify when friend enters UW campus boundary"
- Spatial indexing: Sub-millisecond queries even with 10,000+ spots

**Alternative Considered**: Railway Postgres + separate Redis
- ❌ More complex (need to build realtime ourselves)
- ❌ Higher cost (separate services)
- ❌ More operational overhead

#### Frontend: React Native + Expo
**Why React Native?**
- **Cross-Platform**: Single codebase for iOS + Android (vs building twice)
- **Developer Experience**: Hot reload, mature ecosystem
- **Talent Pool**: Easier to hire React developers than native iOS/Android
- **Performance**: Near-native performance for our use case (mostly UI + maps)

**Why Expo?**
- **Managed Workflow**: No need to manage native code initially
- **OTA Updates**: Push updates without App Store review (critical for fast iteration)
- **Built-in Services**: Expo Push Notifications, Expo Location (saves integration time)
- **Development Speed**: 3-5x faster development than pure React Native
- **EAS Build**: Cloud build service (no need for Mac for iOS builds)

**Expo Router**: File-based routing (like Next.js), excellent for scaling app structure

**UI Framework**: NativeWind (Tailwind for RN)
- Minimalist, utility-first approach
- Consistent with modern web practices
- Easy to theme and customize
- Fast development iteration

---

## Data Models (Core Entities)

### Users
```sql
- id (uuid, pk)
- email (unique)
- username (unique, 3-20 chars)
- full_name
- avatar_url
- university_id (fk → universities)
- graduation_year
- major
- preferences (jsonb): { noise_tolerance, preferred_hours, outlet_required }
- created_at, updated_at
```

### Spots
```sql
- id (uuid, pk)
- name (e.g., "Odegaard 4th Floor East")
- location (geography, PostGIS POINT)
- building_id (fk → buildings)
- spot_type (enum: library, lounge, cafe, outdoor, classroom)
- capacity (int, estimated max capacity)
- current_occupancy (int, real-time count)
- amenities (jsonb): { outlets, whiteboard, natural_light, noise_level }
- hours (jsonb): { monday: ["8:00-22:00"], ... }
- is_verified (bool, manually verified by admin)
- avg_rating (decimal)
- photo_urls (text[])
- created_at, updated_at
- created_by (fk → users, crowdsourced spots)
```

### Occupancy_Logs (Time-series data)
```sql
- id (uuid, pk)
- spot_id (fk → spots)
- user_id (fk → users)
- timestamp (timestamptz)
- status (enum: checked_in, checked_out, present)
- location_accuracy (decimal, meters)
- session_duration (interval, calculated on checkout)

Indexes:
- (spot_id, timestamp DESC) for recent occupancy queries
- (user_id, timestamp DESC) for user history
```

### Friendships
```sql
- id (uuid, pk)
- user_id (fk → users)
- friend_id (fk → users)
- status (enum: pending, accepted, blocked)
- created_at
- updated_at

Constraints:
- Unique (user_id, friend_id)
- Check: user_id != friend_id
```

### Spot_Save_Requests
```sql
- id (uuid, pk)
- requester_id (fk → users)
- saver_id (fk → users)
- spot_id (fk → spots)
- status (enum: pending, accepted, declined, expired)
- message (text, optional)
- requested_at (timestamptz)
- expires_at (timestamptz, default +30 min)
- responded_at (timestamptz)
```

### Reviews
```sql
- id (uuid, pk)
- spot_id (fk → spots)
- user_id (fk → users)
- rating (int, 1-5)
- noise_rating (int, 1-5)
- outlet_rating (int, 1-5)
- lighting_rating (int, 1-5)
- comment (text)
- photos (text[])
- helpful_count (int, upvotes)
- created_at, updated_at
```

---

## Security & Privacy

### Authentication & Authorization
- **JWT-based auth**: Supabase Auth (email/password + Google OAuth for UW students)
- **Row-Level Security (RLS)**: PostgreSQL policies ensure users only see authorized data
- **API Rate Limiting**: Golang middleware (100 req/min per user, 1000/min per IP)
- **Session Management**: Refresh tokens, 7-day access token expiry

### Privacy Considerations
- **Location Data**:
  - Only collected when app is active and user is on campus
  - Aggregated for occupancy (not individual user locations shown)
  - Location history auto-deleted after 30 days (GDPR compliance)
  - Users can opt-out of occupancy tracking (but lose some features)

- **Friend Visibility**:
  - Users control who can see their current location
  - Three modes: Everyone, Friends Only, No One
  - Ghost mode: Use app without sharing location

- **Data Retention**:
  - Personal data deleted within 30 days of account deletion
  - Anonymized analytics retained for product improvement
  - FERPA compliant (educational records protection)

### Security Best Practices
- **HTTPS only**: TLS 1.3 for all API communication
- **Input Validation**: Sanitize all user inputs (SQL injection prevention)
- **Secrets Management**: Environment variables, never hardcoded
- **Regular Audits**: Quarterly security reviews
- **Dependency Scanning**: Automated CVE scanning in CI/CD

---

## Scalability & Performance

### Initial Scale (Year 1)
- **Target Users**: 10,000 MAU (UW only)
- **Peak Load**: 2,000 concurrent users (finals week, 2pm-4pm)
- **API Requests**: ~100,000/day (50/day per MAU)
- **Database**: < 10GB (mostly occupancy logs)

### Growth Projections (Year 2-3)
- **Year 2**: 50,000 MAU (5 universities)
- **Year 3**: 250,000 MAU (25 universities)

### Scalability Strategy
1. **Database**: 
   - Supabase Pro ($25/mo) handles 100k MAU easily
   - Read replicas for analytics queries
   - Time-series data partitioning (occupancy_logs by month)

2. **Backend**:
   - Railway horizontal scaling (add more instances)
   - Stateless services (easy to load balance)
   - Redis caching for hot spots (top 100 spots)

3. **Frontend**:
   - Expo OTA updates (no app store delays)
   - CDN for static assets (Cloudflare)
   - Image optimization (compress spot photos)

4. **Real-time**:
   - Supabase Realtime channels scale to 10k concurrent connections per channel
   - Shard users by geographic regions if needed

### Performance Targets
- **API Latency**: p95 < 200ms, p99 < 500ms
- **Map Load Time**: < 2 seconds (50 spots visible)
- **Real-time Updates**: < 1 second from occupancy change to UI update
- **App Launch**: Cold start < 3 seconds

---

## Monetization Strategy

### Phase 1: Growth (Year 1)
- **Focus**: User acquisition, engagement, product-market fit
- **Revenue**: $0 (free for all users)
- **Funding**: Pre-seed ($100k-$250k) or bootstrapped

### Phase 2: Freemium (Year 2)
- **Free Tier**: 80% of features (MVP + social)
- **Premium Tier**: $4.99/month or $29.99/year
  - Advanced predictions
  - Analytics dashboard
  - Priority notifications
  - Ad-free
- **Target Conversion**: 5-10% of MAU
- **Revenue**: $250k-$500k ARR at 50k MAU

### Phase 3: B2B (Year 2-3)
- **University Partnerships**: $10k-$50k/year per campus
  - Official data integration
  - White-label option
  - Campus analytics dashboard
  - Student affairs integration

- **Cafe/Venue Partnerships**: $100-$500/month per venue
  - Promoted placement in app
  - Menu integration
  - Student discount coordination

### Phase 4: Expansion (Year 3+)
- **National Scale**: $5M+ ARR at 250k MAU
- **Series A Funding**: $3-$7M to accelerate growth
- **Additional Revenue Streams**:
  - Study supplies/snacks delivery partnership
  - Textbook rental integration
  - Tutoring marketplace integration

---

## Success Metrics (KPIs)

### MVP Launch (Month 3)
- ✅ 500 registered users (5% of UW undergrads)
- ✅ 200 DAU (40% retention)
- ✅ 50 verified study spots in database
- ✅ 10,000 occupancy data points/week
- ✅ < 2% crash rate

### Product-Market Fit (Month 6)
- ✅ 3,000 MAU (30% of UW)
- ✅ 1,000 DAU (33% DAU/MAU ratio)
- ✅ 150+ study spots
- ✅ 50+ reviews submitted/week
- ✅ 100+ spot save requests/week
- ✅ NPS score > 40

### Growth (Month 12)
- ✅ 10,000 MAU (at least 1 university fully saturated)
- ✅ 3,500 DAU
- ✅ 300+ study spots
- ✅ 10,000+ check-ins/week
- ✅ 500+ active friend connections
- ✅ NPS score > 50

### Engagement Metrics
- **Session Length**: Avg 5-10 minutes/session
- **Sessions/Day**: Avg 2-3 sessions/user
- **Weekly Retention**: 60%+ (users who return within 7 days)
- **Monthly Retention**: 40%+ (users who return within 30 days)

---

## Risks & Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Location accuracy issues** | High | Medium | Use geofencing + WiFi, require manual check-in as backup |
| **Real-time scalability** | High | Medium | Load test early, use Supabase Realtime (proven at scale) |
| **Battery drain** | Medium | High | Optimize location updates (5-min intervals), background limits |
| **Database costs** | Medium | Low | Partition old data, aggressive caching, monitor usage |

### Market Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low adoption** | Critical | Medium | Focus on UW first (geographic density), viral loops |
| **Privacy concerns** | High | Low | Transparent privacy policy, anonymous mode, minimal data collection |
| **Competition** | Medium | Low | First-mover advantage, social lock-in effects |
| **University pushback** | High | Low | Partner early, demonstrate value, comply with policies |

### Operational Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Moderation needs** | Medium | High | Automated content filtering, report system, community guidelines |
| **Spam/abuse** | Medium | Medium | Rate limiting, reputation system, ban mechanisms |
| **Cost overruns** | Medium | Low | Monitor usage, set alerts, optimize queries |

---

## Go-to-Market Strategy

### Phase 1: UW Campus Launch (Months 1-3)
1. **Pre-Launch** (Month 1):
   - Build waitlist landing page
   - Instagram/TikTok teaser content
   - Partner with 2-3 UW student organizations
   - Recruit 20 beta testers

2. **Soft Launch** (Month 2):
   - Release to 200 beta users
   - Iterate based on feedback
   - Seed initial spot data (top 30 locations)
   - Create UW-specific marketing content

3. **Public Launch** (Month 3):
   - Campus flyering (high-traffic areas)
   - Reddit (r/udub) post + AMA
   - Instagram/TikTok launch campaign
   - Partnership with student newspaper (The Daily)
   - Referral program (invite 3 friends → premium trial)

### Phase 2: UW Scaling (Months 4-6)
- Word-of-mouth growth
- Host "study sessions" at popular spots (IRL events)
- Student ambassador program (5-10 ambassadors)
- Integration with UW student portal (if possible)

### Phase 3: Multi-Campus Expansion (Months 7-12)
- Target: 4-5 additional large universities (UCLA, UC Berkeley, University of Michigan, etc.)
- Playbook approach (replicate UW strategy)
- University-specific customization
- Local student ambassadors at each campus

---

## Development Team (Recommended)

### MVP Phase (Months 1-3)
- **1 Full-Stack Engineer** (You + Cursor AI): 80% of dev work
- **1 Product Designer** (Contract, $3-5k): UI/UX, brand identity
- **5-10 Beta Testers** (Students): Feedback, bug reports

### Growth Phase (Months 4-12)
- **1-2 Full-Stack Engineers**
- **1 Part-Time Designer**
- **1 Growth/Marketing Lead** (Part-time or contract)
- **5-10 Student Ambassadors** (Equity or small stipend)

---

## Legal & Compliance

### Requirements
- **Privacy Policy**: GDPR, CCPA compliant
- **Terms of Service**: User-generated content, acceptable use
- **FERPA Compliance**: Educational records protection
- **Business Entity**: LLC or C-Corp (Delaware)
- **Insurance**: General liability ($1M policy)

### Intellectual Property
- **Trademark**: "havn" name and logo
- **Copyright**: Source code, design assets (MIT license for open-source components)
- **Patents**: Consider provisional patent for unique spot-saving algorithm (optional)

---

## Future Vision (5-Year Horizon)

### Year 3-5: Platform Evolution
1. **Academic Integration**: LMS plugins, study timer tied to productivity tracking
2. **AI Study Assistant**: "Where should I study based on my workflow?"
3. **Cross-Campus Network**: Find study buddies at other universities
4. **Study Spot Marketplace**: Users can "rent" private study rooms peer-to-peer
5. **Corporate Expansion**: Co-working spaces, libraries, cafes in major cities

### Exit Strategy (if VC-funded)
- **Acquisition Target**: Chegg, Course Hero, or education tech company ($50-100M)
- **IPO**: Long-term (5-7 years, $500M+ valuation)
- **Lifestyle Business**: Sustainable $5-10M ARR, remain independent

---

## Conclusion

havn addresses a real, painful problem for millions of students: finding study spaces efficiently. By combining real-time occupancy data with social coordination features, we create a unique value proposition that existing solutions don't offer.

**Key Differentiators**:
1. **Dynamic, not static**: Real-time availability vs. Google Maps' static info
2. **Social-first**: Spot-saving and friend coordination built-in
3. **Crowdsourced discovery**: Uncover hidden gems, not just official spaces
4. **Mobile-optimized**: Native app experience, not a clunky website

**Success Factors**:
- Start focused (UW only, nail product-market fit)
- Build viral loops (referrals, friend invites, social sharing)
- Leverage modern tech (Cursor AI for rapid development, proven stack)
- Think big, start small (MVP in 3 months, then iterate)

With the right execution, havn can become the **default study coordination tool for college students nationwide**.

---

**Next Steps**: See `mvp.md` for detailed development roadmap and `design.md` for technical architecture.


