-- Example seed data for Havn
-- Replace these coordinates and details with your actual university locations
-- 
-- To find coordinates for your university:
-- 1. Go to Google Maps
-- 2. Right-click on a location
-- 3. Click the coordinates to copy them
-- 4. Format as (latitude, longitude)

-- Example: Generic University Study Spots
-- These are placeholder coordinates - UPDATE THEM for your university!

INSERT INTO study_spots (
    name, 
    description, 
    address, 
    latitude, 
    longitude,
    total_capacity, 
    current_available,
    availability_status,
    amenities,
    is_active
) VALUES

-- Main Library
(
    'Main Library',
    'Central campus library with multiple floors, quiet study areas, and group study rooms. Computer lab on first floor.',
    '123 University Ave, Campus, State 12345',
    37.8719,
    -122.2585,
    300,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": true, 
        "quiet_zone": true, 
        "outdoor": false
    }'::jsonb,
    true
),

-- Science Library
(
    'Science & Engineering Library',
    'Specialized library for STEM students. 24-hour access during finals week. Collaborative workspaces.',
    '456 Science Drive, Campus, State 12345',
    37.8725,
    -122.2595,
    150,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": true, 
        "quiet_zone": false, 
        "outdoor": false
    }'::jsonb,
    true
),

-- Student Union
(
    'Student Union Study Lounge',
    'Casual study space in student union. Cafe nearby. Great for group projects and socializing.',
    '789 Campus Center, Campus, State 12345',
    37.8710,
    -122.2600,
    80,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": false, 
        "quiet_zone": false, 
        "outdoor": false
    }'::jsonb,
    true
),

-- Outdoor Study Area
(
    'Memorial Glade',
    'Beautiful outdoor study spot with benches and tables. Perfect for nice weather. No power outlets.',
    'Memorial Glade, Campus, State 12345',
    37.8715,
    -122.2590,
    50,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": false, 
        "printer": false, 
        "quiet_zone": false, 
        "outdoor": true
    }'::jsonb,
    true
),

-- Coffee Shop
(
    'Campus Coffee House',
    'Popular coffee shop with study seating. Can get crowded during midterms. WiFi available for students.',
    '321 University Square, Campus, State 12345',
    37.8708,
    -122.2598,
    40,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": false, 
        "quiet_zone": false, 
        "outdoor": false
    }'::jsonb,
    true
),

-- 24-Hour Study Hall
(
    '24/7 Study Commons',
    'Open 24 hours during academic year. Card access required after 10pm. Quiet floor on level 2.',
    '555 Student Services Building, Campus, State 12345',
    37.8722,
    -122.2588,
    120,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": true, 
        "quiet_zone": true, 
        "outdoor": false
    }'::jsonb,
    true
),

-- Graduate Student Lounge
(
    'Graduate Research Commons',
    'Dedicated space for graduate students. Collaborative workstations and private study carrels.',
    '888 Research Hall, Campus, State 12345',
    37.8730,
    -122.2592,
    60,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": true, 
        "quiet_zone": true, 
        "outdoor": false
    }'::jsonb,
    true
),

-- Computer Lab
(
    'Student Computing Center',
    'Computer lab with 100+ workstations. Printing services available. Technical support on-site.',
    '234 IT Building, Campus, State 12345',
    37.8712,
    -122.2603,
    100,
    NULL,
    'unknown',
    '{
        "wifi": true, 
        "outlets": true, 
        "printer": true, 
        "quiet_zone": false, 
        "outdoor": false
    }'::jsonb,
    true
);

-- Verify inserted data
SELECT 
    name, 
    address,
    latitude,
    longitude,
    ST_AsText(location::geometry) as location_wkt,
    total_capacity,
    amenities
FROM study_spots
ORDER BY name;

-- Test proximity query (find spots within 1km of a point)
SELECT 
    name,
    address,
    ROUND(ST_Distance(location, ST_SetSRID(ST_MakePoint(-122.2590, 37.8715), 4326)::geography)::numeric, 2) as distance_meters
FROM study_spots
WHERE ST_DWithin(
    location, 
    ST_SetSRID(ST_MakePoint(-122.2590, 37.8715), 4326)::geography,
    1000  -- 1000 meters = 1km
)
ORDER BY distance_meters;

-- Show statistics
SELECT 
    COUNT(*) as total_spots,
    SUM(total_capacity) as total_capacity,
    AVG(total_capacity) as avg_capacity_per_spot,
    COUNT(*) FILTER (WHERE amenities->>'wifi' = 'true') as spots_with_wifi,
    COUNT(*) FILTER (WHERE amenities->>'quiet_zone' = 'true') as quiet_zones
FROM study_spots;

