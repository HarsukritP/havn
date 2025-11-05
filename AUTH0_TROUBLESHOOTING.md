# Auth0 Troubleshooting Guide

## 🚨 Current Issue: "Callback URL mismatch"

### Root Cause
Auth0 settings haven't been saved successfully because **Web Origins** field contains invalid URL schemes.

---

## ✅ EXACT Steps to Fix

### Step 1: Open Auth0 Dashboard
1. Go to https://manage.auth0.com/
2. Navigate to **Applications** → **Applications**
3. Click on **"Havn Mobile App"** (or your app name)
4. Go to **Settings** tab

### Step 2: Scroll to "Application URIs" Section

You should see these fields:

```
┌─────────────────────────────────────────┐
│ Application Login URI                   │
│ [can leave empty or default]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Allowed Callback URLs                   │
│ havnapp://auth, exp://localhost:8081    │ ← Keep this
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Allowed Logout URLs                     │
│ havnapp://auth, exp://localhost:8081    │ ← Keep this
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Allowed Web Origins                     │
│ [LEAVE THIS COMPLETELY EMPTY]           │ ← DELETE EVERYTHING
└─────────────────────────────────────────┘
```

### Step 3: Clear Web Origins

1. Click in the **"Allowed Web Origins"** field
2. Select all text (Cmd+A or Ctrl+A)
3. Delete (Backspace/Delete key)
4. Make sure it's **completely empty** - no spaces, no text

### Step 4: Verify Your Settings

Before saving, double-check:

- [ ] **Allowed Callback URLs** has: `havnapp://auth, exp://localhost:8081`
- [ ] **Allowed Logout URLs** has: `havnapp://auth, exp://localhost:8081`
- [ ] **Allowed Web Origins** is **EMPTY** (no text at all)

### Step 5: Save Changes

1. Scroll to the **very bottom** of the page
2. Click the blue **"Save Changes"** button
3. Wait for success message (should appear at top of page)
4. Wait 10-30 seconds for Auth0 to propagate changes

### Step 6: Create Auth0 API

**IMPORTANT**: You also need to register your backend as an API!

1. In Auth0 dashboard, click **Applications** → **APIs** (in left sidebar)
2. Click **"+ Create API"** button
3. Fill in:
   ```
   Name: Havn API
   Identifier: https://havn-api
   Signing Algorithm: RS256
   ```
4. Click **"Create"**

This is separate from the Application settings!

---

## 🧪 Test the Fix

### Test 1: Restart Your App

```bash
cd /Users/harrypall/Projects/Havn/mobile

# Stop the current server (Ctrl+C or Cmd+C)

# Clear cache and restart
npm start -- --clear
```

### Test 2: Try Login

1. App should load without crashes
2. Click "Continue to Sign In" button
3. Browser should open to Auth0
4. **Expected behavior**:
   - Auth0 login page loads
   - You can enter email/password OR see Google button (if configured)
   - After login, redirects back to app
   - App shows main screen

### Test 3: Check for Errors

If it still fails:

1. **Check Auth0 dashboard**:
   - Go to **Monitoring** → **Logs**
   - Look for recent login attempts
   - Click on failed attempts to see error details

2. **Check mobile app console**:
   ```bash
   # Look for logs in the terminal where you ran npm start
   # Should see logs like:
   # "📱 App Configuration: { apiUrl: '...' }"
   # "Auth0 redirect successful"
   ```

---

## 🔍 Why Web Origins Doesn't Accept Custom Schemes

### Technical Explanation:

**Web Origins** is for CORS (Cross-Origin Resource Sharing):
- Only works with HTTP/HTTPS URLs
- Used when JavaScript in a browser makes API calls
- Format: `https://example.com` or `http://localhost:3000`

**Your Native Mobile App**:
- Does NOT run in a browser
- Does NOT use CORS
- Uses direct HTTP requests
- Therefore: Does NOT need Web Origins!

**Custom URL Schemes** (`havnapp://`, `exp://`):
- Used for **deep linking** (opening your app)
- Go in **Callback URLs** and **Logout URLs**
- Do NOT go in **Web Origins**

---

## ❓ FAQ

### Q: Will leaving Web Origins empty cause problems?
**A**: No! Native mobile apps don't need Web Origins at all. This field is only for web applications.

### Q: What if I'm also building a web version?
**A**: Then you would add your web app's URL to Web Origins, like:
```
https://havn-web.vercel.app, http://localhost:3000
```

But only HTTP/HTTPS URLs, never custom schemes.

### Q: Do I need to add my Railway backend URL anywhere in Auth0?
**A**: NO! The only place Railway URL goes is in your mobile app code (`app.json`).

---

## 🎯 Summary Checklist

Before trying login again, verify:

- [ ] Auth0 Application Settings saved successfully
- [ ] Web Origins field is **empty**
- [ ] Callback URLs include `havnapp://auth`
- [ ] Auth0 API created with identifier `https://havn-api`
- [ ] Mobile app restarted with `npm start -- --clear`
- [ ] Hooks error fixed (already done ✅)

---

## 🆘 Still Not Working?

If you've done all the above and it still fails:

1. **Take a screenshot** of:
   - Auth0 Application Settings (the URIs section)
   - The error in your mobile app
   - Auth0 Monitoring → Logs (any failed attempts)

2. **Check these files** haven't been modified:
   - `mobile/config/auth0.ts` - should have correct domain and client ID
   - `mobile/hooks/useAuth0.ts` - should have `useAutoDiscovery` inside the function

3. **Try the Auth0 test**:
   - Open: `https://dev-rlqpb3p7hzb1ldkr.us.auth0.com/authorize?client_id=JzWqmPMtNkl1tuIQ4iP6cdy9KbaCrORE&response_type=code&redirect_uri=havnapp://auth&scope=openid%20profile%20email`
   - If this works in a browser, your Auth0 is configured correctly
   - The issue would then be in the mobile app code

---

## 📞 Quick Reference

**Your Auth0 Configuration**:
- Domain: `dev-rlqpb3p7hzb1ldkr.us.auth0.com`
- Client ID: `JzWqmPMtNkl1tuIQ4iP6cdy9KbaCrORE`
- Audience: `https://havn-api`
- Callback: `havnapp://auth`

**Your Backend**:
- Railway URL: `https://havnapi.up.railway.app`
- Configured in: `mobile/app.json` (extra.apiUrl)

**Status**:
- ✅ Mobile app code fixed (hooks error)
- ✅ Mobile app configuration centralized
- ✅ Backend Auth0 middleware created
- ⏳ Auth0 settings need to be saved
- ⏳ Auth0 API needs to be created
- ⏳ Backend needs Auth0 setup completed

