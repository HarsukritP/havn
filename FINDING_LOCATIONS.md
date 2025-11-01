# How to Find Study Spot Locations for Your University

Quick guide to populate your database with real study spots.

---

## Method 1: Google Maps (Easiest - 5 minutes)

### Step 1: Open Google Maps

1. Go to https://maps.google.com
2. Search for your university (e.g., "UC Berkeley")
3. Zoom in to see individual buildings

### Step 2: Find Each Study Spot

For each study spot (library, student union, etc.):

1. Right-click on the location
2. Click the coordinates (e.g., `37.8719, -122.2585`)
3. Coordinates are automatically copied!

### Step 3: Add to Seed File

Paste into `backend/seeds/001_example_university_spots.sql`:

```sql
INSERT INTO study_spots (name, description, address, latitude, longitude, total_capacity, amenities)
VALUES (
    'Your Library Name',
    'Description of the spot',
    'Address from Google Maps',
    37.8719,  -- Latitude (first number)
    -122.2585,  -- Longitude (second number)
    150,  -- Estimated capacity
    '{"wifi": true, "outlets": true, "printer": true, "quiet_zone": true, "outdoor": false}'::jsonb
);
```

### Common Study Spots to Add

✅ **Main Library**
✅ **Science/Engineering Libraries**  
✅ **Student Union Study Lounges**
✅ **24-Hour Study Rooms**
✅ **Coffee Shops on Campus**
✅ **Computer Labs**
✅ **Graduate Student Lounges**
✅ **Outdoor Study Areas**

---

## Method 2: Walk Around Campus (Most Accurate - 1 hour)

### Use Your Phone

1. Install any GPS app or use Google Maps
2. Walk to each study spot
3. Open Google Maps
4. Long-press on your current location
5. Coordinates appear at top
6. Take notes of each location

### Example Template

```
Spot: Main Library
Coordinates: 37.8719, -122.2585
Capacity: ~200 people
Amenities: WiFi ✓, Outlets ✓, Printer ✓, Quiet ✓
Notes: Gets full during finals week
```

---

## Method 3: Use University Maps

### Many universities have official maps:

**Example URLs:**
- UC Berkeley: https://campusmap.berkeley.edu
- Stanford: https://campus-map.stanford.edu
- MIT: https://whereis.mit.edu

1. Find each building on university map
2. Right-click → "Copy location" (if available)
3. Or manually note building names and look up in Google Maps

---

## Method 4: Crowdsource from Students (MVP Strategy)

### Best Approach for Launch

Instead of pre-populating everything, let students add spots:

1. Start with 5-10 major spots
2. Add "Suggest a Spot" feature in app
3. Students submit their favorites
4. You approve and add to database
5. Community-driven growth!

**Advantages:**
- ✅ Most accurate (from actual users)
- ✅ Includes hidden gems
- ✅ Builds community engagement
- ✅ Less work upfront

---

## Quick Start: Essential Spots Only

### Minimum 5 Spots to Launch

Just add these types to start:

1. **Main University Library** (usually busiest)
2. **Student Union** (most central)
3. **24-Hour Study Room** (most needed)
4. **Popular Coffee Shop** (student favorite)
5. **Science Library** (if STEM-focused school)

You can add more as students request them!

---

## Template SQL Insert

Copy this template for each spot:

```sql
INSERT INTO study_spots (
    name, 
    description, 
    address, 
    latitude, 
    longitude,
    total_capacity, 
    amenities
) VALUES (
    'SPOT_NAME_HERE',
    'Brief description - what makes it special?',
    'Full address from Google Maps',
    0.000000,  -- REPLACE: Right-click on Google Maps
    0.000000,  -- REPLACE: Copy coordinates
    100,       -- REPLACE: Estimate number of seats
    '{
        "wifi": true,           -- REPLACE: Does it have WiFi?
        "outlets": true,        -- REPLACE: Are there power outlets?
        "printer": false,       -- REPLACE: Printer available?
        "quiet_zone": false,    -- REPLACE: Designated quiet area?
        "outdoor": false        -- REPLACE: Outdoor seating?
    }'::jsonb
);
```

---

## Tips for Accurate Data

### Capacity Estimates

**Small:** 20-50 people
- Coffee shops
- Study lounges  
- Outdoor tables

**Medium:** 50-150 people
- Departmental libraries
- Computer labs
- Large study rooms

**Large:** 150+ people
- Main libraries
- Multi-floor study centers
- Student unions

### Amenities Checklist

**WiFi:** Almost always true on campus  
**Outlets:** Check if there are power strips/outlets  
**Printer:** Only if printing services available  
**Quiet Zone:** Designated silent study areas  
**Outdoor:** Open-air seating (weather-dependent)

---

## Example: Complete Entry

Here's a real example:

```sql
INSERT INTO study_spots (
    name, 
    description, 
    address, 
    latitude, 
    longitude,
    total_capacity, 
    amenities
) VALUES (
    'Doe Memorial Library',
    'Historic main library with beautiful reading rooms. Multiple floors with varying noise levels. Computer labs on floor 1.',
    '2150 Doe Library, Berkeley, CA 94720',
    37.8727,
    -122.2595,
    300,
    '{
        "wifi": true,
        "outlets": true,
        "printer": true,
        "quiet_zone": true,
        "outdoor": false
    }'::jsonb
);
```

---

## After Adding Locations

### Test Your Data

```sql
-- View all spots
SELECT name, address, latitude, longitude 
FROM study_spots;

-- Test proximity query (spots within 1km of a point)
SELECT 
    name,
    ROUND(ST_Distance(
        location, 
        ST_SetSRID(ST_MakePoint(-122.2590, 37.8715), 4326)::geography
    )::numeric, 2) as distance_meters
FROM study_spots
WHERE ST_DWithin(
    location, 
    ST_SetSRID(ST_MakePoint(-122.2590, 37.8715), 4326)::geography,
    1000
)
ORDER BY distance_meters;
```

---

## Next Steps

1. ✅ Find 5-10 major study spots
2. ✅ Get coordinates from Google Maps
3. ✅ Update seed file with real data
4. ✅ Run seed file on Railway
5. ✅ Test in mobile app
6. 🚀 **Go live!**

---

## Need More Spots?

**After Launch:**
- Add "Request a Spot" button in app
- Students submit suggestions
- You verify and add to database
- Reward top contributors with points!

This way, your database grows organically with the most-used spots first.

---

**Happy mapping! 🗺️**

