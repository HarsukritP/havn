# SpotSave 🎯

> Know exactly where to go, every time.

SpotSave is a mobile-first platform that solves the campus study spot discovery problem. Students waste 15-30 minutes wandering campus looking for available study spots. SpotSave provides real-time, crowdsourced availability data via an interactive map, enabling students to know exactly where to go before leaving their current location.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Core Features

- **Live Availability Map** - See real-time seat availability for all campus study spots
- **Crowdsourced Updates** - Students check-in to update availability, earning points
- **Spot-Saving** - Save seats for friends arriving soon (peer-to-peer reservations)
- **Gamification** - Points, streaks, achievements, and leaderboards
- **Smart Predictions** - ML-powered occupancy predictions (Phase 2)

## 📱 Tech Stack

### Backend
- **Go 1.21+** - High-performance, concurrent backend
- **Gin** - Fast HTTP web framework
- **PostgreSQL 15+** with PostGIS - Geospatial database
- **Redis 7+** - Caching, pub/sub, rate limiting
- **WebSockets** - Real-time updates (via gorilla/websocket)
- **JWT** - Authentication

### Frontend
- **React Native 0.73+** - Cross-platform mobile app
- **TypeScript 5+** - Type-safe development
- **Gluestack UI v2** - Production-grade component library
- **React Query v5** - Server state management
- **react-native-maps** - Interactive maps
- **Reanimated v3** - 60fps animations
- **Expo Haptics** - Tactile feedback

### Infrastructure
- **Docker** - Containerization
- **Fly.io/AWS** - Deployment
- **Sentry** - Error tracking
- **Mixpanel** - Analytics

## 📂 Project Structure

```
SpotSaver/
├── backend/              # Go backend API
│   ├── cmd/              # Entry points
│   ├── internal/         # Private application code
│   │   ├── handlers/     # HTTP request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Gin middleware
│   │   └── websocket/    # WebSocket server
│   ├── migrations/       # Database migrations
│   └── Dockerfile
├── mobile/               # React Native mobile app
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API layer
│   │   ├── hooks/        # Custom hooks
│   │   └── navigation/   # Navigation config
│   └── package.json
├── docs/                 # Comprehensive documentation
│   ├── projectscope.md   # Project vision & technical overview
│   ├── mvp.md            # 4-week development roadmap
│   ├── design.md         # UI/UX specifications
│   ├── api-spec.md       # Complete API reference
│   └── ui-enhancement-summary.md
└── docker-compose.yml    # Local development setup
```

## 🏃 Quick Start

### Prerequisites

- **Go 1.21+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **PostgreSQL 15+**
- **Redis 7+**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
go mod download

# Start PostgreSQL and Redis (via Docker)
docker-compose up -d

# Run database migrations
make migrate-up

# Start development server
go run cmd/server/main.go
```

Backend will be available at `http://localhost:8080`

### Frontend Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Project Scope](docs/projectscope.md)** - Vision, technical stack, success metrics
- **[MVP Roadmap](docs/mvp.md)** - Week-by-week development plan, database schema, API endpoints
- **[Design Specifications](docs/design.md)** - UI/UX guidelines, component patterns, ASCII mockups
- **[API Reference](docs/api-spec.md)** - Complete endpoint documentation, WebSocket protocol
- **[UI Enhancement Summary](docs/ui-enhancement-summary.md)** - Animation specs, haptic patterns, component library

## 🎯 MVP Milestones (4 Weeks)

### Week 1: Backend Foundation
- [x] Documentation complete
- [ ] Project setup (Go + PostgreSQL + Redis + Docker)
- [ ] Database schema and migrations
- [ ] Authentication (register, login, JWT)
- [ ] Basic spot endpoints

### Week 2: Frontend Foundation
- [ ] React Native project setup
- [ ] Navigation structure
- [ ] Login/Register screens
- [ ] Map view with markers

### Week 3: Core Functionality
- [ ] Spot update endpoint with geofencing
- [ ] Check-in modal (frontend)
- [ ] Gamification (points, streaks)
- [ ] Real-time WebSocket updates

### Week 4: Polish & Launch
- [ ] Performance optimization
- [ ] Beta testing (10-20 users)
- [ ] Bug fixes and UX improvements
- [ ] Production deployment

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Geofencing** - Validate users are within 100m of spots
- **Rate Limiting** - Prevent abuse (100 req/min per user)
- **Input Validation** - Sanitize all user inputs
- **HTTPS Only** - TLS 1.3 in production
- **Privacy-First** - No location history stored

## 🧪 Testing

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd mobile
npm test

# E2E tests (Detox - Phase 2)
npm run test:e2e
```

## 📊 Success Metrics

### MVP Targets (Week 4)
- **500+ users** (5% of campus)
- **100+ DAU** (20% active daily)
- **1,000+ weekly check-ins**
- **80%+ data accuracy**
- **<2s app launch time**

### Scale Targets (Month 3-6)
- **5,000+ users** (50% campus penetration)
- **1,000+ DAU**
- **50+ daily spot-saves**
- **90%+ data accuracy**
- **$2,000+ MRR** (premium subscribers)

## 🤝 Contributing

This is currently a private project in active development. Contributions will be welcome after MVP launch.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 👥 Team

- **Harry Pall** - Full-Stack Developer

## 🔗 Links

- **Production:** Coming soon
- **Staging:** Coming soon
- **Documentation:** [/docs](/docs)
- **API Docs:** [/docs/api-spec.md](/docs/api-spec.md)

---

**Built with ❤️ for students, by students.**

*Last Updated: October 13, 2025*

