# Auth0 Google OAuth Setup Guide

## ✅ What I Just Fixed

1. **Fixed React Hooks Error**: Moved `useAutoDiscovery` hook inside the `useAuth0` function
2. **Switched to Auth0 Login**: Your app now uses Auth0 instead of Supabase for authentication

## 🔧 Auth0 Dashboard Configuration

### Step 1: Configure Callback URLs

1. Go to https://manage.auth0.com/
2. Navigate to **Applications** → **Applications**
3. Find your application: `JzWqmPMtNkl1tuIQ4iP6cdy9KbaCrORE`
4. Add these URLs to the respective fields:

**Allowed Callback URLs:**
```
havnapp://auth
exp://localhost:8081
```

**Allowed Logout URLs:**
```
havnapp://auth
exp://localhost:8081
```

**Allowed Web Origins:**
```
havnapp://
exp://localhost:8081
```

### Step 2: Enable Google Social Connection

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click **+ Create Connection**
3. Select **Google** (Google OAuth2)
4. Enter your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
5. Under **Attributes**, ensure these are enabled:
   - ✅ Basic Profile
   - ✅ Email Address
6. Under **Permissions**, enable:
   - `email`
   - `profile`
7. Click **Save**

### Step 3: Get Google OAuth Credentials (if you don't have them)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://dev-rlqpb3p7hzb1ldkr.us.auth0.com/login/callback
   ```
7. Copy the **Client ID** and **Client Secret** to Auth0

### Step 4: Connect Google to Your Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Select your Havn app
3. Go to the **Connections** tab
4. Under **Social**, enable the **google-oauth2** connection you just created

## 🧪 Testing

1. Run your app: `npm start` (or `expo start`)
2. Navigate to the login screen
3. Click **"Sign In with Auth0"**
4. You should see Auth0's Universal Login with Google button
5. Click **"Continue with Google"**
6. Complete the Google OAuth flow

## 🔍 Troubleshooting

### Error: "Callback URL mismatch"
- Make sure `havnapp://auth` is added to Allowed Callback URLs in Auth0

### Error: "invalid_client" or "unauthorized_client"
- Verify your Client ID matches in `mobile/config/auth0.ts`
- Check that Google connection is enabled for your application

### Google button doesn't appear
- Ensure Google Social Connection is enabled in Auth0
- Verify the connection is linked to your application in the Connections tab

### App crashes or hooks error
- This should be fixed now! The `useAutoDiscovery` hook is properly placed inside the component.

## 📱 Current Configuration

**Auth0 Domain:** `dev-rlqpb3p7hzb1ldkr.us.auth0.com`
**Client ID:** `JzWqmPMtNkl1tuIQ4iP6cdy9KbaCrORE`
**URL Scheme:** `havnapp`
**Audience:** `https://havn-api`

## 🎯 Next Steps

After setting up Google OAuth in Auth0:
1. Users can sign up/login with Google
2. Their Google profile info (name, email, picture) will be synced
3. Auth0 will handle all authentication securely
4. Your backend can verify JWT tokens from Auth0

## 📚 Resources

- [Auth0 Social Connections](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers)
- [Auth0 Google OAuth Setup](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/google)
- [Expo Auth Session](https://docs.expo.dev/guides/authentication/#google)

