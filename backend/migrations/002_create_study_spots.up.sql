-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create study_spots table
CREATE TABLE IF NOT EXISTS study_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(300),
    
    -- Geospatial (simplified for now - in production use PostGIS geography type)
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    
    -- Capacity
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    current_available INTEGER CHECK (current_available IS NULL OR (current_available >= 0 AND current_available <= total_capacity)),
    
    -- Amenities (booleans)
    has_wifi BOOLEAN DEFAULT TRUE,
    has_outlets BOOLEAN DEFAULT TRUE,
    has_printer BOOLEAN DEFAULT FALSE,
    is_quiet_zone BOOLEAN DEFAULT FALSE,
    is_outdoor BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes
CREATE INDEX idx_spots_active ON study_spots(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_spots_updated ON study_spots(last_update_at DESC);
CREATE INDEX idx_spots_location ON study_spots(latitude, longitude);

