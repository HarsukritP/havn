# 📱 Expo Setup & Troubleshooting

## ✅ What We've Fixed So Far

1. ✅ Installed missing dependencies (`expo-build-properties`, `react-dom`, `react-native-web`)
2. ✅ Fixed package version mismatches
3. ✅ Removed duplicate `@types/react-native`
4. ✅ Fixed `tsconfig.json` typo (`strictPropertyInitialization`)
5. ✅ Created placeholder assets (icon.png, splash.png, etc.)
6. ✅ Simplified App.tsx temporarily

## 🚀 How to Start Expo

### Option 1: Use the Startup Script (Recommended)

```bash
cd /Users/harrypall/Projects/SpotSaver/mobile
./start-expo.sh
```

### Option 2: Manual Start

```bash
cd /Users/harrypall/Projects/SpotSaver/mobile

# Increase file descriptor limit (fixes "too many open files" error)
ulimit -n 10240

# Start Expo
npx expo start
```

## 🔧 Common Issues & Solutions

### Issue 1: "EMFILE: too many open files"

**Solution:**
```bash
ulimit -n 10240
```

To make this permanent, add to your `~/.zshrc`:
```bash
echo "ulimit -n 10240" >> ~/.zshrc
```

### Issue 2: Metro bundler won't start

**Solution:**
```bash
# Clear all caches
npx expo start --clear

# Or manually:
rm -rf node_modules/.cache
npx expo start
```

### Issue 3: Port 8081 already in use

**Solution:**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Then start expo
npx expo start
```

### Issue 4: TypeScript errors

**Solution:**
```bash
# Verify tsconfig.json has no typos
cat tsconfig.json

# Should show: "strictPropertyInitialization": true (no space in property name)
```

## 📱 Testing on Your Phone

### iOS (Using iPhone):

1. Download "Expo Go" from the App Store
2. Make sure iPhone and Mac are on the **same WiFi network**
3. Once Expo starts, you'll see a QR code in the terminal
4. Open Camera app on iPhone
5. Point camera at QR code
6. Tap the notification to open in Expo Go

### Android (Using Android phone):

1. Download "Expo Go" from Google Play Store
2. Make sure Android and Mac are on the **same WiFi network**
3. Open Expo Go app
4. Tap "Scan QR Code"
5. Scan the QR code from your terminal

## 🎯 Expected Output When Expo Starts

```
Starting project at /Users/harrypall/Projects/SpotSaver/mobile
Starting Metro Bundler
Waiting on http://localhost:8081

› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu

Logs for your project will appear below.
```

## 🐛 Still Not Working?

### Check Node/npm versions:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### Reinstall dependencies:
```bash
cd /Users/harrypall/Projects/SpotSaver/mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Install Watchman (helps with file watching):
```bash
brew install watchman
```

## 📝 What You Should See in the Simplified App

Currently, App.tsx is simplified to just show:
- 🎯 "Havn" title
- "Mobile app is loading..." subtitle
- Blue background

This is intentional to test that Expo works before adding all the complex components.

## 🔄 Next Steps After Expo Works

Once you see the QR code and can test the simple app:

1. ✅ Test on your phone
2. ✅ Verify the app opens (shows "Havn" title)
3. Then I'll restore the full App.tsx with navigation, auth, map, etc.

## 💡 Quick Test Command

Run this to see if everything is set up correctly:

```bash
cd /Users/harrypall/Projects/SpotSaver/mobile
npx expo-doctor
```

Should show: ✓ All checks passed!

---

**Current Status:** 
- ✅ All dependencies installed
- ✅ All config files fixed  
- ⏳ Need to manually start Expo (the automated script may need manual run)

**To start now:**
```bash
cd /Users/harrypall/Projects/SpotSaver/mobile
ulimit -n 10240
npx expo start
```

Then scan the QR code with your phone!

