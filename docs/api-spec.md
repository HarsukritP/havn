# Havn API Specification

## Overview

This document provides the complete API specification for the Havn backend. The API follows RESTful principles with JSON request/response payloads and JWT-based authentication.

**API Version:** v1  
**Base URL (Development):** `http://localhost:8080/api`  
**Base URL (Staging):** `https://staging-api.havn.app/api`  
**Base URL (Production):** `https://api.havn.app/api`

---

## Authentication

### Authentication Method

All authenticated endpoints require a JWT (JSON Web Token) in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle

- **Expiration:** 7 days from issue
- **Refresh:** Not implemented in MVP (re-login required)
- **Storage:** Client stores token in secure storage (AsyncStorage, Keychain)
- **Logout:** Token added to Redis blacklist

### Obtaining a Token

Tokens are obtained via:
1. `POST /api/auth/register` - Returns token on successful registration
2. `POST /api/auth/login` - Returns token on successful login

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response payload specific to endpoint
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional: validation errors, etc.
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE with no response body
- `400 Bad Request` - Invalid request (validation error, missing fields)
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Resource already exists (e.g., duplicate email)
- `422 Unprocessable Entity` - Semantic validation error (e.g., geofence violation)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error (should be rare)

---

## Rate Limiting

### Limits

**Authentication Endpoints:**
- 10 requests per minute per IP address
- Prevents brute-force attacks

**General Endpoints:**
- 100 requests per minute per authenticated user
- WebSocket connections: 5 per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1697265600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Pagination

### Query Parameters

```
GET /api/endpoint?page=2&limit=20
```

- `page` (integer, default: 1) - Page number (1-indexed)
- `limit` (integer, default: 20, max: 100) - Items per page

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "current_page": 2,
      "total_pages": 5,
      "total_items": 94,
      "per_page": 20,
      "has_next": true,
      "has_prev": true
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `INVALID_CREDENTIALS` | Email or password incorrect |
| `UNAUTHORIZED` | Missing or invalid JWT token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource does not exist |
| `ALREADY_EXISTS` | Duplicate resource (e.g., email) |
| `GEOFENCE_VIOLATION` | User too far from location |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error (logged for debugging) |

---

## Endpoints

### Authentication

#### POST /api/auth/register

Create a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecureP@ss123",
  "full_name": "Jane Doe"
}
```

**Validation:**
- `email`: Valid email format, max 255 chars
- `password`: Min 8 chars, must contain uppercase, lowercase, number
- `full_name`: Min 2 chars, max 100 chars

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 0,
      "current_streak": 0,
      "reputation_score": 50.0,
      "email_verified": false,
      "created_at": "2025-10-13T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Account created successfully"
}
```

**Errors:**
- `400` - Validation error
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "password": "Password must be at least 8 characters"
    }
  }
  ```
- `409` - Email already exists
  ```json
  {
    "success": false,
    "error": "An account with this email already exists",
    "code": "ALREADY_EXISTS"
  }
  ```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecureP@ss123",
    "full_name": "Jane Doe"
  }'
```

---

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 125,
      "current_streak": 3,
      "reputation_score": 68.5,
      "email_verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
  ```json
  {
    "success": false,
    "error": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
  ```
- `400` - Missing fields
  ```json
  {
    "success": false,
    "error": "Email and password are required",
    "code": "VALIDATION_ERROR"
  }
  ```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecureP@ss123"
  }'
```

---

#### POST /api/auth/logout

Invalidate JWT token (add to Redis blacklist).

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Errors:**
- `401` - Missing or invalid token

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Study Spots

#### GET /api/spots

Retrieve all study spots or filter by geospatial bounds.

**Request:**
```http
GET /api/spots?lat=37.8719&lng=-122.2585&radius=1000
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `lat` (float, optional): Latitude for center of search
- `lng` (float, optional): Longitude for center of search
- `radius` (integer, optional): Radius in meters (default: 5000, max: 10000)
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Main Library - 2nd Floor",
        "description": "Quiet study area with individual desks",
        "address": "100 University Ave",
        "latitude": 37.8719,
        "longitude": -122.2585,
        "total_capacity": 50,
        "current_available": 12,
        "availability_status": "available",
        "confidence_score": 85.5,
        "last_update_at": "2025-10-13T10:25:00Z",
        "amenities": {
          "wifi": true,
          "outlets": true,
          "printer": true,
          "quiet_zone": true,
          "outdoor": false
        },
        "distance_meters": 450
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "name": "Student Center Lounge",
        "description": "Collaborative study space with group tables",
        "address": "200 Campus Drive",
        "latitude": 37.8725,
        "longitude": -122.2590,
        "total_capacity": 30,
        "current_available": 5,
        "availability_status": "low",
        "confidence_score": 72.0,
        "last_update_at": "2025-10-13T10:20:00Z",
        "amenities": {
          "wifi": true,
          "outlets": true,
          "printer": false,
          "quiet_zone": false,
          "outdoor": false
        },
        "distance_meters": 720
      }
    ],
    "count": 24,
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 24,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Availability Status Values:**
- `available`: >50% capacity available (green)
- `low`: 20-50% capacity available (yellow)
- `full`: <20% capacity available or 0 seats (red)

**cURL Example:**
```bash
curl "http://localhost:8080/api/spots?lat=37.8719&lng=-122.2585&radius=1000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET /api/spots/nearby

Optimized endpoint for "spots near me" (mobile-friendly).

**Request:**
```http
GET /api/spots/nearby?lat=37.8719&lng=-122.2585&radius=500&limit=10
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `lat` (float, required): User's latitude
- `lng` (float, required): User's longitude
- `radius` (integer, optional): Radius in meters (default: 500, max: 2000)
- `limit` (integer, optional): Max results (default: 20, max: 50)

**Response:** Same format as `GET /api/spots`

**Errors:**
- `400` - Missing lat/lng
  ```json
  {
    "success": false,
    "error": "Latitude and longitude are required",
    "code": "VALIDATION_ERROR"
  }
  ```

**cURL Example:**
```bash
curl "http://localhost:8080/api/spots/nearby?lat=37.8719&lng=-122.2585&radius=500" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET /api/spots/:id

Get detailed information about a specific spot.

**Request:**
```http
GET /api/spots/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer YOUR_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Main Library - 2nd Floor",
      "description": "Quiet study area with individual desks",
      "address": "100 University Ave",
      "latitude": 37.8719,
      "longitude": -122.2585,
      "total_capacity": 50,
      "current_available": 12,
      "availability_status": "available",
      "confidence_score": 85.5,
      "last_update_at": "2025-10-13T10:25:00Z",
      "amenities": {
        "wifi": true,
        "outlets": true,
        "printer": true,
        "quiet_zone": true,
        "outdoor": false
      },
      "recent_updates": [
        {
          "seats_available": 12,
          "noise_level": "quiet",
          "updated_at": "2025-10-13T10:25:00Z",
          "updated_by": "Anonymous"
        },
        {
          "seats_available": 15,
          "noise_level": "quiet",
          "updated_at": "2025-10-13T10:05:00Z",
          "updated_by": "Anonymous"
        },
        {
          "seats_available": 18,
          "noise_level": "quiet",
          "updated_at": "2025-10-13T09:45:00Z",
          "updated_by": "Anonymous"
        }
      ],
      "occupancy_history": [
        {
          "hour": 9,
          "avg_available": 18,
          "avg_occupancy_percent": 64
        },
        {
          "hour": 10,
          "avg_available": 12,
          "avg_occupancy_percent": 76
        },
        {
          "hour": 11,
          "avg_available": 8,
          "avg_occupancy_percent": 84
        }
      ]
    }
  }
}
```

**Errors:**
- `404` - Spot not found
  ```json
  {
    "success": false,
    "error": "Spot not found",
    "code": "NOT_FOUND"
  }
  ```

**cURL Example:**
```bash
curl http://localhost:8080/api/spots/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### POST /api/spots/:id/update

Submit an availability update for a spot.

**Request:**
```http
POST /api/spots/123e4567-e89b-12d3-a456-426614174000/update
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "seats_available": 12,
  "noise_level": "quiet",
  "photo_url": "https://s3.amazonaws.com/havn/photos/abc123.jpg",
  "user_latitude": 37.8720,
  "user_longitude": -122.2586
}
```

**Request Body:**
- `seats_available` (integer, required): Number of seats available (0 to spot capacity)
- `noise_level` (string, optional): One of `quiet`, `moderate`, `loud`
- `photo_url` (string, optional): URL to uploaded photo (upload happens separately)
- `user_latitude` (float, required): User's current latitude
- `user_longitude` (float, required): User's current longitude

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "update": {
      "id": "update-uuid-here",
      "spot_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "seats_available": 12,
      "noise_level": "quiet",
      "confidence_score": 95.0,
      "distance_from_spot": 45.2,
      "created_at": "2025-10-13T10:30:00Z"
    },
    "rewards": {
      "points_earned": 5,
      "accuracy_bonus": 2,
      "total_points_earned": 7,
      "user_total_points": 132,
      "streak_updated": true,
      "current_streak": 4
    },
    "spot_updated": {
      "current_available": 12,
      "availability_status": "available",
      "confidence_score": 95.0
    }
  },
  "message": "Thanks for helping the community! +7 points"
}
```

**Business Logic:**
1. Validate user is authenticated
2. Validate spot exists
3. Calculate distance between user and spot (using PostGIS)
4. **Geofence check:** User must be within 100m of spot
5. Validate seats_available <= spot capacity
6. Check rate limit (max 1 update per spot per 5 minutes per user)
7. Insert update into `spot_updates` table
8. Calculate confidence score based on:
   - User reputation score
   - Recency (100% confidence)
   - Consistency with recent updates
9. Update `study_spots.current_available` and `last_update_at`
10. Invalidate Redis cache for this spot
11. Award points to user:
    - Base: 5 points
    - Accuracy bonus: +2 points if update aligns with recent consensus
12. Update user streak if new day
13. Broadcast update via WebSocket (Redis pub/sub)

**Errors:**
- `400` - Validation error
  ```json
  {
    "success": false,
    "error": "Seats available cannot exceed total capacity (50)",
    "code": "VALIDATION_ERROR"
  }
  ```
- `422` - Geofence violation
  ```json
  {
    "success": false,
    "error": "You must be within 100m of the spot to submit an update. You are currently 450m away.",
    "code": "GEOFENCE_VIOLATION",
    "details": {
      "distance_meters": 450,
      "max_distance_meters": 100
    }
  }
  ```
- `429` - Rate limit exceeded
  ```json
  {
    "success": false,
    "error": "You can only update this spot once every 5 minutes. Please try again in 3 minutes.",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "retry_after_seconds": 180
    }
  }
  ```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/spots/123e4567-e89b-12d3-a456-426614174000/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seats_available": 12,
    "noise_level": "quiet",
    "user_latitude": 37.8720,
    "user_longitude": -122.2586
  }'
```

---

### Users

#### GET /api/users/me

Get current user's profile and stats.

**Request:**
```http
GET /api/users/me
Authorization: Bearer YOUR_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "full_name": "Jane Doe",
      "total_points": 132,
      "current_streak": 4,
      "reputation_score": 72.5,
      "email_verified": false,
      "created_at": "2025-10-01T08:00:00Z",
      "last_login_at": "2025-10-13T10:00:00Z"
    },
    "stats": {
      "total_check_ins": 26,
      "check_ins_this_week": 8,
      "check_ins_today": 2,
      "accuracy_rate": 92.3,
      "rank_percentile": 15,
      "favorite_spots": [
        {
          "spot_id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Main Library - 2nd Floor",
          "check_in_count": 12
        }
      ],
      "achievements_unlocked": 3,
      "achievements": [
        {
          "id": "achievement-uuid",
          "name": "First Check-In",
          "description": "Submit your first availability update",
          "icon_url": "https://cdn.havn.app/badges/first-checkin.png",
          "unlocked_at": "2025-10-01T09:30:00Z"
        }
      ]
    }
  }
}
```

**Errors:**
- `401` - Unauthorized (invalid or missing token)

**cURL Example:**
```bash
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### PATCH /api/users/me

Update current user's profile.

**Request:**
```http
PATCH /api/users/me
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "email": "new-email@university.edu"
}
```

**Request Body (all fields optional):**
- `full_name` (string): New full name
- `email` (string): New email (must be unique, triggers re-verification)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "new-email@university.edu",
      "full_name": "Jane Smith",
      "email_verified": false,
      "updated_at": "2025-10-13T10:35:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

**Errors:**
- `409` - Email already in use
- `400` - Validation error

---

#### GET /api/users/leaderboard

Get top users by points (weekly or all-time).

**Request:**
```http
GET /api/users/leaderboard?period=weekly&limit=10
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `period` (string, optional): `weekly` or `all_time` (default: `weekly`)
- `limit` (integer, optional): Number of users (default: 10, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "user-uuid-1",
        "full_name": "John S.",
        "points": 450,
        "check_ins": 90,
        "reputation_score": 85.2
      },
      {
        "rank": 2,
        "user_id": "user-uuid-2",
        "full_name": "Sarah T.",
        "points": 380,
        "check_ins": 76,
        "reputation_score": 78.5
      },
      {
        "rank": 3,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "Jane D.",
        "points": 132,
        "check_ins": 26,
        "reputation_score": 72.5,
        "is_current_user": true
      }
    ],
    "your_rank": 3,
    "your_points": 132,
    "period": "weekly",
    "total_participants": 247
  }
}
```

**Notes:**
- Names are partially obscured for privacy ("John S." instead of "John Smith")
- `is_current_user` flag indicates the authenticated user in the list
- `your_rank` shows authenticated user's rank even if not in top N

**cURL Example:**
```bash
curl "http://localhost:8080/api/users/leaderboard?period=weekly&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET /api/users/:id/stats

Get public stats for any user (limited info for privacy).

**Request:**
```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000/stats
Authorization: Bearer YOUR_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "Jane D.",
      "reputation_score": 72.5,
      "joined_at": "2025-10-01T08:00:00Z"
    },
    "stats": {
      "total_check_ins": 26,
      "current_streak": 4,
      "rank_percentile": 15,
      "achievements_unlocked": 3
    }
  }
}
```

**Notes:**
- Email address is not exposed (privacy)
- Only public stats are shown

---

### Health & Utility

#### GET /api/health

Health check endpoint (no authentication required).

**Request:**
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-10-13T10:30:00Z",
    "uptime_seconds": 86400,
    "services": {
      "database": "healthy",
      "redis": "healthy"
    }
  }
}
```

**Use Case:**
- Monitoring/uptime checks
- Load balancer health checks
- Development debugging

---

## WebSocket Protocol

### Connection

**URL:** `ws://localhost:8080/ws` (dev) or `wss://api.havn.app/ws` (prod)

**Connection Flow:**
1. Client opens WebSocket connection
2. Server sends `connection_established` message
3. Client sends `auth` message with JWT token
4. Server validates token and sends `auth_success` or `auth_error`
5. Client subscribes to geographic regions
6. Server broadcasts spot updates to subscribed clients

---

### Message Format

All messages are JSON objects with a `type` field.

---

### Client → Server Messages

#### 1. Authentication

**Message:**
```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Server Response (Success):**
```json
{
  "type": "auth_success",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Authenticated successfully"
}
```

**Server Response (Error):**
```json
{
  "type": "auth_error",
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**Notes:**
- Must send within 10 seconds of connection or server will close connection
- Connection is unauthenticated until auth succeeds

---

#### 2. Subscribe to Region

Subscribe to spot updates within a geographic bounding box.

**Message:**
```json
{
  "type": "subscribe",
  "bounds": {
    "north": 37.8750,
    "south": 37.8690,
    "east": -122.2550,
    "west": -122.2620
  }
}
```

**Server Response:**
```json
{
  "type": "subscribed",
  "region_id": "geohash_9q8yy",
  "spot_count": 12,
  "message": "Subscribed to region with 12 spots"
}
```

**Notes:**
- Client should subscribe when map viewport changes
- Server converts bounds to geohash for efficient pub/sub
- Only one subscription per connection (subsequent subscribes replace previous)

---

#### 3. Unsubscribe

Unsubscribe from current region.

**Message:**
```json
{
  "type": "unsubscribe"
}
```

**Server Response:**
```json
{
  "type": "unsubscribed",
  "message": "Unsubscribed from all regions"
}
```

---

#### 4. Ping (Heartbeat)

Keep connection alive.

**Message:**
```json
{
  "type": "ping"
}
```

**Server Response:**
```json
{
  "type": "pong",
  "timestamp": "2025-10-13T10:30:00Z"
}
```

**Notes:**
- Client should send ping every 30 seconds
- Server closes connection if no message received in 60 seconds

---

### Server → Client Messages

#### 1. Connection Established

Sent immediately after WebSocket connection opens.

**Message:**
```json
{
  "type": "connection_established",
  "message": "Welcome to Havn WebSocket API",
  "version": "1.0.0"
}
```

---

#### 2. Spot Update

Broadcast when someone submits an availability update for a spot in the subscribed region.

**Message:**
```json
{
  "type": "spot_update",
  "data": {
    "spot_id": "123e4567-e89b-12d3-a456-426614174000",
    "current_available": 12,
    "total_capacity": 50,
    "availability_status": "available",
    "confidence_score": 95.0,
    "last_update_at": "2025-10-13T10:30:00Z",
    "noise_level": "quiet"
  },
  "timestamp": "2025-10-13T10:30:00Z"
}
```

**Client Action:**
- Update map marker color/state
- Update spot detail if user is viewing that spot
- Show subtle notification (optional)

---

#### 3. Spot Reservation Request (Phase 2)

Broadcast to users at a spot when someone requests a saved seat.

**Message:**
```json
{
  "type": "reservation_request",
  "data": {
    "request_id": "request-uuid",
    "spot_id": "123e4567-e89b-12d3-a456-426614174000",
    "spot_name": "Main Library - 2nd Floor",
    "requester_name": "John S.",
    "estimated_arrival_minutes": 8,
    "points_reward": 15,
    "expires_at": "2025-10-13T10:32:00Z"
  },
  "timestamp": "2025-10-13T10:30:00Z"
}
```

**Client Action:**
- Show push notification
- Show in-app modal (if app is open)

---

#### 4. Error

Server error (e.g., invalid message format).

**Message:**
```json
{
  "type": "error",
  "error": "Invalid message format",
  "code": "INVALID_MESSAGE"
}
```

---

### WebSocket Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication failed or token expired |
| `INVALID_MESSAGE` | Message format is invalid (missing fields, wrong types) |
| `SUBSCRIPTION_ERROR` | Failed to subscribe to region (invalid bounds) |
| `RATE_LIMIT_EXCEEDED` | Too many messages sent (max 10/second) |

---

### Reconnection Strategy (Client)

**Client should implement:**
1. **Exponential Backoff:** On disconnect, wait 1s, 2s, 4s, 8s, 16s (max 30s) before reconnecting
2. **Re-authenticate:** Send auth message immediately after reconnection
3. **Re-subscribe:** Send subscribe message with current map bounds
4. **Optimistic Updates:** Don't wait for WebSocket; show updates optimistically from API responses

---

### Redis Pub/Sub Architecture

**Backend Implementation:**

1. **Geohashing:** Convert spot location to geohash (precision 6: ~1.2km square)
   - Example: `9q8yy9` for a spot at (37.8719, -122.2585)

2. **Redis Channels:**
   - `spot_updates:9q8yy9` - Updates for geohash region
   - `global_events` - System-wide announcements

3. **Publishing Updates:**
   ```go
   // When user submits update
   geohash := calculateGeohash(spot.Latitude, spot.Longitude, 6)
   channel := fmt.Sprintf("spot_updates:%s", geohash)
   message := json.Marshal(updateData)
   redisClient.Publish(ctx, channel, message)
   ```

4. **Subscribing to Updates:**
   ```go
   // When WebSocket client subscribes
   geohash := calculateGeohash(bounds.Center.Lat, bounds.Center.Lng, 6)
   channel := fmt.Sprintf("spot_updates:%s", geohash)
   subscription := redisClient.Subscribe(ctx, channel)
   
   // Forward messages to WebSocket client
   for msg := range subscription.Channel() {
       websocketConn.WriteJSON(msg.Payload)
   }
   ```

**Horizontal Scaling:**
- Multiple backend servers can handle WebSocket connections
- Redis pub/sub ensures all servers receive updates
- Each server broadcasts to its connected clients

---

## Example Workflows

### Workflow 1: User Registration and First Check-In

1. **Register:**
   ```
   POST /api/auth/register
   → Returns JWT token
   ```

2. **Fetch Nearby Spots:**
   ```
   GET /api/spots/nearby?lat=37.8719&lng=-122.2585&radius=500
   → Returns list of spots with availability
   ```

3. **View Spot Details:**
   ```
   GET /api/spots/123e4567...
   → Returns full spot info
   ```

4. **Submit Check-In:**
   ```
   POST /api/spots/123e4567.../update
   Body: { seats_available: 12, user_latitude: 37.8720, user_longitude: -122.2586 }
   → Awards +5 points, updates spot availability
   ```

5. **View Updated Profile:**
   ```
   GET /api/users/me
   → Shows new points total, streak = 1
   ```

---

### Workflow 2: Real-Time Map Updates

1. **Open App, Navigate to Map Screen:**
   - Fetch spots via API: `GET /api/spots/nearby`
   - Display markers on map

2. **Connect WebSocket:**
   ```
   Open: ws://localhost:8080/ws
   Send: { type: "auth", token: "..." }
   Receive: { type: "auth_success" }
   ```

3. **Subscribe to Map Region:**
   ```
   Send: { type: "subscribe", bounds: { north: 37.8750, south: 37.8690, ... } }
   Receive: { type: "subscribed", region_id: "9q8yy" }
   ```

4. **Receive Real-Time Update:**
   ```
   Receive: {
     type: "spot_update",
     data: { spot_id: "123...", current_available: 8, ... }
   }
   → Update marker color on map (green → yellow if availability dropped)
   ```

5. **User Pans Map (Changes Viewport):**
   ```
   Send: { type: "subscribe", bounds: { new bounds } }
   → Server updates subscription, client receives updates for new region
   ```

---

### Workflow 3: Viewing Leaderboard

1. **Tap Leaderboard Button:**
   ```
   GET /api/users/leaderboard?period=weekly&limit=10
   → Returns top 10 users + your rank
   ```

2. **Tap on Another User:**
   ```
   GET /api/users/{user_id}/stats
   → Returns public stats for that user
   ```

---

## Testing

### Postman Collection

A Postman collection with all endpoints is available at:
```
/backend/docs/Havn.postman_collection.json
```

**Collection includes:**
- All endpoints with example requests
- Environment variables (base_url, jwt_token)
- Pre-request scripts (auto-add auth headers)
- Tests (validate response status, structure)

### Manual Testing Checklist

**Authentication:**
- [ ] Register with valid email → 201 Created
- [ ] Register with duplicate email → 409 Conflict
- [ ] Register with weak password → 400 Validation Error
- [ ] Login with valid credentials → 200 OK + token
- [ ] Login with invalid credentials → 401 Unauthorized
- [ ] Logout → 200 OK, token blacklisted

**Spots:**
- [ ] Fetch spots without auth → 401 Unauthorized
- [ ] Fetch spots with valid token → 200 OK + list
- [ ] Fetch nearby spots with lat/lng → 200 OK + sorted by distance
- [ ] Get spot details → 200 OK + full info
- [ ] Update spot within 100m → 200 OK + points awarded
- [ ] Update spot >100m away → 422 Geofence Violation
- [ ] Update with seats > capacity → 400 Validation Error
- [ ] Rate limit: 2 updates in 5 min → 429 Rate Limit

**Users:**
- [ ] Get own profile → 200 OK + stats
- [ ] Update profile → 200 OK + updated fields
- [ ] Fetch leaderboard → 200 OK + top users

**WebSocket:**
- [ ] Connect → connection_established
- [ ] Auth with valid token → auth_success
- [ ] Auth with invalid token → auth_error + connection closed
- [ ] Subscribe to region → subscribed
- [ ] Submit update via API → spot_update broadcast received
- [ ] Ping → pong

---

## Security Considerations

### 1. SQL Injection Prevention
- **Prepared Statements:** All database queries use parameterized statements
- **ORM:** Consider using GORM for automatic escaping

### 2. XSS Prevention
- **Input Validation:** Sanitize all user inputs
- **Output Encoding:** JSON responses are automatically escaped

### 3. Rate Limiting
- **Redis-Based:** Track requests per user/IP in Redis with TTL
- **Sliding Window:** More accurate than fixed window

### 4. CORS
- **Allowed Origins:** Only allow known frontend domains (not `*`)
- **Credentials:** Allow credentials (cookies, auth headers)

### 5. JWT Security
- **Secret Key:** Strong secret (256-bit minimum), stored in env var
- **Expiration:** 7-day expiry (re-login required)
- **Blacklist:** Logout adds token to Redis blacklist

### 6. HTTPS
- **Production:** All API calls must use HTTPS (TLS 1.3)
- **Development:** HTTP allowed for localhost only

### 7. Geolocation Privacy
- **No Storage:** Don't store user location history (only current update location for geofencing)
- **Anonymization:** Don't expose who submitted an update

---

## Versioning

### API Version Strategy

**Current:** v1 (implicit, no version in URL)  
**Future:** v2 will use `/api/v2/...` prefix

**Breaking Changes:**
- Require new version (e.g., `/api/v2/spots`)
- Maintain v1 for 6 months after v2 launch
- Announce deprecation 3 months in advance

**Non-Breaking Changes:**
- Add new fields to responses
- Add new optional parameters
- Add new endpoints
- Can be deployed to v1 without version bump

---

## Changelog

### v1.0.0 (MVP)
- Initial API release
- Authentication (register, login, logout)
- Study spots (list, detail, update)
- User profile and leaderboard
- WebSocket real-time updates

### Future Versions

**v1.1.0 (Phase 2):**
- Spot reservation endpoints (save seats)
- Push notification support
- Photo upload endpoint (S3 integration)

**v1.2.0 (Phase 3):**
- Study matching endpoints
- Session tracking
- Analytics endpoints

---

**Last Updated:** October 13, 2025  
**Version:** 1.0 (Pre-Development)  
**Status:** Documentation Phase

