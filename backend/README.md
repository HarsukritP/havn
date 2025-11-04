# havn Backend API

Go backend for the havn campus study spot finder app.

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin (HTTP server)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Deployment**: Railway

## Setup

1. Install Go 1.21+
2. Install dependencies:
   ```bash
   go mod download
   ```

3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Run the server:
   ```bash
   go run cmd/api/main.go
   ```

## Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── handlers/             # HTTP request handlers
│   ├── services/             # Business logic
│   ├── models/               # Data models
│   └── middleware/           # HTTP middleware (auth, CORS, etc.)
├── pkg/
│   ├── database/             # Database connection
│   └── auth/                 # Auth utilities
└── config/                   # Configuration files
```

## API Endpoints

### Public
- `GET /health` - Health check
- `POST /api/v1/auth/signup` - User registration (proxies to Supabase)
- `POST /api/v1/auth/login` - User login (proxies to Supabase)

### Protected (require JWT token)
- `GET /api/v1/spots` - Get nearby spots
- `GET /api/v1/spots/:id` - Get spot details
- `POST /api/v1/occupancy/checkin` - Check in to a spot
- `POST /api/v1/occupancy/checkout` - Check out from current spot
- `GET /api/v1/users/search` - Search for users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/friends` - Get friends list
- `POST /api/v1/friends/request` - Send friend request
- `POST /api/v1/friends/respond` - Respond to friend request
- `GET /api/v1/spot-saves` - Get spot save requests
- `POST /api/v1/spot-saves/request` - Request spot save
- `POST /api/v1/spot-saves/respond` - Respond to spot save request

## Development

Build the binary:
```bash
go build -o main cmd/api/main.go
```

Run tests:
```bash
go test ./...
```

## Deployment

### Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Set environment variables via Railway dashboard
5. Deploy: `railway up`

The server will start on the port specified by the `PORT` environment variable (default: 8080).

