# Environment Variables Setup Guide

## 🎯 Understanding the Architecture

```
┌─────────────────────┐        ┌──────────────────────┐
│   Mobile App        │───────▶│   Backend API        │
│  (User's Phone)     │   API  │   (Railway)          │
│                     │ Calls  │                      │
│  Needs:             │        │  Needs:              │
│  - Backend URL      │        │  - Auth0 Domain      │
│  - Auth0 Config     │        │  - Auth0 Audience    │
└─────────────────────┘        │  - Database URL      │
                               └──────────────────────┘
```

**Key Point**: Mobile and backend are SEPARATE applications with SEPARATE environment variables!

---

## 📱 Mobile App Environment Variables

### Where They're Stored:

#### 1. `app.json` - Static Configuration (Best for Production URLs)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://havnapi.up.railway.app/api/v1"
    }
  }
}
```

#### 2. `config/env.ts` - Configuration Logic
- Automatically uses `localhost` in development
- Uses `app.json` values in production
- Can be extended for more environment variables

### How to Use:

```typescript
import { config } from '../config/env';

// In your code:
const apiUrl = config.apiUrl;  // ✅ Automatically correct for dev/prod
```

### For EAS Builds (Advanced):

When building with EAS, you can override values:

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://havnapi.up.railway.app/api/v1"
      }
    },
    "staging": {
      "env": {
        "API_URL": "https://havnapi-staging.railway.app/api/v1"
      }
    }
  }
}
```

---

## 🖥️ Backend Environment Variables

### Local Development (`.env` file):

```bash
# Auth0 Configuration
AUTH0_DOMAIN=dev-rlqpb3p7hzb1ldkr.us.auth0.com
AUTH0_AUDIENCE=https://havn-api

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Environment
ENV=development
PORT=8080
```

### Railway Production:

Set these in Railway Dashboard → Variables tab:

| Variable | Value |
|----------|-------|
| `AUTH0_DOMAIN` | `dev-rlqpb3p7hzb1ldkr.us.auth0.com` |
| `AUTH0_AUDIENCE` | `https://havn-api` |
| `DATABASE_URL` | (Auto-set by Railway) |
| `PORT` | (Auto-set by Railway) |

---

## 🔄 Current Configuration

### Mobile App (`config/env.ts`):

```typescript
export const config = {
  apiUrl: __DEV__ 
    ? 'http://localhost:8080/api/v1'           // ← Local dev
    : 'https://havnapi.up.railway.app/api/v1', // ← Production
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};
```

### Used In (`lib/api.ts`):

```typescript
import { config } from '../config/env';
const API_URL = config.apiUrl; // ✅ No more hardcoding!
```

---

## 🚀 Deployment Workflow

### Mobile App:

1. **Development**:
   ```bash
   npm start
   # Automatically uses localhost:8080
   ```

2. **Production Build**:
   ```bash
   eas build --platform ios
   eas build --platform android
   # Automatically uses havnapi.up.railway.app
   ```

### Backend:

1. **Development**:
   ```bash
   # Create .env file
   ./setup-auth0.sh
   
   # Run locally
   go run cmd/api/main.go
   ```

2. **Production Deploy**:
   ```bash
   git push origin main
   # Railway auto-deploys
   # Uses Railway environment variables
   ```

---

## 🔧 Adding New Environment Variables

### For Mobile App:

1. **Add to `app.json`**:
   ```json
   "extra": {
     "apiUrl": "https://havnapi.up.railway.app/api/v1",
     "newVariable": "value"
   }
   ```

2. **Update `config/env.ts`**:
   ```typescript
   export const config = {
     apiUrl: getApiUrl(),
     newVariable: Constants.expoConfig?.extra?.newVariable || 'default',
   };
   ```

3. **Use anywhere**:
   ```typescript
   import { config } from '../config/env';
   const value = config.newVariable;
   ```

### For Backend:

1. **Add to `.env`** (local):
   ```bash
   NEW_VARIABLE=local_value
   ```

2. **Add to Railway** (production):
   - Dashboard → Variables → + New Variable

3. **Use in code**:
   ```go
   value := os.Getenv("NEW_VARIABLE")
   ```

---

## ❓ FAQ

### Q: Why can't the mobile app use Railway environment variables?
**A**: The mobile app runs on user's phones, not on Railway. Railway variables are only accessible to the backend server.

### Q: Where does the Railway backend URL go?
**A**: In the mobile app's configuration (`app.json` and `config/env.ts`), NOT in Auth0!

### Q: Do I need to rebuild the app to change the API URL?
**A**: 
- **Development**: No, just change `app.json` and reload
- **Production**: Yes, need to rebuild with EAS

### Q: Can I have different backends for dev/staging/prod?
**A**: Yes! Update `config/env.ts` to check environment and return different URLs:
```typescript
const getApiUrl = () => {
  if (__DEV__) return 'http://localhost:8080/api/v1';
  if (releaseChannel === 'staging') return 'https://havnapi-staging.railway.app/api/v1';
  return 'https://havnapi.up.railway.app/api/v1';
};
```

---

## ✅ Checklist

### Mobile Setup:
- ✅ `expo-constants` installed
- ✅ `config/env.ts` created
- ✅ `app.json` has `extra.apiUrl`
- ✅ `lib/api.ts` uses `config.apiUrl`

### Backend Setup:
- ⏳ `.env` file created (run `./setup-auth0.sh`)
- ⏳ Railway variables set
- ⏳ Backend deployed

---

## 📚 Resources

- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)
- [EAS Environment Variables](https://docs.expo.dev/build-reference/variables/)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)

---

## 💡 Summary

| What | Mobile App | Backend |
|------|-----------|---------|
| **Runs On** | User's phone | Railway server |
| **Config Location** | `app.json` + `config/env.ts` | `.env` + Railway dashboard |
| **Access Method** | `config.apiUrl` | `os.Getenv()` |
| **Backend URL** | Set in mobile config ✅ | Not needed ❌ |
| **Auth0 Config** | Set in `config/auth0.ts` ✅ | Set in `.env` ✅ |

