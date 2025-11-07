# 🎭 Demo Mode - Temporary Mock Authentication

## Overview

Auth0 authentication has been **temporarily bypassed** with a mock authentication system to allow you to explore and test the app's UI without dealing with authentication issues.

## What Changed

### 1. **Mock Authentication Hook** (`mobile/hooks/useAuth0.ts`)
- Replaced Auth0 integration with a simple mock login system
- Login now instantly creates a mock session without requiring real credentials
- No network calls to Auth0 servers
- Mock token: `mock-access-token`

### 2. **Mock API Layer** (`mobile/lib/api.ts`)
- Added detection for mock mode (checks if token is `mock-access-token`)
- Returns realistic fake data for all API endpoints when in mock mode
- Includes sample data for:
  - **4 Study Spots** (Dana Porter Library, SLC Great Hall, Engineering 5, Celsius Coffee Bar)
  - **2 Friends** (Sarah Chen, Mike Johnson)
  - **User Profile** (Demo User with stats)
  - Search results, check-ins, and more

### 3. **Updated Login Screen** (`mobile/app/(auth)/login.tsx`)
- Added a demo mode badge to indicate mock authentication
- Changed button text to "Enter Demo Mode"
- Added informative message about mock authentication

## How to Use

1. **Start the App**: Run your Expo app as usual
2. **Login Screen**: Tap the "Enter Demo Mode" button
3. **Explore**: You'll be instantly logged in and can:
   - View the map with 4 study spots around UW campus
   - See 2 mock friends on the map and friends list
   - View spot details with occupancy, amenities, and hours
   - Access your profile with demo stats
   - Search for users
   - Test check-in/check-out (simulated)

## Mock Data Included

### Study Spots
1. **Dana Porter Library - 5th Floor** (Low occupancy, 15%)
2. **SLC Great Hall** (Moderate occupancy, 56%)
3. **Engineering 5 - 2nd Floor** (High occupancy, 83%)
4. **Celsius Coffee Bar** (Moderate occupancy, 57%)

All spots include:
- Realistic amenities (WiFi, outlets, quiet areas, etc.)
- Opening hours
- Occupancy status
- Location coordinates (UW Waterloo campus)

### Friends
- **Sarah Chen** (@sarahchen) - Currently at Dana Porter Library
- **Mike Johnson** (@mikejohnson) - Currently at SLC Great Hall

### Your Profile
- **Name**: Demo User
- **Email**: demo@uwaterloo.ca
- **Username**: @demouser
- **Major**: Computer Science
- **Graduation Year**: 2025
- **Stats**: 24 study hours, 47 check-ins, 2 friends

## Reverting to Real Auth0

When you're ready to restore Auth0 authentication:

1. **Restore `mobile/hooks/useAuth0.ts`**:
   ```bash
   git checkout mobile/hooks/useAuth0.ts
   ```

2. **Restore `mobile/lib/api.ts`**:
   ```bash
   git checkout mobile/lib/api.ts
   ```

3. **Restore `mobile/app/(auth)/login.tsx`**:
   ```bash
   git checkout mobile/app/(auth)/login.tsx
   ```

4. **Delete this file**:
   ```bash
   rm DEMO_MODE_INFO.md
   ```

## Notes

- ⚠️ **No data is saved** - All interactions are simulated
- 🔒 **Not for production** - This is strictly for UI testing
- 🗺️ **Location services still required** - The map needs your real location
- 🎨 **All UI is functional** - Everything should look and work as designed

## Testing Checklist

- ✅ Login with demo mode
- ✅ View map with study spots
- ✅ Click on spot markers
- ✅ View spot details
- ✅ See friends list
- ✅ View your profile
- ✅ Check profile stats
- ✅ Search for users
- ✅ Filter spots by type/distance
- ✅ Navigate between tabs

Enjoy exploring your app! 🎉

