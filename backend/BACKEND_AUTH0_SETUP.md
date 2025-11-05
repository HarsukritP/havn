# Backend Auth0 Setup Guide

## 🎯 Overview

Your backend needs to verify JWT tokens issued by Auth0. This is separate from the mobile app callback configuration.

## 📋 Steps to Set Up

### 1. Register API in Auth0 Dashboard

1. Go to https://manage.auth0.com/
2. Navigate to **Applications** → **APIs**
3. Click **+ Create API**
4. Enter the following:
   - **Name**: `Havn API`
   - **Identifier**: `https://havn-api` (⚠️ Must match exactly!)
   - **Signing Algorithm**: `RS256`
5. Click **Create**

### 2. Add Required Go Dependencies

```bash
cd /Users/harrypall/Projects/Havn/backend
go get github.com/lestrrat-go/jwx/v2@latest
go mod tidy
```

### 3. Set Environment Variables

#### For Local Development (`.env` file):
```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-rlqpb3p7hzb1ldkr.us.auth0.com
AUTH0_AUDIENCE=https://havn-api

# Keep your existing variables
DATABASE_URL=your_db_url_here
```

#### For Railway (Production):

In Railway dashboard, add these environment variables:
1. Go to your project → Variables tab
2. Add:
   - `AUTH0_DOMAIN` = `dev-rlqpb3p7hzb1ldkr.us.auth0.com`
   - `AUTH0_AUDIENCE` = `https://havn-api`

### 4. Update main.go

Replace the current `middleware.Auth()` with `middleware.Auth0Middleware()`:

```go
// Add after database initialization (around line 50)
// Initialize Auth0
if err := middleware.InitAuth0(); err != nil {
    log.Fatal().Err(err).Msg("Failed to initialize Auth0")
}
log.Info().Msg("Auth0 JWT verification initialized")

// Later in the protected routes section (around line 96)
// Change from:
protected.Use(middleware.Auth())

// To:
protected.Use(middleware.Auth0Middleware())
```

## 🔧 How It Works

### Mobile App → Backend Flow:

1. **User logs in** via Auth0 in mobile app
2. **Auth0 returns JWT token** with:
   - Audience: `https://havn-api`
   - Signature: RS256 (public key cryptography)
   - User ID in `sub` claim
3. **Mobile app sends request** to backend with token in header:
   ```
   Authorization: Bearer eyJhbGc...
   ```
4. **Backend verifies token**:
   - Fetches Auth0's public keys (JWKS)
   - Validates signature
   - Checks audience matches
   - Extracts user ID from `sub` claim
5. **Backend processes request** with authenticated user

### Railway URL?

❌ **NO** - Railway URL does NOT go in Auth0 settings  
✅ **YES** - Auth0 validates tokens using its own public keys

The backend just needs to know:
- Auth0 domain (to fetch public keys)
- Expected audience (to validate tokens)

## 🧪 Testing

### 1. Test Auth0 API Setup

```bash
# Get Auth0's public keys (should return JSON with keys)
curl https://dev-rlqpb3p7hzb1ldkr.us.auth0.com/.well-known/jwks.json
```

### 2. Test Backend Health

```bash
curl https://your-railway-app.railway.app/health
```

### 3. Test Protected Endpoint

From your mobile app after login, the API calls should work automatically!

## 📊 Architecture Diagram

```
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │ 1. Login
       ▼
┌─────────────┐
│   Auth0     │
└──────┬──────┘
       │ 2. Returns JWT Token
       │    Audience: https://havn-api
       │
       ▼
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │ 3. API Request
       │    Authorization: Bearer <token>
       ▼
┌─────────────┐         ┌─────────────┐
│  Railway    │────────▶│   Auth0     │
│  Backend    │   4.    │  Public     │
│             │  Verify │  Keys       │
└──────┬──────┘         └─────────────┘
       │ 5. Process Request
       │    user_id from token
       ▼
    Response
```

## 🔍 Troubleshooting

### "AUTH0_DOMAIN not set"
- Make sure environment variables are set in Railway
- For local: create `.env` file with `AUTH0_DOMAIN`

### "failed to fetch JWKS"
- Check Auth0 domain is correct
- Check internet connectivity from Railway

### "Token audience does not match"
- Verify mobile app has `audience: 'https://havn-api'` in config
- Verify Auth0 API identifier is exactly `https://havn-api`

### "Key not found"
- Auth0 might have rotated keys
- Backend automatically refetches keys on restart

## 🚀 Deployment Checklist

- [ ] Auth0 API created with identifier `https://havn-api`
- [ ] Go dependencies installed (`go get github.com/lestrrat-go/jwx/v2`)
- [ ] `main.go` updated to call `InitAuth0()` and use `Auth0Middleware()`
- [ ] Environment variables set in Railway
- [ ] Backend redeployed to Railway
- [ ] Mobile app can successfully call protected endpoints

## 📚 Resources

- [Auth0 Go Quickstart](https://auth0.com/docs/quickstart/backend/golang)
- [JWT Verification](https://auth0.com/docs/secure/tokens/json-web-tokens/validate-json-web-tokens)
- [Auth0 APIs](https://auth0.com/docs/get-started/apis)

