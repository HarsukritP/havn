-- Havn Database Setup Script
-- Run this to set up the database manually

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 0,
    reputation_score DECIMAL(3,2) DEFAULT 0.5,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Study spots table with PostGIS geography
CREATE TABLE IF NOT EXISTS study_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    total_capacity INTEGER NOT NULL DEFAULT 50,
    current_available INTEGER,
    spot_type VARCHAR(50) DEFAULT 'library',
    noise_level VARCHAR(20),
    has_wifi BOOLEAN DEFAULT TRUE,
    has_outlets BOOLEAN DEFAULT TRUE,
    has_food BOOLEAN DEFAULT FALSE,
    hours_open VARCHAR(255),
    photo_urls TEXT[],
    university_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    last_update_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for fast location queries
CREATE INDEX IF NOT EXISTS idx_study_spots_location ON study_spots USING GIST(location);

-- Trigger to sync lat/lng with geography column
CREATE OR REPLACE FUNCTION sync_location_from_lat_lng()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_location_from_lat_lng
BEFORE INSERT OR UPDATE ON study_spots
FOR EACH ROW
EXECUTE FUNCTION sync_location_from_lat_lng();

-- Success message
SELECT 'Database setup complete! ✅' AS status;

