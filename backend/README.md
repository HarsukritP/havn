# Havn Backend API

Go backend API for Havn - Real-time study spot availability platform.

## Tech Stack

- **Go 1.21+** - High-performance, concurrent backend
- **Gin** - Fast HTTP web framework
- **PostgreSQL 15+** with PostGIS - Geospatial database
- **Redis 7+** - Caching, session storage, pub/sub
- **WebSockets** - Real-time updates (gorilla/websocket)
- **JWT** - Token-based authentication

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── database/                # Database connection
│   │   └── postgres.go
│   ├── handlers/                # HTTP request handlers
│   │   ├── auth_handler.go      # Authentication endpoints
│   │   ├── spot_handler.go      # Spot endpoints
│   │   ├── user_handler.go      # User endpoints
│   │   ├── websocket_handler.go # WebSocket connections
│   │   └── health.go            # Health check
│   ├── middleware/              # Gin middleware
│   │   ├── auth.go              # JWT authentication
│   │   ├── cors.go              # CORS configuration
│   │   ├── rate_limit.go        # Rate limiting (Redis)
│   │   └── logger.go            # Request logging
│   ├── models/                  # Data models
│   │   ├── user.go              # User model
│   │   ├── spot.go              # Spot model
│   │   └── response.go          # API response types
│   ├── services/                # Business logic
│   │   ├── auth_service.go      # Authentication logic
│   │   ├── spot_service.go      # Spot management
│   │   └── user_service.go      # User management
│   └── websocket/               # WebSocket server
│       ├── hub.go               # WebSocket hub
│       └── client.go            # WebSocket client
├── migrations/                  # Database migrations
│   ├── 001_create_users.up.sql
│   ├── 002_create_study_spots.up.sql
│   └── 003_create_spot_updates.up.sql
├── Dockerfile                   # Production Docker image
├── Makefile                     # Development commands
└── go.mod                       # Go dependencies
```

## Quick Start

### Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/HarsukritP/havn.git
cd havn/backend
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker Compose
make docker-up
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=8080
GIN_MODE=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=havn
DB_PASSWORD=havn_dev
DB_NAME=havn_dev
DB_SSLMODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_HOURS=168
```

### 4. Run Database Migrations

```bash
# Install golang-migrate (if not already installed)
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path migrations \
  -database "postgresql://havn:havn_dev@localhost:5432/havn_dev?sslmode=disable" \
  up
```

### 5. Install Dependencies

```bash
go mod download
```

### 6. Run the Server

```bash
# Using Makefile
make run

# Or directly with go
go run cmd/server/main.go
```

Server will start on `http://localhost:8080`

## API Endpoints

### Health Check

```bash
GET /api/health
```

### Authentication

```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
POST /api/auth/logout      # Logout (requires auth)
```

### Spots

```bash
GET  /api/spots            # Get all spots
GET  /api/spots/nearby     # Get nearby spots (requires lat, lng)
GET  /api/spots/:id        # Get spot by ID
POST /api/spots/:id/update # Update spot availability (requires auth)
```

### Users

```bash
GET   /api/users/me          # Get current user profile (requires auth)
PATCH /api/users/me          # Update current user (requires auth)
GET   /api/users/leaderboard # Get leaderboard
GET   /api/users/:id/stats   # Get user public stats
```

### WebSocket

```
ws://localhost:8080/ws       # WebSocket connection for real-time updates
```

## Example Requests

### Register User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecureP@ss123",
    "full_name": "Jane Doe"
  }'
```

### Get Nearby Spots

```bash
curl "http://localhost:8080/api/spots/nearby?lat=37.8719&lng=-122.2585&radius=1000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Spot Availability

```bash
curl -X POST http://localhost:8080/api/spots/SPOT_ID/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seats_available": 12,
    "noise_level": "quiet",
    "user_latitude": 37.8720,
    "user_longitude": -122.2586
  }'
```

## Development Commands

```bash
# Start PostgreSQL and Redis
make docker-up

# Stop Docker services
make docker-down

# Run the server
make run

# Build the binary
make build

# Run tests
make test

# Clean build artifacts
make clean

# Run linter (requires golangci-lint)
make lint
```

## Database Migrations

### Run Migrations

```bash
migrate -path migrations \
  -database "postgresql://havn:havn_dev@localhost:5432/havn_dev?sslmode=disable" \
  up
```

### Rollback Migrations

```bash
migrate -path migrations \
  -database "postgresql://havn:havn_dev@localhost:5432/havn_dev?sslmode=disable" \
  down 1
```

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests verbosely
go test -v ./...
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t havn-backend .
```

### Run with Docker

```bash
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e REDIS_HOST=host.docker.internal \
  havn-backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `GIN_MODE` | Gin mode (debug/release) | `debug` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `havn` |
| `DB_PASSWORD` | Database password | `havn_dev` |
| `DB_NAME` | Database name | `havn_dev` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRY_HOURS` | Token expiry time | `168` (7 days) |

## Security

- **JWT Authentication:** Tokens expire after 7 days
- **Password Hashing:** bcrypt with default cost (10)
- **Rate Limiting:** 100 requests/minute per IP
- **CORS:** Configured for all origins (update in production)
- **Geofencing:** Users must be within 100m to update spots
- **Input Validation:** All endpoints validate input

## Performance

- **Response Time:** <200ms median (p95 target)
- **WebSocket Connections:** Supports 100+ concurrent connections
- **Database Queries:** Optimized with indexes
- **Redis Caching:** Reduces database load

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connection
psql -h localhost -U havn -d havn_dev
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
redis-cli ping
```

### Migration Errors

```bash
# Check migration version
migrate -path migrations \
  -database "postgresql://..." \
  version

# Force migration version (use with caution)
migrate -path migrations \
  -database "postgresql://..." \
  force VERSION
```

## Documentation

- **API Specification:** See `/docs/api-spec.md`
- **Project Scope:** See `/docs/projectscope.md`
- **MVP Roadmap:** See `/docs/mvp.md`

## License

MIT License - See LICENSE for details

---

**Built with ❤️ for students, by students.**

