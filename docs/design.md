# Havn - Design System & UI Specifications

## Design Principles

### 1. Mobile-First
- **Thumb-Friendly:** Primary actions in bottom 2/3 of screen (natural thumb reach zone)
- **Large Touch Targets:** Minimum 44x44pt tap areas (Apple HIG standard)
- **One-Handed Use:** Core flows completable with one hand
- **Minimal Scrolling:** Critical info above the fold

### 2. Scannable at a Glance
- **Visual Hierarchy:** Color-coded availability (green=go, red=stop)
- **Progressive Disclosure:** Show essentials first, details on demand
- **Icons Over Text:** WiFi icon > "WiFi Available" text
- **Numbers Highlight:** Big bold numbers for seat count

### 3. Fast & Responsive
- **Instant Feedback:** Every tap shows immediate response (spinner, color change)
- **Optimistic Updates:** Update UI before API responds
- **Skeleton Screens:** Show structure while loading, not blank screen
- **Smooth Animations:** 60fps transitions, <300ms duration

### 4. Familiar Patterns
- **Native Feel:** Follow iOS/Android platform conventions
- **Standard Navigation:** Bottom tabs (like Instagram, Twitter)
- **Gestures:** Pull-to-refresh, swipe-to-go-back
- **Modal Sheets:** Bottom sheets for quick actions (not full-screen takeovers)

### 5. Accessible
- **High Contrast:** Text readable in sunlight (WCAG AA minimum)
- **Color + Icons:** Don't rely on color alone (accessibility)
- **Dynamic Type:** Support user font size preferences
- **VoiceOver/TalkBack:** Screen reader friendly labels

---

## ASCII Mockups for Core Screens

### Screen 1: Map View (Home Screen)

**Description:** Primary screen shown after login. Displays all campus study spots as color-coded map markers. User's current location shown as blue dot. Bottom drawer shows quick stats.

```
┌─────────────────────────────────────┐
│  🔍 Search spots           ⚙️ Settings │ ← Header (sticky)
├─────────────────────────────────────┤
│                                     │
│         🗺️ MAP VIEWPORT              │
│                                     │
│    🟢 Main Library                  │ ← Green marker (available)
│                                     │
│              🔵 You are here        │ ← User location
│                                     │
│  🟡 Student Center                  │ ← Yellow (low availability)
│                                     │
│                                     │
│         🔴 Engineering Lounge        │ ← Red marker (full)
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ 📍 12 spots nearby        🔄 Refresh │ ← Quick stats bar
├─────────────────────────────────────┤
│ ⎼⎼⎼                                 │ ← Drag handle
│                                     │
│ 🟢 Main Library - 2nd Floor         │ ← Bottom drawer (swipe up for more)
│    8 of 20 seats available          │
│    Updated 3 min ago · 450m away    │
│                                     │
│    [Tap for details →]              │
│                                     │
└─────────────────────────────────────┘
│ ▼Map  │ List │ Update │ Profile │    │ ← Bottom tab navigation
└─────────────────────────────────────┘
```

**Key Elements:**
- **Map Viewport:** Full screen interactive map (react-native-maps)
- **Markers:** Color-coded circles with location icons
  - 🟢 Green: >50% capacity available
  - 🟡 Yellow: 20-50% capacity available
  - 🔴 Red: <20% capacity available or full
- **User Location:** Blue pulsing dot
- **Search Bar:** Top header (tap to filter/search)
- **Bottom Drawer:** Sticky quick info about nearest spot
  - Swipe up to see list of all nearby spots
  - Swipe down to minimize
- **Bottom Tabs:** Always visible navigation

**Interactions:**
- **Tap marker:** Show spot callout, then navigate to Spot Detail
- **Pinch/zoom:** Zoom map in/out
- **Pan:** Drag to move map viewport
- **Pull-to-refresh:** Drag down from top to reload spots
- **My Location button:** Re-center map on user (FAB in bottom-right)

---

### Screen 2: Spot Detail Screen

**Description:** Full-screen view of a specific study spot with all details, current availability, recent updates, and action buttons.

```
┌─────────────────────────────────────┐
│ ← Back          Main Library     ⋮  │ ← Nav header
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║   [Photo of library interior] ║  │ ← Photo gallery (swipeable)
│  ╚═══════════════════════════════╝  │
│           ● ○ ○                     │ ← Photo pagination dots
│                                     │
│  📍 Main Library - 2nd Floor        │ ← Spot name
│     100 University Ave              │ ← Address
│     450m away · 6 min walk          │ ← Distance
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🟢 8 of 20 seats available │   │ ← Availability card (large, prominent)
│  │                             │   │
│  │  Updated 3 min ago          │   │ ← Recency indicator
│  │  ████████░░ 85% confident   │   │ ← Confidence score
│  └─────────────────────────────┘   │
│                                     │
│  Amenities:                         │
│  📶 WiFi  🔌 Outlets  🖨️ Printer    │ ← Icon row
│  🤫 Quiet Zone                      │
│                                     │
├─────────────────────────────────────┤
│  Recent Updates (Last hour):        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 10:25am  8 seats  🤫 Quiet    │ │ ← Update history
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ 10:05am  10 seats  🤫 Quiet   │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ 9:45am  12 seats  🤫 Quiet    │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║   📝 Update Availability      ║  │ ← Primary CTA button (large)
│  ╚═══════════════════════════════╝  │
│                                     │
│  [ ⭐ Add to Favorites ]            │ ← Secondary action
│                                     │
└─────────────────────────────────────┘
```

**Key Elements:**
- **Photo Gallery:** Horizontal swipeable photos (user-submitted)
- **Availability Card:** Large, prominent display of current status
  - Color-coded background (green/yellow/red)
  - Big numbers for seats
  - Confidence score as progress bar
- **Amenities Row:** Icon-based (saves space, universally understood)
- **Recent Updates:** Scroll list of last 5-10 updates (shows data freshness)
- **CTA Button:** "Update Availability" (opens check-in modal)

**Interactions:**
- **Swipe photos:** Navigate through gallery
- **Tap "Update Availability":** Opens check-in modal (Screen 3)
- **Tap "Add to Favorites":** Star/unstar this location
- **Scroll:** Vertical scroll for long content
- **Back button:** Return to map

---

### Screen 3: Check-In/Update Modal

**Description:** Bottom sheet modal that slides up when user taps "Update Availability". Simple, fast interface to submit an update.

```
        ┌─────────────────────────────┐
        │  ⎼⎼⎼  (Drag to dismiss)     │ ← Drag handle
        ├─────────────────────────────┤
        │                             │
        │  Update Availability        │ ← Modal title
        │                             │
        │  Main Library - 2nd Floor   │ ← Spot name (context)
        │                             │
        ├─────────────────────────────┤
        │                             │
        │  How many seats available?  │ ← Question
        │                             │
        │       ┌───────────┐         │
        │       │     8     │         │ ← Number (large, tappable)
        │       └───────────┘         │
        │                             │
        │   [ - ]         [ + ]       │ ← Increment/decrement buttons
        │                             │
        │  Or use picker:             │
        │  ╔═══╦═══╦═══╦═══╦═══╗     │
        │  ║ 5 ║ 8 ║ 10║ 15║ 20║     │ ← Quick select chips
        │  ╚═══╩═══╩═══╩═══╩═══╝     │
        │                             │
        ├─────────────────────────────┤
        │  Noise level (optional):    │
        │                             │
        │  [ 🤫 Quiet ]               │ ← Toggle buttons (single select)
        │  [ 🔊 Moderate ]            │
        │  [ 📢 Loud ]                │
        │                             │
        ├─────────────────────────────┤
        │  📷 Add photo (optional)    │ ← Photo upload (collapsed by default)
        │                             │
        ├─────────────────────────────┤
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║  ✓ Submit Update      ║  │ ← Primary action (big button)
        │  ╚═══════════════════════╝  │
        │                             │
        │  [ Cancel ]                 │ ← Secondary action
        │                             │
        └─────────────────────────────┘
```

**After Submission (Success State):**

```
        ┌─────────────────────────────┐
        │                             │
        │         ✓                   │ ← Success icon (animated)
        │                             │
        │   Update submitted!         │
        │                             │
        │   +5 points earned          │ ← Points feedback
        │   Current streak: 4 days    │
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║     Done              ║  │ ← Dismiss button
        │  ╚═══════════════════════╝  │
        │                             │
        └─────────────────────────────┘
```

**Error State (Too Far Away):**

```
        ┌─────────────────────────────┐
        │                             │
        │         ⚠️                   │
        │                             │
        │   Can't update this spot    │
        │                             │
        │   You must be within 100m   │
        │   of the location.          │
        │                             │
        │   You're currently 450m away│
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║     OK                ║  │
        │  ╚═══════════════════════╝  │
        │                             │
        └─────────────────────────────┘
```

**Key Elements:**
- **Drag Handle:** Swipe down to dismiss
- **Number Picker:** Large, easy to tap +/- buttons
- **Quick Select Chips:** Common values (5, 8, 10, 15, 20) for fast selection
- **Noise Level:** Optional toggle buttons (visual icons)
- **Photo Upload:** Collapsed by default (reduces friction)
- **Submit Button:** Prominent, changes to loading spinner when tapped
- **Validation:** Show error if too far from location

**Interactions:**
- **Swipe down:** Dismiss modal
- **Tap +/-:** Adjust number
- **Tap chip:** Set number to that value
- **Tap noise level:** Select one (single choice)
- **Tap photo:** Open camera/gallery (if opted in)
- **Tap Submit:** Validate location → Submit to API → Show success
- **Geofence Check:** Runs when modal opens (disable submit if too far)

---

### Screen 4: List View

**Description:** Alternative to map view for users who prefer lists. Shows all nearby spots sorted by distance or availability.

```
┌─────────────────────────────────────┐
│  Study Spots           🔍  ⚙️         │ ← Header
├─────────────────────────────────────┤
│  Sort by: Distance ▼   Filter: All ▼│ ← Sort/Filter controls
├─────────────────────────────────────┤
│  🔄 Pull to refresh                 │ ← Pull indicator (when dragging)
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║ 🟢 Main Library - 2nd Floor   ║  │ ← Spot card (available)
│  ║                               ║  │
│  ║ 8 of 20 seats available       ║  │
│  ║ 450m away · 6 min walk        ║  │
│  ║ Updated 3 min ago             ║  │
│  ║                               ║  │
│  ║ 📶 🔌 🖨️ 🤫                   ║  │ ← Amenity icons
│  ╚═══════════════════════════════╝  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║ 🟡 Student Center Lounge      ║  │ ← Spot card (low availability)
│  ║                               ║  │
│  ║ 3 of 15 seats available       ║  │
│  ║ 720m away · 9 min walk        ║  │
│  ║ Updated 8 min ago             ║  │
│  ║                               ║  │
│  ║ 📶 🔌                         ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║ 🔴 Engineering Lounge         ║  │ ← Spot card (full)
│  ║                               ║  │
│  ║ 0 of 12 seats available       ║  │
│  ║ 1.2km away · 15 min walk      ║  │
│  ║ Updated 2 min ago             ║  │
│  ║                               ║  │
│  ║ 📶 🔌 🤫                      ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║ 🟢 Outdoor Quad Tables        ║  │
│  ║                               ║  │
│  ║ 12 of 16 seats available      ║  │
│  ║ 890m away · 11 min walk       ║  │
│  ║ Updated 15 min ago ⚠️         ║  │ ← Warning: older data
│  ║                               ║  │
│  ║ 📶 🌳                         ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
└─────────────────────────────────────┘
│   Map  │ ▼List │ Update │ Profile │  │ ← Bottom tabs
└─────────────────────────────────────┘
```

**Sort Options:**
- **Distance** (default): Nearest first
- **Availability**: Most seats available first
- **Recently Updated**: Freshest data first
- **Capacity**: Largest spots first

**Filter Options:**
- **All** (default): Show all spots
- **Available Only**: Hide full spots
- **Quiet Only**: Show only quiet zones
- **WiFi + Outlets**: Filter by amenities

**Key Elements:**
- **Spot Cards:** Consistent card design (color-coded left border)
- **Availability First:** Big bold numbers (most important info)
- **Distance Second:** Walking time is useful (not just meters)
- **Freshness Indicator:** Show age of update ("3 min ago")
  - ⚠️ Warning icon if >30 min old
- **Amenity Icons:** Quick visual scan

**Interactions:**
- **Pull-to-refresh:** Drag down to reload
- **Tap card:** Navigate to Spot Detail screen
- **Tap sort/filter:** Show dropdown menu
- **Scroll:** Infinite scroll (or pagination)

**Empty State (No Results):**

```
┌─────────────────────────────────────┐
│                                     │
│           🔍                        │
│                                     │
│   No spots found nearby             │
│                                     │
│   Try zooming out or changing       │
│   your filters.                     │
│                                     │
│   [ Reset Filters ]                 │
│                                     │
└─────────────────────────────────────┘
```

---

### Screen 5: Profile/Stats

**Description:** User profile showing gamification stats, achievements, and settings.

```
┌─────────────────────────────────────┐
│  Profile                    ⚙️ Settings│ ← Header
├─────────────────────────────────────┤
│                                     │
│         ┌─────────┐                 │
│         │   👤    │                 │ ← Avatar (placeholder or photo)
│         └─────────┘                 │
│                                     │
│       Jane Doe                      │ ← Full name
│       student@university.edu        │ ← Email
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  Your Stats This Week         ║  │ ← Stats card
│  ║                               ║  │
│  ║  ⭐ 130 total points           ║  │
│  ║  🔥 4-day streak               ║  │
│  ║  ✓ 26 check-ins this week     ║  │
│  ║  🏆 Top 15% of contributors    ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  Reputation Score             ║  │
│  ║                               ║  │
│  ║  ████████████░░░░ 72.5/100    ║  │ ← Progress bar
│  ║                               ║  │
│  ║  Status: Trusted Contributor  ║  │ ← Tier badge
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  Achievements (3 unlocked):         │
│                                     │
│  🎉 First Check-In                  │
│  🔥 Week Warrior (7-day streak)     │
│  💯 Century Club (100 points)       │
│                                     │
│  [ View Leaderboard ]               │ ← Link to leaderboard screen
│                                     │
├─────────────────────────────────────┤
│  Quick Actions:                     │
│                                     │
│  [ 📍 Favorite Spots ]              │
│  [ 📊 Contribution History ]        │
│  [ 🔔 Notification Settings ]       │
│  [ 🔐 Privacy Settings ]            │
│  [ 📧 Support & Feedback ]          │
│  [ 🚪 Logout ]                      │
│                                     │
└─────────────────────────────────────┘
│   Map  │ List │ Update │ ▼Profile │  │ ← Bottom tabs
└─────────────────────────────────────┘
```

**Key Elements:**
- **Stats Card:** Big numbers, visual icons
- **Reputation Bar:** Progress bar with tier indicator
- **Achievements:** Icon + title (tap for details)
- **Quick Actions:** List of navigation links

**Interactions:**
- **Tap settings:** Navigate to settings screen
- **Tap leaderboard:** Navigate to leaderboard screen
- **Tap achievement:** Show modal with achievement details
- **Tap quick action:** Navigate to respective screen

**Stats Breakdown (Expanded View):**

```
┌─────────────────────────────────────┐
│  ← Back       Your Contribution History│
├─────────────────────────────────────┤
│                                     │
│  This Week:                         │
│  ┌───────────────────────────────┐ │
│  │ Monday     3 check-ins   +15  │ │
│  │ Tuesday    2 check-ins   +10  │ │
│  │ Wednesday  4 check-ins   +20  │ │
│  │ Thursday   3 check-ins   +15  │ │
│  │ Friday     2 check-ins   +10  │ │
│  │ Saturday   0 check-ins    —   │ │
│  │ Sunday     1 check-in    +5   │ │
│  └───────────────────────────────┘ │
│                                     │
│  Most Active Spots:                 │
│  1. Main Library (12 check-ins)     │
│  2. Student Center (5 check-ins)    │
│  3. Engineering Hall (4 check-ins)  │
│                                     │
│  Accuracy Rate: 92%                 │
│  (23 of 25 updates were accurate)   │
│                                     │
└─────────────────────────────────────┘
```

---

### Screen 6: Spot-Save Request (Phase 2)

**Description:** Social coordination feature where a user arriving soon can request someone at the location to save them a seat.

**User Flow:**
1. User views Spot Detail screen
2. Taps "Request Seat Save" button (only shown if spot is full or low availability)
3. Modal appears to confirm request
4. Push notification sent to users currently at that location
5. Recipient accepts/declines
6. Requester gets notification of response

**Request Modal (Requester's View):**

```
        ┌─────────────────────────────┐
        │  ⎼⎼⎼  (Drag to dismiss)     │
        ├─────────────────────────────┤
        │                             │
        │  Request a Saved Seat       │
        │                             │
        │  Main Library - 2nd Floor   │
        │  (Currently full)           │
        │                             │
        ├─────────────────────────────┤
        │                             │
        │  How soon will you arrive?  │
        │                             │
        │  ╔═══╦═══╦═══╦═══╗          │
        │  ║ 5 ║ 8 ║ 10║ 15║ min     │ ← Quick select
        │  ╚═══╩═══╩═══╩═══╝          │
        │                             │
        │  We'll notify people at     │
        │  this location who can      │
        │  save you a seat.           │
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║  Send Request         ║  │ ← Primary button
        │  ╚═══════════════════════╝  │
        │                             │
        │  [ Cancel ]                 │
        │                             │
        └─────────────────────────────┘
```

**Pending State (After Request Sent):**

```
        ┌─────────────────────────────┐
        │                             │
        │  ⏳ Request Sent             │
        │                             │
        │  Waiting for someone to     │
        │  accept your request...     │
        │                             │
        │  Expires in 2:00            │ ← Countdown timer
        │                             │
        │  [ Cancel Request ]         │
        │                             │
        └─────────────────────────────┘
```

**Recipient's Push Notification:**

```
┌──────────────────────────────────────┐
│  Havn                        now │
│                                      │
│  💺 Seat save request                │
│                                      │
│  Someone needs a seat at Main        │
│  Library - 2nd Floor. They'll        │
│  arrive in 8 minutes. Can you help?  │
│                                      │
│  [Decline]              [Accept →]   │
└──────────────────────────────────────┘
```

**Recipient's Accept Modal:**

```
        ┌─────────────────────────────┐
        │                             │
        │  🙋 Save a Seat?            │
        │                             │
        │  Someone is arriving to     │
        │  Main Library in 8 minutes  │
        │                             │
        │  Can you save them a seat?  │
        │                             │
        │  You'll earn +15 points     │
        │  when they arrive!          │
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║  ✓ Yes, I'll Save It  ║  │
        │  ╚═══════════════════════╝  │
        │                             │
        │  [ No Thanks ]              │
        │                             │
        └─────────────────────────────┘
```

**Success State (Requester's View):**

```
        ┌─────────────────────────────┐
        │                             │
        │         ✓                   │
        │                             │
        │  Seat Saved!                │
        │                             │
        │  Sarah T. is saving you     │
        │  a seat at Main Library.    │
        │                             │
        │  ETA: 8 minutes             │
        │                             │
        │  Please arrive on time or   │
        │  they'll give it to someone │
        │  else!                      │
        │                             │
        │  ╔═══════════════════════╗  │
        │  ║    Got It             ║  │
        │  ╚═══════════════════════╝  │
        │                             │
        └─────────────────────────────┘
```

---

## Navigation Structure

### Bottom Tab Navigator (Main Navigation)

```
┌─────────────────────────────────────┐
│                                     │
│        [Screen Content]             │
│                                     │
│                                     │
└─────────────────────────────────────┘
│  🗺️   │  📋  │  📝   │  👤   │        │
│  Map  │ List │ Update│Profile│        │
│   ●   │      │       │       │        │ ← Active indicator
└─────────────────────────────────────┘
```

**Tab 1: Map** - Map view with markers (default screen)  
**Tab 2: List** - List view of nearby spots  
**Tab 3: Update** - Quick check-in (shortcut to modal)  
**Tab 4: Profile** - User stats and settings

### Stack Navigator (Nested Navigation)

**Auth Stack** (shown when not logged in):
```
Login Screen
  └─> Register Screen
  └─> Forgot Password Screen
```

**Main Stack** (shown after login):
```
Bottom Tabs (Map, List, Update, Profile)
  └─> Spot Detail Screen
      └─> Check-In Modal (modal overlay)
  └─> Settings Screen
  └─> Leaderboard Screen
  └─> Contribution History Screen
```

### Gestures

- **Swipe right:** Go back (iOS standard, Android back button)
- **Pull down:** Refresh current screen
- **Swipe up on bottom drawer:** Expand to full list
- **Swipe down on modal:** Dismiss modal

---

## Color Palette

### Brand Colors

```
Primary Blue (Brand):
  Hex: #2563EB
  Use: Primary buttons, links, active states, brand elements
  
Primary Blue Dark:
  Hex: #1D4ED8
  Use: Button hover/pressed state
  
Primary Blue Light:
  Hex: #DBEAFE
  Use: Button backgrounds (disabled), subtle highlights
```

### Availability Status Colors

```
Success Green (Available):
  Hex: #10B981
  Use: Available markers, success messages, positive indicators
  
Warning Yellow (Low Availability):
  Hex: #F59E0B
  Use: Low availability markers, caution messages
  
Danger Red (Full):
  Hex: #EF4444
  Use: Full markers, error messages, critical warnings
```

### Neutral Colors

```
Dark (Text Primary):
  Hex: #1F2937
  Use: Headings, primary text, high-contrast elements
  
Gray (Text Secondary):
  Hex: #6B7280
  Use: Secondary text, labels, captions
  
Light Gray (Borders):
  Hex: #E5E7EB
  Use: Dividers, borders, card outlines
  
Background Light:
  Hex: #F3F4F6
  Use: Page background, disabled buttons
  
White:
  Hex: #FFFFFF
  Use: Card backgrounds, modal backgrounds
```

### Semantic Colors

```
Info Blue:
  Hex: #3B82F6
  Use: Informational messages, tips
  
Success (alternate):
  Hex: #059669
  Use: Success toast, confirmation checkmarks
  
Error:
  Hex: #DC2626
  Use: Form errors, destructive actions
```

### Map Marker Colors

```
Available Marker: #10B981 (green)
Low Availability Marker: #F59E0B (yellow/orange)
Full Marker: #EF4444 (red)
User Location: #2563EB (blue, pulsing)
Selected Marker: #1F2937 (dark, outlined)
```

---

## Typography

**Font Family:**
- **iOS:** San Francisco (system default)
- **Android:** Roboto (system default)
- Reason: Native fonts for best performance and platform consistency

### Type Scale

```
H1 (Page Titles):
  Size: 32pt
  Weight: Bold (700)
  Use: Screen titles ("Study Spots", "Profile")
  
H2 (Section Headings):
  Size: 24pt
  Weight: Semibold (600)
  Use: Section headers ("Amenities", "Recent Updates")
  
H3 (Card Titles):
  Size: 18pt
  Weight: Semibold (600)
  Use: Spot names, card titles
  
Body (Primary Text):
  Size: 16pt
  Weight: Regular (400)
  Use: Main content, descriptions, list items
  
Body Small (Secondary Text):
  Size: 14pt
  Weight: Regular (400)
  Use: Metadata, timestamps ("Updated 3 min ago")
  
Caption (Tertiary Text):
  Size: 12pt
  Weight: Regular (400)
  Use: Labels, tags, fine print
  
Button Text:
  Size: 16pt
  Weight: Semibold (600)
  Use: All button labels
  
Number Display (Emphasis):
  Size: 48pt
  Weight: Bold (700)
  Use: Large seat counts, points earned
```

### Line Height

- **Headings:** 1.2x font size
- **Body text:** 1.5x font size (optimal readability)
- **Captions:** 1.3x font size

### Text Colors

- **Headings:** #1F2937 (Dark)
- **Body:** #1F2937 (Dark)
- **Secondary:** #6B7280 (Gray)
- **Disabled:** #9CA3AF (Light Gray)
- **Error:** #DC2626 (Error Red)
- **On Primary Button:** #FFFFFF (White on blue)

---

## Interaction Patterns

### 1. Loading States

**Skeleton Screens (Preferred):**
```
┌─────────────────────────────────────┐
│  ┌──────────────┐                   │
│  │ ░░░░░░░░░░░  │                   │ ← Animated shimmer
│  │ ░░░░░░░░░░░  │                   │
│  │ ░░░░░ ░░░░░  │                   │
│  └──────────────┘                   │
│  ┌──────────────┐                   │
│  │ ░░░░░░░░░░░  │                   │
│  │ ░░░░░░░░░░░  │                   │
│  │ ░░░░░ ░░░░░  │                   │
│  └──────────────┘                   │
└─────────────────────────────────────┘
```

**Spinner (For Actions):**
```
  ╔═══════════════════════╗
  ║  ⏳ Loading...        ║  ← Button disabled with spinner
  ╚═══════════════════════╝
```

**Pull-to-Refresh:**
```
         ↓
    [Spinner icon]
     Refreshing...
```

### 2. Empty States

**No Data:**
```
┌─────────────────────────────────────┐
│                                     │
│           📭                        │
│                                     │
│   No spots nearby                   │
│                                     │
│   Try zooming out on the map or     │
│   adjusting your filters.           │
│                                     │
│   [ Reset Filters ]                 │
│                                     │
└─────────────────────────────────────┘
```

**No Results (Search):**
```
┌─────────────────────────────────────┐
│                                     │
│           🔍                        │
│                                     │
│   No results for "coffee shop"      │
│                                     │
│   Try a different search term.      │
│                                     │
└─────────────────────────────────────┘
```

**No Favorites:**
```
┌─────────────────────────────────────┐
│                                     │
│           ⭐                        │
│                                     │
│   No favorite spots yet             │
│                                     │
│   Tap the star on any spot to       │
│   add it to your favorites!         │
│                                     │
└─────────────────────────────────────┘
```

### 3. Error States

**Network Error:**
```
┌─────────────────────────────────────┐
│                                     │
│           ⚠️                        │
│                                     │
│   Connection error                  │
│                                     │
│   Please check your internet        │
│   connection and try again.         │
│                                     │
│   [ Retry ]                         │
│                                     │
└─────────────────────────────────────┘
```

**Location Permission Denied:**
```
┌─────────────────────────────────────┐
│                                     │
│           📍                        │
│                                     │
│   Location access needed            │
│                                     │
│   Havn needs your location to   │
│   show nearby study spots.          │
│                                     │
│   [ Enable Location ]               │
│                                     │
└─────────────────────────────────────┘
```

**Form Validation Error:**
```
┌─────────────────────────────────────┐
│  Email:                             │
│  ┌─────────────────────────────┐   │
│  │ invalidemail                │   │ ← Red border
│  └─────────────────────────────┘   │
│  ⚠️ Please enter a valid email     │ ← Error message
│                                     │
└─────────────────────────────────────┘
```

### 4. Success Feedback

**Toast Notification:**
```
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║  ✓ Update submitted!          ║  │ ← Appears at top, auto-dismiss after 3s
│  ╚═══════════════════════════════╝  │
│                                     │
│        [Main content]               │
│                                     │
└─────────────────────────────────────┘
```

**Inline Success:**
```
  ┌─────────────────────────────┐
  │  ✓ Saved to favorites       │   ← Green background
  └─────────────────────────────┘
```

### 5. Gestures

**Pull-to-Refresh:**
- Drag down from top of scrollable content
- Release to trigger refresh
- Spinner appears while loading

**Swipe-to-Go-Back:**
- Swipe right from left edge (iOS)
- Android back button

**Long Press (Future):**
- Long press on marker → Quick actions menu
- Long press on card → Add to favorites

**Pinch-to-Zoom:**
- Map viewport (standard map gestures)

---

## Component Patterns

### Spot Marker (Map)

**Visual Design:**
- Circle with colored fill (green/yellow/red)
- White icon in center (📍 or number)
- Drop shadow for depth
- Pulsing animation for user's location
- Selected state: larger with outline

**States:**
- Default: Colored circle
- Selected: Larger + outline
- Clustered: Number badge (e.g., "5" for 5 spots)

### Spot Card (List View)

**Anatomy:**
```
┌─────────────────────────────────────┐
│ ▌ Spot Name                         │ ← Left border (colored)
│ ▌                                   │
│ ▌ Availability info                 │
│ ▌ Distance · Updated time           │
│ ▌ Amenity icons                     │
└─────────────────────────────────────┘
```

**Left Border Colors:**
- Green: Available (>50% capacity)
- Yellow: Low (20-50% capacity)
- Red: Full (<20% capacity)

### Modal Bottom Sheet

**Behavior:**
- Slides up from bottom
- Drag handle at top (swipe down to dismiss)
- Semi-transparent backdrop (tap to dismiss)
- Smooth spring animation (300ms)

**Sizes:**
- Small: 40% screen height (quick actions)
- Medium: 60% screen height (check-in modal)
- Large: 90% screen height (detailed forms)

### Primary Button

**Visual:**
- Blue background (#2563EB)
- White text (16pt, semibold)
- Rounded corners (8pt radius)
- Padding: 12pt vertical, 24pt horizontal
- Min height: 48pt (thumb-friendly)

**States:**
- Default: Blue background
- Hover: Darker blue (#1D4ED8)
- Pressed: Scale down 95%
- Disabled: Light gray (#E5E7EB), gray text
- Loading: Disabled + spinner

### Secondary Button

**Visual:**
- Transparent background
- Blue text (#2563EB)
- Blue border (1pt)
- Same padding as primary

### Icon Button (FAB - Floating Action Button)

**Visual:**
- Circular (56pt diameter)
- Blue background
- White icon
- Drop shadow
- Bottom-right corner (16pt margin)

**Use Cases:**
- "My Location" button on map
- Quick check-in shortcut

---

## Accessibility Considerations

### Color Contrast

All text meets WCAG AA standards:
- **Normal text:** 4.5:1 contrast ratio minimum
- **Large text (18pt+):** 3:1 contrast ratio minimum

Examples:
- Dark text (#1F2937) on White (#FFFFFF): 16.9:1 ✓
- White (#FFFFFF) on Primary Blue (#2563EB): 6.3:1 ✓
- Gray text (#6B7280) on White: 5.7:1 ✓

### Don't Rely on Color Alone

- Availability uses color + icons
  - Green marker + ✓ icon
  - Red marker + ✗ icon
- Error states show red border + error icon + text

### Dynamic Type Support

- Support iOS Dynamic Type (user font size preferences)
- Test layouts at largest accessibility font size

### Screen Reader Labels

All interactive elements have aria-labels:
```typescript
<TouchableOpacity 
  accessibilityLabel="Update availability for Main Library"
  accessibilityHint="Opens a form to report current seat availability"
>
  <Text>Update Availability</Text>
</TouchableOpacity>
```

### Focus Order

- Logical tab order (top to bottom, left to right)
- Focus visible (outline on focused elements)

---

## Responsive Breakpoints

### Phone Sizes

**Small (iPhone SE):**
- Width: 320pt
- Optimize: Smaller fonts for spot names, 2-column amenities

**Medium (iPhone 14):**
- Width: 390pt
- Standard layouts (designed for this size)

**Large (iPhone 14 Pro Max):**
- Width: 430pt
- Optimize: Show more cards on screen, larger map

### Tablet Support (Phase 2)

- iPad: Show map + list side-by-side
- Use split view (60% map, 40% list)

---

## Animation Specifications

### Transitions

**Screen Transitions:**
- Duration: 300ms
- Easing: Ease-in-out
- Type: Slide from right (push), slide to right (pop)

**Modal Appear:**
- Duration: 300ms
- Easing: Spring (bounce)
- Type: Slide up from bottom

**Fade In/Out:**
- Duration: 200ms
- Easing: Linear
- Use: Loading spinners, toast notifications

### Micro-Interactions

**Button Press:**
- Duration: 100ms
- Effect: Scale down to 95%

**Marker Bounce (on map load):**
- Duration: 600ms
- Effect: Drop down + bounce

**Success Checkmark:**
- Duration: 400ms
- Effect: Scale from 0% to 120% to 100% (elastic)

**Pull-to-Refresh Spinner:**
- Continuous rotation
- Speed: 1 rotation/second

---

## Custom Component Specifications

### UI Component Library: Gluestack UI v2

**Primary Library:** Gluestack UI v2 (https://gluestack.io/)
- Modern, production-grade components
- TypeScript-first with excellent type safety
- Customizable via design tokens
- Similar polish to shadcn/ui (web equivalent)
- Accessible by default (WCAG AA compliant)

**Icon Library:** Lucide React Native
- Consistent with Gluestack ecosystem
- 1000+ icons, customizable size and color
- Tree-shakeable (only imports used icons)

**Alternative:** NativeBase v3 with custom theme (if Gluestack unavailable)

---

### Custom Animated Components

These components extend Gluestack UI with animations and haptics for premium feel.

#### 1. SpotMarker (Animated Map Pin)

**Purpose:** Custom map marker for study spots with availability-based color coding and bounce animation.

**Visual Spec:**
```
┌─────────────┐
│   🟢 12     │  ← Circle with seat count
└──────┬──────┘
       │          ← Pin tail
       ▼          ← Points to location
```

**Code Pattern:**
```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay
} from 'react-native-reanimated';
import { Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';

interface SpotMarkerProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
}

export const SpotMarker: React.FC<SpotMarkerProps> = ({ spot, onPress }) => {
  const scale = useSharedValue(0);
  
  // Bounce-in animation on mount
  useEffect(() => {
    scale.value = withDelay(
      Math.random() * 300, // Stagger animation
      withSpring(1, { damping: 8, stiffness: 100 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const getMarkerColor = () => {
    const availabilityPercent = (spot.current_available / spot.total_capacity) * 100;
    if (availabilityPercent > 50) return '#10B981'; // Green
    if (availabilityPercent > 20) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(spot);
  };
  
  return (
    <Marker
      coordinate={{
        latitude: spot.latitude,
        longitude: spot.longitude,
      }}
      onPress={handlePress}
    >
      <Animated.View style={[styles.markerContainer, animatedStyle]}>
        <View style={[styles.markerCircle, { backgroundColor: getMarkerColor() }]}>
          <Text style={styles.markerText}>{spot.current_available}</Text>
        </View>
        <View style={[styles.markerTail, { backgroundColor: getMarkerColor() }]} />
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
```

**Features:**
- ✅ Bounce-in animation on map load (staggered)
- ✅ Color-coded by availability (green/yellow/red)
- ✅ Shows seat count in marker
- ✅ Haptic feedback on tap
- ✅ Drop shadow for depth

---

#### 2. SpotCard (List Item with Swipe Actions)

**Purpose:** Swipeable card for list view with favorite/navigate actions.

**Visual Spec:**
```
┌──────────────────────────────────────┐
│ 🟢 Main Library - 2nd Floor          │
│                                      │
│ 12 of 20 seats available             │
│ 450m away · Updated 3 min ago        │
│                                      │
│ 📶 🔌 🖨️ 🤫                          │
└──────────────────────────────────────┘
← Swipe left to favorite ⭐
→ Swipe right to navigate 🧭
```

**Code Pattern:**
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Card, VStack, HStack, Badge, Text } from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';

interface SpotCardProps {
  spot: Spot;
  onPress: () => void;
  onFavorite: () => void;
  onNavigate: () => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ 
  spot, 
  onPress, 
  onFavorite, 
  onNavigate 
}) => {
  const translateX = useSharedValue(0);
  const cardScale = useSharedValue(1);
  
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -100) {
        // Swipe left: Favorite
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(onFavorite)();
      } else if (e.translationX > 100) {
        // Swipe right: Navigate
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onNavigate)();
      }
      translateX.value = withSpring(0);
    });
  
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      cardScale.value = withSpring(0.98);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onEnd(() => {
      cardScale.value = withSpring(1);
      runOnJS(onPress)();
    });
  
  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: cardScale.value }
    ],
  }));
  
  const getAvailabilityColor = () => {
    const percent = (spot.current_available / spot.total_capacity) * 100;
    if (percent > 50) return 'success';
    if (percent > 20) return 'warning';
    return 'error';
  };
  
  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={animatedStyle}>
        <Card p="$4" mb="$3" borderLeftWidth={4} borderLeftColor={`$${getAvailabilityColor()}500`}>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$lg" fontWeight="$semibold">{spot.name}</Text>
              <Badge action={getAvailabilityColor()}>
                {spot.current_available} available
              </Badge>
            </HStack>
            
            <Text fontSize="$sm" color="$textLight600">
              {spot.distance_meters}m away · Updated {formatTimeAgo(spot.last_update_at)}
            </Text>
            
            <HStack space="sm">
              {spot.amenities.wifi && <Icon as={Wifi} size="sm" />}
              {spot.amenities.outlets && <Icon as={Zap} size="sm" />}
              {spot.amenities.printer && <Icon as={Printer} size="sm" />}
              {spot.amenities.quiet_zone && <Icon as={Volume2} size="sm" />}
            </HStack>
          </VStack>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
};
```

**Features:**
- ✅ Swipe left/right for quick actions
- ✅ Tap to view details (scales down on press)
- ✅ Haptic feedback (different patterns for different actions)
- ✅ Color-coded left border
- ✅ Amenity icons (compact visual info)

---

#### 3. CheckInModal (Bottom Sheet with Slide Animation)

**Purpose:** Smooth bottom sheet for submitting availability updates.

**Code Pattern:**
```typescript
import { Modal, Button, VStack, HStack, Text, Slider } from '@gluestack-ui/themed';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface CheckInModalProps {
  visible: boolean;
  spot: Spot;
  onClose: () => void;
  onSubmit: (data: UpdateData) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  spot,
  onClose,
  onSubmit,
}) => {
  const [seats, setSeats] = useState(spot.current_available || 10);
  const [noiseLevel, setNoiseLevel] = useState<'quiet' | 'moderate' | 'loud'>('quiet');
  const backdropOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withSpring(0.5);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      backdropOpacity.value = withSpring(0);
    }
  }, [visible]);
  
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  
  const handleSeatChange = (value: number) => {
    setSeats(value);
    // Haptic tick every 5 seats
    if (value % 5 === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({ seats_available: seats, noise_level: noiseLevel });
    onClose();
  };
  
  return (
    <Modal visible={visible} onClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      
      <Animated.View 
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown}
        style={styles.modalContent}
      >
        <VStack space="lg" p="$6">
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          
          <Text fontSize="$2xl" fontWeight="$bold">Update Availability</Text>
          <Text fontSize="$sm" color="$textLight600">{spot.name}</Text>
          
          {/* Seat Counter */}
          <VStack space="md">
            <Text fontSize="$md">How many seats available?</Text>
            
            <HStack justifyContent="center" space="xl">
              <Button
                size="lg"
                variant="outline"
                onPress={() => handleSeatChange(Math.max(0, seats - 1))}
              >
                <Text fontSize="$2xl">−</Text>
              </Button>
              
              <View style={styles.seatDisplay}>
                <Text fontSize="$4xl" fontWeight="$bold">{seats}</Text>
              </View>
              
              <Button
                size="lg"
                variant="outline"
                onPress={() => handleSeatChange(Math.min(spot.total_capacity, seats + 1))}
              >
                <Text fontSize="$2xl">+</Text>
              </Button>
            </HStack>
            
            {/* Quick Select */}
            <HStack space="sm" justifyContent="center">
              {[0, 5, 10, 15, 20].map(value => (
                <Button
                  key={value}
                  size="sm"
                  variant={seats === value ? 'solid' : 'outline'}
                  onPress={() => handleSeatChange(value)}
                >
                  {value}
                </Button>
              ))}
            </HStack>
          </VStack>
          
          {/* Noise Level */}
          <VStack space="md">
            <Text fontSize="$md">Noise level (optional)</Text>
            <HStack space="sm">
              {(['quiet', 'moderate', 'loud'] as const).map(level => (
                <Button
                  key={level}
                  flex={1}
                  variant={noiseLevel === level ? 'solid' : 'outline'}
                  onPress={() => {
                    setNoiseLevel(level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  {level === 'quiet' && '🤫'} 
                  {level === 'moderate' && '🔊'}
                  {level === 'loud' && '📢'}
                  {' '}{level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </HStack>
          </VStack>
          
          {/* Submit Button */}
          <Button size="xl" onPress={handleSubmit}>
            <Text color="$white" fontSize="$lg" fontWeight="$semibold">
              ✓ Submit Update
            </Text>
          </Button>
          
          <Button variant="link" onPress={onClose}>
            <Text>Cancel</Text>
          </Button>
        </VStack>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40, // Safe area
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
  seatDisplay: {
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Features:**
- ✅ Slide-in animation from bottom (spring physics)
- ✅ Drag handle for swipe-to-dismiss
- ✅ Haptic feedback on seat changes (every 5 seats)
- ✅ Quick select buttons (0, 5, 10, 15, 20)
- ✅ +/− buttons with haptics
- ✅ Noise level toggle
- ✅ Success haptic on submit

---

#### 4. SkeletonSpotCard (Loading State)

**Purpose:** Shimmer loading skeleton for spot cards (not spinners).

**Code Pattern:**
```typescript
import { Skeleton, VStack, HStack } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const SkeletonSpotCard: React.FC = () => {
  const shimmerTranslate = useSharedValue(-1);
  
  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value * 300 }],
  }));
  
  return (
    <View style={styles.card}>
      <VStack space="md">
        <HStack justifyContent="space-between">
          <Skeleton h={24} w="70%" borderRadius={8} />
          <Skeleton h={24} w={60} borderRadius={12} />
        </HStack>
        
        <Skeleton h={16} w="80%" borderRadius={8} />
        
        <HStack space="sm">
          <Skeleton h={20} w={20} borderRadius={10} />
          <Skeleton h={20} w={20} borderRadius={10} />
          <Skeleton h={20} w={20} borderRadius={10} />
        </HStack>
      </VStack>
      
      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

**Features:**
- ✅ Shimmer animation (not static)
- ✅ Matches actual card layout
- ✅ Progressive loading (show structure immediately)

---

#### 5. PointsBadge (Animated Counter)

**Purpose:** Animated points counter that increments smoothly.

**Code Pattern:**
```typescript
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { Badge } from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';

interface PointsBadgeProps {
  points: number;
  onPointsEarned?: (amount: number) => void;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({ points, onPointsEarned }) => {
  const animatedPoints = useSharedValue(points);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    const difference = points - animatedPoints.value;
    
    if (difference > 0) {
      // Points increased - celebrate!
      scale.value = withSpring(1.2, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPointsEarned?.(difference);
    }
    
    animatedPoints.value = withSpring(points, { damping: 50 });
  }, [points]);
  
  const animatedProps = useAnimatedProps(() => ({
    text: Math.floor(animatedPoints.value).toString(),
  }));
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Badge action="success" variant="solid">
        <AnimatedText animatedProps={animatedProps}>
          {Math.floor(points)} points
        </AnimatedText>
      </Badge>
    </Animated.View>
  );
};
```

**Features:**
- ✅ Smooth number increment (not instant jump)
- ✅ Scale-up animation when points increase
- ✅ Success haptic on points earned
- ✅ Callback for showing toast

---

### Design Tokens (Gluestack Configuration)

**File:** `gluestack.config.ts`

```typescript
import { config } from '@gluestack-ui/config';

export default {
  ...config,
  tokens: {
    ...config.tokens,
    colors: {
      // Brand colors
      primary500: '#2563EB',
      primary600: '#1D4ED8',
      primary400: '#3B82F6',
      
      // Availability colors
      success500: '#10B981',
      warning500: '#F59E0B',
      error500: '#EF4444',
      
      // Neutrals
      textDark900: '#1F2937',
      textLight600: '#6B7280',
      backgroundLight: '#F3F4F6',
    },
    space: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      '2xl': 32,
      '3xl': 48,
      '4xl': 64,
    },
    radii: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      full: 9999,
    },
  },
};
```

---

## Design Checklist (Before Development)

- [ ] All screens have mockups
- [ ] All interactive states defined (default, hover, pressed, disabled)
- [ ] All loading states defined (skeleton loaders)
- [ ] All empty states defined
- [ ] All error states defined
- [ ] Color palette documented with hex codes
- [ ] Typography scale defined
- [ ] Icon set selected (Lucide React Native)
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Animation specs documented (60fps with Reanimated)
- [ ] Haptic patterns defined (light, medium, heavy, success, error)
- [ ] Gluestack UI theme configured
- [ ] Shadow system defined (sm, md, lg)
- [ ] Spacing scale defined (4px base)
- [ ] Border radius scale defined

---

**Last Updated:** October 13, 2025  
**Version:** 1.1 (Pre-Development - UI Enhanced)  
**Status:** Documentation Phase

