# Auth0 Complete Setup Guide - Mobile + Backend

## ✅ What's Already Done

### Mobile App
- ✅ React Hooks error fixed
- ✅ Switched to Auth0 authentication  
- ✅ Login and signup screens using Auth0
- ✅ Callback URLs configured in code

### Backend
- ✅ Auth0 middleware created (`auth0.go`)
- ✅ main.go updated to use Auth0 middleware
- ✅ Ready to verify Auth0 JWT tokens

## 🔧 What You Need To Do

### Part 1: Auth0 Dashboard - Mobile App (5 minutes)

**Already Open in Your Browser!** Just need to save:

1. **Application Settings** (You're here now!)
   - ✅ Callback URLs already entered: `havnapp://auth, exp://localhost:8081`
   - ✅ Logout URLs already entered: `havnapp://auth, exp://localhost:8081`
   - 📝 **ACTION**: Scroll down and click **"Save Changes"**

2. **Enable Google OAuth** (Optional - do this after testing basic login works)
   - Go to **Authentication** → **Social** → **Create Connection**
   - Select **Google**
   - Follow instructions in `mobile/AUTH0_GOOGLE_SETUP.md`

### Part 2: Auth0 Dashboard - Backend API (5 minutes)

1. Go to **Applications** → **APIs**
2. Click **+ Create API**
3. Enter:
   ```
   Name: Havn API
   Identifier: https://havn-api
   Signing Algorithm: RS256
   ```
4. Click **Create**
5. **Done!** No need to add Railway URL anywhere

### Part 3: Backend Setup (5 minutes)

#### Step 1: Install Dependencies

```bash
cd /Users/harrypall/Projects/Havn/backend
go get github.com/lestrrat-go/jwx/v2@latest
go mod tidy
```

#### Step 2: Add Environment Variables

**For Local Development** - Create/update `.env`:
```env
AUTH0_DOMAIN=dev-rlqpb3p7hzb1ldkr.us.auth0.com
AUTH0_AUDIENCE=https://havn-api

# Keep your existing DATABASE_URL and other vars
```

**For Railway Production**:
1. Go to Railway dashboard → Your project
2. Click **Variables** tab
3. Click **+ New Variable**
4. Add these two:
   ```
   AUTH0_DOMAIN = dev-rlqpb3p7hzb1ldkr.us.auth0.com
   AUTH0_AUDIENCE = https://havn-api
   ```

#### Step 3: Deploy Backend

```bash
# Commit the changes
git add backend/
git commit -m "Add Auth0 JWT verification"
git push origin main

# Railway will automatically redeploy
```

### Part 4: Test Everything (2 minutes)

1. **Start Mobile App**
   ```bash
   cd mobile
   npm start
   ```

2. **Test Login Flow**
   - Click "Continue to Sign In"
   - Auth0 browser should open
   - Create account or sign in
   - Should redirect back to app
   - Should see the main app screen

3. **Test API Call**
   - Once logged in, the app should make API calls automatically
   - Check Railway logs to see successful authenticated requests

## 🎯 Quick Answer to Your Question

### "Do I need the Railway URL in Auth0?"

**NO!** Here's why:

```
Mobile App Callback URLs (IN Auth0):
✅ havnapp://auth          ← Redirects back to mobile app
✅ exp://localhost:8081    ← For Expo development
❌ Railway URL             ← NOT needed here

Backend API Identifier (IN Auth0):
✅ https://havn-api        ← Logical identifier, not actual URL
❌ Railway URL             ← NOT needed here either

Railway URL (In Mobile Code):
✅ lib/api.ts              ← This is where Railway URL goes!
```

**The Railway URL only goes in your mobile app's API client code**, not in Auth0.

## 📊 How Authentication Works

```
1. User clicks "Sign In" in Mobile App
   ↓
2. Mobile App opens Auth0 login (dev-rlqpb3p7hzb1ldkr.us.auth0.com)
   ↓
3. User signs in with email/Google/etc
   ↓
4. Auth0 redirects to: havnapp://auth
   ↓
5. Mobile App receives JWT token with:
   - Audience: https://havn-api
   - User ID in 'sub' claim
   ↓
6. Mobile App calls Railway Backend API:
   - URL: https://your-app.railway.app/api/v1/spots
   - Header: Authorization: Bearer <token>
   ↓
7. Railway Backend verifies token:
   - Fetches Auth0 public keys
   - Validates signature
   - Checks audience = https://havn-api
   ↓
8. Backend processes request with user ID
   ↓
9. Response sent back to Mobile App
```

## 🚀 Deployment Order

1. ✅ Fix mobile React Hooks (DONE)
2. ✅ Switch mobile to Auth0 (DONE)
3. ⏳ Save Auth0 Application settings (YOU ARE HERE)
4. ⏳ Create Auth0 API
5. ⏳ Install backend dependencies
6. ⏳ Set Railway environment variables
7. ⏳ Deploy backend to Railway
8. ✅ Test login flow

## 📝 Files Modified

### Mobile
- `mobile/hooks/useAuth0.ts` - Fixed hooks error
- `mobile/app/(auth)/login.tsx` - Using Auth0
- `mobile/app/(auth)/signup.tsx` - Using Auth0

### Backend  
- `backend/internal/middleware/auth0.go` - NEW: Auth0 JWT verification
- `backend/cmd/api/main.go` - Updated to use Auth0 middleware
- `backend/go.mod` - Will add jwx dependency

### Documentation
- `mobile/AUTH0_GOOGLE_SETUP.md` - Google OAuth setup
- `backend/BACKEND_AUTH0_SETUP.md` - Backend configuration
- `AUTH0_COMPLETE_SETUP.md` - This file (overview)

## 🔍 Current Status

| Component | Status | Next Step |
|-----------|--------|-----------|
| Mobile App | ✅ Ready | Save Auth0 settings |
| Auth0 Application | ⏳ Configured | Click "Save Changes" |
| Auth0 API | ❌ Not created | Create in dashboard |
| Backend Code | ✅ Updated | Install dependencies |
| Railway Env Vars | ❌ Not set | Add AUTH0_* variables |
| Backend Deployed | ❌ Old version | Deploy new version |

## 💡 Pro Tips

1. **Test locally first** - Make sure login works in Expo before deploying backend
2. **Check Railway logs** - You'll see "Auth0 JWT verification initialized" when backend starts
3. **Token inspection** - Use https://jwt.io to decode tokens and see claims
4. **CORS errors?** - Backend already has CORS middleware enabled
5. **Still using Supabase?** - Old auth middleware is still there, just not being used

## 🆘 Need Help?

- **Mobile crashes**: Already fixed! Restart Expo server
- **"Callback URL mismatch"**: Save Auth0 settings and wait 10 seconds
- **Backend auth fails**: Check Railway logs for Auth0 initialization errors
- **Can't create API**: Make sure you're in the right Auth0 tenant

---

## Next Steps

1. **Right now**: Save Auth0 Application settings (just scroll down and click Save)
2. **Next**: Create Auth0 API
3. **Then**: Install backend dependencies and deploy

You're almost done! 🎉

